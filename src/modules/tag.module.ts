import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tag } from "./entities/tag.entity";
import { TagController } from "./controllers/tag.controller";
import { TagService } from "./services/tag.service";
import { TagRepository } from "./repositories/tag.repository";

@Module({
    imports: [TypeOrmModule.forFeature([Tag])], 
    controllers: [TagController],
    providers: [TagService, TagRepository],
    exports: [TagService, TagRepository],
})
export class TagModule { }