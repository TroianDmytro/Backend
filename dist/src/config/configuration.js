"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT || '3000', 10),
    database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-api',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'defaultJwtSecretKey',
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    },
    email: {
        host: process.env.EMAIL_HOST || 'localhost',
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        secure: process.env.EMAIL_SECURE === 'true',
        user: process.env.EMAIL_USER || '',
        password: process.env.EMAIL_PASSWORD || '',
        from: process.env.EMAIL_FROM || 'noreply@example.com',
    },
    app: {
        url: process.env.APP_URL || 'http://localhost:3000',
    },
});
//# sourceMappingURL=configuration.js.map