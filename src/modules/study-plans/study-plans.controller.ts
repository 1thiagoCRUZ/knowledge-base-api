import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StudyPlansService } from './study-plans.service';
import {
  AddStudyTopicsDto,
  CreateStudyPlanDto,
  ReorderStudyTopicsDto,
  UpdateStudyPlanDto,
} from './dto/study-plan.dto';
import { UpdateStudyTopicDto } from './dto/study-topic.dto';

@ApiTags('study-plans')
@ApiBearerAuth()
@Controller('study-plans')
export class StudyPlansController {
  constructor(private readonly studyPlansService: StudyPlansService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateStudyPlanDto,
  ) {
    return this.studyPlansService.create(user.id, dto);
  }

  /** Lista os planos com o progresso de cada um (sem os tópicos). */
  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.studyPlansService.findAll(user.id);
  }

  /** Plano com progresso e todos os tópicos, na ordem da tabela. */
  @Get(':id')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.studyPlansService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudyPlanDto,
  ) {
    return this.studyPlansService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.studyPlansService.remove(user.id, id);
  }

  /** Adiciona um ou mais tópicos ao fim da tabela. */
  @Post(':id/topics')
  addTopics(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddStudyTopicsDto,
  ) {
    return this.studyPlansService.addTopics(user.id, id, dto);
  }

  @Put(':id/topics/order')
  reorderTopics(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReorderStudyTopicsDto,
  ) {
    return this.studyPlansService.reorderTopics(user.id, id, dto);
  }

  /** Edição inline de uma linha (status, prioridade, carga horária...). */
  @Patch(':id/topics/:topicId')
  updateTopic(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Param('topicId', ParseIntPipe) topicId: number,
    @Body() dto: UpdateStudyTopicDto,
  ) {
    return this.studyPlansService.updateTopic(user.id, id, topicId, dto);
  }

  @Delete(':id/topics/:topicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTopic(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Param('topicId', ParseIntPipe) topicId: number,
  ) {
    return this.studyPlansService.removeTopic(user.id, id, topicId);
  }
}
