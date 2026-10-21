import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validateEnv } from './config/env.validation';
import { dataSourceOptions } from './database/data-source';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { TypeOrmExceptionFilter } from './common/filters/typeorm-exception.filter';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TagsModule } from './modules/tags/tags.module';
import { N8nModule } from './modules/integrations/n8n/n8n.module';
import { PomodoroModule } from './modules/pomodoro/pomodoro.module';
import { StudyPlansModule } from './modules/study-plans/study-plans.module';
import { HealthController } from './modules/health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    TypeOrmModule.forRoot(dataSourceOptions),
    // Limites aplicados só onde há @UseGuards(ThrottlerGuard) (ex.: login).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    AuthModule,
    UsersModule,
    ArticlesModule,
    CategoriesModule,
    TagsModule,
    N8nModule,
    PomodoroModule,
    StudyPlansModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: TypeOrmExceptionFilter },
    // Aplica @Exclude() das entidades (ex.: userId) nas respostas.
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
