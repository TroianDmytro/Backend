"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('port') || 8000;
    const host = configService.get('host') || '0.0.0.0';
    const allowedOrigins = configService.get('app.allowedOrigins') || ['*'];
    const globalPrefix = configService.get('app.globalPrefix') || 'api';
    const appUrl = configService.get('app.url') || 'http://localhost:8000';
    app.setGlobalPrefix(globalPrefix);
    if (allowedOrigins.includes('*')) {
        app.enableCors({
            origin: true,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
            allowedHeaders: [
                'Content-Type',
                'Authorization',
                'Accept',
                'X-Requested-With',
                'Access-Control-Allow-Origin',
                'Origin',
                'X-Forwarded-For',
                'X-Real-IP'
            ],
            optionsSuccessStatus: 200,
            preflightContinue: false,
        });
        console.log('🌍 CORS: ✅ РАЗРЕШЕНЫ ВСЕ ДОМЕНЫ (origin: true)');
    }
    else {
        app.enableCors({
            origin: (origin, callback) => {
                if (!origin)
                    return callback(null, true);
                if (allowedOrigins.includes(origin)) {
                    return callback(null, true);
                }
                if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
                    return callback(null, true);
                }
                return callback(new Error('Not allowed by CORS'), false);
            },
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
            allowedHeaders: [
                'Content-Type',
                'Authorization',
                'Accept',
                'X-Requested-With',
                'Access-Control-Allow-Origin',
                'Origin'
            ],
            credentials: true,
            optionsSuccessStatus: 200,
        });
        console.log(`🌍 CORS: Разрешены домены: ${allowedOrigins.join(', ')}`);
    }
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        skipMissingProperties: false,
    }));
    const swaggerEnabled = configService.get('swagger.enabled') !== false;
    if (swaggerEnabled) {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle(configService.get('swagger.title') || 'Auth API')
            .setDescription(configService.get('swagger.description') || 'API Documentation')
            .setVersion(configService.get('swagger.version') || '1.0')
            .addTag('auth')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Введите JWT токен',
            in: 'header',
        })
            .addServer('http://localhost:8000', 'Local development')
            .addServer(appUrl, 'Production')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        const swaggerPath = configService.get('swagger.path') || 'api/docs';
        swagger_1.SwaggerModule.setup(swaggerPath, app, document, {
            swaggerOptions: {
                persistAuthorization: true,
                tryItOutEnabled: true,
                filter: true,
                displayRequestDuration: true,
            },
            customSiteTitle: 'Auth API Documentation',
        });
        console.log(`📚 Swagger UI доступен по адресу: ${appUrl}/${swaggerPath}`);
    }
    app.use('/avatars', (req, res, next) => {
        req.setTimeout(30000);
        next();
    });
    if (process.env.NODE_ENV !== 'production') {
        app.use((req, res, next) => {
            console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
            next();
        });
    }
    await app.listen(port, host);
    console.log(`🚀 Приложение запущено на: ${await app.getUrl()}`);
    console.log(`🌍 API доступен по адресу: ${appUrl}/${globalPrefix}`);
    console.log(`🔧 Режим: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Разрешенные домены CORS: ${allowedOrigins.join(', ')}`);
}
bootstrap().catch((error) => {
    console.error('❌ Ошибка запуска приложения:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map