import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description:
      'Gerado a partir do título se omitido (com sufixo se já existir)',
  })
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug deve conter apenas letras minúsculas, números e hífens',
  })
  slug?: string;

  @ApiPropertyOptional({ description: 'Conteúdo em Markdown' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  categoryId: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Nome da série/curso a que a aula pertence',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  series?: string;

  @ApiPropertyOptional({ description: 'Ordem da aula na série' })
  @IsOptional()
  @IsInt()
  @Min(1)
  seriesPosition?: number;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  tagIds?: number[];
}
