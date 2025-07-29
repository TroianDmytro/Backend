"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const courses_service_1 = require("./courses.service");
const courses_controller_1 = require("./courses.controller");
const course_schema_1 = require("./schemas/course.schema");
const teacher_schema_1 = require("../teachers/schemas/teacher.schema");
const lesson_schema_1 = require("../lessons/schemas/lesson.schema");
const subscription_schema_1 = require("../subscriptions/schemas/subscription.schema");
const teachers_module_1 = require("../teachers/teachers.module");
const lessons_module_1 = require("../lessons/lessons.module");
const subscriptions_module_1 = require("../subscriptions/subscriptions.module");
const category_schema_1 = require("../categories/schemas/category.schema");
const difficulty_level_schema_1 = require("../difficulty-levels/schemas/difficulty-level.schema");
const categories_module_1 = require("../categories/categories.module");
const difficulty_levels_module_1 = require("../difficulty-levels/difficulty-levels.module");
let CoursesModule = class CoursesModule {
};
exports.CoursesModule = CoursesModule;
exports.CoursesModule = CoursesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: course_schema_1.Course.name, schema: course_schema_1.CourseSchema },
                { name: teacher_schema_1.Teacher.name, schema: teacher_schema_1.TeacherSchema },
                { name: lesson_schema_1.Lesson.name, schema: lesson_schema_1.LessonSchema },
                { name: subscription_schema_1.Subscription.name, schema: subscription_schema_1.SubscriptionSchema },
                { name: category_schema_1.Category.name, schema: category_schema_1.CategorySchema },
                { name: difficulty_level_schema_1.DifficultyLevel.name, schema: difficulty_level_schema_1.DifficultyLevelSchema }
            ]),
            (0, common_1.forwardRef)(() => teachers_module_1.TeachersModule),
            (0, common_1.forwardRef)(() => lessons_module_1.LessonsModule),
            (0, common_1.forwardRef)(() => subscriptions_module_1.SubscriptionsModule),
            (0, common_1.forwardRef)(() => categories_module_1.CategoriesModule),
            (0, common_1.forwardRef)(() => difficulty_levels_module_1.DifficultyLevelsModule)
        ],
        controllers: [courses_controller_1.CoursesController],
        providers: [courses_service_1.CoursesService],
        exports: [courses_service_1.CoursesService],
    })
], CoursesModule);
//# sourceMappingURL=courses.module.js.map