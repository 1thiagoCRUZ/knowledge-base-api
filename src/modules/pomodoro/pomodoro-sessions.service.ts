import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  LessThan,
  MoreThanOrEqual,
  And,
  Repository,
} from 'typeorm';
import { Paginated, paginate } from '../../common/dto/pagination.dto';
import { ArticlesService } from '../articles/articles.service';
import { PomodoroSession } from './pomodoro-session.entity';
import { PomodoroSettingsService } from './pomodoro-settings.service';
import {
  CreatePomodoroSessionDto,
  MAX_SESSION_SECONDS,
} from './dto/create-pomodoro-session.dto';
import { ListPomodoroSessionsQueryDto } from './dto/pomodoro-query.dto';

/** Tolerância para diferença de relógio entre o navegador e o servidor. */
const CLOCK_SKEW_MS = 5 * 60 * 1000;

/** Valida o intervalo enviado pelo front e retorna a duração em segundos. */
export function computeSessionDuration(
  startedAt: Date,
  endedAt: Date,
  now: Date = new Date(),
): number {
  if (endedAt.getTime() <= startedAt.getTime()) {
    throw new BadRequestException('endedAt deve ser depois de startedAt.');
  }
  if (endedAt.getTime() > now.getTime() + CLOCK_SKEW_MS) {
    throw new BadRequestException('endedAt não pode estar no futuro.');
  }
  const seconds = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000);
  if (seconds > MAX_SESSION_SECONDS) {
    throw new BadRequestException('Uma sessão não pode passar de 4 horas.');
  }
  return seconds;
}

interface DailyStatsRow {
  date: string;
  completedSessions: number;
  focusSeconds: number;
}

interface TopArticleRow {
  id: number;
  title: string;
  slug: string;
  focusSeconds: number;
}

const toMinutes = (seconds: number) => Math.round(seconds / 60);

@Injectable()
export class PomodoroSessionsService {
  constructor(
    @InjectRepository(PomodoroSession)
    private readonly sessionsRepository: Repository<PomodoroSession>,
    private readonly settingsService: PomodoroSettingsService,
    private readonly articlesService: ArticlesService,
  ) {}

  async create(
    userId: number,
    dto: CreatePomodoroSessionDto,
  ): Promise<PomodoroSession> {
    const startedAt = new Date(dto.startedAt);
    const endedAt = new Date(dto.endedAt);
    const durationSeconds = computeSessionDuration(startedAt, endedAt);

    if (dto.articleId !== undefined) {
      await this.articlesService.findOne(dto.articleId);
    }

    const session = this.sessionsRepository.create({
      userId,
      type: dto.type,
      startedAt,
      endedAt,
      plannedSeconds: dto.plannedSeconds,
      durationSeconds,
      completed: dto.completed,
      articleId: dto.articleId ?? null,
    });
    return this.sessionsRepository.save(session);
  }

  async findAll(
    userId: number,
    query: ListPomodoroSessionsQueryDto,
  ): Promise<Paginated<PomodoroSession>> {
    const where: FindOptionsWhere<PomodoroSession> = { userId };
    const from = query.from ? MoreThanOrEqual(new Date(query.from)) : null;
    const to = query.to ? LessThan(new Date(query.to)) : null;
    if (from && to) {
      where.startedAt = And(from, to);
    } else if (from ?? to) {
      where.startedAt = from ?? to ?? undefined;
    }

    const [data, total] = await this.sessionsRepository.findAndCount({
      where,
      order: { startedAt: 'DESC' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return paginate(data, total, query);
  }

  async remove(userId: number, id: number): Promise<void> {
    const result = await this.sessionsRepository.delete({ id, userId });
    if (!result.affected) {
      throw new NotFoundException(`Sessão ${id} não encontrada.`);
    }
  }

  /**
   * Estatísticas de foco dos últimos `days` dias (incluindo hoje), com os dias
   * contados no fuso configurado nas settings.
   */
  async stats(userId: number, days: number) {
    const { timezone } = await this.settingsService.get(userId);

    const daily = await this.sessionsRepository.query<DailyStatsRow[]>(
      `WITH days AS (
         SELECT generate_series(
           (now() AT TIME ZONE $2)::date - ($3::int - 1),
           (now() AT TIME ZONE $2)::date,
           interval '1 day'
         )::date AS day
       )
       SELECT to_char(d.day, 'YYYY-MM-DD') AS "date",
              (COUNT(s.id) FILTER (WHERE s.completed))::int AS "completedSessions",
              COALESCE(SUM(s."durationSeconds"), 0)::int AS "focusSeconds"
         FROM days d
         LEFT JOIN pomodoro_session s
           ON s."userId" = $1
          AND s.type = 'focus'
          AND (s."startedAt" AT TIME ZONE $2)::date = d.day
        GROUP BY d.day
        ORDER BY d.day`,
      [userId, timezone, days],
    );

    const topArticles = await this.sessionsRepository.query<TopArticleRow[]>(
      `SELECT a.id, a.title, a.slug,
              SUM(s."durationSeconds")::int AS "focusSeconds"
         FROM pomodoro_session s
         JOIN article a ON a.id = s."articleId"
        WHERE s."userId" = $1
          AND s.type = 'focus'
          AND (s."startedAt" AT TIME ZONE $2)::date
              >= (now() AT TIME ZONE $2)::date - ($3::int - 1)
        GROUP BY a.id
        ORDER BY "focusSeconds" DESC
        LIMIT 5`,
      [userId, timezone, days],
    );

    const dailyStats = daily.map((row) => ({
      date: row.date,
      completedSessions: row.completedSessions,
      focusMinutes: toMinutes(row.focusSeconds),
    }));
    const totalSeconds = daily.reduce((sum, row) => sum + row.focusSeconds, 0);

    return {
      timezone,
      days,
      today: dailyStats[dailyStats.length - 1],
      total: {
        completedSessions: dailyStats.reduce(
          (sum, row) => sum + row.completedSessions,
          0,
        ),
        focusMinutes: toMinutes(totalSeconds),
      },
      daily: dailyStats,
      topArticles: topArticles.map((row) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        focusMinutes: toMinutes(row.focusSeconds),
      })),
    };
  }
}
