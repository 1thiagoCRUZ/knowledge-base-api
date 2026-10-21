import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Article } from '../articles/article.entity';
import { User } from '../users/user.entity';

@Entity()
@Unique(['userId', 'slug'])
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude({ toPlainOnly: true })
  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'userId',
    foreignKeyConstraintName: 'FK_tag_userId',
  })
  user: User;

  @Column()
  name: string;

  @Column()
  slug: string;

  @ManyToMany(() => Article, (article) => article.tags, { onDelete: 'CASCADE' })
  articles: Article[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
