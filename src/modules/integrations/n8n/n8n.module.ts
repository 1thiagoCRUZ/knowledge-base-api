import { Module } from '@nestjs/common';
import { ArticlesModule } from '../../articles/articles.module';
import { CategoriesModule } from '../../categories/categories.module';
import { TagsModule } from '../../tags/tags.module';
import { UsersModule } from '../../users/users.module';
import { N8nController } from './n8n.controller';
import { N8nService } from './n8n.service';
import { N8nApiKeyGuard } from './n8n-api-key.guard';

@Module({
  imports: [ArticlesModule, CategoriesModule, TagsModule, UsersModule],
  controllers: [N8nController],
  providers: [N8nService, N8nApiKeyGuard],
})
export class N8nModule {}
