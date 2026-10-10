import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
import { IsTimeZone } from '../../../common/validators/is-timezone.validator';

export class UpdatePomodoroSettingsDto {
  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(180)
  focusMinutes?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  shortBreakMinutes?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  longBreakMinutes?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  cyclesUntilLongBreak?: number;

  @IsOptional()
  @IsBoolean()
  autoStartBreaks?: boolean;

  @IsOptional()
  @IsBoolean()
  autoStartFocus?: boolean;

  @ApiPropertyOptional({ example: 'America/Sao_Paulo' })
  @IsOptional()
  @IsTimeZone()
  timezone?: string;
}
