import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Tag } from "../entities/tag.entity";
import { Repository } from "typeorm";
import { CreateTagDto } from "../DTOs/tags/createTag.dto";

@Injectable()
export class TagRepository {
    constructor(@InjectRepository(Tag) private readonly repository: Repository<Tag>) { }

    async create(createTagDto: CreateTagDto): Promise<Tag> {
        const tag = this.repository.create(createTagDto);
        return this.repository.save(tag);
    }

    async findAll(): Promise<Tag[]> {
        return this.repository.find();
    }

    async findById(id: number): Promise<Tag | null> {
        return this.repository.findOne({ where: { id } });
    }

    async findByName(name: string): Promise<Tag | null> {
        return this.repository.findOne({ where: { name } });
    }

    async findBySlug(slug: string): Promise<Tag | null> {
        return this.repository.findOne({ where: { slug } });
    }

    async update(id: number, updateTagDto: Partial<Tag>): Promise<void> {
        await this.repository.update(id, updateTagDto);
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }
}