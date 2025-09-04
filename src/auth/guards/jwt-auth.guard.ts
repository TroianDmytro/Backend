import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {

        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            console.log('isPublic ->', context.getHandler().name, isPublic);
            return true;
        }
        return super.canActivate(context);
    }

    // Переопределяем для логирования причин 401
    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        if (err || !user) {
            const request = context.switchToHttp().getRequest();
            const authHeader = request.headers['authorization'];
            const tokenSnippet = authHeader?.split(' ')[1]?.slice(0, 20);
            console.warn('[JWT GUARD] Unauthorized:', {
                route: request.method + ' ' + request.url,
                hasAuthHeader: !!authHeader,
                bearerStartsWith: tokenSnippet,
                error: err?.message,
                info: (info as any)?.message || info,
            });
            throw err || new UnauthorizedException('Неверный или просроченный токен');
        }
        return user;
    }
}
