import { IsNotEmpty, IsString } from "class-validator";

export class CreateSuggestionDto {
    @IsString()
    @IsNotEmpty()
    content: string;
}