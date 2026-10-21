import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

/** Configurações do timer (uma linha por usuário). */
@Entity('pomodoro_settings')
export class PomodoroSettings {
  @Exclude({ toPlainOnly: true })
  @PrimaryColumn({ primaryKeyConstraintName: 'PK_pomodoro_settings' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'userId',
    foreignKeyConstraintName: 'FK_pomodoro_settings_userId',
  })
  user: User;

  @Column({ type: 'integer', default: 25 })
  focusMinutes: number;

  @Column({ type: 'integer', default: 5 })
  shortBreakMinutes: number;

  @Column({ type: 'integer', default: 15 })
  longBreakMinutes: number;

  /** Quantos ciclos de foco até a pausa longa (o "Ciclo 1/4"). */
  @Column({ type: 'integer', default: 4 })
  cyclesUntilLongBreak: number;

  @Column({ type: 'boolean', default: false })
  autoStartBreaks: boolean;

  @Column({ type: 'boolean', default: false })
  autoStartFocus: boolean;

  /** Fuso usado para definir o que é "hoje" nas estatísticas. */
  @Column({ type: 'varchar', length: 64, default: DEFAULT_TIMEZONE })
  timezone: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
