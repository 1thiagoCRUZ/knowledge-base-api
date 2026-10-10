import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsISO8601, IsOptional, Max, Min } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class ListPomodoroSessionsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Início do período (ISO 8601)' })
  @IsOptional()
  @IsISO8601({ strict: true })
  from?: string;

  @ApiPropertyOptional({ description: 'Fim do período (ISO 8601)' })
  @IsOptional()
  @IsISO8601({ strict: true })
  to?: string;
}

export class PomodoroStatsQueryDto {
  @ApiPropertyOptional({
    default: 7,
    minimum: 1,
    maximum: 90,
    description: 'Quantos dias (incluindo hoje) entram nas estatísticas',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  days: number = 7;
}
