import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "../entities/category.entity";
import { Repository } from "typeorm";
import { CreateCategoryDto } from "../DTOs/categories/createCategory.dto";

@Injectable()
export class CategoryRepository {
    constructor(@InjectRepository(Category) private readonly repository: Repository<Category>) { }

    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        return this.repository.save(createCategoryDto);
    }

    async findAll(): Promise<Category[]> {
        return this.repository.find();
    }

    async findById(id: number): Promise<Category | null> {
        return this.repository.findOne({ where: { id } });
    }

    async update(id: number, updateCategoryDto: Partial<Category>): Promise<void> {
        await this.repository.update(id, updateCategoryDto);
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    async findByName(name: string): Promise<Category | null> {
        return this.repository.findOne({ where: { name } });
    }

    async findBySlug(slug: string): Promise<Category | null> {
        return this.repository.findOne({ where: { slug } });
    }
}
