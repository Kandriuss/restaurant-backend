import { Inject, Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import type { IUserRepository } from 'src/user/domain/interfaces';
import type { IAuthResponse, LoginInput } from './domain';
import { ILogin } from './domain/interface';
import { PasswordUtil } from 'src/user/utils';
import type { IJwtAdapterService } from 'libs/domain/src';
import { errorMessagesAuth } from 'libs/infraestructure/src/constants';

@Injectable()
export class AuthService {
    constructor(
        @Inject('UserRepository') private userRepository: IUserRepository,
        @Inject('JwtAdapterService') private jwtService: IJwtAdapterService,
    ) {}

    async login(login: LoginInput): Promise<IAuthResponse> {
        try {
            const user = await this.userRepository.findByEmail(login.email);
            if (!user) {
                throw new UnauthorizedException(errorMessagesAuth.userNotFound);
            }
    
            if (!await PasswordUtil.validate(login.password, user.password)) {
                throw new UnauthorizedException(errorMessagesAuth.passwordIncorrect);
            }

            // Verificar que el usuario tenga un roleCode válido
            if (!user.roleCode) {
                throw new UnauthorizedException(errorMessagesAuth.userWithoutRole);
            }

            //payload para el token
            const payload = {
                id: user.id,
                email: user.email,
                name: user.name,
                lastname: user.lastName,
                role: user.roleCode
            }

            // Crear el token JWT
            const tokenResult = await this.jwtService.createToken(payload, '24h');
            
            return {
                accessToken: tokenResult.accessToken,
                expiresAt: tokenResult.expiresAt,
                user: {
                    id: user.id ?? '',
                    email: user.email,
                    role: user.roleCode
                }
            };
            
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException(errorMessagesAuth.internalServerError);
        }
    }
    
}
