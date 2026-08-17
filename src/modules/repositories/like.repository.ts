import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like } from "../entities/like.entity";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { Article } from "../entities/article.entity";

@Injectable()
export class LikeRepository {
    constructor(@InjectRepository(Like) private readonly repository: Repository<Like>) { }

    async findOne(articleId: number, userId: number): Promise<Like | null> {
        return this.repository.findOneBy({ articleId, userId });
    }

    async addLike(user: User, article: Article): Promise<Like> {
        const like = this.repository.create({ user, article });
        return this.repository.save(like);
    }

    async removeLike(like: Like): Promise<void> {
        await this.repository.delete(like);
    }

    async countLikes(articleId: number): Promise<number> {
        return this.repository.count({ where: { articleId } });
    }

    async countLikesByArticle(article: Article): Promise<number> {
        return this.repository.count({ where: { article } });
    }

    async countLikesByUser(user: User): Promise<number> {
        return this.repository.count({ where: { user } });
    }

    async findAllByUserId(userId: number): Promise<Like[]> {
        return this.repository.find({ where: { userId } });
    }

    async findAllByArticleId(articleId: number): Promise<Like[]> {
        return this.repository.find({ where: { articleId } });
    }
}
