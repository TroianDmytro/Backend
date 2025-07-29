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
var CoursesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const mongoose = require("mongoose");
const course_schema_1 = require("./schemas/course.schema");
const teacher_schema_1 = require("../teachers/schemas/teacher.schema");
const category_schema_1 = require("../categories/schemas/category.schema");
const difficulty_level_schema_1 = require("../difficulty-levels/schemas/difficulty-level.schema");
let CoursesService = CoursesService_1 = class CoursesService {
    courseModel;
    teacherModel;
    categoryModel;
    difficultyLevelModel;
    logger = new common_1.Logger(CoursesService_1.name);
    constructor(courseModel, teacherModel, categoryModel, difficultyLevelModel) {
        this.courseModel = courseModel;
        this.teacherModel = teacherModel;
        this.categoryModel = categoryModel;
        this.difficultyLevelModel = difficultyLevelModel;
    }
    async create(createCourseDto) {
        this.logger.log(`Создание курса: ${createCourseDto.title}`);
        const teacher = await this.teacherModel.findById(createCourseDto.teacherId);
        if (!teacher) {
            throw new common_1.NotFoundException('Преподаватель не найден');
        }
        const category = await this.categoryModel.findById(createCourseDto.categoryId);
        if (!category) {
            throw new common_1.NotFoundException('Категория не найдена');
        }
        const difficultyLevel = await this.difficultyLevelModel.findById(createCourseDto.difficultyLevelId);
        if (!difficultyLevel) {
            throw new common_1.NotFoundException('Уровень сложности не найден');
        }
        const existingCourse = await this.courseModel.findOne({ slug: createCourseDto.slug });
        if (existingCourse) {
            throw new common_1.ConflictException('Курс с таким slug уже существует');
        }
        const course = new this.courseModel({
            ...createCourseDto,
            published_at: new Date(),
        });
        const savedCourse = await course.save();
        await Promise.all([
            this.updateTeacherStatistics(createCourseDto.teacherId),
            this.updateCategoryStatistics(createCourseDto.categoryId),
            this.updateDifficultyLevelStatistics(createCourseDto.difficultyLevelId)
        ]);
        this.logger.log(`Курс создан с ID: ${savedCourse._id}`);
        return savedCourse;
    }
    async findAll(filters = {}, page = 1, limit = 10) {
        this.logger.log(`Получение курсов. Страница: ${page}, Лимит: ${limit}, Фильтры:`, filters);
        const skip = (page - 1) * limit;
        const query = {};
        if (filters.category) {
            if (this.isValidObjectId(filters.category)) {
                query.categoryId = filters.category;
            }
            else {
                const category = await this.categoryModel.findOne({ slug: filters.category });
                if (category) {
                    query.categoryId = category._id;
                }
                else {
                    return {
                        courses: [],
                        totalItems: 0,
                        totalPages: 0,
                        currentPage: page
                    };
                }
            }
        }
        if (filters.difficulty_level) {
            if (this.isValidObjectId(filters.difficulty_level)) {
                query.difficultyLevelId = filters.difficulty_level;
            }
            else {
                const difficultyLevel = await this.difficultyLevelModel.findOne({
                    $or: [
                        { slug: filters.difficulty_level },
                        { code: filters.difficulty_level }
                    ]
                });
                if (difficultyLevel) {
                    query.difficultyLevelId = difficultyLevel._id;
                }
                else {
                    return {
                        courses: [],
                        totalItems: 0,
                        totalPages: 0,
                        currentPage: page
                    };
                }
            }
        }
        if (filters.teacher_id) {
            query.teacherId = filters.teacher_id;
        }
        if (filters.is_active !== undefined) {
            query.is_active = filters.is_active;
        }
        if (filters.is_featured !== undefined) {
            query.is_featured = filters.is_featured;
        }
        if (filters.min_price || filters.max_price) {
            query.price = {};
            if (filters.min_price) {
                query.price.$gte = Number(filters.min_price);
            }
            if (filters.max_price) {
                query.price.$lte = Number(filters.max_price);
            }
        }
        if (filters.search) {
            query.$or = [
                { title: { $regex: filters.search, $options: 'i' } },
                { description: { $regex: filters.search, $options: 'i' } },
                { tags: { $in: [new RegExp(filters.search, 'i')] } }
            ];
        }
        const [courses, totalItems] = await Promise.all([
            this.courseModel
                .find(query)
                .populate('teacherId', 'name second_name rating experience_years avatar_url')
                .populate('categoryId', 'name slug description color icon')
                .populate('difficultyLevelId', 'name slug level color description')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec(),
            this.courseModel.countDocuments(query).exec()
        ]);
        const totalPages = Math.ceil(totalItems / limit);
        this.logger.log(`Найдено курсов: ${totalItems}`);
        return {
            courses,
            totalItems,
            totalPages,
            currentPage: page
        };
    }
    async findById(id) {
        this.logger.log(`Получение курса с ID: ${id}`);
        if (!this.isValidObjectId(id)) {
            throw new common_1.BadRequestException('Некорректный ID курса');
        }
        const course = await this.courseModel
            .findById(id)
            .populate('teacherId', 'name second_name email rating experience_years avatar_url bio')
            .populate('categoryId', 'name slug description color icon parent_id')
            .populate('difficultyLevelId', 'name slug level color description requirements')
            .exec();
        return course;
    }
    async findBySlug(slug) {
        this.logger.log(`Получение курса со slug: ${slug}`);
        const course = await this.courseModel
            .findOne({ slug, is_active: true })
            .populate('teacherId', 'name second_name email rating experience_years avatar_url bio')
            .populate('categoryId', 'name slug description color icon parent_id')
            .populate('difficultyLevelId', 'name slug level color description requirements')
            .exec();
        return course;
    }
    async update(id, updateCourseDto) {
        this.logger.log(`Обновление курса с ID: ${id}`);
        if (!this.isValidObjectId(id)) {
            throw new common_1.BadRequestException('Некорректный ID курса');
        }
        const existingCourse = await this.courseModel.findById(id);
        if (!existingCourse) {
            throw new common_1.NotFoundException('Курс не найден');
        }
        if (updateCourseDto.teacherId) {
            const teacher = await this.teacherModel.findById(updateCourseDto.teacherId);
            if (!teacher) {
                throw new common_1.NotFoundException('Преподаватель не найден');
            }
        }
        if (updateCourseDto.categoryId) {
            const category = await this.categoryModel.findById(updateCourseDto.categoryId);
            if (!category) {
                throw new common_1.NotFoundException('Категория не найдена');
            }
        }
        if (updateCourseDto.difficultyLevelId) {
            const difficultyLevel = await this.difficultyLevelModel.findById(updateCourseDto.difficultyLevelId);
            if (!difficultyLevel) {
                throw new common_1.NotFoundException('Уровень сложности не найден');
            }
        }
        if (updateCourseDto.slug && updateCourseDto.slug !== existingCourse.slug) {
            const courseWithSlug = await this.courseModel.findOne({
                slug: updateCourseDto.slug,
                _id: { $ne: id }
            });
            if (courseWithSlug) {
                throw new common_1.ConflictException('Курс с таким slug уже существует');
            }
        }
        const oldTeacherId = existingCourse.teacherId;
        const oldCategoryId = existingCourse.categoryId;
        const oldDifficultyLevelId = existingCourse.difficultyLevelId;
        const updatedCourse = await this.courseModel
            .findByIdAndUpdate(id, { ...updateCourseDto, updated_at: new Date() }, { new: true, runValidators: true })
            .populate('teacherId', 'name second_name rating experience_years avatar_url')
            .populate('categoryId', 'name slug description color icon')
            .populate('difficultyLevelId', 'name slug level color description')
            .exec();
        if (!updatedCourse) {
            throw new common_1.NotFoundException(`Курс с ID ${id} не найден после обновления`);
        }
        const statsUpdates = [];
        if (updateCourseDto.teacherId && updateCourseDto.teacherId !== oldTeacherId.toString()) {
            statsUpdates.push(this.updateTeacherStatistics(oldTeacherId.toString()));
            statsUpdates.push(this.updateTeacherStatistics(updateCourseDto.teacherId));
        }
        else if (oldTeacherId) {
            statsUpdates.push(this.updateTeacherStatistics(oldTeacherId.toString()));
        }
        if (updateCourseDto.categoryId && updateCourseDto.categoryId !== oldCategoryId.toString()) {
            statsUpdates.push(this.updateCategoryStatistics(oldCategoryId.toString()));
            statsUpdates.push(this.updateCategoryStatistics(updateCourseDto.categoryId));
        }
        else if (oldCategoryId) {
            statsUpdates.push(this.updateCategoryStatistics(oldCategoryId.toString()));
        }
        if (updateCourseDto.difficultyLevelId && updateCourseDto.difficultyLevelId !== oldDifficultyLevelId.toString()) {
            statsUpdates.push(this.updateDifficultyLevelStatistics(oldDifficultyLevelId.toString()));
            statsUpdates.push(this.updateDifficultyLevelStatistics(updateCourseDto.difficultyLevelId));
        }
        else if (oldDifficultyLevelId) {
            statsUpdates.push(this.updateDifficultyLevelStatistics(oldDifficultyLevelId.toString()));
        }
        await Promise.all(statsUpdates);
        this.logger.log(`Курс обновлен: ${updatedCourse._id}`);
        return updatedCourse;
    }
    async delete(id) {
        this.logger.log(`Удаление курса с ID: ${id}`);
        if (!this.isValidObjectId(id)) {
            throw new common_1.BadRequestException('Некорректный ID курса');
        }
        const course = await this.courseModel.findById(id);
        if (!course) {
            throw new common_1.NotFoundException('Курс не найден');
        }
        const teacherId = course.teacherId;
        const categoryId = course.categoryId;
        const difficultyLevelId = course.difficultyLevelId;
        await this.courseModel.findByIdAndDelete(id);
        await Promise.all([
            this.updateTeacherStatistics(teacherId.toString()),
            this.updateCategoryStatistics(categoryId.toString()),
            this.updateDifficultyLevelStatistics(difficultyLevelId.toString())
        ]);
        this.logger.log(`Курс удален: ${id}`);
    }
    async getCoursesByDifficultyLevel(difficultyLevelId, page = 1, limit = 12, detailLevel = 'card') {
        this.logger.log(`Получение курсов уровня сложности ${difficultyLevelId}, уровень: ${detailLevel}`);
        if (!this.isValidObjectId(difficultyLevelId)) {
            throw new common_1.BadRequestException('Некорректный ID уровня сложности');
        }
        const difficultyLevel = await this.difficultyLevelModel.findById(difficultyLevelId);
        if (!difficultyLevel) {
            throw new common_1.NotFoundException('Уровень сложности не найден');
        }
        const skip = (page - 1) * limit;
        const query = { difficultyLevelId, is_active: true };
        let teacherFields = 'name second_name rating';
        let courseFields = 'title slug price discount_percent currency average_rating students_count image_url';
        if (detailLevel === 'full') {
            teacherFields += ' experience_years avatar_url';
            courseFields += ' description duration_hours lessons_count tags preview_video_url is_featured';
        }
        else if (detailLevel === 'admin') {
            teacherFields += ' experience_years avatar_url bio email created_at';
            courseFields = '';
        }
        const [courses, totalItems] = await Promise.all([
            this.courseModel
                .find(query, detailLevel === 'admin' ? {} : courseFields)
                .populate('teacherId', teacherFields)
                .populate('categoryId', 'name slug color icon')
                .skip(skip)
                .limit(limit)
                .sort({ average_rating: -1, students_count: -1 })
                .exec(),
            this.courseModel.countDocuments(query).exec()
        ]);
        const totalPages = Math.ceil(totalItems / limit);
        return {
            difficultyLevel: {
                id: difficultyLevel._id,
                name: difficultyLevel.name,
                slug: difficultyLevel.slug,
                level: difficultyLevel.level,
                color: difficultyLevel.color,
                description: difficultyLevel.description
            },
            courses,
            totalItems,
            currentPage: page,
            totalPages
        };
    }
    async getFeaturedCourses(limit = 6) {
        this.logger.log(`Получение ${limit} рекомендуемых курсов`);
        const courses = await this.courseModel
            .find({
            is_active: true,
            is_featured: true
        })
            .populate('teacherId', 'name second_name rating experience_years avatar_url')
            .populate('categoryId', 'name slug color icon')
            .populate('difficultyLevelId', 'name slug level color')
            .sort({ average_rating: -1, students_count: -1 })
            .limit(limit)
            .exec();
        return courses;
    }
    async searchCourses(searchQuery, page = 1, limit = 10, filters = {}) {
        this.logger.log(`Поиск курсов по запросу: "${searchQuery}"`);
        const skip = (page - 1) * limit;
        const query = {
            is_active: true,
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
                { tags: { $in: [new RegExp(searchQuery, 'i')] } }
            ]
        };
        if (filters.categoryId) {
            query.categoryId = filters.categoryId;
        }
        if (filters.difficultyLevelId) {
            query.difficultyLevelId = filters.difficultyLevelId;
        }
        if (filters.teacherId) {
            query.teacherId = filters.teacherId;
        }
        const [courses, totalItems] = await Promise.all([
            this.courseModel
                .find(query)
                .populate('teacherId', 'name second_name rating experience_years avatar_url')
                .populate('categoryId', 'name slug color icon')
                .populate('difficultyLevelId', 'name slug level color')
                .skip(skip)
                .limit(limit)
                .sort({
                average_rating: -1,
                students_count: -1
            })
                .exec(),
            this.courseModel.countDocuments(query).exec()
        ]);
        const totalPages = Math.ceil(totalItems / limit);
        return {
            courses,
            totalItems,
            totalPages,
            currentPage: page,
            searchQuery
        };
    }
    async updateTeacherStatistics(teacherId) {
        try {
            const stats = await this.courseModel.aggregate([
                { $match: { teacherId: new mongoose.Types.ObjectId(teacherId) } },
                {
                    $group: {
                        _id: null,
                        coursesCount: { $sum: 1 },
                        totalStudents: { $sum: '$students_count' },
                        avgRating: { $avg: '$average_rating' }
                    }
                }
            ]);
            if (stats.length > 0) {
                await this.teacherModel.findByIdAndUpdate(teacherId, {
                    courses_count: stats[0].coursesCount,
                    total_students: stats[0].totalStudents,
                    $set: { updated_at: new Date() }
                });
            }
        }
        catch (error) {
            this.logger.error(`Ошибка обновления статистики преподавателя ${teacherId}:`, error);
        }
    }
    async updateCategoryStatistics(categoryId) {
        try {
            const stats = await this.courseModel.aggregate([
                { $match: { categoryId: new mongoose.Types.ObjectId(categoryId), is_active: true } },
                {
                    $group: {
                        _id: null,
                        coursesCount: { $sum: 1 },
                        totalStudents: { $sum: '$students_count' },
                        avgPrice: { $avg: '$price' }
                    }
                }
            ]);
            if (stats.length > 0) {
                await this.categoryModel.findByIdAndUpdate(categoryId, {
                    courses_count: stats[0].coursesCount,
                    students_count: stats[0].totalStudents,
                    average_price: stats[0].avgPrice,
                    updated_at: new Date()
                });
            }
        }
        catch (error) {
            this.logger.error(`Ошибка обновления статистики категории ${categoryId}:`, error);
        }
    }
    async updateDifficultyLevelStatistics(difficultyLevelId) {
        try {
            const stats = await this.courseModel.aggregate([
                { $match: { difficultyLevelId: new mongoose.Types.ObjectId(difficultyLevelId), is_active: true } },
                {
                    $group: {
                        _id: null,
                        coursesCount: { $sum: 1 },
                        totalStudents: { $sum: '$students_count' },
                        avgRating: { $avg: '$average_rating' }
                    }
                }
            ]);
            if (stats.length > 0) {
                await this.difficultyLevelModel.findByIdAndUpdate(difficultyLevelId, {
                    courses_count: stats[0].coursesCount,
                    students_count: stats[0].totalStudents,
                    average_rating: stats[0].avgRating,
                    updated_at: new Date()
                });
            }
        }
        catch (error) {
            this.logger.error(`Ошибка обновления статистики уровня сложности ${difficultyLevelId}:`, error);
        }
    }
    isValidObjectId(id) {
        return mongoose.Types.ObjectId.isValid(id);
    }
    async updatePublishStatus(id, isPublished) {
        const course = await this.courseModel.findById(id).exec();
        if (!course) {
            throw new common_1.NotFoundException(`Курс с ID ${id} не найден`);
        }
        course.isPublished = isPublished;
        return course.save();
    }
    async getCourseLessons(courseId) {
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) {
            throw new common_1.NotFoundException(`Курс с ID ${courseId} не найден`);
        }
        return [];
    }
    async getCourseStatistics(courseId) {
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) {
            throw new common_1.NotFoundException(`Курс с ID ${courseId} не найден`);
        }
        return {
            studentsCount: course.students_count || 0,
            lessonsCount: course.lessons_count || 0,
            averageRating: course.average_rating || 0,
            completionRate: 0,
            revenue: 0
        };
    }
    async getPopularCourses(limit = 10) {
        return this.courseModel
            .find({ isActive: true, isPublished: true })
            .sort({ students_count: -1, average_rating: -1 })
            .limit(limit)
            .populate('teacherId', 'name second_name rating')
            .populate('categoryId', 'name slug')
            .populate('difficultyLevelId', 'name level color')
            .exec();
    }
    async getCategories() {
        return [];
    }
    async enrollStudent(courseId, userId) {
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) {
            throw new common_1.NotFoundException(`Курс с ID ${courseId} не найден`);
        }
        return {
            courseId,
            userId,
            enrollmentDate: new Date()
        };
    }
    async getCourseStudents(courseId, page = 1, limit = 20) {
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) {
            throw new common_1.NotFoundException(`Курс с ID ${courseId} не найден`);
        }
        return {
            students: [],
            totalItems: 0,
            totalPages: 0
        };
    }
    async duplicateCourse(courseId, newTitle, userId) {
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) {
            throw new common_1.NotFoundException(`Курс с ID ${courseId} не найден`);
        }
        const courseData = course.toObject();
        delete courseData._id;
        delete courseData.id;
        const newCourse = new this.courseModel({
            ...courseData,
            title: newTitle,
            isPublished: false,
            students_count: 0,
            slug: `${courseData.slug}-copy-${Date.now().toString(36)}`
        });
        return newCourse.save();
    }
    async getCoursesByCategory(categoryId, page = 1, limit = 12, detailLevel = 'card') {
        this.logger.log(`Получение курсов категории ${categoryId}, уровень: ${detailLevel}`);
        if (!this.isValidObjectId(categoryId)) {
            throw new common_1.BadRequestException('Некорректный ID категории');
        }
        const category = await this.categoryModel.findById(categoryId);
        if (!category) {
            throw new common_1.NotFoundException('Категория не найдена');
        }
        const skip = (page - 1) * limit;
        const query = { categoryId, is_active: true };
        let teacherFields = 'name second_name rating';
        let courseFields = 'title slug price discount_percent currency average_rating students_count image_url';
        if (detailLevel === 'full') {
            teacherFields += ' experience_years avatar_url';
            courseFields += ' description duration_hours lessons_count tags preview_video_url is_featured';
        }
        else if (detailLevel === 'admin') {
            teacherFields += ' experience_years avatar_url bio email created_at';
            courseFields = '';
        }
        const [courses, totalItems] = await Promise.all([
            this.courseModel
                .find(query, detailLevel === 'admin' ? {} : courseFields)
                .populate('teacherId', teacherFields)
                .populate('difficultyLevelId', 'name slug level color')
                .skip(skip)
                .limit(limit)
                .sort({ average_rating: -1, students_count: -1 })
                .exec(),
            this.courseModel.countDocuments(query).exec()
        ]);
        const totalPages = Math.ceil(totalItems / limit);
        return {
            category: {
                id: category._id,
                name: category.name,
                slug: category.slug,
                description: category.description,
                color: category.color,
                icon: category.icon
            },
            courses,
            totalItems,
            currentPage: page,
            totalPages
        };
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = CoursesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(course_schema_1.Course.name)),
    __param(1, (0, mongoose_1.InjectModel)(teacher_schema_1.Teacher.name)),
    __param(2, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __param(3, (0, mongoose_1.InjectModel)(difficulty_level_schema_1.DifficultyLevel.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], CoursesService);
//# sourceMappingURL=courses.service.js.map