import { Model } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { TeacherDocument } from '../teachers/schemas/teacher.schema';
import { Category } from '../categories/schemas/category.schema';
import { DifficultyLevel } from '../difficulty-levels/schemas/difficulty-level.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
export declare class CoursesService {
    private courseModel;
    private teacherModel;
    private categoryModel;
    private difficultyLevelModel;
    private readonly logger;
    constructor(courseModel: Model<CourseDocument>, teacherModel: Model<TeacherDocument>, categoryModel: Model<Category>, difficultyLevelModel: Model<DifficultyLevel>);
    create(createCourseDto: CreateCourseDto): Promise<Course>;
    findAll(filters?: any, page?: number, limit?: number): Promise<{
        courses: Course[];
        totalItems: number;
        totalPages: number;
        currentPage: number;
    }>;
    findById(id: string): Promise<Course | null>;
    findBySlug(slug: string): Promise<Course | null>;
    update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course>;
    delete(id: string): Promise<void>;
    getCoursesByDifficultyLevel(difficultyLevelId: string, page?: number, limit?: number, detailLevel?: 'card' | 'full' | 'admin'): Promise<{
        difficultyLevel: any;
        courses: any[];
        totalItems: number;
        currentPage: number;
        totalPages: number;
    }>;
    getFeaturedCourses(limit?: number): Promise<Course[]>;
    searchCourses(searchQuery: string, page?: number, limit?: number, filters?: any): Promise<{
        courses: Course[];
        totalItems: number;
        totalPages: number;
        currentPage: number;
        searchQuery: string;
    }>;
    private updateTeacherStatistics;
    private updateCategoryStatistics;
    private updateDifficultyLevelStatistics;
    private isValidObjectId;
    updatePublishStatus(id: string, isPublished: boolean): Promise<Course>;
    getCourseLessons(courseId: string): Promise<any[]>;
    getCourseStatistics(courseId: string): Promise<any>;
    getPopularCourses(limit?: number): Promise<Course[]>;
    getCategories(): Promise<any[]>;
    enrollStudent(courseId: string, userId: string): Promise<any>;
    getCourseStudents(courseId: string, page?: number, limit?: number): Promise<any>;
    duplicateCourse(courseId: string, newTitle: string, userId: string): Promise<Course>;
    getCoursesByCategory(categoryId: string, page?: number, limit?: number, detailLevel?: 'card' | 'full' | 'admin'): Promise<{
        category: any;
        courses: any[];
        totalItems: number;
        currentPage: number;
        totalPages: number;
    }>;
}
