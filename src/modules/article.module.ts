import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category } from "./entities/category.entity";
import { Article } from "./entities/article.entity";
import { ArticleController } from "./controllers/article.controller";
import { ArticleService } from "./services/article.service";
import { ArticleRepository } from "./repositories/article.repository";

@Module({
    imports: [TypeOrmModule.forFeature([Article, Category])],
    controllers: [ArticleController],
    providers: [ArticleService, ArticleRepository],
    exports: [ArticleService, ArticleRepository],
})
export class ArticleModule { }