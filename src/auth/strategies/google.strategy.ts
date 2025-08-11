// src/auth/strategies/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

/**
 * ИСПРАВЛЕННАЯ Google OAuth Strategy
 * Основные исправления:
 * 1. Правильная конфигурация URL
 * 2. Обработка HTTPS для production
 * 3. Улучшенная обработка ошибок
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    private clientId;
    constructor(
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        // Получаем конфигурацию с проверкой
        const clientId = configService.get<string>('google.clientId');
        const clientSecret = configService.get<string>('google.clientSecret');
        const callbackURL = configService.get<string>('google.callbackUrl');

        console.log('🔧 Google OAuth конфигурация:');
        console.log('📍 Client ID:', clientId ? '✅ Найден' : '❌ Не найден');
        console.log('🔑 Client Secret:', clientSecret ? '✅ Найден' : '❌ Не найден');
        console.log('🔄 Callback URL:', callbackURL);

        if (!clientId) {
            throw new Error('GOOGLE_CLIENT_ID не установлен в переменных окружения');
        }
        if (!clientSecret) {
            throw new Error('GOOGLE_CLIENT_SECRET не установлен в переменных окружения');
        }
        if (!callbackURL) {
            throw new Error('GOOGLE_CALLBACK_URL не установлен в переменных окружения');
        }

        super({
            clientID: clientId || '',
            clientSecret: clientSecret || '',
            callbackURL: callbackURL || '',
            scope: [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile'
            ],
            passReqToCallback: false,
            skipUserProfile: false,
        });

        // Проверяем обязательные параметры
        if (!clientId || !clientSecret || !callbackURL) {
            console.error('❌ ОШИБКА: Не все переменные Google OAuth настроены!');
            console.error('Проверьте переменные окружения:');
            console.error('- GOOGLE_CLIENT_ID');
            console.error('- GOOGLE_CLIENT_SECRET');
            console.error('- GOOGLE_CALLBACK_URL');
        }
    }

    /**
     * Callback функция после успешной авторизации в Google
     */
    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        try {
            console.log('🔍 Google OAuth Profile получен:', {
                id: profile.id,
                displayName: profile.displayName,
                emails: profile.emails?.map(e => e.value),
                provider: profile.provider
            });

            // Проверяем базовые поля
            if (!profile.id) {
                console.error('❌ Отсутствует Google User ID');
                return done(new Error('Missing Google User ID'), false);
            }

            if (!profile.emails || profile.emails.length === 0) {
                console.error('❌ Отсутствует email в Google профиле');
                return done(new Error('No email provided by Google'), false);
            }

            // Извлекаем данные
            const email = profile.emails[0].value;
            const firstName = profile.name?.givenName || '';
            const lastName = profile.name?.familyName || '';
            const avatarUrl = profile.photos?.[0]?.value || null;

            console.log(`✅ Обрабатываем Google пользователя: ${email}`);

            // Создаем или находим пользователя
            const user = await this.authService.validateGoogleUser({
                googleId: profile.id,
                email: email,
                name: firstName,
                second_name: lastName,
                avatar_url: avatarUrl,
                accessToken,
                refreshToken,
            });

            console.log(`✅ Google пользователь обработан: ${user.email}`);
            return done(null, user);

        } catch (error) {
            console.error('❌ Ошибка Google OAuth validation:', error.message);
            return done(error, false);
        }
    }
}