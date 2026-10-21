import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ArticlesService } from '../articles/articles.service';
import { StudyPlan } from './study-plan.entity';
import { StudyTopic } from './study-topic.entity';
import {
  applyTopicStatus,
  StudyPlansService,
  summarizeTopics,
} from './study-plans.service';

describe('applyTopicStatus', () => {
  const now = new Date('2026-10-11T12:00:00Z');

  it('marca completedAt ao concluir', () => {
    const topic = { status: 'in_progress' as const, completedAt: null };
    applyTopicStatus(topic, 'done', now);
    expect(topic).toEqual({ status: 'done', completedAt: now });
  });

  it('mantém a data ao "reconcluir"', () => {
    const original = new Date('2026-01-01T00:00:00Z');
    const topic = { status: 'done' as const, completedAt: original };
    applyTopicStatus(topic, 'done', now);
    expect(topic.completedAt).toBe(original);
  });

  it('limpa completedAt ao reabrir', () => {
    const topic = { status: 'done' as const, completedAt: now };
    applyTopicStatus(topic, 'todo', now);
    expect(topic).toEqual({ status: 'todo', completedAt: null });
  });
});

describe('summarizeTopics', () => {
  it('calcula contagens, minutos e percentual', () => {
    expect(
      summarizeTopics([
        { status: 'done', estimatedMinutes: 60 },
        { status: 'done', estimatedMinutes: null },
        { status: 'in_progress', estimatedMinutes: 30 },
        { status: 'todo', estimatedMinutes: 90 },
      ]),
    ).toEqual({
      totalTopics: 4,
      doneTopics: 2,
      inProgressTopics: 1,
      totalMinutes: 180,
      doneMinutes: 60,
      percentDone: 50,
    });
  });

  it('plano vazio tem 0%', () => {
    expect(summarizeTopics([]).percentDone).toBe(0);
  });
});

describe('StudyPlansService', () => {
  let service: StudyPlansService;
  let plans: { findOneBy: jest.Mock; find: jest.Mock };
  let topics: {
    find: jest.Mock;
    save: jest.Mock<Promise<void>, [StudyTopic]>;
    manager: { transaction: jest.Mock };
  };
  let articles: { assertOwned: jest.Mock };

  beforeEach(() => {
    plans = {
      findOneBy: jest.fn().mockResolvedValue({ id: 1, userId: 7 }),
      find: jest.fn(),
    };
    topics = {
      find: jest.fn(),
      save: jest.fn<Promise<void>, [StudyTopic]>(),
      manager: { transaction: jest.fn() },
    };
    articles = { assertOwned: jest.fn() };
    service = new StudyPlansService(
      plans as unknown as Repository<StudyPlan>,
      topics as unknown as Repository<StudyTopic>,
      articles as unknown as ArticlesService,
    );
  });

  it('lança 404 para plano de outro usuário', async () => {
    plans.findOneBy.mockResolvedValue(null);
    await expect(service.remove(99, 1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(plans.findOneBy).toHaveBeenCalledWith({ id: 1, userId: 99 });
  });

  describe('reorderTopics', () => {
    beforeEach(() => {
      topics.find.mockResolvedValue([{ id: 10 }, { id: 11 }, { id: 12 }]);
    });

    it('rejeita lista incompleta', async () => {
      await expect(
        service.reorderTopics(7, 1, { topicIds: [12, 10] }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(topics.manager.transaction).not.toHaveBeenCalled();
    });

    it('rejeita ID de outro plano', async () => {
      await expect(
        service.reorderTopics(7, 1, { topicIds: [12, 10, 99] }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('grava a nova ordem', async () => {
      const update = jest.fn<
        Promise<void>,
        [unknown, Record<string, number>, Record<string, number>]
      >();
      topics.manager.transaction.mockImplementation(
        (fn: (manager: { update: typeof update }) => Promise<void>) =>
          fn({ update }),
      );
      jest.spyOn(service, 'findOne').mockResolvedValue({} as never);

      await service.reorderTopics(7, 1, { topicIds: [12, 10, 11] });

      expect(update.mock.calls.map((call) => [call[1], call[2]])).toEqual([
        [{ id: 12, planId: 1 }, { position: 0 }],
        [{ id: 10, planId: 1 }, { position: 1 }],
        [{ id: 11, planId: 1 }, { position: 2 }],
      ]);
    });
  });

  describe('updateTopic', () => {
    const existing = (): StudyTopic =>
      ({
        id: 5,
        planId: 1,
        title: 'JOINs',
        status: 'todo',
        completedAt: null,
        module: 'SQL',
        articleId: 3,
        article: { id: 3 },
      }) as StudyTopic;

    let findOwnedTopic: jest.SpyInstance;

    beforeEach(() => {
      findOwnedTopic = jest
        .spyOn(
          service as unknown as {
            findOwnedTopic: () => Promise<StudyTopic>;
          },
          'findOwnedTopic',
        )
        .mockImplementation(() => Promise.resolve(existing()));
    });

    it('concluir preenche completedAt e limpa campos com null', async () => {
      await service.updateTopic(7, 1, 5, { status: 'done', module: null });
      const saved = topics.save.mock.calls[0][0];
      expect(saved.status).toBe('done');
      expect(saved.completedAt).toBeInstanceOf(Date);
      expect(saved.module).toBeNull();
      expect(saved.title).toBe('JOINs');
    });

    it('não vincula aula de outro usuário', async () => {
      articles.assertOwned.mockRejectedValue(new NotFoundException());
      await expect(
        service.updateTopic(7, 1, 5, { articleId: 42 }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(topics.save).not.toHaveBeenCalled();
    });

    it('troca a aula vinculada validando que ela é do usuário', async () => {
      await service.updateTopic(7, 1, 5, { articleId: 8 });
      expect(articles.assertOwned).toHaveBeenCalledWith(7, 8);
      const saved = topics.save.mock.calls[0][0];
      expect(saved.articleId).toBe(8);
      expect(saved.article).toEqual({ id: 8 });
    });

    it('desvincula a aula com null', async () => {
      await service.updateTopic(7, 1, 5, { articleId: null });
      expect(articles.assertOwned).not.toHaveBeenCalled();
      const saved = topics.save.mock.calls[0][0];
      expect(saved.articleId).toBeNull();
      expect(saved.article).toBeNull();
    });

    it('propaga 404 de tópico inexistente', async () => {
      findOwnedTopic.mockRejectedValue(new NotFoundException());
      await expect(
        service.updateTopic(7, 1, 5, { title: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
