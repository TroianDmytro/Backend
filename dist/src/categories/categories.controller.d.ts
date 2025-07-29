import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    private readonly logger;
    constructor(categoriesService: CategoriesService);
    create(createCategoryDto: CreateCategoryDto): Promise<{
        message: string;
        category: import("./schemas/category.schema").CategoryDocument;
    }>;
    findAll(onlyActive: boolean, onlyParent: boolean): Promise<{
        categories: import("./schemas/category.schema").CategoryDocument[];
        total: number;
    }>;
    getCategoriesTree(): Promise<{
        categories: any[];
    }>;
    getFeaturedCategories(limit: number): Promise<{
        categories: import("./schemas/category.schema").CategoryDocument[];
        total: number;
    }>;
    findById(id: string): Promise<{
        category: import("./schemas/category.schema").CategoryDocument;
    }>;
    findBySlug(slug: string): Promise<{
        category: import("./schemas/category.schema").CategoryDocument;
    }>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<{
        message: string;
        category: import("./schemas/category.schema").CategoryDocument;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    getCategoryCourses(id: string, page: number, limit: number): Promise<{
        category: {
            id: any;
            name: string;
            slug: string;
            description: string;
        };
        courses: any[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getCategoryCoursesDetailed(id: string, page: number, limit: number): Promise<any>;
    getCategoryCoursesAdmin(id: string, page: number, limit: number): Promise<any>;
    updateCategoryStatistics(id: string): Promise<{
        message: string;
    }>;
    updateAllCategoriesStatistics(): Promise<{
        message: string;
    }>;
}
