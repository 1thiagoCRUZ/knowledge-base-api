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
      await service.create(7, {
        title: 'Introdução ao SQL',
        content: '# SQL',
        categoryId: 1,
      });
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
      await service.create(1, { title: 'SQL', content: 'x', categoryId: 1 });
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'sql-3' }),
      );
    });

    it('preenche publishedAt ao criar já publicado', async () => {
      await service.create(1, {
        title: 'SQL',
        content: 'x',
        categoryId: 1,
        isPublished: true,
      });
      const saved = repo.save.mock.calls[0][0] as Article;
      expect(saved.isPublished).toBe(true);
      expect(saved.publishedAt).toBeInstanceOf(Date);
    });

    it('falha se a categoria não existir', async () => {
      categories.findOne.mockRejectedValue(new NotFoundException());
      await expect(
        service.create(1, { title: 'SQL', content: 'x', categoryId: 99 }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('falha se o título não gera slug e nenhum foi informado', async () => {
      await expect(
        service.create(1, { title: '!!!', content: 'x', categoryId: 1 }),
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
      await service.update(7, 1, { title: 'Novo título' });
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
    await expect(service.findOne(7, 123)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  describe('isolamento por usuário (IDOR)', () => {
    it('findOne filtra pelo dono na própria consulta', async () => {
      repo.findOne.mockResolvedValue({ id: 3 } as Article);
      await service.findOne(7, 3);
      expect(repo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 3, userId: 7 } }),
      );
    });

    it('findBySlug filtra pelo dono', async () => {
      repo.findOne.mockResolvedValue({ id: 3 } as Article);
      await service.findBySlug(7, 'sql');
      expect(repo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { slug: 'sql', userId: 7 } }),
      );
    });

    it('remove não apaga aula de outro usuário', async () => {
      repo.existsBy.mockResolvedValue(false);
      await expect(service.remove(7, 3)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repo.existsBy).toHaveBeenCalledWith({ id: 3, userId: 7 });
      expect(repo.delete).not.toHaveBeenCalled();
    });

    it('remove apaga só com o filtro de dono', async () => {
      repo.existsBy.mockResolvedValue(true);
      await service.remove(7, 3);
      expect(repo.delete).toHaveBeenCalledWith({ id: 3, userId: 7 });
    });

    it('create valida categoria, tags e slug dentro do usuário', async () => {
      repo.findOne.mockResolvedValue({ id: 1 } as Article);
      await service.create(7, {
        title: 'SQL',
        content: 'x',
        categoryId: 2,
        tagIds: [4],
      });
      expect(categories.findOne).toHaveBeenCalledWith(7, 2);
      expect(tags.findByIds).toHaveBeenCalledWith(7, [4]);
      expect(repo.existsBy).toHaveBeenCalledWith({ userId: 7, slug: 'sql' });
    });

    it('update valida a nova categoria dentro do usuário', async () => {
      repo.findOne.mockResolvedValue({
        id: 1,
        categoryId: 1,
        isPublished: false,
      } as Article);
      await service.update(7, 1, { categoryId: 9 });
      expect(categories.findOne).toHaveBeenCalledWith(7, 9);
    });

    it('upsertExternal procura a aula existente só entre as do usuário', async () => {
      repo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 1 } as Article);
      await service.upsertExternal({
        source: 'n8n',
        externalId: 'x',
        title: 'X',
        content: 'x',
        category: { id: 5 } as Category,
        tags: [],
        userId: 7,
      });
      expect(repo.findOne).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          where: { userId: 7, source: 'n8n', externalId: 'x' },
        }),
      );
    });
  });
});
