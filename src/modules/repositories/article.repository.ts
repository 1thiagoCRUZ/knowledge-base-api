import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Article } from "../entities/article.entity";
import { Repository } from "typeorm";
import { CreateArticleDto } from "../DTOs/articles/createArticle.dto";
import { User } from "../entities/user.entity";

@Injectable()
export class ArticleRepository {
    constructor(@InjectRepository(Article) private readonly repository: Repository<Article>) { }

    async create(createArticleDto: CreateArticleDto, user: User): Promise<Article> {
        const article = this.repository.create({
            ...createArticleDto,
            user,
        });
        return this.repository.save(article);
    }

    async findAll(): Promise<Article[]> {
        return this.repository.find();
    }

    async findById(id: number): Promise<Article | null> {
        return this.repository.findOne({ where: { id } });
    }

    async update(id: number, updateArticleDto: Partial<Article>): Promise<void> {
        await this.repository.update(id, updateArticleDto);
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    async findByTitle(title: string): Promise<Article | null> {
        return this.repository.findOne({ where: { title } });
    }

    async findBySlug(slug: string): Promise<Article | null> {
        return this.repository.findOne({ where: { slug } });
    }

    async findByCategoryId(categoryId: number): Promise<Article[]> {
        return this.repository.find({ where: { categoryId } });
    }

    async findByUserId(userId: number): Promise<Article[]> {
        return this.repository.find({ where: { userId } });
    }

    async findByIsPublished(isPublished: boolean): Promise<Article[]> {
        return this.repository.find({ where: { isPublished } });
    }


}