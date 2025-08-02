// config/configuration.ts
export default () => ({
    port: parseInt(process.env.PORT || '3000', 10),
    database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/education-platform',
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
        fromName: process.env.EMAIL_FROM_NAME || 'Education Platform',
    },
    app: {
        url: process.env.APP_URL || 'http://localhost:3000',
    },
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: process.env.CORS_CREDENTIALS === 'true',
    },
    swagger: {
        enabled: process.env.SWAGGER_ENABLED === 'true',
    },
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    },
});