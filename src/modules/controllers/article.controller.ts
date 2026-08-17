import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ArticleService } from "../services/article.service";
import { AuthGuard } from "@nestjs/passport";
import { CreateArticleDto } from "../DTOs/articles/createArticle.dto";
import { UpdateArticleDto } from "../DTOs/articles/updateArticle.dto";

@Controller('articles')
export class ArticleController {
    constructor(private readonly articleService: ArticleService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createArticleDto: CreateArticleDto, @Req() req: any) {
        return this.articleService.create(createArticleDto, req.user);
    }

    @Get()
    async findAll() {
        return this.articleService.findAll();
    }

    @Get(':slug')
    async findBySlug(@Param('slug') slug: string) {
        return this.articleService.findBySlug(slug);
    }

    @Get(':id')
    async findById(@Param('id', ParseIntPipe) id: number) {
        return this.articleService.findById(id);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateArticleDto: UpdateArticleDto, @Req() req: any) {
        return this.articleService.update(id, updateArticleDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.articleService.delete(id);
    }
}