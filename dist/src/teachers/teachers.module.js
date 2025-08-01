"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeachersModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const teachers_service_1 = require("./teachers.service");
const teachers_controller_1 = require("./teachers.controller");
const teacher_schema_1 = require("./schemas/teacher.schema");
const course_schema_1 = require("../courses/schemas/course.schema");
const email_module_1 = require("../email/email.module");
let TeachersModule = class TeachersModule {
};
exports.TeachersModule = TeachersModule;
exports.TeachersModule = TeachersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: teacher_schema_1.Teacher.name, schema: teacher_schema_1.TeacherSchema },
                { name: course_schema_1.Course.name, schema: course_schema_1.CourseSchema }
            ]),
            email_module_1.EmailModule,
        ],
        controllers: [teachers_controller_1.TeachersController],
        providers: [teachers_service_1.TeachersService],
        exports: [teachers_service_1.TeachersService],
    })
], TeachersModule);
//# sourceMappingURL=teachers.module.js.map