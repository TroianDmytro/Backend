"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const secrets_config_1 = require("./config/secrets.config");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    try {
        logger.log('🔐 Загрузка конфигурации...');
        const secrets = secrets_config_1.SecretsConfig.getAllSecrets();
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            skipMissingProperties: false,
        }));
        if (secrets.nodeEnv !== 'production') {
            const config = new swagger_1.DocumentBuilder()
                .setTitle('NestJS Backend API')
                .setDescription('API документация')
                .setVersion('1.0')
                .addBearerAuth()
                .build();
            const document = swagger_1.SwaggerModule.createDocument(app, config);
            swagger_1.SwaggerModule.setup('api', app, document, {
                swaggerOptions: {
                    persistAuthorization: true,
                },
            });
            logger.log(`📚 Swagger доступен по адресу: http://localhost:${secrets.port}/api#`);
        }
        app.enableCors({
            origin: secrets.corsOrigins.split(','),
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            credentials: true,
        });
        process.on('SIGTERM', async () => {
            logger.log('🛑 SIGTERM получен, завершаем работу...');
            await app.close();
            process.exit(0);
        });
        await app.listen(secrets.port);
        logger.log(`🚀 Приложение запущено на порту ${secrets.port}`);
        logger.log(`🌍 URL: ${secrets.appUrl}`);
    }
    catch (error) {
        logger.error('❌ Ошибка запуска:', error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map