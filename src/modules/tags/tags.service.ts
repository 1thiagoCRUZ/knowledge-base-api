import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { slugify } from '../../common/utils/slugify';
import { Tag } from './tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag) private readonly tagsRepository: Repository<Tag>,
  ) {}

  create(dto: CreateTagDto): Promise<Tag> {
    const tag = this.tagsRepository.create({
      ...dto,
      slug: this.resolveSlug(dto.slug, dto.name),
    });
    return this.tagsRepository.save(tag);
  }

  findAll(): Promise<Tag[]> {
    return this.tagsRepository.find({ order: { name: 'ASC' } });
  }

  /**
   * Retorna as tags pelo nome, criando as que não existem (casadas pelo slug).
   * O INSERT ... ON CONFLICT DO NOTHING evita erro se duas requisições
   * criarem a mesma tag ao mesmo tempo.
   */
  async findOrCreateByNames(names: string[]): Promise<Tag[]> {
    const bySlug = new Map<string, string>();
    for (const name of names) {
      const slug = slugify(name);
      if (slug && !bySlug.has(slug)) {
        bySlug.set(slug, name.trim());
      }
    }
    if (bySlug.size === 0) {
      return [];
    }

    await this.tagsRepository
      .createQueryBuilder()
      .insert()
      .values([...bySlug].map(([slug, name]) => ({ slug, name })))
      .orIgnore()
      .execute();

    return this.tagsRepository.findBy({ slug: In([...bySlug.keys()]) });
  }

  async findOne(id: number): Promise<Tag> {
    const tag = await this.tagsRepository.findOneBy({ id });
    if (!tag) {
      throw new NotFoundException(`Tag ${id} não encontrada.`);
    }
    return tag;
  }

  /** Busca várias tags e falha se alguma não existir. */
  async findByIds(ids: number[]): Promise<Tag[]> {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0) {
      return [];
    }
    const tags = await this.tagsRepository.findBy({ id: In(uniqueIds) });
    if (tags.length !== uniqueIds.length) {
      const found = new Set(tags.map((tag) => tag.id));
      const missing = uniqueIds.filter((id) => !found.has(id));
      throw new NotFoundException(
        `Tags não encontradas: ${missing.join(', ')}`,
      );
    }
    return tags;
  }

  async update(id: number, dto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);
    Object.assign(tag, dto);
    if (dto.slug !== undefined) {
      tag.slug = this.resolveSlug(dto.slug, tag.name);
    }
    return this.tagsRepository.save(tag);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    // As ligações em article_tags são removidas em cascata.
    await this.tagsRepository.delete(id);
  }

  private resolveSlug(slug: string | undefined, name: string): string {
    const resolved = slug ?? slugify(name);
    if (!resolved) {
      throw new BadRequestException('Não foi possível gerar um slug válido.');
    }
    return resolved;
  }
}
