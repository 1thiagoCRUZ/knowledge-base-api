import { Injectable } from "@nestjs/common";
import { ArticleRepository } from "../repositories/article.repository";
import { CreateArticleDto } from "../DTOs/articles/createArticle.dto";
import { User } from "../entities/user.entity";
import { Article } from "../entities/article.entity";

@Injectable()
export class ArticleService {
    constructor(private readonly articleRepository: ArticleRepository) { }

    async create(createArticleDto: CreateArticleDto, user: User): Promise<Article> {
        return this.articleRepository.create(createArticleDto, user);
    }

    async findAll(): Promise<Article[]> {
        return this.articleRepository.findAll();
    }

    async findById(id: number): Promise<Article | null> {
        return this.articleRepository.findById(id);
    }

    async findBySlug(slug: string): Promise<Article | null> {
        return this.articleRepository.findBySlug(slug);
    }

    async findByTitle(title: string): Promise<Article | null> {
        return this.articleRepository.findByTitle(title);
    }

    async findByUserId(userId: number): Promise<Article[]> {
        return this.articleRepository.findByUserId(userId);
    }

    async findByCategoryId(categoryId: number): Promise<Article[]> {
        return this.articleRepository.findByCategoryId(categoryId);
    }

    async update(id: number, updateArticleDto: Partial<Article>): Promise<void> {
        await this.articleRepository.update(id, updateArticleDto);
    }

    async delete(id: number): Promise<void> {
        await this.articleRepository.delete(id);
    }

    async findByIsPublished(isPublished: boolean): Promise<Article[]> {
        return this.articleRepository.findByIsPublished(isPublished);
    }
}