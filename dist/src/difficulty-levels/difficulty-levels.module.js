"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DifficultyLevelsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const difficulty_levels_service_1 = require("./difficulty-levels.service");
const difficulty_levels_controller_1 = require("./difficulty-levels.controller");
const difficulty_level_schema_1 = require("./schemas/difficulty-level.schema");
const course_schema_1 = require("../courses/schemas/course.schema");
const subscription_schema_1 = require("../subscriptions/schemas/subscription.schema");
const courses_module_1 = require("../courses/courses.module");
let DifficultyLevelsModule = class DifficultyLevelsModule {
};
exports.DifficultyLevelsModule = DifficultyLevelsModule;
exports.DifficultyLevelsModule = DifficultyLevelsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: difficulty_level_schema_1.DifficultyLevel.name, schema: difficulty_level_schema_1.DifficultyLevelSchema },
                { name: course_schema_1.Course.name, schema: course_schema_1.CourseSchema },
                { name: subscription_schema_1.Subscription.name, schema: subscription_schema_1.SubscriptionSchema }
            ]),
            (0, common_1.forwardRef)(() => courses_module_1.CoursesModule)
        ],
        controllers: [difficulty_levels_controller_1.DifficultyLevelsController],
        providers: [difficulty_levels_service_1.DifficultyLevelsService],
        exports: [difficulty_levels_service_1.DifficultyLevelsService],
    })
], DifficultyLevelsModule);
//# sourceMappingURL=difficulty-levels.module.js.map