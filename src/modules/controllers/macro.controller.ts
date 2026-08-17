import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards } from "@nestjs/common";
import { MacroService } from "../services/macro.service";
import { AuthGuard } from "@nestjs/passport";
import { HttpCode, HttpStatus } from "@nestjs/common";
import { CreateMacroDto } from "../DTOs/macros/createMacro.dto";
import { UpdateMacroDto } from "../DTOs/macros/updateMacro.dto";

@Controller('macros')
export class MacroController {
    constructor(private readonly macroService: MacroService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createMacroDto: CreateMacroDto, @Req() req: any) {
        return this.macroService.create(createMacroDto, req.user, req.article);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    async findAll() {
        return this.macroService.findAll();
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    async findById(@Param('id', ParseIntPipe) id: number) {
        return this.macroService.findById(id);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateMacroDto: UpdateMacroDto) {
        return this.macroService.update(id, updateMacroDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.macroService.delete(id);
    }
}