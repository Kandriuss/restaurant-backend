// auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtiene los roles requeridos desde el decorador
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // si no se definieron roles, se permite el acceso
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // viene del JwtAuthGuard

    if (!user) {
      throw new ForbiddenException('No se encontró usuario en la request');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('No tienes permisos para acceder a esta ruta');
    }

    return true;
  }
}
