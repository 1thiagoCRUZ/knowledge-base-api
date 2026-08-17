import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthLoginDto } from "../DTOs/auth/authLogin.dto";
import { AuthService } from "./auth.service";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() authLoginDto: AuthLoginDto) {
        return this.authService.login(authLoginDto);
    }
}