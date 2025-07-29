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
var CategoriesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const category_schema_1 = require("./schemas/category.schema");
const course_schema_1 = require("../courses/schemas/course.schema");
let CategoriesService = CategoriesService_1 = class CategoriesService {
    categoryModel;
    courseModel;
    logger = new common_1.Logger(CategoriesService_1.name);
    constructor(categoryModel, courseModel) {
        this.categoryModel = categoryModel;
        this.courseModel = courseModel;
    }
    async create(createCategoryDto) {
        const existingCategory = await this.categoryModel.findOne({
            slug: createCategoryDto.slug
        }).exec();
        if (existingCategory) {
            throw new common_1.ConflictException(`Категория со slug "${createCategoryDto.slug}" уже существует`);
        }
        if (createCategoryDto.parent_id) {
            const parentCategory = await this.categoryModel.findById(createCategoryDto.parent_id).exec();
            if (!parentCategory) {
                throw new common_1.NotFoundException(`Родительская категория с ID ${createCategoryDto.parent_id} не найдена`);
            }
        }
        const newCategory = new this.categoryModel({
            ...createCategoryDto,
            courses_count: 0,
            students_count: 0
        });
        const savedCategory = await newCategory.save();
        this.logger.log(`Создана категория: ${savedCategory.name} (ID: ${savedCategory.id})`);
        return savedCategory;
    }
    async findAll(onlyActive = false, onlyParent = false) {
        const filter = {};
        if (onlyActive) {
            filter.isActive = true;
        }
        if (onlyParent) {
            filter.parent_id = null;
        }
        return this.categoryModel
            .find(filter)
            .sort({ order: 1, name: 1 })
            .exec();
    }
    async findById(id) {
        return this.categoryModel.findById(id).exec();
    }
    async findBySlug(slug) {
        return this.categoryModel.findOne({ slug }).exec();
    }
    async update(id, updateCategoryDto) {
        const category = await this.categoryModel.findById(id).exec();
        if (!category) {
            throw new common_1.NotFoundException(`Категория с ID ${id} не найдена`);
        }
        if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
            const existingCategory = await this.categoryModel.findOne({
                slug: updateCategoryDto.slug,
                _id: { $ne: id }
            }).exec();
            if (existingCategory) {
                throw new common_1.ConflictException(`Категория со slug "${updateCategoryDto.slug}" уже существует`);
            }
        }
        if (updateCategoryDto.parent_id === id) {
            throw new common_1.BadRequestException('Категория не может быть своим родителем');
        }
        Object.assign(category, updateCategoryDto);
        const updatedCategory = await category.save();
        this.logger.log(`Обновлена категория: ${id}`);
        return updatedCategory;
    }
    async delete(id) {
        const category = await this.categoryModel.findById(id).exec();
        if (!category) {
            throw new common_1.NotFoundException(`Категория с ID ${id} не найдена`);
        }
        const coursesCount = await this.courseModel.countDocuments({
            categoryId: id
        }).exec();
        if (coursesCount > 0) {
            throw new common_1.ConflictException(`Нельзя удалить категорию с курсами. Количество курсов: ${coursesCount}`);
        }
        const subcategoriesCount = await this.categoryModel.countDocuments({
            parent_id: id
        }).exec();
        if (subcategoriesCount > 0) {
            throw new common_1.ConflictException(`Нельзя удалить категорию с подкатегориями. Количество подкатегорий: ${subcategoriesCount}`);
        }
        await this.categoryModel.findByIdAndDelete(id).exec();
        this.logger.log(`Удалена категория: ${id}`);
    }
    async getCategoryCourses(categoryId, page = 1, limit = 12, onlyPublished = true) {
        const category = await this.categoryModel.findById(categoryId).exec();
        if (!category) {
            throw new common_1.NotFoundException(`Категория с ID ${categoryId} не найдена`);
        }
        const skip = (page - 1) * limit;
        const filter = { categoryId };
        if (onlyPublished) {
            filter.isPublished = true;
            filter.isActive = true;
        }
        const [courses, totalItems] = await Promise.all([
            this.courseModel
                .find(filter)
                .select('title short_description logo_url price discount_price currency rating reviews_count current_students_count duration_hours lessons_count')
                .populate('teacherId', 'name second_name rating')
                .populate('difficultyLevelId', 'name slug level color')
                .skip(skip)
                .limit(limit)
                .sort({ rating: -1, current_students_count: -1 })
                .exec(),
            this.courseModel.countDocuments(filter).exec()
        ]);
        const totalPages = Math.ceil(totalItems / limit);
        const courseCards = courses.map(course => ({
            id: course.id,
            title: course.title,
            short_description: course.short_description,
            logo_url: course.logo_url,
            price: course.price,
            discount_price: course.price * (1 - course.discount_percent / 100),
            currency: course.currency,
            rating: course.rating,
            reviews_count: course.reviews_count,
            current_students_count: course.current_students_count,
            duration_hours: course.duration_hours,
            lessons_count: course.lessons_count,
            difficulty_level: course.difficultyLevelId ? {
                name: course.difficultyLevelId.name,
                slug: course.difficultyLevelId.slug,
                level: course.difficultyLevelId.level,
                color: course.difficultyLevelId.color
            } : null,
            teacher: course.teacherId ? {
                id: course.teacherId.id,
                name: course.teacherId.name,
                second_name: course.teacherId.second_name,
                rating: course.teacherId.rating
            } : null
        }));
        return {
            courses: courseCards,
            totalItems,
            totalPages,
            category
        };
    }
    async getCategoryCoursesDetailed(categoryId, page = 1, limit = 10) {
        const category = await this.categoryModel.findById(categoryId).exec();
        if (!category) {
            throw new common_1.NotFoundException(`Категория с ID ${categoryId} не найдена`);
        }
        const skip = (page - 1) * limit;
        const filter = {
            categoryId,
            isPublished: true,
            isActive: true
        };
        const [courses, totalItems] = await Promise.all([
            this.courseModel
                .find(filter)
                .select('-__v')
                .populate('teacherId', '-password -verificationToken -resetPasswordToken')
                .populate('categoryId')
                .populate('difficultyLevelId')
                .skip(skip)
                .limit(limit)
                .sort({ rating: -1, current_students_count: -1 })
                .exec(),
            this.courseModel.countDocuments(filter).exec()
        ]);
        const totalPages = Math.ceil(totalItems / limit);
        return {
            category,
            courses,
            totalItems,
            totalPages,
            currentPage: page
        };
    }
    async getCategoryCoursesAdmin(categoryId, page = 1, limit = 10) {
        const category = await this.categoryModel.findById(categoryId).exec();
        if (!category) {
            throw new common_1.NotFoundException(`Категория с ID ${categoryId} не найдена`);
        }
        const skip = (page - 1) * limit;
        const filter = { categoryId };
        const [courses, totalItems] = await Promise.all([
            this.courseModel
                .find(filter)
                .populate('teacherId')
                .populate('categoryId')
                .populate('difficultyLevelId')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec(),
            this.courseModel.countDocuments(filter).exec()
        ]);
        const totalPages = Math.ceil(totalItems / limit);
        return {
            category,
            courses,
            totalItems,
            totalPages,
            currentPage: page,
            statistics: {
                totalCourses: totalItems,
                publishedCourses: courses.filter(c => c.isPublished).length,
                activeCourses: courses.filter(c => c.is_active).length,
                totalStudents: courses.reduce((sum, c) => sum + (c.current_students_count || 0), 0),
                averageRating: courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length || 0
            }
        };
    }
    async getFeaturedCategories(limit = 6) {
        return this.categoryModel
            .find({
            isActive: true,
            isFeatured: true
        })
            .sort({ courses_count: -1, order: 1 })
            .limit(limit)
            .exec();
    }
    async getCategoriesTree() {
        const categories = await this.categoryModel
            .find({ isActive: true })
            .sort({ order: 1, name: 1 })
            .exec();
        const categoriesMap = new Map();
        const tree = [];
        categories.forEach(category => {
            categoriesMap.set(category.id, {
                ...category.toObject(),
                subcategories: []
            });
        });
        categories.forEach(category => {
            const categoryData = categoriesMap.get(category.id);
            if (category.parent_id) {
                const parent = categoriesMap.get(category.parent_id);
                if (parent) {
                    parent.subcategories.push(categoryData);
                }
            }
            else {
                tree.push(categoryData);
            }
        });
        return tree;
    }
    async updateCategoryStatistics(categoryId) {
        const coursesCount = await this.courseModel.countDocuments({
            categoryId: categoryId,
            isActive: true,
            isPublished: true
        }).exec();
        const courses = await this.courseModel
            .find({
            categoryId: categoryId,
            isActive: true,
            isPublished: true
        })
            .select('current_students_count')
            .exec();
        const studentsCount = courses.reduce((sum, course) => {
            return sum + (course.current_students_count || 0);
        }, 0);
        await this.categoryModel.findByIdAndUpdate(categoryId, {
            courses_count: coursesCount,
            students_count: studentsCount
        }).exec();
        this.logger.log(`Обновлена статистика категории ${categoryId}: курсов - ${coursesCount}, студентов - ${studentsCount}`);
    }
    async updateAllCategoriesStatistics() {
        this.logger.log('Начало обновления статистики всех категорий');
        const categories = await this.categoryModel.find().exec();
        for (const category of categories) {
            await this.updateCategoryStatistics(category.id);
        }
        this.logger.log('Статистика всех категорий обновлена');
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = CategoriesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __param(1, (0, mongoose_1.InjectModel)(course_schema_1.Course.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map