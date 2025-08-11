// src/auth/guards/google-auth.guard.ts
import { Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * УЛУЧШЕННЫЙ Guard для Google OAuth авторизации
 * Добавлена обработка ошибок и логирование
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
    private readonly logger = new Logger(GoogleAuthGuard.name);

    constructor() {
        super({
            // ✅ Параметры для Google OAuth
            accessType: 'offline', // Получаем refresh token
            prompt: 'consent',      // Принудительно показываем согласие
        });
    }

    /**
     * Обработка успешной авторизации
     */
    handleRequest(err: any, user: any, info: any, context: any) {
        if (err) {
            this.logger.error('❌ Ошибка в Google Auth Guard:', err);
            throw err;
        }

        if (!user) {
            this.logger.warn('⚠️ Пользователь не найден в Google Auth Guard');
            this.logger.debug('Info:', info);
            throw new Error('Google authorization failed');
        }

        this.logger.log(`✅ Google авторизация успешна: ${user.email}`);
        return user;
    }
}