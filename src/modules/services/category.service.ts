import { Injectable } from "@nestjs/common";
import { CategoryRepository } from "../repositories/category.repository";
import { CreateCategoryDto } from "../DTOs/categories/createCategory.dto";
import { Category } from "../entities/category.entity";

@Injectable()
export class CategoryService {
    constructor(private readonly categoryRepository: CategoryRepository) { }

    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        return this.categoryRepository.create(createCategoryDto);
    }

    async findAll(): Promise<Category[]> {
        return this.categoryRepository.findAll();
    }


    async findById(id: number): Promise<Category | null> {
        return this.categoryRepository.findById(id);
    }

    async update(id: number, updateCategoryDto: Partial<Category>): Promise<void> {
        await this.categoryRepository.update(id, updateCategoryDto);
    }

    async delete(id: number): Promise<void> {
        await this.categoryRepository.delete(id);
    }

    async findByName(name: string): Promise<Category | null> {
        return this.categoryRepository.findByName(name);
    }

    async findBySlug(slug: string): Promise<Category | null> {
        return this.categoryRepository.findBySlug(slug);
    }
}