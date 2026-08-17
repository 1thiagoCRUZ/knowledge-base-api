import { Injectable } from "@nestjs/common";
import { SuggestionRepository } from "../repositories/suggestion.repository";
import { CreateSuggestionDto } from "../DTOs/suggestions/createSuggestion.dto";
import { Suggestion } from "../entities/suggestion.entity";
import { User } from "../entities/user.entity";
import { Article } from "../entities/article.entity";

@Injectable()
export class SuggestionService {
    constructor(private readonly suggestionRepository: SuggestionRepository) { }

    async create(createSuggestionDto: CreateSuggestionDto, user: User, article: Article): Promise<Suggestion> {
        return this.suggestionRepository.create(createSuggestionDto, user, article);
    }

    async findAll(): Promise<Suggestion[]> {
        return this.suggestionRepository.findAll();
    }

    async findById(id: number): Promise<Suggestion | null> {
        return this.suggestionRepository.findById(id);
    }

    async update(id: number, updateSuggestionDto: Partial<Suggestion>): Promise<void> {
        await this.suggestionRepository.update(id, updateSuggestionDto);
    }

    async delete(id: number): Promise<void> {
        await this.suggestionRepository.delete(id);
    }

    async findByUserId(userId: number): Promise<Suggestion[]> {
        return this.suggestionRepository.findByUserId(userId);
    }

    async findByArticleId(articleId: number): Promise<Suggestion[]> {
        return this.suggestionRepository.findByArticleId(articleId);
    }

    async findByStatus(status: string): Promise<Suggestion[]> {
        return this.suggestionRepository.findByStatus(status);
    }
}