import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesModule } from '../articles/articles.module';
import { PomodoroSession } from './pomodoro-session.entity';
import { PomodoroSettings } from './pomodoro-settings.entity';
import { PomodoroController } from './pomodoro.controller';
import { PomodoroSettingsService } from './pomodoro-settings.service';
import { PomodoroSessionsService } from './pomodoro-sessions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PomodoroSession, PomodoroSettings]),
    ArticlesModule,
  ],
  controllers: [PomodoroController],
  providers: [PomodoroSettingsService, PomodoroSessionsService],
})
export class PomodoroModule {}
