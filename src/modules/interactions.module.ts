import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Like } from "./entities/like.entity";
import { LikeController } from "./controllers/like.controller";
import { LikeService } from "./services/like.service";
import { LikeRepository } from "./repositories/like.repository";
import { AuthModule } from "./auth/auth.module";
import { ArticleModule } from "./article.module";

@Module({
    imports: [TypeOrmModule.forFeature([Like]), AuthModule, ArticleModule],
    controllers: [LikeController],
    providers: [LikeService, LikeRepository],
    exports: [LikeService, LikeRepository],
})
export class InteractionsModule { }