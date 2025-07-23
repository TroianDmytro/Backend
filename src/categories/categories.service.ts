// src/categories/categories.service.ts
import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    private readonly logger = new Logger(CategoriesService.name);

    constructor(
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>
    ) { }

    /**
     * Создание новой категории
     */
    async create(createCategoryDto: CreateCategoryDto): Promise<CategoryDocument> {
        // Проверяем уникальность slug
        const existingCategory = await this.categoryModel.findOne({
            slug: createCategoryDto.slug
        }).exec();

        if (existingCategory) {
            throw new ConflictException(`Категория со slug "${createCategoryDto.slug}" уже существует`);
        }

        // Если указана родительская категория, проверяем её существование
        if (createCategoryDto.parent_id) {
            const parentCategory = await this.categoryModel.findById(createCategoryDto.parent_id).exec();
            if (!parentCategory) {
                throw new NotFoundException(`Родительская категория с ID ${createCategoryDto.parent_id} не найдена`);
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

    /**
     * Получение всех категорий
     */
    async findAll(
        onlyActive: boolean = false,
        onlyParent: boolean = false
    ): Promise<CategoryDocument[]> {
        const filter: any = {};

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

    /**
     * Получение категории по ID
     */
    async findById(id: string): Promise<CategoryDocument | null> {
        return this.categoryModel.findById(id).exec();
    }

    /**
     * Получение категории по slug
     */
    async findBySlug(slug: string): Promise<CategoryDocument | null> {
        return this.categoryModel.findOne({ slug }).exec();
    }

    /**
     * Обновление категории
     */
    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryDocument> {
        const category = await this.categoryModel.findById(id).exec();
        if (!category) {
            throw new NotFoundException(`Категория с ID ${id} не найдена`);
        }

        // Проверяем уникальность slug, если он меняется
        if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
            const existingCategory = await this.categoryModel.findOne({
                slug: updateCategoryDto.slug,
                _id: { $ne: id }
            }).exec();

            if (existingCategory) {
                throw new ConflictException(`Категория со slug "${updateCategoryDto.slug}" уже существует`);
            }
        }

        // Проверяем, чтобы категория не была своим же родителем
        if (updateCategoryDto.parent_id === id) {
            throw new BadRequestException('Категория не может быть своим родителем');
        }

        Object.assign(category, updateCategoryDto);
        const updatedCategory = await category.save();

        this.logger.log(`Обновлена категория: ${id}`);
        return updatedCategory;
    }

    /**
     * Удаление категории
     */
    async delete(id: string): Promise<void> {
        const category = await this.categoryModel.findById(id).exec();
        if (!category) {
            throw new NotFoundException(`Категория с ID ${id} не найдена`);
        }

        // Проверяем наличие курсов в категории
        const coursesCount = await this.courseModel.countDocuments({
            categoryId: id
        }).exec();

        if (coursesCount > 0) {
            throw new ConflictException(
                `Нельзя удалить категорию с курсами. Количество курсов: ${coursesCount}`
            );
        }

        // Проверяем наличие подкатегорий
        const subcategoriesCount = await this.categoryModel.countDocuments({
            parent_id: id
        }).exec();

        if (subcategoriesCount > 0) {
            throw new ConflictException(
                `Нельзя удалить категорию с подкатегориями. Количество подкатегорий: ${subcategoriesCount}`
            );
        }

        await this.categoryModel.findByIdAndDelete(id).exec();
        this.logger.log(`Удалена категория: ${id}`);
    }

    /**
     * Получение курсов в категории (краткая информация для карточек)
     */
    async getCategoryCourses(
        categoryId: string,
        page: number = 1,
        limit: number = 12,
        onlyPublished: boolean = true
    ): Promise<{
        courses: any[];
        totalItems: number;
        totalPages: number;
        category: CategoryDocument;
    }> {
        const category = await this.categoryModel.findById(categoryId).exec();
        if (!category) {
            throw new NotFoundException(`Категория с ID ${categoryId} не найдена`);
        }

        const skip = (page - 1) * limit;
        const filter: any = { categoryId };

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

        // Преобразуем данные для карточек
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
                name: (course.difficultyLevelId as any).name,
                slug: (course.difficultyLevelId as any).slug,
                level: (course.difficultyLevelId as any).level,
                color: (course.difficultyLevelId as any).color
            } : null,
            teacher: course.teacherId ? {
                id: (course.teacherId as any).id,
                name: (course.teacherId as any).name,
                second_name: (course.teacherId as any).second_name,
                rating: (course.teacherId as any).rating
            } : null
        }));

        return {
            courses: courseCards,
            totalItems,
            totalPages,
            category
        };
    }

    /**
     * Получение полной информации о курсах в категории (для пользователей)
     */
    async getCategoryCoursesDetailed(
        categoryId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<any> {
        const category = await this.categoryModel.findById(categoryId).exec();
        if (!category) {
            throw new NotFoundException(`Категория с ID ${categoryId} не найдена`);
        }

        const skip = (page - 1) * limit;
        const filter: any = {
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

    /**
     * Получение полной информации о курсах в категории (для админов)
     */
    async getCategoryCoursesAdmin(
        categoryId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<any> {
        const category = await this.categoryModel.findById(categoryId).exec();
        if (!category) {
            throw new NotFoundException(`Категория с ID ${categoryId} не найдена`);
        }

        const skip = (page - 1) * limit;
        const filter: any = { categoryId };

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

    /**
     * Получение рекомендуемых категорий
     */
    async getFeaturedCategories(limit: number = 6): Promise<CategoryDocument[]> {
        return this.categoryModel
            .find({
                isActive: true,
                isFeatured: true
            })
            .sort({ courses_count: -1, order: 1 })
            .limit(limit)
            .exec();
    }

    /**
     * Получение дерева категорий
     */
    async getCategoriesTree(): Promise<any[]> {
        const categories = await this.categoryModel
            .find({ isActive: true })
            .sort({ order: 1, name: 1 })
            .exec();

        // Строим дерево категорий
        const categoriesMap = new Map();
        const tree: any[] = [];

        // Сначала добавляем все категории в Map
        categories.forEach(category => {
            categoriesMap.set(category.id, {
                ...category.toObject(),
                subcategories: []
            });
        });

        // Затем строим иерархию
        categories.forEach(category => {
            const categoryData = categoriesMap.get(category.id);

            if (category.parent_id) {
                const parent = categoriesMap.get(category.parent_id);
                if (parent) {
                    parent.subcategories.push(categoryData);
                }
            } else {
                tree.push(categoryData);
            }
        });

        return tree;
    }

    /**
     * Обновление статистики категории
     */
    async updateCategoryStatistics(categoryId: string): Promise<void> {
        // Подсчитываем количество курсов
        const coursesCount = await this.courseModel.countDocuments({
            categoryId: categoryId,
            isActive: true,
            isPublished: true
        }).exec();

        // Получаем все курсы для подсчета студентов
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

        // Обновляем статистику
        await this.categoryModel.findByIdAndUpdate(categoryId, {
            courses_count: coursesCount,
            students_count: studentsCount
        }).exec();

        this.logger.log(`Обновлена статистика категории ${categoryId}: курсов - ${coursesCount}, студентов - ${studentsCount}`);
    }

    /**
     * Массовое обновление статистики всех категорий
     */
    async updateAllCategoriesStatistics(): Promise<void> {
        this.logger.log('Начало обновления статистики всех категорий');

        const categories = await this.categoryModel.find().exec();

        for (const category of categories) {
            await this.updateCategoryStatistics(category.id);
        }

        this.logger.log('Статистика всех категорий обновлена');
    }
}