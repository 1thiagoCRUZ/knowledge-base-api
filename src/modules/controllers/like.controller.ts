import { Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Req, UseGuards } from "@nestjs/common";
import { LikeService } from "../services/like.service";
import { AuthGuard } from "@nestjs/passport";

@Controller('likes')
export class LikeController {
    constructor(private readonly likeService: LikeService) { }

    @Post(':articleId')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async addLike(@Param('articleId', ParseIntPipe) articleId: number, @Req() req) {
        return this.likeService.addLike(req.user, articleId);
    }

    @Get('my-likes')
    @UseGuards(AuthGuard('jwt'))
    async findMyLikes(@Req() req) {
        return this.likeService.findAllByUserId(req.user.id);
    }
}