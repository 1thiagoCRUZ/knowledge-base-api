import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Suggestion } from "../entities/suggestion.entity";
import { Repository } from "typeorm";
import { CreateSuggestionDto } from "../DTOs/suggestions/createSuggestion.dto";
import { User } from "../entities/user.entity";
import { Article } from "../entities/article.entity";

@Injectable()
export class SuggestionRepository {
    constructor(@InjectRepository(Suggestion) private readonly repository: Repository<Suggestion>) { }

    async create(createSuggestionDto: CreateSuggestionDto, user: User, article: Article): Promise<Suggestion> {
        const suggestion = this.repository.create({
            ...createSuggestionDto,
            user,
            article
        });
        return this.repository.save(suggestion);
    }

    async findAll(): Promise<Suggestion[]> {
        return this.repository.find();
    }

    async findById(id: number): Promise<Suggestion | null> {
        return this.repository.findOne({ where: { id } });
    }

    async findByArticleId(articleId: number): Promise<Suggestion[]> {
        return this.repository.find({ where: { articleId } });
    }

    async findByUserId(userId: number): Promise<Suggestion[]> {
        return this.repository.find({ where: { userId } });
    }

    async findByStatus(status: string): Promise<Suggestion[]> {
        return this.repository.find({ where: { status } });
    }

    async update(id: number, updateSuggestionDto: Partial<Suggestion>): Promise<void> {
        await this.repository.update(id, updateSuggestionDto);
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }
}