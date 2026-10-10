import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Article } from '../articles/article.entity';

export const POMODORO_SESSION_TYPES = [
  'focus',
  'short_break',
  'long_break',
] as const;
export type PomodoroSessionType = (typeof POMODORO_SESSION_TYPES)[number];

/**
 * Um bloco de foco ou pausa já encerrado. O timer roda no front; a API só
 * registra o resultado (concluído ou interrompido) para as estatísticas.
 */
@Entity('pomodoro_session')
@Index('IDX_pomodoro_session_userId_startedAt', ['userId', 'startedAt'])
export class PomodoroSession {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'PK_pomodoro_session' })
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'userId',
    foreignKeyConstraintName: 'FK_pomodoro_session_userId',
  })
  user: User;

  @Column({ type: 'varchar', length: 20 })
  type: PomodoroSessionType;

  @Column({ type: 'timestamptz' })
  startedAt: Date;

  @Column({ type: 'timestamptz' })
  endedAt: Date;

  /** Duração configurada no timer quando o bloco começou. */
  @Column({ type: 'integer' })
  plannedSeconds: number;

  /** Duração real (endedAt - startedAt). */
  @Column({ type: 'integer' })
  durationSeconds: number;

  /** false = interrompido ou pulado antes do fim. */
  @Column({ type: 'boolean' })
  completed: boolean;

  /** Aula estudada durante o bloco (opcional). */
  @Index('IDX_pomodoro_session_articleId')
  @Column({ type: 'integer', nullable: true })
  articleId: number | null;

  @ManyToOne(() => Article, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({
    name: 'articleId',
    foreignKeyConstraintName: 'FK_pomodoro_session_articleId',
  })
  article: Article | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
