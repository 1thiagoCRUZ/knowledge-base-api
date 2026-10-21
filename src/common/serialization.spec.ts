import { instanceToPlain } from 'class-transformer';
import { Article } from '../modules/articles/article.entity';
import { Category } from '../modules/categories/category.entity';
import { StudyPlan } from '../modules/study-plans/study-plan.entity';
import { PomodoroSettings } from '../modules/pomodoro/pomodoro-settings.entity';

/**
 * O ClassSerializerInterceptor global usa instanceToPlain nas respostas.
 * Estes testes garantem que campos internos não vazam.
 */
describe('serialização das respostas', () => {
  const article = Object.assign(new Article(), {
    id: 1,
    userId: 7,
    title: 'SQL',
    category: Object.assign(new Category(), { id: 2, userId: 7, name: 'BD' }),
  });

  it('remove userId da entidade e das relações', () => {
    const plain = instanceToPlain(article);
    expect(plain).not.toHaveProperty('userId');
    expect(plain.category).not.toHaveProperty('userId');
    expect(plain).toMatchObject({ id: 1, title: 'SQL' });
  });

  it('remove userId de entidades dentro de objetos comuns (paginação)', () => {
    const plain = instanceToPlain({ data: [article], meta: { total: 1 } }) as {
      data: Record<string, unknown>[];
      meta: unknown;
    };
    expect(plain.data[0]).not.toHaveProperty('userId');
    expect(plain.meta).toEqual({ total: 1 });
  });

  it('remove userId de plano de estudos e configurações do Pomodoro', () => {
    expect(
      instanceToPlain(Object.assign(new StudyPlan(), { id: 1, userId: 7 })),
    ).not.toHaveProperty('userId');
    expect(
      instanceToPlain(
        Object.assign(new PomodoroSettings(), { userId: 7, focusMinutes: 25 }),
      ),
    ).toEqual({ focusMinutes: 25 });
  });
});
