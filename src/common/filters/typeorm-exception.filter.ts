import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_NOT_NULL_VIOLATION = '23502';

/** Converte erros de constraint do Postgres em respostas 4xx em vez de 500. */
@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TypeOrmExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const code = (exception.driverError as { code?: string }).code;

    if (code === PG_UNIQUE_VIOLATION) {
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: 'Já existe um registro com esses dados.',
        error: 'Conflict',
      });
    }

    if (code === PG_FOREIGN_KEY_VIOLATION) {
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message:
          'Operação viola um relacionamento (registro em uso ou referência inexistente).',
        error: 'Conflict',
      });
    }

    if (code === PG_NOT_NULL_VIOLATION) {
      const column = (exception.driverError as { column?: string }).column;
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: column
          ? `O campo "${column}" não pode ser nulo.`
          : 'Campo obrigatório não pode ser nulo.',
        error: 'Bad Request',
      });
    }

    this.logger.error(exception.message, exception.stack);
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
