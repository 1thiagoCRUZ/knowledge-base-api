import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import {
  POMODORO_SESSION_TYPES,
  type PomodoroSessionType,
} from '../pomodoro-session.entity';

export const MAX_SESSION_SECONDS = 4 * 60 * 60;

export class CreatePomodoroSessionDto {
  @ApiProperty({ enum: POMODORO_SESSION_TYPES })
  @IsIn(POMODORO_SESSION_TYPES)
  type: PomodoroSessionType;

  @ApiProperty({ example: '2026-10-10T13:00:00-03:00' })
  @IsISO8601({ strict: true })
  startedAt: string;

  @ApiProperty({ example: '2026-10-10T13:25:00-03:00' })
  @IsISO8601({ strict: true })
  endedAt: string;

  @ApiProperty({ description: 'Duração configurada no timer', example: 1500 })
  @IsInt()
  @Min(60)
  @Max(MAX_SESSION_SECONDS)
  plannedSeconds: number;

  @ApiProperty({ description: 'false se foi interrompido/pulado' })
  @IsBoolean()
  completed: boolean;

  @ApiPropertyOptional({ description: 'Aula estudada durante o bloco' })
  @IsOptional()
  @IsInt()
  articleId?: number;
}
