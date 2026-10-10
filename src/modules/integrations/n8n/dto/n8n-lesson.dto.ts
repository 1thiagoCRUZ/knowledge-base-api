import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class N8nLessonDto {
  @ApiProperty({
    description:
      'ID estável da aula no n8n. Reenviar o mesmo ID atualiza a aula em vez de duplicar.',
    example: 'sql-joins-2026-10-09',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  externalId: string;

  @ApiProperty({ example: 'Entendendo JOINs no SQL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'Conteúdo da aula em Markdown' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Nome da categoria; é criada se não existir',
    example: 'Banco de Dados',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category: string;

  @ApiPropertyOptional({
    description: 'Nomes das tags; as que não existirem são criadas',
    example: ['sql', 'postgres'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 'SQL do zero' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  series?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  seriesPosition?: number;

  @ApiPropertyOptional({
    description:
      'Dados livres guardados com a aula (workflow, modelo, prompt...)',
    example: { workflowId: 'abc', executionId: '123', model: 'gpt' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
