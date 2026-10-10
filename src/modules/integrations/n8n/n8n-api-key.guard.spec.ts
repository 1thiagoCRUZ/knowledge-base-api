import {
  ExecutionContext,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { N8nApiKeyGuard } from './n8n-api-key.guard';

const KEY = 'a'.repeat(40);

function contextWithHeader(value?: string): ExecutionContext {
  const request = {
    header: (name: string) => (name === 'x-api-key' ? value : undefined),
  };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function guardWithKey(key?: string) {
  return new N8nApiKeyGuard({ get: () => key } as unknown as ConfigService);
}

describe('N8nApiKeyGuard', () => {
  it('aceita a chave correta', () => {
    expect(guardWithKey(KEY).canActivate(contextWithHeader(KEY))).toBe(true);
  });

  it('rejeita chave errada ou ausente', () => {
    const guard = guardWithKey(KEY);
    expect(() => guard.canActivate(contextWithHeader('errada'))).toThrow(
      UnauthorizedException,
    );
    expect(() => guard.canActivate(contextWithHeader())).toThrow(
      UnauthorizedException,
    );
  });

  it('fica desativado sem N8N_API_KEY configurada', () => {
    expect(() =>
      guardWithKey(undefined).canActivate(contextWithHeader(KEY)),
    ).toThrow(ServiceUnavailableException);
  });
});
