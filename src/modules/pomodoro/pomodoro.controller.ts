import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PomodoroSettingsService } from './pomodoro-settings.service';
import { PomodoroSessionsService } from './pomodoro-sessions.service';
import { UpdatePomodoroSettingsDto } from './dto/update-pomodoro-settings.dto';
import { CreatePomodoroSessionDto } from './dto/create-pomodoro-session.dto';
import {
  ListPomodoroSessionsQueryDto,
  PomodoroStatsQueryDto,
} from './dto/pomodoro-query.dto';

@ApiTags('pomodoro')
@ApiBearerAuth()
@Controller('pomodoro')
export class PomodoroController {
  constructor(
    private readonly settingsService: PomodoroSettingsService,
    private readonly sessionsService: PomodoroSessionsService,
  ) {}

  @Get('settings')
  getSettings(@CurrentUser() user: AuthenticatedUser) {
    return this.settingsService.get(user.id);
  }

  @Patch('settings')
  updateSettings(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePomodoroSettingsDto,
  ) {
    return this.settingsService.update(user.id, dto);
  }

  /** O front chama ao fim de cada bloco (concluído ou interrompido). */
  @Post('sessions')
  createSession(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePomodoroSessionDto,
  ) {
    return this.sessionsService.create(user.id, dto);
  }

  @Get('sessions')
  listSessions(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListPomodoroSessionsQueryDto,
  ) {
    return this.sessionsService.findAll(user.id, query);
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.sessionsService.remove(user.id, id);
  }

  @Get('stats')
  stats(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PomodoroStatsQueryDto,
  ) {
    return this.sessionsService.stats(user.id, query.days);
  }
}
