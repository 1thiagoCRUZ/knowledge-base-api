import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category } from "./entities/category.entity";
import { CategoryController } from "./controllers/category.controller";
import { CategoryService } from "./services/category.service";
import { CategoryRepository } from "./repositories/category.repository";

@Module({
    imports: [TypeOrmModule.forFeature([Category])],
    controllers: [CategoryController],
    providers: [CategoryService, CategoryRepository],
    exports: [CategoryService, CategoryRepository],
})
export class CategoryModule { }