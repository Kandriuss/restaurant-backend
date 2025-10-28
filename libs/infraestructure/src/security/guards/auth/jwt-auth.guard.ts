import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtAdapterService } from '../../../adapters'; // ajusta la ruta según tu estructura

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject('JwtAdapterService') private readonly jwtService: JwtAdapterService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Buscar el token en los headers
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header not found');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    try {
      // Verificar el token con tu servicio
      const payload = await this.jwtService.verifyToken(token);

      // Inyectar el payload en la request para usarlo en el controlador
      request.user = payload;

      return true; // Permite continuar al controlador
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }
  }
}
