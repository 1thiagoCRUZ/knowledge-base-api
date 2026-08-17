import { Injectable } from "@nestjs/common";
import { MacroRepository } from "../repositories/macro.repository";
import { CreateMacroDto } from "../DTOs/macros/createMacro.dto";
import { Macro } from "../entities/macro.entity";
import { User } from "../entities/user.entity";
import { Article } from "../entities/article.entity";

@Injectable()
export class MacroService {
    constructor(private readonly macroRepository: MacroRepository) { }

    async create(createMacroDto: CreateMacroDto, user: User, article: Article): Promise<Macro> {
        return this.macroRepository.create(createMacroDto, user, article);
    }

    async findAll(): Promise<Macro[]> {
        return this.macroRepository.findAll();
    }

    async findById(id: number): Promise<Macro | null> {
        return this.macroRepository.findById(id);
    }

    async update(id: number, updateMacroDto: Partial<Macro>): Promise<void> {
        await this.macroRepository.update(id, updateMacroDto);
    }

    async delete(id: number): Promise<void> {
        await this.macroRepository.delete(id);
    }

    async findByUserId(userId: number): Promise<Macro[]> {
        return this.macroRepository.findByUserId(userId);
    }

    async findByArticleId(articleId: number): Promise<Macro[]> {
        return this.macroRepository.findByArticleId(articleId);
    }
}