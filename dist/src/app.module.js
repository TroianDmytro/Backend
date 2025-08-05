"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const email_module_1 = require("./email/email.module");
const roles_module_1 = require("./roles/roles.module");
const avatars_controller_1 = require("./avatars/avatars.controller");
const avatars_module_1 = require("./avatars/avatars.module");
const teachers_module_1 = require("./teachers/teachers.module");
const courses_module_1 = require("./courses/courses.module");
const lessons_module_1 = require("./lessons/lessons.module");
const subscriptions_module_1 = require("./subscriptions/subscriptions.module");
const categories_module_1 = require("./categories/categories.module");
const difficulty_levels_module_1 = require("./difficulty-levels/difficulty-levels.module");
const configuration_1 = require("./config/configuration");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                load: [configuration_1.default],
                isGlobal: true,
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => {
                    const mongoUri = configService.get('database.uri');
                    console.log('🔗 Подключение к MongoDB...');
                    console.log('📍 URI:', mongoUri ? 'Найден' : 'Не найден, используется fallback');
                    return {
                        uri: mongoUri,
                        retryWrites: true,
                        w: 'majority',
                        connectionFactory: (connection) => {
                            connection.on('connected', () => {
                                console.log('✅ MongoDB успешно подключена');
                                console.log(`📦 База данных: ${connection.db?.databaseName || 'неизвестно'}`);
                            });
                            connection.on('error', (error) => {
                                console.error('❌ Ошибка подключения к MongoDB:', error.message);
                            });
                            connection.on('disconnected', () => {
                                console.log('⚠️ MongoDB отключена');
                            });
                            return connection;
                        },
                    };
                },
                inject: [config_1.ConfigService],
            }),
            roles_module_1.RolesModule,
            users_module_1.UsersModule,
            email_module_1.EmailModule,
            auth_module_1.AuthModule,
            avatars_module_1.AvatarsModule,
            teachers_module_1.TeachersModule,
            categories_module_1.CategoriesModule,
            difficulty_levels_module_1.DifficultyLevelsModule,
            courses_module_1.CoursesModule,
            lessons_module_1.LessonsModule,
            subscriptions_module_1.SubscriptionsModule
        ],
        controllers: [avatars_controller_1.AvatarsController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map