import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Article } from "./article.entity";
import { Macro } from "./macro.entity";
import { Suggestion } from "./suggestion.entity";
import { Like } from "./like.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    isAdmin: boolean;

    @OneToMany(() => Article, (article) => article.user)
    articles: Article[];

    @OneToMany(() => Macro, (macro) => macro.user)
    macros: Macro[];

    @OneToMany(() => Suggestion, (suggestion) => suggestion.user)
    suggestions: Suggestion[];

    @OneToMany(() => Like, (like) => like.user)
    likes: Like[];

    @CreateDateColumn()
    createdAt: Date;

    @CreateDateColumn()
    updatedAt: Date;
}