// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user || !user.roles) {
            throw new ForbiddenException('У вас нет необходимых прав доступа');
        }

        // Убедимся, что у нас есть массив ролей пользователя
        const userRoles = Array.isArray(user.roles)
            ? user.roles
            : [user.roles];

        // Проверяем, имеет ли пользователь хотя бы одну из требуемых ролей
        const hasRole = requiredRoles.some((role) =>
            userRoles.some((userRole) => {
                // Роль может быть объектом или строкой
                if (typeof userRole === 'string') {
                    return userRole === role;
                } else if (userRole && typeof userRole === 'object') {
                    return userRole.name === role;
                }
                return false;
            })
        );

        if (!hasRole) {
            throw new ForbiddenException('У вас нет необходимых прав доступа');
        }

        return true;
    }
}