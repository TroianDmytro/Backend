// src/config/secrets.config.ts
import { readFileSync } from 'fs';
import { Logger } from '@nestjs/common';

export class SecretsConfig {
    private static readonly logger = new Logger(SecretsConfig.name);

    /**
     * Читает секрет из файла Docker Secrets или переменной окружения
     */
    static getSecret(
        secretName: string,
        envVarName?: string,
        defaultValue?: string
    ): string {
        // 1. Пытаемся прочитать из Docker Secret
        const secretFilePath = `/run/secrets/${secretName}`;
        try {
            const secretValue = readFileSync(secretFilePath, 'utf8').trim();
            this.logger.log(`✅ Секрет '${secretName}' загружен из Docker Secret`);
            return secretValue;
        } catch (error) {
            // Игнорируем ошибку чтения файла
        }

        // 2. Пытаемся прочитать из переменной окружения
        if (envVarName && process.env[envVarName]) {
            this.logger.log(`✅ Секрет '${secretName}' загружен из переменной окружения`);
            return process.env[envVarName]!;
        }

        // 3. Используем значение по умолчанию
        if (defaultValue) {
            this.logger.warn(`⚠️  Используется значение по умолчанию для '${secretName}'`);
            return defaultValue;
        }

        throw new Error(`❌ Секрет '${secretName}' не найден`);
    }

    /**
     * Получает все необходимые секреты для приложения
     */
    static getAllSecrets() {
        return {
            // MongoDB URI берем из переменной окружения (внешняя БД)
            mongodbUri: process.env.MONGODB_URI ||
                'mongodb+srv://troyant64:msfA0CqyZhkdF5NH@cluster0.icbj0hf.mongodb.net/',

            // JWT секрет из Docker Secret
            jwtSecret: this.getSecret('jwt_secret', 'JWT_SECRET'),

            // Email пароль из Docker Secret
            emailPassword: this.getSecret('email_password', 'EMAIL_PASSWORD'),

            // Остальные настройки из переменных окружения
            port: parseInt(process.env.PORT || '8000'),
            nodeEnv: process.env.NODE_ENV || 'development',
            emailHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
            emailPort: parseInt(process.env.EMAIL_PORT || '587'),
            emailUser: process.env.EMAIL_USER || '',
            emailFrom: process.env.EMAIL_FROM || '',
            appUrl: process.env.APP_URL || 'http://localhost:8000',
            corsOrigins: process.env.CORS_ORIGINS || '*',
        };
    }

    /**
     * Маскирует чувствительную информацию для логов
     */
    static maskSensitiveData(data: string): string {
        if (!data || data.length < 8) return '***';
        return data.substring(0, 3) + '***' + data.substring(data.length - 3);
    }
}