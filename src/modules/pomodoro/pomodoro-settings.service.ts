import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PomodoroSettings } from './pomodoro-settings.entity';
import { UpdatePomodoroSettingsDto } from './dto/update-pomodoro-settings.dto';

@Injectable()
export class PomodoroSettingsService {
  constructor(
    @InjectRepository(PomodoroSettings)
    private readonly settingsRepository: Repository<PomodoroSettings>,
  ) {}

  /** Retorna as configurações, criando com os valores padrão no primeiro acesso. */
  async get(userId: number): Promise<PomodoroSettings> {
    await this.settingsRepository
      .createQueryBuilder()
      .insert()
      .values({ userId })
      .orIgnore()
      .execute();
    return this.settingsRepository.findOneByOrFail({ userId });
  }

  async update(
    userId: number,
    dto: UpdatePomodoroSettingsDto,
  ): Promise<PomodoroSettings> {
    const settings = await this.get(userId);
    Object.assign(settings, dto);
    return this.settingsRepository.save(settings);
  }
}
