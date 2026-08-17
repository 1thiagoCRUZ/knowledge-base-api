import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Article } from "./article.entity";

@Entity()
export class Macro {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    userId: number;

    @ManyToOne(() => User, (user) => user.macros)
    user: User;

    @Column()
    name: string;

    @Column()
    contentBody: string;

    @Column()
    articleId: number;

    @ManyToOne(() => Article, (article) => article.macros)
    article: Article;

    @CreateDateColumn()
    createdAt: Date;

    @CreateDateColumn()
    updatedAt: Date;
}