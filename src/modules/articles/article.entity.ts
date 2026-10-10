import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';
import { Tag } from '../tags/tag.entity';

/**
 * Índice GIN de busca full-text, criado na migration com
 * to_tsvector('portuguese', title || ' ' || content).
 * `synchronize: false` impede o TypeORM de tentar recriá-lo.
 */
export const ARTICLE_SEARCH_VECTOR = `to_tsvector('portuguese', article.title || ' ' || article.content)`;

export const ARTICLE_SOURCES = ['manual', 'n8n'] as const;
export type ArticleSource = (typeof ARTICLE_SOURCES)[number];

@Entity()
@Unique(['slug'])
@Unique(['source', 'externalId'])
@Index('IDX_article_search', { synchronize: false })
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('IDX_article_userId')
  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.articles)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index('IDX_article_categoryId')
  @Column()
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.articles)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  title: string;

  @Column()
  slug: string;

  /** Conteúdo em Markdown. */
  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  isPublished: boolean;

  /** Preenchido quando o artigo é publicado; nulo enquanto for rascunho. */
  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  /** De onde o artigo veio: escrito à mão ou gerado por uma integração. */
  @Column({ type: 'varchar', length: 20, default: 'manual' })
  source: ArticleSource;

  /** ID na origem (ex.: n8n). Garante que reenviar a mesma aula não a duplica. */
  @Column({ type: 'varchar', nullable: true })
  externalId: string | null;

  /** Agrupa aulas de uma mesma série/curso (opcional). */
  @Index('IDX_article_series')
  @Column({ type: 'varchar', nullable: true })
  series: string | null;

  /** Ordem da aula dentro da série. */
  @Column({ type: 'integer', nullable: true })
  seriesPosition: number | null;

  /** Dados livres da origem (workflow, modelo, prompt...). */
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @ManyToMany(() => Tag, (tag) => tag.articles)
  @JoinTable({
    name: 'article_tags',
    joinColumn: {
      name: 'articleId',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_article_tags_articleId',
    },
    inverseJoinColumn: {
      name: 'tagId',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_article_tags_tagId',
    },
  })
  tags: Tag[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
