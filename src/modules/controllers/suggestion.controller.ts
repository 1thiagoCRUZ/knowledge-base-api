import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Req, UseGuards } from "@nestjs/common";
import { SuggestionService } from "../services/suggestion.service";
import { CreateSuggestionDto } from "../DTOs/suggestions/createSuggestion.dto";
import { UpdateSuggestionDto } from "../DTOs/suggestions/updateSuggestion.dto";
import { AuthGuard } from "@nestjs/passport";

@Controller('suggestions')
export class SuggestionController {
    constructor(private readonly suggestionService: SuggestionService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createSuggestionDto: CreateSuggestionDto, @Req() req: any) {
        return this.suggestionService.create(createSuggestionDto, req.user, req.article);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    async findAll() {
        return this.suggestionService.findAll();
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    async findById(@Param('id', ParseIntPipe) id: number) {
        return this.suggestionService.findById(id);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateSuggestionDto: UpdateSuggestionDto) {
        return this.suggestionService.update(id, updateSuggestionDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.suggestionService.delete(id);
    }
}
