// src/auth/strategies/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

/**
 * Google OAuth Strategy для Passport
 * Обрабатывает авторизацию через Google
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        super({
            clientID: configService.get<string>('google.clientId') || '',
            clientSecret: configService.get<string>('google.clientSecret') || '',
            callbackURL: configService.get<string>('google.callbackUrl') || '',
            // ✅ СОВРЕМЕННЫЕ SCOPE (НЕ Google+ API)
            scope: [
                'https://www.googleapis.com/auth/userinfo.email',    // Доступ к email
                'https://www.googleapis.com/auth/userinfo.profile'   // Доступ к базовому профилю
            ],
        });
    }

    /**
     * Callback функция, вызываемая после успешной авторизации в Google
     * Использует современный Google OAuth 2.0 API (НЕ устаревший Google+ API)
     * @param accessToken - токен доступа от Google
     * @param refreshToken - токен обновления от Google
     * @param profile - профиль пользователя от Google (Google OAuth 2.0 формат)
     * @param done - callback функция Passport
     */
    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        try {
            console.log('🔍 Google OAuth 2.0 Profile:', JSON.stringify(profile, null, 2));
            console.log('✅ Используем современный Google OAuth 2.0 API');

            // Извлекаем данные из профиля Google OAuth 2.0
            const { id, name, emails, photos, provider } = profile;

            // Проверяем, что используется правильный провайдер
            if (provider !== 'google') {
                console.error('❌ Неожиданный провайдер:', provider);
                return done(new Error('Invalid OAuth provider'), false);
            }

            // Проверяем наличие обязательных полей
            if (!id) {
                console.error('❌ Отсутствует Google User ID');
                return done(new Error('Google profile missing user ID'), false);
            }

            if (!emails || emails.length === 0) {
                console.error('❌ Отсутствует email в Google профиле');
                return done(new Error('Google profile does not have email'), false);
            }

            // Извлекаем данные пользователя
            const email = emails[0].value;
            const emailVerified = emails[0].verified || true; // Google emails считаются верифицированными
            const firstName = name?.givenName || '';
            const lastName = name?.familyName || '';
            const fullName = name?.displayName || `${firstName} ${lastName}`.trim();
            const avatarUrl = photos?.[0]?.value || null;

            // Проверяем валидность email
            if (!email.includes('@')) {
                console.error('❌ Невалидный email от Google:', email);
                return done(new Error('Invalid email format from Google'), false);
            }

            console.log('📧 Email:', email);
            console.log('👤 Имя:', firstName, lastName);
            console.log('✅ Email верифицирован:', emailVerified);

            // Ищем или создаем пользователя через AuthService
            const user = await this.authService.validateGoogleUser({
                googleId: id,
                email: email,
                name: firstName,
                second_name: lastName,
                avatar_url: avatarUrl,
                accessToken,
                refreshToken,
            });

            console.log('✅ Google OAuth 2.0 User validated:', user.email);

            return done(null, user);
        } catch (error) {
            console.error('❌ Google OAuth 2.0 validation error:', error);

            // Логируем детали ошибки для дебага
            if (error.message.includes('plus.') || error.message.includes('Google+')) {
                console.error('🚨 ВНИМАНИЕ: Обнаружено использование устаревшего Google+ API!');
                console.error('🔧 Убедитесь, что используете современные scope: userinfo.email, userinfo.profile');
            }

            return done(error, false);
        }
    }
}