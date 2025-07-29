"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LessonsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const lesson_schema_1 = require("./schemas/lesson.schema");
const course_schema_1 = require("../courses/schemas/course.schema");
let LessonsService = LessonsService_1 = class LessonsService {
    lessonModel;
    courseModel;
    logger = new common_1.Logger(LessonsService_1.name);
    constructor(lessonModel, courseModel) {
        this.lessonModel = lessonModel;
        this.courseModel = courseModel;
    }
    async create(createLessonDto, userId, isAdmin) {
        const { courseId, ...lessonData } = createLessonDto;
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) {
            throw new common_1.NotFoundException(`Курс с ID ${courseId} не найден`);
        }
        if (!isAdmin && course.teacherId.toString() !== userId) {
            throw new common_1.BadRequestException('У вас нет прав на создание уроков для этого курса');
        }
        const existingLesson = await this.lessonModel.findOne({
            courseId,
            order: createLessonDto.order
        }).exec();
        if (existingLesson) {
            throw new common_1.ConflictException(`Урок с порядковым номером ${createLessonDto.order} уже существует в этом курсе`);
        }
        const newLesson = new this.lessonModel({
            ...lessonData,
            courseId,
            isActive: true,
            isPublished: false,
            isFree: false
        });
        const savedLesson = await newLesson.save();
        await this.updateCourseLessonsCount(courseId);
        this.logger.log(`Создан урок: ${savedLesson.title} (ID: ${savedLesson.id})`);
        return savedLesson;
    }
    async findByCourse(courseId, includeUnpublished = false) {
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) {
            throw new common_1.NotFoundException(`Курс с ID ${courseId} не найден`);
        }
        const filter = { courseId, isActive: true };
        if (!includeUnpublished) {
            filter.isPublished = true;
        }
        return this.lessonModel
            .find(filter)
            .sort({ order: 1 })
            .exec();
    }
    async findById(id) {
        return this.lessonModel.findById(id).populate('courseId', 'title teacherId').exec();
    }
    async update(id, updateLessonDto, userId, isAdmin) {
        const lesson = await this.lessonModel.findById(id).populate('courseId').exec();
        if (!lesson) {
            throw new common_1.NotFoundException(`Урок с ID ${id} не найден`);
        }
        const course = lesson.courseId;
        if (!isAdmin && course.teacherId.toString() !== userId) {
            throw new common_1.BadRequestException('У вас нет прав на редактирование этого урока');
        }
        if (updateLessonDto.order && updateLessonDto.order !== lesson.order) {
            const existingLesson = await this.lessonModel.findOne({
                courseId: lesson.courseId,
                order: updateLessonDto.order,
                _id: { $ne: id }
            }).exec();
            if (existingLesson) {
                throw new common_1.ConflictException(`Урок с порядковым номером ${updateLessonDto.order} уже существует в этом курсе`);
            }
        }
        Object.assign(lesson, updateLessonDto);
        const updatedLesson = await lesson.save();
        this.logger.log(`Обновлен урок: ${id}`);
        return updatedLesson;
    }
    async delete(id, userId, isAdmin) {
        const lesson = await this.lessonModel.findById(id).populate('courseId').exec();
        if (!lesson) {
            throw new common_1.NotFoundException(`Урок с ID ${id} не найден`);
        }
        const course = lesson.courseId;
        if (!isAdmin && course.teacherId.toString() !== userId) {
            throw new common_1.BadRequestException('У вас нет прав на удаление этого урока');
        }
        const courseId = lesson.courseId;
        await this.lessonModel.findByIdAndDelete(id).exec();
        await this.updateCourseLessonsCount(courseId.toString());
        this.logger.log(`Удален урок: ${id}`);
    }
    async updatePublishStatus(id, isPublished, userId, isAdmin) {
        const lesson = await this.lessonModel.findById(id).populate('courseId').exec();
        if (!lesson) {
            throw new common_1.NotFoundException(`Урок с ID ${id} не найден`);
        }
        const course = lesson.courseId;
        if (!isAdmin && course.teacherId.toString() !== userId) {
            throw new common_1.BadRequestException('У вас нет прав на изменение статуса публикации этого урока');
        }
        lesson.isPublished = isPublished;
        await lesson.save();
        this.logger.log(`Урок ${id} ${isPublished ? 'опубликован' : 'снят с публикации'}`);
        return lesson;
    }
    async getNextLesson(currentLessonId) {
        const currentLesson = await this.lessonModel.findById(currentLessonId).exec();
        if (!currentLesson) {
            throw new common_1.NotFoundException('Текущий урок не найден');
        }
        return this.lessonModel
            .findOne({
            courseId: currentLesson.courseId,
            order: { $gt: currentLesson.order },
            isActive: true,
            isPublished: true
        })
            .sort({ order: 1 })
            .exec();
    }
    async getPreviousLesson(currentLessonId) {
        const currentLesson = await this.lessonModel.findById(currentLessonId).exec();
        if (!currentLesson) {
            throw new common_1.NotFoundException('Текущий урок не найден');
        }
        return this.lessonModel
            .findOne({
            courseId: currentLesson.courseId,
            order: { $lt: currentLesson.order },
            isActive: true,
            isPublished: true
        })
            .sort({ order: -1 })
            .exec();
    }
    async updateCourseLessonsCount(courseId) {
        const lessonsCount = await this.lessonModel.countDocuments({
            courseId,
            isActive: true
        }).exec();
        await this.courseModel.findByIdAndUpdate(courseId, {
            lessons_count: lessonsCount
        }).exec();
    }
    async getLessonHomeworkSubmissions(lessonId, status, page = 1, limit = 20) {
        return {
            submissions: [],
            totalItems: 0,
            totalPages: 0
        };
    }
    async getLessonProgress(lessonId) {
        return {
            totalStudents: 0,
            completedStudents: 0,
            averageScore: 0
        };
    }
    async markLessonComplete(lessonId, userId) {
        this.logger.log(`Урок ${lessonId} отмечен как пройденный пользователем ${userId}`);
    }
    async reorderLessons(lessons, userId, isAdmin) {
        for (const lessonUpdate of lessons) {
            await this.lessonModel.findByIdAndUpdate(lessonUpdate.lessonId, {
                order: lessonUpdate.order
            }).exec();
        }
        this.logger.log('Порядок уроков обновлен');
    }
    async duplicateLesson(originalId, newTitle, userId, isAdmin, targetCourseId) {
        const originalLesson = await this.lessonModel.findById(originalId).exec();
        if (!originalLesson) {
            throw new common_1.NotFoundException(`Урок с ID ${originalId} не найден`);
        }
        const lessonData = originalLesson.toObject();
        delete lessonData._id;
        delete lessonData.id;
        delete lessonData.createdAt;
        delete lessonData.updatedAt;
        const courseId = targetCourseId || originalLesson.courseId.toString();
        const maxOrder = await this.lessonModel
            .findOne({ courseId })
            .sort({ order: -1 })
            .exec();
        const newOrder = maxOrder ? maxOrder.order + 1 : 1;
        const duplicatedLesson = new this.lessonModel({
            ...lessonData,
            title: newTitle,
            courseId: courseId,
            order: newOrder,
            isPublished: false
        });
        const savedLesson = await duplicatedLesson.save();
        await this.updateCourseLessonsCount(courseId);
        this.logger.log(`Урок ${originalId} дублирован как ${savedLesson.id}`);
        return savedLesson;
    }
};
exports.LessonsService = LessonsService;
exports.LessonsService = LessonsService = LessonsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(lesson_schema_1.Lesson.name)),
    __param(1, (0, mongoose_1.InjectModel)(course_schema_1.Course.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], LessonsService);
//# sourceMappingURL=lessons.service.js.map