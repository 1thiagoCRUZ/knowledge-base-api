import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { IsOptionalNonNull } from '../../../common/validators/is-optional-non-null.validator';
import {
  STUDY_TOPIC_PRIORITIES,
  STUDY_TOPIC_STATUSES,
  type StudyTopicPriority,
  type StudyTopicStatus,
} from '../study-topic.entity';

const MAX_MINUTES = 100_000;

export class CreateStudyTopicDto {
  @ApiProperty({ example: 'INNER JOIN e LEFT JOIN' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'Módulo 2 — Consultas' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  module?: string;

  @ApiPropertyOptional({ enum: STUDY_TOPIC_STATUSES, default: 'todo' })
  @IsOptional()
  @IsIn(STUDY_TOPIC_STATUSES)
  status?: StudyTopicStatus;

  @ApiPropertyOptional({ enum: STUDY_TOPIC_PRIORITIES, default: 'medium' })
  @IsOptional()
  @IsIn(STUDY_TOPIC_PRIORITIES)
  priority?: StudyTopicPriority;

  @ApiPropertyOptional({ description: 'Carga horária em minutos', example: 90 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_MINUTES)
  estimatedMinutes?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Aula vinculada ao tópico' })
  @IsOptional()
  @IsInt()
  articleId?: number;
}

/**
 * Edição de uma linha. Campos opcionais (`module`, `estimatedMinutes`,
 * `notes`, `articleId`) aceitam `null` para limpar; os obrigatórios não.
 */
export class UpdateStudyTopicDto {
  @ApiPropertyOptional()
  @IsOptionalNonNull()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  module?: string | null;

  @ApiPropertyOptional({ enum: STUDY_TOPIC_STATUSES })
  @IsOptionalNonNull()
  @IsIn(STUDY_TOPIC_STATUSES)
  status?: StudyTopicStatus;

  @ApiPropertyOptional({ enum: STUDY_TOPIC_PRIORITIES })
  @IsOptionalNonNull()
  @IsIn(STUDY_TOPIC_PRIORITIES)
  priority?: StudyTopicPriority;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_MINUTES)
  estimatedMinutes?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'null desvincula a aula',
  })
  @IsOptional()
  @IsInt()
  articleId?: number | null;
}
