import { BadRequestException } from '@nestjs/common';
import { computeSessionDuration } from './pomodoro-sessions.service';
import { isValidTimeZone } from '../../common/validators/is-timezone.validator';

describe('computeSessionDuration', () => {
  const now = new Date('2026-10-10T16:00:00Z');
  const at = (iso: string) => new Date(iso);

  it('calcula a duração em segundos', () => {
    expect(
      computeSessionDuration(
        at('2026-10-10T15:00:00Z'),
        at('2026-10-10T15:25:00Z'),
        now,
      ),
    ).toBe(1500);
  });

  it('rejeita fim antes do início', () => {
    expect(() =>
      computeSessionDuration(
        at('2026-10-10T15:25:00Z'),
        at('2026-10-10T15:00:00Z'),
        now,
      ),
    ).toThrow(BadRequestException);
  });

  it('rejeita fim no futuro, com tolerância de relógio', () => {
    expect(() =>
      computeSessionDuration(
        at('2026-10-10T15:50:00Z'),
        at('2026-10-10T16:10:00Z'),
        now,
      ),
    ).toThrow(BadRequestException);
    expect(
      computeSessionDuration(
        at('2026-10-10T15:40:00Z'),
        at('2026-10-10T16:02:00Z'),
        now,
      ),
    ).toBe(1320);
  });

  it('rejeita sessões com mais de 4 horas', () => {
    expect(() =>
      computeSessionDuration(
        at('2026-10-10T10:00:00Z'),
        at('2026-10-10T15:00:00Z'),
        now,
      ),
    ).toThrow(BadRequestException);
  });
});

describe('isValidTimeZone', () => {
  it('aceita fusos IANA e rejeita lixo', () => {
    expect(isValidTimeZone('America/Sao_Paulo')).toBe(true);
    expect(isValidTimeZone('UTC')).toBe(true);
    expect(isValidTimeZone('Terra/Media')).toBe(false);
    expect(isValidTimeZone('')).toBe(false);
  });
});
