import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { TagService } from "../services/tag.service";
import { CreateTagDto } from "../DTOs/tags/createTag.dto";
import { UpdateTagDto } from "../DTOs/tags/updateTag.dto";

@Controller('tags')
export class TagController {
    constructor(private readonly tagService: TagService) { }
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createTagDto: CreateTagDto) {
        return this.tagService.create(createTagDto);
    }

    @Get()
    async findAll() {
        return this.tagService.findAll();
    }

    @Get(':id')
    async findById(@Param('id', ParseIntPipe) id: number) {
        return this.tagService.findById(id);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateTagDto: UpdateTagDto) {
        return this.tagService.update(id, updateTagDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.tagService.delete(id);
    }
}