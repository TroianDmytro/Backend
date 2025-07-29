"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretsConfig = void 0;
const fs_1 = require("fs");
const common_1 = require("@nestjs/common");
class SecretsConfig {
    static logger = new common_1.Logger(SecretsConfig.name);
    static getSecret(secretName, envVarName, defaultValue) {
        const secretFilePath = `/run/secrets/${secretName}`;
        try {
            const secretValue = (0, fs_1.readFileSync)(secretFilePath, 'utf8').trim();
            this.logger.log(`✅ Секрет '${secretName}' загружен из Docker Secret`);
            return secretValue;
        }
        catch (error) {
        }
        if (envVarName && process.env[envVarName]) {
            this.logger.log(`✅ Секрет '${secretName}' загружен из переменной окружения`);
            return process.env[envVarName];
        }
        if (defaultValue) {
            this.logger.warn(`⚠️  Используется значение по умолчанию для '${secretName}'`);
            return defaultValue;
        }
        throw new Error(`❌ Секрет '${secretName}' не найден`);
    }
    static getAllSecrets() {
        return {
            mongodbUri: process.env.MONGODB_URI ||
                'mongodb+srv://troyant64:msfA0CqyZhkdF5NH@cluster0.icbj0hf.mongodb.net/',
            jwtSecret: this.getSecret('jwt_secret', 'JWT_SECRET'),
            emailPassword: this.getSecret('email_password', 'EMAIL_PASSWORD'),
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
    static maskSensitiveData(data) {
        if (!data || data.length < 8)
            return '***';
        return data.substring(0, 3) + '***' + data.substring(data.length - 3);
    }
}
exports.SecretsConfig = SecretsConfig;
//# sourceMappingURL=secrets.config.js.map