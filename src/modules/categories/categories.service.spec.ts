import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Article } from '../articles/article.entity';
import { Category } from './category.entity';
import { CategoriesService } from './categories.service';

describe('CategoriesService — isolamento por usuário', () => {
  let service: CategoriesService;
  let categories: {
    find: jest.Mock;
    findOneBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };
  let articles: { countBy: jest.Mock };

  beforeEach(() => {
    categories = {
      find: jest.fn().mockResolvedValue([]),
      findOneBy: jest.fn(),
      create: jest.fn((data: Partial<Category>) => data),
      save: jest.fn((data: Partial<Category>) => Promise.resolve(data)),
      delete: jest.fn(),
    };
    articles = { countBy: jest.fn().mockResolvedValue(0) };
    service = new CategoriesService(
      categories as unknown as Repository<Category>,
      articles as unknown as Repository<Article>,
    );
  });

  it('lista só as categorias do usuário', async () => {
    await service.findAll(7);
    expect(categories.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 7 } }),
    );
  });

  it('cria já com o dono, ignorando qualquer outro', async () => {
    await service.create(7, { name: 'Banco de Dados' });
    expect(categories.save).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 7, slug: 'banco-de-dados' }),
    );
  });

  it('categoria de outro usuário é 404 em ler, editar e apagar', async () => {
    categories.findOneBy.mockResolvedValue(null);
    await expect(service.findOne(7, 3)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.update(7, 3, { name: 'x' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.remove(7, 3)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(categories.findOneBy).toHaveBeenCalledWith({ id: 3, userId: 7 });
    expect(categories.save).not.toHaveBeenCalled();
    expect(categories.delete).not.toHaveBeenCalled();
  });

  it('não exclui categoria com aulas e apaga com filtro de dono', async () => {
    categories.findOneBy.mockResolvedValue({ id: 3, userId: 7 });
    articles.countBy.mockResolvedValueOnce(2);
    await expect(service.remove(7, 3)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(articles.countBy).toHaveBeenCalledWith({ categoryId: 3, userId: 7 });

    await service.remove(7, 3);
    expect(categories.delete).toHaveBeenCalledWith({ id: 3, userId: 7 });
  });
});
