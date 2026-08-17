import { Injectable, NotFoundException } from "@nestjs/common";
import { LikeRepository } from "../repositories/like.repository";
import { Like } from "../entities/like.entity";
import { User } from "../entities/user.entity";
import { ArticleRepository } from "../repositories/article.repository";

@Injectable()
export class LikeService {
    constructor(private readonly likeRepository: LikeRepository, private readonly articleRepository: ArticleRepository) { }

    async addLike(user: User, articleId: number) {
        const article = await this.articleRepository.findById(articleId);
        if (!article) {
            throw new NotFoundException('Artigo não encontrado');
        }

        const existingLike = await this.likeRepository.findOne(user.id, articleId);
        if (existingLike) {
            await this.likeRepository.removeLike(existingLike);
            return { status: 'unliked', message: 'Like removido' };
        } else {
            await this.likeRepository.addLike(user, article);
            return { status: 'liked', message: 'Like adicionado' };
        }
    }

    async countLikes(articleId: number): Promise<number> {
        return this.likeRepository.countLikes(articleId);
    }

    async countLikesByArticle(articleId: number): Promise<number> {
        return this.likeRepository.countLikes(articleId);
    }

    async countLikesByUser(userId: number): Promise<number> {
        return this.likeRepository.countLikes(userId);
    }

    async findAllByUserId(userId: number): Promise<Like[]> {
        return this.likeRepository.findAllByUserId(userId);
    }

    async findAllByArticleId(articleId: number): Promise<Like[]> {
        return this.likeRepository.findAllByArticleId(articleId);
    }
}