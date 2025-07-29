import { Model } from 'mongoose';
import { CategoryDocument } from './schemas/category.schema';
import { CourseDocument } from '../courses/schemas/course.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private categoryModel;
    private courseModel;
    private readonly logger;
    constructor(categoryModel: Model<CategoryDocument>, courseModel: Model<CourseDocument>);
    create(createCategoryDto: CreateCategoryDto): Promise<CategoryDocument>;
    findAll(onlyActive?: boolean, onlyParent?: boolean): Promise<CategoryDocument[]>;
    findById(id: string): Promise<CategoryDocument | null>;
    findBySlug(slug: string): Promise<CategoryDocument | null>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryDocument>;
    delete(id: string): Promise<void>;
    getCategoryCourses(categoryId: string, page?: number, limit?: number, onlyPublished?: boolean): Promise<{
        courses: any[];
        totalItems: number;
        totalPages: number;
        category: CategoryDocument;
    }>;
    getCategoryCoursesDetailed(categoryId: string, page?: number, limit?: number): Promise<any>;
    getCategoryCoursesAdmin(categoryId: string, page?: number, limit?: number): Promise<any>;
    getFeaturedCategories(limit?: number): Promise<CategoryDocument[]>;
    getCategoriesTree(): Promise<any[]>;
    updateCategoryStatistics(categoryId: string): Promise<void>;
    updateAllCategoriesStatistics(): Promise<void>;
}
