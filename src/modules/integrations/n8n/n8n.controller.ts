import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../../../common/decorators/public.decorator';
import { N8N_API_KEY_HEADER, N8nApiKeyGuard } from './n8n-api-key.guard';
import { N8nService } from './n8n.service';
import { N8nLessonDto } from './dto/n8n-lesson.dto';

/**
 * Webhook chamado pelo n8n quando termina de gerar uma aula.
 * Usa chave de API em vez do JWT do usuário (que expira).
 */
@ApiTags('integrations')
@ApiHeader({ name: N8N_API_KEY_HEADER, required: true })
@Public()
@UseGuards(N8nApiKeyGuard)
@Controller('integrations/n8n')
export class N8nController {
  constructor(private readonly n8nService: N8nService) {}

  @Post('lessons')
  @ApiResponse({ status: 201, description: 'Aula criada como rascunho' })
  @ApiResponse({ status: 200, description: 'Rascunho existente atualizado' })
  @ApiResponse({
    status: 409,
    description: 'Aula já publicada; não sobrescrita',
  })
  async receiveLesson(
    @Body() dto: N8nLessonDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.n8nService.receiveLesson(dto);
    res.status(
      result.status === 'created' ? HttpStatus.CREATED : HttpStatus.OK,
    );
    return result;
  }
}
