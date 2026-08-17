import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateArticleDto {
    @IsInt()
    @IsNotEmpty()
    categoryId: number;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    slug: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsInt()
    @IsOptional()
    views: number;

    @IsBoolean()
    @IsNotEmpty()
    isPublished: boolean;

    @IsInt()
    @IsNotEmpty()
    likesCount: number;
}