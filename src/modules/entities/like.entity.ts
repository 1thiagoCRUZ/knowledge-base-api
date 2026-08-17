import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "./user.entity";
import { Article } from "./article.entity";

@Entity()
@Unique(['userId', 'articleId'])
export class Like {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    articleId: number;

    @ManyToOne(() => Article, (article) => article.likes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'articleId' })
    article: Article;

    @CreateDateColumn()
    createdAt: Date;

    @CreateDateColumn()
    updatedAt: Date;
}