import { Injectable } from '@nestjs/common';
import { ArticlesService } from '../../articles/articles.service';
import { CategoriesService } from '../../categories/categories.service';
import { TagsService } from '../../tags/tags.service';
import { UsersService } from '../../users/users.service';
import { N8nLessonDto } from './dto/n8n-lesson.dto';

@Injectable()
export class N8nService {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly categoriesService: CategoriesService,
    private readonly tagsService: TagsService,
    private readonly usersService: UsersService,
  ) {}

  async receiveLesson(dto: N8nLessonDto) {
    const [owner, category, tags] = await Promise.all([
      this.usersService.findOwner(),
      this.categoriesService.findOrCreateByName(dto.category),
      this.tagsService.findOrCreateByNames(dto.tags ?? []),
    ]);

    const { article, created } = await this.articlesService.upsertExternal({
      source: 'n8n',
      externalId: dto.externalId,
      title: dto.title,
      content: dto.content,
      category,
      tags,
      userId: owner.id,
      series: dto.series,
      seriesPosition: dto.seriesPosition,
      metadata: dto.metadata,
    });

    return {
      status: created ? 'created' : 'updated',
      id: article.id,
      slug: article.slug,
      isPublished: article.isPublished,
    };
  }
}
