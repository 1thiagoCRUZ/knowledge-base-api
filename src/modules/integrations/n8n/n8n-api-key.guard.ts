import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, timingSafeEqual } from 'crypto';
import { Request } from 'express';

export const N8N_API_KEY_HEADER = 'x-api-key';

function sha256(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

/** Autentica chamadas do n8n pela chave `N8N_API_KEY` no header `X-API-Key`. */
@Injectable()
export class N8nApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get<string>('N8N_API_KEY');
    if (!expected) {
      throw new ServiceUnavailableException(
        'Integração com n8n desativada: defina N8N_API_KEY.',
      );
    }

    const request = context.switchToHttp().getRequest<Request>();
    const received = request.header(N8N_API_KEY_HEADER);
    // Compara os hashes para ter tamanho fixo e tempo constante.
    if (!received || !timingSafeEqual(sha256(received), sha256(expected))) {
      throw new UnauthorizedException('Chave de API inválida.');
    }
    return true;
  }
}
