import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesModule } from '../articles/articles.module';
import { StudyPlan } from './study-plan.entity';
import { StudyTopic } from './study-topic.entity';
import { StudyPlansService } from './study-plans.service';
import { StudyPlansController } from './study-plans.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StudyPlan, StudyTopic]), ArticlesModule],
  controllers: [StudyPlansController],
  providers: [StudyPlansService],
  exports: [StudyPlansService],
})
export class StudyPlansModule {}
