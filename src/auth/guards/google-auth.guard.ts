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
    private userFound = false; // Флаг для відстеження успішної авторизації

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
        this.logger.debug(`🔍 handleRequest виклик:`, {
            hasError: !!err,
            hasUser: !!user,
            userFoundFlag: this.userFound
        });

        // Якщо є помилка
        if (err) {
            this.logger.error('❌ Помилка в Google Auth Guard:', err.message);
            throw err;
        }

        // Перший виклик з користувачем - успіх
        if (user && !this.userFound) {
            this.userFound = true;
            this.logger.log(`✅ Google авторизація успішна: ${user.email}`);
            return user;
        }

        // Повторний виклик з користувачем - повертаємо того самого
        if (user && this.userFound) {
            return user;
        }

        // Другий виклик без користувача після успішного першого - це норма
        if (!user && this.userFound) {
            this.logger.debug('🔄 Другий виклик handleRequest (нормально для OAuth)');
            return null; // Не кидаємо помилку, це нормальний flow
        }

        // Якщо ніколи не було користувача - це справжня помилка
        if (!user && !this.userFound) {
            this.logger.error('❌ Google авторизація не вдалась - користувач не знайдений');
            throw new Error('Google authorization failed');
        }

        return user;
    }

    /**
     * Скидаємо флаг перед кожним новим запитом
     */
    canActivate(context: any) {
        this.userFound = false;
        return super.canActivate(context);
    }
}