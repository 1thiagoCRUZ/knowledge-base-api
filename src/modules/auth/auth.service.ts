import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthLoginDto } from "../DTOs/auth/authLogin.dto";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../services/user.service";

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService, private readonly jwtService: JwtService) {}

    async login(authLoginDto: AuthLoginDto) {
        const user = await this.userService.findByEmailForAuth(authLoginDto.email);

        if (!user) {
            throw new UnauthorizedException('Email ou senha inválidos');
        }
        const isPasswordValid = await bcrypt.compare(authLoginDto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Email ou senha inválidos');
        }

        const payload = { sub: user.id, email: user.email, name: user.name };
        return {
            access_token: this.jwtService.sign(payload),
        }
    }
}