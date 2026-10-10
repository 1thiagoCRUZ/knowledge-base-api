import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { slugify } from '../../common/utils/slugify';
import { Article } from '../articles/article.entity';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
  ) {}

  create(dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create({
      ...dto,
      slug: this.resolveSlug(dto.slug, dto.name),
    });
    return this.categoriesRepository.save(category);
  }

  findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({ order: { name: 'ASC' } });
  }

  /** Busca a categoria pelo slug do nome, criando-a se não existir. */
  async findOrCreateByName(name: string): Promise<Category> {
    const slug = this.resolveSlug(undefined, name);
    await this.categoriesRepository
      .createQueryBuilder()
      .insert()
      .values({ name: name.trim(), slug })
      .orIgnore()
      .execute();
    return this.categoriesRepository.findOneByOrFail({ slug });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Categoria ${id} não encontrada.`);
    }
    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoriesRepository.findOneBy({ slug });
    if (!category) {
      throw new NotFoundException(`Categoria "${slug}" não encontrada.`);
    }
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    if (dto.slug !== undefined) {
      category.slug = this.resolveSlug(dto.slug, category.name);
    }
    return this.categoriesRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    const articleCount = await this.articlesRepository.countBy({
      categoryId: id,
    });
    if (articleCount > 0) {
      throw new ConflictException(
        `Categoria possui ${articleCount} artigo(s). Mova-os antes de excluir.`,
      );
    }
    await this.categoriesRepository.delete(id);
  }

  private resolveSlug(slug: string | undefined, name: string): string {
    const resolved = slug ?? slugify(name);
    if (!resolved) {
      throw new BadRequestException('Não foi possível gerar um slug válido.');
    }
    return resolved;
  }
}
