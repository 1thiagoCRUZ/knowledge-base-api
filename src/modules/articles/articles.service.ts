import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Paginated, paginate } from '../../common/dto/pagination.dto';
import { slugify } from '../../common/utils/slugify';
import { CategoriesService } from '../categories/categories.service';
import { TagsService } from '../tags/tags.service';
import { Category } from '../categories/category.entity';
import { Tag } from '../tags/tag.entity';
import {
  Article,
  ARTICLE_SEARCH_VECTOR,
  ArticleSource,
} from './article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto';

const SEARCH_QUERY = `websearch_to_tsquery('portuguese', :search)`;

/** Aula vinda de uma integração, já com categoria, tags e autor resolvidos. */
export interface ExternalArticleInput {
  source: Exclude<ArticleSource, 'manual'>;
  externalId: string;
  title: string;
  content: string;
  category: Category;
  tags: Tag[];
  userId: number;
  series?: string | null;
  seriesPosition?: number | null;
  metadata?: Record<string, unknown> | null;
}

/** Mantém `publishedAt` coerente com `isPublished`. */
export function applyPublishState(
  article: Pick<Article, 'isPublished' | 'publishedAt'>,
  isPublished: boolean,
  now: Date = new Date(),
): void {
  if (isPublished && !article.isPublished) {
    article.publishedAt = now;
  } else if (!isPublished) {
    article.publishedAt = null;
  }
  article.isPublished = isPublished;
}

