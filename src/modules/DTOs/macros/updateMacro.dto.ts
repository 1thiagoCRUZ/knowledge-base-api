import { PartialType } from "@nestjs/mapped-types";
import { CreateMacroDto } from "./createMacro.dto";

export class UpdateMacroDto extends PartialType(CreateMacroDto) {}