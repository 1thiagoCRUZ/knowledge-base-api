import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { ARTICLE_SOURCES, type ArticleSource } from '../article.entity';

export const ARTICLE_STATUSES = ['published', 'draft'] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export class ListArticlesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description:
      'Busca full-text em título e conteúdo. Aceita sintaxe web: "frase exata", -excluir, OR',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Slug da tag' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ enum: ARTICLE_SOURCES })
  @IsOptional()
  @IsIn(ARTICLE_SOURCES)
  source?: ArticleSource;

  @ApiPropertyOptional({
    description: 'Filtra por série; ordena pela posição da aula',
  })
  @IsOptional()
  @IsString()
  series?: string;

  @ApiPropertyOptional({ enum: ARTICLE_STATUSES })
  @IsOptional()
  @IsIn(ARTICLE_STATUSES)
  status?: ArticleStatus;
}
