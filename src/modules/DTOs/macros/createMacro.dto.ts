import { IsNotEmpty, IsString } from "class-validator";

export class CreateMacroDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    contentBody: string;
}