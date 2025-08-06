// src/auth/guards/google-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard для Google OAuth авторизации
 * Использует стратегию 'google' для перенаправления на Google
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
    constructor() {
        super({
            // Дополнительные параметры для Google OAuth
            accessType: 'offline', // Получаем refresh token
            prompt: 'consent',      // Принудительно показываем согласие
        });
    }
}