import { NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Tag } from './tag.entity';
import { TagsService } from './tags.service';

describe('TagsService — isolamento por usuário', () => {
  let service: TagsService;
  let tags: { findBy: jest.Mock; findOneBy: jest.Mock; delete: jest.Mock };

  beforeEach(() => {
    tags = {
      findBy: jest.fn(),
      findOneBy: jest.fn(),
      delete: jest.fn(),
    };
    service = new TagsService(tags as unknown as Repository<Tag>);
  });

  it('findByIds busca só entre as tags do usuário', async () => {
    tags.findBy.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    await service.findByIds(7, [1, 2, 2]);
    expect(tags.findBy).toHaveBeenCalledWith({ id: In([1, 2]), userId: 7 });
  });

  it('findByIds falha se alguma tag é de outro usuário', async () => {
    // A tag 2 existe, mas é de outro usuário, então a busca filtrada não a retorna.
    tags.findBy.mockResolvedValue([{ id: 1 }]);
    await expect(service.findByIds(7, [1, 2])).rejects.toThrow(
      'Tags não encontradas: 2',
    );
  });

  it('tag de outro usuário é 404 e não é apagada', async () => {
    tags.findOneBy.mockResolvedValue(null);
    await expect(service.remove(7, 3)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(tags.findOneBy).toHaveBeenCalledWith({ id: 3, userId: 7 });
    expect(tags.delete).not.toHaveBeenCalled();
  });
});