@Injectable()
/** Todas as operações são restritas às aulas do próprio usuário (404 para as de outros). */
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    private readonly categoriesService: CategoriesService,
    private readonly tagsService: TagsService,
  ) {}

  async create(userId: number, dto: CreateArticleDto): Promise<Article> {
    await this.categoriesService.findOne(userId, dto.categoryId);
    const tags = await this.tagsService.findByIds(userId, dto.tagIds ?? []);

    const article = this.articlesRepository.create({
      title: dto.title,
      content: dto.content,
      categoryId: dto.categoryId,
      userId,
      tags,
      slug: dto.slug ?? (await this.generateUniqueSlug(userId, dto.title)),
      series: dto.series ?? null,
      seriesPosition: dto.seriesPosition ?? null,
      source: 'manual',
      isPublished: false,
      publishedAt: null,
    });
    applyPublishState(article, dto.isPublished ?? false);

    const saved = await this.articlesRepository.save(article);
    return this.findOne(userId, saved.id);
  }

  /**
   * Cria ou atualiza uma aula vinda de integração, identificada por
   * (source, externalId). Sempre fica como rascunho para revisão.
   * Uma aula que você já publicou não é sobrescrita.
   */
  async upsertExternal(
    input: ExternalArticleInput,
  ): Promise<{ article: Article; created: boolean }> {
    const existing = await this.articlesRepository.findOne({
      where: {
        userId: input.userId,
        source: input.source,
        externalId: input.externalId,
      },
      relations: { category: true, tags: true },
    });

    if (existing?.isPublished) {
      throw new ConflictException(
        `A aula "${existing.slug}" já foi publicada e não será sobrescrita.`,
      );
    }

    const article =
      existing ??
      this.articlesRepository.create({
        source: input.source,
        externalId: input.externalId,
        userId: input.userId,
        slug: await this.generateUniqueSlug(input.userId, input.title),
        isPublished: false,
        publishedAt: null,
      });

    article.title = input.title;
    article.content = input.content;
    article.categoryId = input.category.id;
    article.category = input.category;
    article.tags = input.tags;
    article.series = input.series ?? null;
    article.seriesPosition = input.seriesPosition ?? null;
    article.metadata = input.metadata ?? null;

    const saved = await this.articlesRepository.save(article);
    return {
      article: await this.findOne(input.userId, saved.id),
      created: !existing,
    };
  }

  async findAll(
    userId: number,
    query: ListArticlesQueryDto,
  ): Promise<Paginated<Article>> {
    const qb = this.articlesRepository
      .createQueryBuilder('article')
      .where('article.userId = :userId', { userId });

    if (query.categoryId !== undefined) {
      qb.andWhere('article.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }
    if (query.tag) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM article_tags at
          JOIN tag t ON t.id = at."tagId"
          WHERE at."articleId" = article.id AND t.slug = :tag
        )`,
        { tag: query.tag },
      );
    }
    if (query.source) {
      qb.andWhere('article.source = :source', { source: query.source });
    }
    if (query.series) {
      qb.andWhere('article.series = :series', { series: query.series });
      qb.orderBy('article.seriesPosition', 'ASC', 'NULLS LAST');
    }
    if (query.status) {
      qb.andWhere('article.isPublished = :isPublished', {
        isPublished: query.status === 'published',
      });
    }
    if (query.search) {
      qb.andWhere(`${ARTICLE_SEARCH_VECTOR} @@ ${SEARCH_QUERY}`, {
        search: query.search,
      });
      qb.addOrderBy(
        `ts_rank(${ARTICLE_SEARCH_VECTOR}, ${SEARCH_QUERY})`,
        'DESC',
      );
    }
    qb.addOrderBy('article.updatedAt', 'DESC').addOrderBy('article.id', 'DESC');

    // Pagina só pelos IDs e depois carrega as relações; evita os problemas do
    // TypeORM ao combinar skip/take, joins e ORDER BY por expressão.
    const total = await qb.getCount();
    const rows = await qb
      .select('article.id', 'id')
      .offset((query.page - 1) * query.limit)
      .limit(query.limit)
      .getRawMany<{ id: number }>();
    const ids = rows.map((row) => row.id);

    const articles = ids.length
      ? await this.articlesRepository.find({
          where: { id: In(ids), userId },
          relations: { category: true, tags: true },
        })
      : [];
    const byId = new Map(articles.map((article) => [article.id, article]));
    const ordered = ids
      .map((id) => byId.get(id))
      .filter((article): article is Article => article !== undefined);

    return paginate(ordered, total, query);
  }

  async findOne(userId: number, id: number): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { id, userId },
      relations: { category: true, tags: true },
    });
    if (!article) {
      throw new NotFoundException(`Artigo ${id} não encontrado.`);
    }
    return article;
  }

  /**
   * Garante que a aula existe e é do usuário, sem carregar o conteúdo.
   * Use ao receber um `articleId` dentro do corpo de outra requisição.
   */
  async assertOwned(userId: number, id: number): Promise<void> {
    const exists = await this.articlesRepository.existsBy({ id, userId });
    if (!exists) {
      throw new NotFoundException(`Artigo ${id} não encontrado.`);
    }
  }

  async findBySlug(userId: number, slug: string): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { slug, userId },
      relations: { category: true, tags: true },
    });
    if (!article) {
      throw new NotFoundException(`Artigo "${slug}" não encontrado.`);
    }
    return article;
  }

  async update(
    userId: number,
    id: number,
    dto: UpdateArticleDto,
  ): Promise<Article> {
    const article = await this.findOne(userId, id);

    if (dto.categoryId !== undefined && dto.categoryId !== article.categoryId) {
      await this.categoriesService.findOne(userId, dto.categoryId);
      article.categoryId = dto.categoryId;
      // Sem isso o TypeORM usaria a relação carregada e ignoraria o novo categoryId.
      article.category = { id: dto.categoryId } as Article['category'];
    }
    if (dto.tagIds !== undefined) {
      article.tags = await this.tagsService.findByIds(userId, dto.tagIds);
    }
    if (dto.title !== undefined) {
      article.title = dto.title;
    }
    if (dto.content !== undefined) {
      article.content = dto.content;
    }
    // O slug não muda junto com o título, para não quebrar links existentes.
    if (dto.slug !== undefined) {
      article.slug = dto.slug;
    }
    if (dto.series !== undefined) {
      article.series = dto.series;
    }
    if (dto.seriesPosition !== undefined) {
      article.seriesPosition = dto.seriesPosition;
    }
    if (dto.isPublished !== undefined) {
      applyPublishState(article, dto.isPublished);
    }

    await this.articlesRepository.save(article);
    return this.findOne(userId, id);
  }

  async remove(userId: number, id: number): Promise<void> {
    await this.assertOwned(userId, id);
    await this.articlesRepository.delete({ id, userId });
  }

  private async generateUniqueSlug(
    userId: number,
    title: string,
  ): Promise<string> {
    const base = slugify(title);
    if (!base) {
      throw new BadRequestException(
        'Não foi possível gerar um slug a partir do título. Informe o campo "slug".',
      );
    }

    let candidate = base;
    for (let suffix = 2; ; suffix++) {
      const exists = await this.articlesRepository.existsBy({
        userId,
        slug: candidate,
      });
      if (!exists) {
        return candidate;
      }
      candidate = `${base}-${suffix}`;
    }
  }
}
