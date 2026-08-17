import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Macro } from "./entities/macro.entity";
import { MacroController } from "./controllers/macro.controller";
import { MacroService } from "./services/macro.service";
import { MacroRepository } from "./repositories/macro.repository";

@Module({
    imports: [TypeOrmModule.forFeature([Macro])],
    controllers: [MacroController],
    providers: [MacroService, MacroRepository],
    exports: [MacroService, MacroRepository],
})
export class MacroModule { }