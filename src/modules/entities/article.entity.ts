import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Category } from "./category.entity";
import { Macro } from "./macro.entity";
import { Suggestion } from "./suggestion.entity";
import { Tag } from "./tag.entity";
import { Like } from "./like.entity";

@Entity()
export class Article {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @ManyToOne(() => User, (user) => user.articles)
    user: User;

    @Column()
    categoryId: number;

    @ManyToOne(() => Category, (category) => category.articles)
    category: Category;

    @Column()
    title: string;

    @Column()
    slug: string;

    @Column()
    content: string;

    @Column()
    views: number;

    @Column()
    isPublished: boolean;

    @CreateDateColumn()
    publishedAt: Date;

    @Column()
    likesCount: number;

    @OneToMany(() => Macro, (macro) => macro.article)
    macros: Macro[];

    @OneToMany(() => Suggestion, (suggestion) => suggestion.article)
    suggestions: Suggestion[];

    @ManyToMany(() => Tag, (tag) => tag.articles)
    tags: Tag[];

    @OneToMany(() => Like, (like) => like.article)
    likes: Like[];

    @CreateDateColumn()
    createdAt: Date;

    @CreateDateColumn()
    updatedAt: Date;
}