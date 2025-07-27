//secrets.config.ts
import { readFileSync } from 'fs';
import { Logger } from '@nestjs/common';

export class SecretsConfig {
    private static readonly logger = new Logger(SecretsConfig.name);

    /**
     * Читает секрет из файла или переменной окружения
     * @param secretName - Имя секрета
     * @param envVarName - Имя переменной окружения (fallback)
     * @param defaultValue - Значение по умолчанию
     */
    static getSecret(
        secretName: string,
        envVarName?: string,
        defaultValue?: string
    ): string {
        // 1. Пытаемся прочитать из Docker Secret файла
        const secretFilePath = `/run/secrets/${secretName}`;
        try {
            const secretValue = readFileSync(secretFilePath, 'utf8').trim();
            this.logger.log(`✅ Секрет '${secretName}' загружен из файла`);
            return secretValue;
        } catch (error) {
            this.logger.warn(`⚠️  Секрет файл '${secretFilePath}' не найден`);
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

        throw new Error(`❌ Секрет '${secretName}' не найден ни в файлах, ни в переменных окружения`);
    }

    /**
     * Получает все необходимые секреты для приложения
     */
    static getAllSecrets() {
        return {
            mongodbPassword: this.getSecret('mongodb_password', 'MONGODB_PASSWORD'),
            jwtSecret: this.getSecret('jwt_secret', 'JWT_SECRET'),
            emailPassword: this.getSecret('email_password', 'EMAIL_PASSWORD'),

            // Не секретные переменные окружения
            mongodbUri: this.buildMongoUri(),
            port: parseInt(process.env.PORT || '8001'),
            nodeEnv: process.env.NODE_ENV || 'development',
            emailHost: process.env.EMAIL_HOST || 'localhost',
            emailPort: parseInt(process.env.EMAIL_PORT || '587'),
            emailUser: process.env.EMAIL_USER || '',
            appUrl: process.env.APP_URL || 'http://localhost:8001',
        };
    }

    /**
     * Строит URI для MongoDB с паролем из секрета
     */
    private static buildMongoUri(): string {
        const mongoPassword = this.getSecret('mongodb_password', 'MONGODB_PASSWORD');
        const mongoHost = process.env.MONGODB_HOST || 'localhost';
        const mongoPort = process.env.MONGODB_PORT || '27017';
        const mongoUser = process.env.MONGODB_USER || 'admin';
        const mongoDatabase = process.env.MONGODB_DATABASE || 'nestjs-app';

        return `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDatabase}?authSource=admin`;
    }

    /**
     * Маскирует чувствительную информацию для логов
     */
    static maskSensitiveData(data: string): string {
        if (!data || data.length < 8) return '***';
        return data.substring(0, 3) + '***' + data.substring(data.length - 3);
    }
}