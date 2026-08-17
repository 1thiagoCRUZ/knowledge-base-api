import { Injectable } from "@nestjs/common";
import { TagRepository } from "../repositories/tag.repository";
import { CreateTagDto } from "../DTOs/tags/createTag.dto";
import { Tag } from "../entities/tag.entity";

@Injectable()
export class TagService {
    constructor(private readonly tagRepository: TagRepository) { }

    async create(createTagDto: CreateTagDto): Promise<Tag> {
        return this.tagRepository.create(createTagDto);
    }

    async findAll(): Promise<Tag[]> {
        return this.tagRepository.findAll();
    }

    async findById(id: number): Promise<Tag | null> {
        return this.tagRepository.findById(id);
    }

    async findByName(name: string): Promise<Tag | null> {
        return this.tagRepository.findByName(name);
    }

    async update(id: number, updateTagDto: Partial<Tag>): Promise<void> {
        await this.tagRepository.update(id, updateTagDto);
    }

    async delete(id: number): Promise<void> {
        await this.tagRepository.delete(id);
    }
}