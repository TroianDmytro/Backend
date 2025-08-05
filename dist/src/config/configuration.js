"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT || '8000', 10),
    host: process.env.HOST || '0.0.0.0',
    database: {
        uri: process.env.MONGODB_URI || 'mongodb+srv://troyant64:msfA0CqyZhkdF5NH@cluster0.icbj0hf.mongodb.net/',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'cd2c18d6c7f64a37a1a404c4d4c5a75ee76ec2b13949e3a67e1e0e1a3cf6a8db',
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
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
        url: process.env.APP_URL || 'http://localhost:8000',
        allowedOrigins: process.env.ALLOWED_ORIGINS === '*' ?
            ['*'] :
            (process.env.ALLOWED_ORIGINS?.split(',') || [
                'http://localhost:3000',
                'http://localhost:8000',
                'https://neuronest.pp.ua',
            ]),
        globalPrefix: process.env.API_PREFIX || 'api',
    },
    swagger: {
        enabled: process.env.SWAGGER_ENABLED !== 'true',
        path: process.env.SWAGGER_PATH || 'api/docs',
        title: 'Auth API',
        description: 'API \'Diplom\'',
        version: '1.0',
    },
});
//# sourceMappingURL=configuration.js.map