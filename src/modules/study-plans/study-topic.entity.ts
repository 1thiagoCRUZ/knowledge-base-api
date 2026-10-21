import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Article } from '../articles/article.entity';
import { StudyPlan } from './study-plan.entity';

export const STUDY_TOPIC_STATUSES = ['todo', 'in_progress', 'done'] as const;
export type StudyTopicStatus = (typeof STUDY_TOPIC_STATUSES)[number];

export const STUDY_TOPIC_PRIORITIES = ['low', 'medium', 'high'] as const;
export type StudyTopicPriority = (typeof STUDY_TOPIC_PRIORITIES)[number];

/** Uma linha da Tabela de Estudos. */
@Entity('study_topic')
@Index('IDX_study_topic_planId_position', ['planId', 'position'])
export class StudyTopic {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'PK_study_topic' })
  id: number;

  @Column()
  planId: number;

  @ManyToOne(() => StudyPlan, (plan) => plan.topics, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'planId',
    foreignKeyConstraintName: 'FK_study_topic_planId',
  })
  plan: StudyPlan;

  @Column()
  title: string;

  /** Nome do módulo (agrupamento livre, como numa planilha). */
  @Column({ type: 'varchar', length: 100, nullable: true })
  module: string | null;

  @Column({ type: 'varchar', length: 20, default: 'todo' })
  status: StudyTopicStatus;

  @Column({ type: 'varchar', length: 10, default: 'medium' })
  priority: StudyTopicPriority;

  /** Carga horária estimada, em minutos. */
  @Column({ type: 'integer', nullable: true })
  estimatedMinutes: number | null;

  /** Ordem do tópico dentro do plano. */
  @Column({ type: 'integer', default: 0 })
  position: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  /** Preenchido quando o status vira "done". */
  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  /** Aula ligada ao tópico (escrita à mão ou gerada pelo n8n). */
  @Index('IDX_study_topic_articleId')
  @Column({ type: 'integer', nullable: true })
  articleId: number | null;

  @ManyToOne(() => Article, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({
    name: 'articleId',
    foreignKeyConstraintName: 'FK_study_topic_articleId',
  })
  article: Article | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
