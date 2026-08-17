import { PartialType } from "@nestjs/mapped-types";
import { CreateSuggestionDto } from "./createSuggestion.dto";

export class UpdateSuggestionDto extends PartialType(CreateSuggestionDto) {}