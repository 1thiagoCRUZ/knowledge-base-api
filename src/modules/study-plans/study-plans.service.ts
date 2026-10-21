import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Article } from '../articles/article.entity';
import { ArticlesService } from '../articles/articles.service';
import { StudyPlan } from './study-plan.entity';
import { StudyTopic, StudyTopicStatus } from './study-topic.entity';
import {
  AddStudyTopicsDto,
  CreateStudyPlanDto,
  ReorderStudyTopicsDto,
  UpdateStudyPlanDto,
} from './dto/study-plan.dto';
import {
  CreateStudyTopicDto,
  UpdateStudyTopicDto,
} from './dto/study-topic.dto';

export interface StudyPlanProgress {
  totalTopics: number;
  doneTopics: number;
  inProgressTopics: number;
  totalMinutes: number;
  doneMinutes: number;
  /** % de tópicos concluídos (0–100). */
  percentDone: number;
}

/** Mantém `completedAt` coerente com o status. */
export function applyTopicStatus(
  topic: Pick<StudyTopic, 'status' | 'completedAt'>,
  status: StudyTopicStatus,
  now: Date = new Date(),
): void {
  if (status === 'done' && topic.status !== 'done') {
    topic.completedAt = now;
  } else if (status !== 'done') {
    topic.completedAt = null;
  }
  topic.status = status;
}

export function summarizeTopics(
  topics: Pick<StudyTopic, 'status' | 'estimatedMinutes'>[],
): StudyPlanProgress {
  let doneTopics = 0;
  let inProgressTopics = 0;
  let totalMinutes = 0;
  let doneMinutes = 0;

  for (const topic of topics) {
    const minutes = topic.estimatedMinutes ?? 0;
    totalMinutes += minutes;
    if (topic.status === 'done') {
      doneTopics++;
      doneMinutes += minutes;
    } else if (topic.status === 'in_progress') {
      inProgressTopics++;
    }
  }

  return {
    totalTopics: topics.length,
    doneTopics,
    inProgressTopics,
    totalMinutes,
    doneMinutes,
    percentDone: topics.length
      ? Math.round((doneTopics / topics.length) * 100)
      : 0,
  };
}

@Injectable()
export class StudyPlansService {
  constructor(
    @InjectRepository(StudyPlan)
    private readonly plansRepository: Repository<StudyPlan>,
    @InjectRepository(StudyTopic)
    private readonly topicsRepository: Repository<StudyTopic>,
    private readonly articlesService: ArticlesService,
  ) {}

  // ---------------------------------------------------------------- planos

  async findAll(userId: number) {
    const plans = await this.plansRepository.find({
      where: { userId },
      relations: { topics: true },
      order: { updatedAt: 'DESC' },
    });
    return plans.map(({ topics, ...plan }) => ({
      ...plan,
      progress: summarizeTopics(topics),
    }));
  }

  async findOne(userId: number, id: number) {
    const plan = await this.findOwnedPlan(userId, id);
    const topics = await this.topicsRepository
      .createQueryBuilder('topic')
      .leftJoin('topic.article', 'article')
      .addSelect([
        'article.id',
        'article.title',
        'article.slug',
        'article.isPublished',
      ])
      .where('topic.planId = :planId', { planId: id })
      .orderBy('topic.position', 'ASC')
      .addOrderBy('topic.id', 'ASC')
      .getMany();

    return { ...plan, progress: summarizeTopics(topics), topics };
  }

  async create(userId: number, dto: CreateStudyPlanDto) {
    const topics = dto.topics ?? [];
    await this.assertArticlesExist(topics);

    const planId = await this.plansRepository.manager.transaction(
      async (manager) => {
        const plan = await manager.save(
          manager.create(StudyPlan, {
            userId,
            title: dto.title,
            description: dto.description ?? null,
          }),
        );
        await this.insertTopics(manager, plan.id, topics, 0);
        return plan.id;
      },
    );

    return this.findOne(userId, planId);
  }

  async update(userId: number, id: number, dto: UpdateStudyPlanDto) {
    const plan = await this.findOwnedPlan(userId, id);
    if (dto.title !== undefined) {
      plan.title = dto.title;
    }
    if (dto.description !== undefined) {
      plan.description = dto.description;
    }
    await this.plansRepository.save(plan);
    return this.findOne(userId, id);
  }

  async remove(userId: number, id: number): Promise<void> {
    await this.findOwnedPlan(userId, id);
    // Os tópicos são removidos em cascata.
    await this.plansRepository.delete(id);
  }

  // --------------------------------------------------------------- tópicos

