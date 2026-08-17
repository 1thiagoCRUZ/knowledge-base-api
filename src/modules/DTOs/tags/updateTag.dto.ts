import { PartialType } from "@nestjs/swagger";
import { CreateTagDto } from "./createTag.dto";

export class UpdateTagDto extends PartialType(CreateTagDto) {}