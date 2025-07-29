import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseFilterDto } from './dto/course-filter.dto';
import { TeachersService } from 'src/teachers/teachers.service';
export declare class CoursesController {
    private readonly coursesService;
    private readonly teachersService;
    private readonly logger;
    constructor(coursesService: CoursesService, teachersService: TeachersService);
    createCourse(createCourseDto: CreateCourseDto, req?: any): Promise<{
        message: string;
        course: import("./schemas/course.schema").Course;
    }>;
    getAllCourses(page: number | undefined, limit: number | undefined, filters: CourseFilterDto, req?: any): Promise<{
        courses: import("./schemas/course.schema").Course[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
        filters: CourseFilterDto;
    }>;
    getCourseById(id: string, includeLessons?: boolean): Promise<{
        course: import("./schemas/course.schema").Course;
    }>;
    updateCourse(id: string, updateCourseDto: UpdateCourseDto, req?: any): Promise<{
        message: string;
        course: import("./schemas/course.schema").Course;
    }>;
    deleteCourse(id: string, req?: any): Promise<{
        message: string;
    }>;
    publishCourse(id: string, isPublished: boolean, req?: any): Promise<{
        message: string;
        course: import("./schemas/course.schema").Course;
    }>;
    getCourseLessons(id: string): Promise<{
        courseId: string;
        lessons: any[];
        totalLessons: number;
    }>;
    getCourseStatistics(id: string): Promise<{
        courseId: string;
        statistics: any;
    }>;
    getFeaturedCourses(limit?: number): Promise<{
        courses: import("./schemas/course.schema").Course[];
        totalCourses: number;
    }>;
    getPopularCourses(limit?: number): Promise<{
        courses: import("./schemas/course.schema").Course[];
        totalCourses: number;
    }>;
    getCategories(): Promise<{
        categories: any[];
    }>;
    enrollInCourse(courseId: string, req?: any): Promise<{
        message: string;
        enrollment: any;
    }>;
    getCourseStudents(id: string, page?: number, limit?: number): Promise<{
        courseId: string;
        students: any;
        pagination: {
            currentPage: number;
            totalPages: any;
            totalItems: any;
            itemsPerPage: number;
        };
    }>;
    duplicateCourse(id: string, newTitle: string, req?: any): Promise<{
        message: string;
        originalCourseId: string;
        duplicatedCourse: import("./schemas/course.schema").Course;
    }>;
    getCoursesByCategory(categoryId: string, page: number, limit: number): Promise<{
        category: any;
        courses: any[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getCoursesByCategoryFull(categoryId: string, page: number, limit: number): Promise<{
        category: any;
        courses: any[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getCoursesByCategoryAdmin(categoryId: string, page: number, limit: number): Promise<{
        category: any;
        courses: any[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getCoursesByDifficultyLevel(difficultyLevelId: string, page: number, limit: number): Promise<{
        difficultyLevel: any;
        courses: any[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getCoursesByDifficultyLevelFull(difficultyLevelId: string, page: number, limit: number): Promise<{
        difficultyLevel: any;
        courses: any[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getCoursesByDifficultyLevelAdmin(difficultyLevelId: string, page: number, limit: number): Promise<{
        difficultyLevel: any;
        courses: any[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
}
