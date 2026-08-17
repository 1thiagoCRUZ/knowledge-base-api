import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { CategoryService } from "../services/category.service";
import { CreateCategoryDto } from "../DTOs/categories/createCategory.dto";
import { UpdateCategoryDto } from "../DTOs/categories/updateCategory.dto";

@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoryService.create(createCategoryDto);
    }

    @Get()
    async findAll() {
        return this.categoryService.findAll();
    }

    @Get(':id')
    async findById(@Param('id', ParseIntPipe) id: number) {
        return this.categoryService.findById(id);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
        return this.categoryService.update(id, updateCategoryDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.categoryService.delete(id);
    }
}