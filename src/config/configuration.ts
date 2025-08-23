// config/configuration.ts
export default () => ({
    port: parseInt(process.env.PORT || '8000', 10),
    host: process.env.HOST || '0.0.0.0', // Важно: слушаем на всех интерфейсах
    database: {
        uri: process.env.MONGODB_URI || 'mongodb+srv://troyant64:msfA0CqyZhkdF5NH@cluster0.icbj0hf.mongodb.net/',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'cd2c18d6c7f64a37a1a404c4d4c5a75ee76ec2b13949e3a67e1e0e1a3cf6a8db',
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    },
    // конфигурацию для Google OAuth
    google: {
        // clientId: process.env.GOOGLE_CLIENT_ID || '254445727557-kq6503r77n1427cpv57notcnhaqkjkni.apps.googleusercontent.com',
        // clientSecret: process.env.GOOGLE_CLIENT_SECRET || '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',
        // callbackUrl: process.env.GOOGLE_CALLBACK_URL || `${process.env.APP_URL || 'https://neuronest.pp.ua'}/api/auth/google/callback`
    },
    // Настройки Monobank
    monobank: {
        token: process.env.MONOBANK_TOKEN || 'ura1drIjryK6dOHTd3T0e-LCfAyvSUxUsXE2IrgpT9co',
        webhookUrl: process.env.MONOBANK_WEBHOOK_URL || `${process.env.APP_URL || 'https://neuronest.pp.ua'}/api/payments/webhook`,
        isTestMode: process.env.MONOBANK_TEST_MODE === 'true' || true, // по умолчанию тестовый режим
         baseUrl: process.env.MONOBANK_BASE_URL || 'https://api.monobank.ua/api/merchant',
    },
    email: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        secure: process.env.EMAIL_SECURE === 'false',
        user: process.env.EMAIL_USER || 'test.dpoff@gmail.com',
        password: process.env.EMAIL_PASSWORD || 'lplj ubop uudh fpjg',
        from: process.env.EMAIL_FROM || 'test.dpoff@gmail.com',
        fromName: process.env.EMAIL_FROM_NAME || 'Education Platform',
    },
    app: {
        url: process.env.APP_URL || 'https://neuronest.pp.ua',
        // Разрешенные домены для CORS
        // allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
        //     'http://localhost:3000',
        //     'http://localhost:8000',
        //     'https://neuronest.pp.ua',
        // ],
        // Разрешенные домены для CORS - поддержка символа *
        allowedOrigins: ['*'],
        // Базовый префикс для API
        globalPrefix: process.env.API_PREFIX || 'api',
        // URL для редиректа после успешной авторизации
        frontendUrl: process.env.FRONTEND_URL || 'https://neuronest.pp.ua',
    },
    swagger: {
        enabled: process.env.SWAGGER_ENABLED !== 'true',
        path: process.env.SWAGGER_PATH || 'api/docs',
        title: 'Auth API',
        description: 'API \'Diplom\'',
        version: '1.0',
    },
});