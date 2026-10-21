import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { IsOptionalNonNull } from '../../../common/validators/is-optional-non-null.validator';
import { CreateStudyTopicDto } from './study-topic.dto';

export const MAX_TOPICS_PER_REQUEST = 200;

export class CreateStudyPlanDto {
  @ApiProperty({ example: 'SQL do zero' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: [CreateStudyTopicDto],
    description: 'Tópicos iniciais, na ordem da tabela',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_TOPICS_PER_REQUEST)
  @ValidateNested({ each: true })
  @Type(() => CreateStudyTopicDto)
  topics?: CreateStudyTopicDto[];
}

export class UpdateStudyPlanDto {
  @ApiPropertyOptional()
  @IsOptionalNonNull()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;
}

export class AddStudyTopicsDto {
  @ApiProperty({ type: [CreateStudyTopicDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_TOPICS_PER_REQUEST)
  @ValidateNested({ each: true })
  @Type(() => CreateStudyTopicDto)
  topics: CreateStudyTopicDto[];
}

export class ReorderStudyTopicsDto {
  @ApiProperty({
    type: [Number],
    description: 'Todos os IDs de tópicos do plano, na nova ordem',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsInt({ each: true })
  topicIds: number[];
}
