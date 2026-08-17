import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Macro } from "../entities/macro.entity";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { Article } from "../entities/article.entity";
import { CreateMacroDto } from "../DTOs/macros/createMacro.dto";

@Injectable()
export class MacroRepository {
    constructor(@InjectRepository(Macro) private readonly repository: Repository<Macro>) { }

    async create(createMacroDto: CreateMacroDto, user: User, article: Article): Promise<Macro> {
        const macro = this.repository.create({
            ...createMacroDto,
            user,
            article
        });
        return this.repository.save(macro);
    }

    async findAll(): Promise<Macro[]> {
        return this.repository.find();
    }

    async findById(id: number): Promise<Macro | null> {
        return this.repository.findOne({ where: { id } });
    }

    async findByArticleId(articleId: number): Promise<Macro[]> {
        return this.repository.find({ where: { articleId } });
    }

    async findByUserId(userId: number): Promise<Macro[]> {
        return this.repository.find({ where: { userId } });
    }

    async update(id: number, updateMacroDto: Partial<Macro>): Promise<void> {
        await this.repository.update(id, updateMacroDto);
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }
}