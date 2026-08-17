import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Suggestion } from "./entities/suggestion.entity";
import { SuggestionController } from "./controllers/suggestion.controller";
import { SuggestionService } from "./services/suggestion.service";
import { SuggestionRepository } from "./repositories/suggestion.repository";

@Module({
    imports: [TypeOrmModule.forFeature([Suggestion])],
    controllers: [SuggestionController],
    providers: [SuggestionService, SuggestionRepository],
    exports: [SuggestionService, SuggestionRepository],
})
export class SuggestionModule { }