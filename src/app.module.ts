import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { dataSourceOptions } from './database/config/db';
import { ArticleModule } from "./modules/article.module";
import { UsersModule } from "./modules/user.module";
import { TagModule } from "./modules/tag.module";
import { SuggestionModule } from "./modules/suggestion.module";
import { MacroModule } from "./modules/macro.module";
import { InteractionsModule } from "./modules/interactions.module";
import { CategoryModule } from "./modules/category.module";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule } from "./modules/auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    ArticleModule,
    UsersModule,
    TagModule,
    AuthModule,
    SuggestionModule,
    MacroModule,
    JwtModule,
    InteractionsModule,
    CategoryModule
  ],
})

export class AppModule {}