  /** Adiciona tópicos ao fim da tabela. */
  async addTopics(userId: number, planId: number, dto: AddStudyTopicsDto) {
    await this.findOwnedPlan(userId, planId);
    await this.assertArticlesExist(dto.topics);

    const { max } = (await this.topicsRepository
      .createQueryBuilder('topic')
      .select('MAX(topic.position)', 'max')
      .where('topic.planId = :planId', { planId })
      .getRawOne<{ max: number | null }>()) ?? { max: null };
    const start = max === null ? 0 : max + 1;

    await this.topicsRepository.manager.transaction((manager) =>
      this.insertTopics(manager, planId, dto.topics, start),
    );
    return this.findOne(userId, planId);
  }

  async updateTopic(
    userId: number,
    planId: number,
    topicId: number,
    dto: UpdateStudyTopicDto,
  ): Promise<StudyTopic> {
    const topic = await this.findOwnedTopic(userId, planId, topicId);

    if (dto.articleId !== undefined && dto.articleId !== null) {
      await this.articlesService.findOne(dto.articleId);
    }

    const { status, ...fields } = dto;
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        Object.assign(topic, { [key]: value });
      }
    }
    if (status !== undefined) {
      applyTopicStatus(topic, status);
    }
    if (dto.articleId !== undefined) {
      // Sem isso o TypeORM usaria a relação carregada e ignoraria o novo articleId.
      topic.article =
        dto.articleId === null ? null : ({ id: dto.articleId } as Article);
    }

    await this.topicsRepository.save(topic);
    return this.findOwnedTopic(userId, planId, topicId);
  }

  async removeTopic(
    userId: number,
    planId: number,
    topicId: number,
  ): Promise<void> {
    await this.findOwnedTopic(userId, planId, topicId);
    await this.topicsRepository.delete(topicId);
  }

  /** Reordena a tabela (ex.: arrastar e soltar). Exige todos os IDs do plano. */
  async reorderTopics(
    userId: number,
    planId: number,
    dto: ReorderStudyTopicsDto,
  ) {
    await this.findOwnedPlan(userId, planId);
    const existing = await this.topicsRepository.find({
      where: { planId },
      select: { id: true },
    });

    const existingIds = new Set(existing.map((topic) => topic.id));
    const sameSet =
      existingIds.size === dto.topicIds.length &&
      dto.topicIds.every((id) => existingIds.has(id));
    if (!sameSet) {
      throw new BadRequestException(
        'topicIds deve conter exatamente todos os tópicos do plano.',
      );
    }

    await this.topicsRepository.manager.transaction(async (manager) => {
      for (const [position, id] of dto.topicIds.entries()) {
        await manager.update(StudyTopic, { id, planId }, { position });
      }
    });
    return this.findOne(userId, planId);
  }

  // ------------------------------------------------------------- auxiliares

  private async findOwnedPlan(userId: number, id: number): Promise<StudyPlan> {
    const plan = await this.plansRepository.findOneBy({ id, userId });
    if (!plan) {
      throw new NotFoundException(`Plano de estudos ${id} não encontrado.`);
    }
    return plan;
  }

  private async findOwnedTopic(
    userId: number,
    planId: number,
    topicId: number,
  ): Promise<StudyTopic> {
    const topic = await this.topicsRepository
      .createQueryBuilder('topic')
      .innerJoin('topic.plan', 'plan', 'plan.userId = :userId', { userId })
      .leftJoin('topic.article', 'article')
      .addSelect([
        'article.id',
        'article.title',
        'article.slug',
        'article.isPublished',
      ])
      .where('topic.id = :topicId AND topic.planId = :planId', {
        topicId,
        planId,
      })
      .getOne();
    if (!topic) {
      throw new NotFoundException(`Tópico ${topicId} não encontrado.`);
    }
    return topic;
  }

  private async insertTopics(
    manager: EntityManager,
    planId: number,
    topics: CreateStudyTopicDto[],
    startPosition: number,
  ): Promise<void> {
    if (topics.length === 0) {
      return;
    }
    const entities = topics.map((dto, index) => {
      const topic = manager.create(StudyTopic, {
        planId,
        title: dto.title,
        module: dto.module ?? null,
        priority: dto.priority ?? 'medium',
        estimatedMinutes: dto.estimatedMinutes ?? null,
        notes: dto.notes ?? null,
        articleId: dto.articleId ?? null,
        position: startPosition + index,
        status: 'todo',
        completedAt: null,
      });
      applyTopicStatus(topic, dto.status ?? 'todo');
      return topic;
    });
    await manager.save(entities);
  }

  private async assertArticlesExist(
    topics: Pick<CreateStudyTopicDto, 'articleId'>[],
  ): Promise<void> {
    const ids = new Set(
      topics
        .map((topic) => topic.articleId)
        .filter((id): id is number => id !== undefined),
    );
    for (const id of ids) {
      await this.articlesService.findOne(id);
    }
  }
}
