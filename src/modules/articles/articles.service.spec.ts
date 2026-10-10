import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Category } from '../categories/category.entity';
import { CategoriesService } from '../categories/categories.service';
import { Tag } from '../tags/tag.entity';
import { TagsService } from '../tags/tags.service';
import { Article } from './article.entity';
import { applyPublishState, ArticlesService } from './articles.service';

describe('applyPublishState', () => {
  const now = new Date('2026-01-01T00:00:00Z');

  it('preenche publishedAt ao publicar um rascunho', () => {
    const article = { isPublished: false, publishedAt: null };
    applyPublishState(article, true, now);
    expect(article).toEqual({ isPublished: true, publishedAt: now });
  });

  it('mantém a data original ao "republicar"', () => {
    const original = new Date('2025-05-05T00:00:00Z');
    const article = { isPublished: true, publishedAt: original };
    applyPublishState(article, true, now);
    expect(article.publishedAt).toBe(original);
  });

  it('limpa publishedAt ao despublicar', () => {
    const article = { isPublished: true, publishedAt: now };
    applyPublishState(article, false, now);
    expect(article).toEqual({ isPublished: false, publishedAt: null });
  });
});

describe('ArticlesService', () => {
  let service: ArticlesService;
  let repo: jest.Mocked<
    Pick<
      Repository<Article>,
      'create' | 'save' | 'findOne' | 'existsBy' | 'delete'
    >
  >;
  let categories: { findOne: jest.Mock };
  let tags: { findByIds: jest.Mock };

  beforeEach(() => {
    repo = {
      create: jest.fn((data) => ({ ...data }) as Article),
      save: jest.fn((article) =>
        Promise.resolve({ ...article, id: 1 } as Article),
      ),
      findOne: jest.fn(),
      existsBy: jest.fn().mockResolvedValue(false),
      delete: jest.fn(),
    } as never;
    categories = { findOne: jest.fn().mockResolvedValue({ id: 1 }) };
    tags = { findByIds: jest.fn().mockResolvedValue([]) };
    service = new ArticlesService(
      repo as unknown as Repository<Article>,
      categories as unknown as CategoriesService,
      tags as unknown as TagsService,
    );
  });

  describe('create', () => {
    beforeEach(() => {
      repo.findOne.mockImplementation(() =>
        Promise.resolve({ id: 1 } as Article),
      );
    });

    it('gera slug a partir do título e cria como rascunho por padrão', async () => {
      await service.create(
        { title: 'Introdução ao SQL', content: '# SQL', categoryId: 1 },
        7,
      );
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'introducao-ao-sql',
          userId: 7,
          isPublished: false,
          publishedAt: null,
        }),
      );
    });

    it('adiciona sufixo quando o slug já existe', async () => {
      repo.existsBy
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      await service.create({ title: 'SQL', content: 'x', categoryId: 1 }, 1);
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'sql-3' }),
      );
    });

    it('preenche publishedAt ao criar já publicado', async () => {
      await service.create(
        { title: 'SQL', content: 'x', categoryId: 1, isPublished: true },
        1,
      );
      const saved = repo.save.mock.calls[0][0] as Article;
      expect(saved.isPublished).toBe(true);
      expect(saved.publishedAt).toBeInstanceOf(Date);
    });

    it('falha se a categoria não existir', async () => {
      categories.findOne.mockRejectedValue(new NotFoundException());
      await expect(
        service.create({ title: 'SQL', content: 'x', categoryId: 99 }, 1),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('falha se o título não gera slug e nenhum foi informado', async () => {
      await expect(
        service.create({ title: '!!!', content: 'x', categoryId: 1 }, 1),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('update', () => {
    it('não altera o slug quando só o título muda', async () => {
      repo.findOne.mockResolvedValue({
        id: 1,
        title: 'Antigo',
        slug: 'antigo',
        isPublished: false,
        publishedAt: null,
      } as Article);
      await service.update(1, { title: 'Novo título' });
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Novo título', slug: 'antigo' }),
      );
    });
  });

  describe('upsertExternal', () => {
    const input = {
      source: 'n8n' as const,
      externalId: 'aula-1',
      title: 'JOINs no SQL',
      content: '# JOINs',
      category: { id: 5 } as Category,
      tags: [{ id: 9 } as Tag],
      userId: 1,
      series: 'SQL do zero',
      seriesPosition: 2,
    };

    it('cria como rascunho quando o externalId é novo', async () => {
      repo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 1 } as Article);

      const { created } = await service.upsertExternal(input);

      expect(created).toBe(true);
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'n8n',
          externalId: 'aula-1',
          slug: 'joins-no-sql',
          categoryId: 5,
          isPublished: false,
          series: 'SQL do zero',
          seriesPosition: 2,
        }),
      );
    });

    it('atualiza o rascunho existente sem mudar o slug', async () => {
      repo.findOne
        .mockResolvedValueOnce({
          id: 1,
          slug: 'slug-antigo',
          isPublished: false,
        } as Article)
        .mockResolvedValueOnce({ id: 1 } as Article);

      const { created } = await service.upsertExternal({
        ...input,
        title: 'Título novo',
      });

      expect(created).toBe(false);
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Título novo', slug: 'slug-antigo' }),
      );
    });

    it('não sobrescreve aula já publicada', async () => {
      repo.findOne.mockResolvedValueOnce({
        id: 1,
        slug: 'joins',
        isPublished: true,
      } as Article);

      await expect(service.upsertExternal(input)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  it('findOne lança 404 quando não encontra', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne(123)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
