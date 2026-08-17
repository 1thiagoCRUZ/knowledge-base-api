import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Article } from "./article.entity";

@Entity()
export class Suggestion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @ManyToOne(() => User, (user) => user.suggestions)
    user: User;

    @Column()
    articleId: number;

    @ManyToOne(() => Article, (article) => article.suggestions)
    article: Article;

    @Column()
    content: string;

    @Column()
    status: string;

    @CreateDateColumn()
    createdAt: Date;

    @CreateDateColumn()
    updatedAt: Date;
}