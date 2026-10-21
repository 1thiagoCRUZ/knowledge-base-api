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

/** Todas as operações são restritas às categorias do próprio usuário. */
@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
  ) {}

  create(userId: number, dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create({
      ...dto,
      userId,
      slug: this.resolveSlug(dto.slug, dto.name),
    });
    return this.categoriesRepository.save(category);
  }

  findAll(userId: number): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { userId },
      order: { name: 'ASC' },
    });
  }

  /** Busca a categoria pelo slug do nome, criando-a se não existir. */
  async findOrCreateByName(userId: number, name: string): Promise<Category> {
    const slug = this.resolveSlug(undefined, name);
    await this.categoriesRepository
      .createQueryBuilder()
      .insert()
      .values({ userId, name: name.trim(), slug })
      .orIgnore()
      .execute();
    return this.categoriesRepository.findOneByOrFail({ userId, slug });
  }

  async findOne(userId: number, id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOneBy({ id, userId });
    if (!category) {
      throw new NotFoundException(`Categoria ${id} não encontrada.`);
    }
    return category;
  }

  async findBySlug(userId: number, slug: string): Promise<Category> {
    const category = await this.categoriesRepository.findOneBy({
      slug,
      userId,
    });
    if (!category) {
      throw new NotFoundException(`Categoria "${slug}" não encontrada.`);
    }
    return category;
  }

  async update(
    userId: number,
    id: number,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(userId, id);
    Object.assign(category, dto);
    if (dto.slug !== undefined) {
      category.slug = this.resolveSlug(dto.slug, category.name);
    }
    return this.categoriesRepository.save(category);
  }

  async remove(userId: number, id: number): Promise<void> {
    await this.findOne(userId, id);
    const articleCount = await this.articlesRepository.countBy({
      categoryId: id,
      userId,
    });
    if (articleCount > 0) {
      throw new ConflictException(
        `Categoria possui ${articleCount} artigo(s). Mova-os antes de excluir.`,
      );
    }
    await this.categoriesRepository.delete({ id, userId });
  }

  private resolveSlug(slug: string | undefined, name: string): string {
    const resolved = slug ?? slugify(name);
    if (!resolved) {
      throw new BadRequestException('Não foi possível gerar um slug válido.');
    }
    return resolved;
  }
}
