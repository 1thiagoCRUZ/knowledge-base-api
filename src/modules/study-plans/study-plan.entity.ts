import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { StudyTopic } from './study-topic.entity';

/** Uma "Tabela de Estudos": um assunto dividido em tópicos. */
@Entity('study_plan')
export class StudyPlan {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'PK_study_plan' })
  id: number;

  @Index('IDX_study_plan_userId')
  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'userId',
    foreignKeyConstraintName: 'FK_study_plan_userId',
  })
  user: User;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => StudyTopic, (topic) => topic.plan)
  topics: StudyTopic[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
