import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import type { LoginInput } from './domain';
import { ZodValidationPipe } from 'libs/application/src/pipes';
import { LoginZ } from './domain/schemas';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body(new ZodValidationPipe(LoginZ)) login: LoginInput) {
        return this.authService.login(login);
    }
}
