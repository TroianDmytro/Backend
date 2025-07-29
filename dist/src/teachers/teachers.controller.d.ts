import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeacherApprovalDto } from './dto/teacher-approval.dto';
import { CourseDocument } from 'src/courses/schemas/course.schema';
export declare class TeachersController {
    private readonly teachersService;
    private readonly logger;
    constructor(teachersService: TeachersService);
    createTeacherApplication(createTeacherDto: CreateTeacherDto): Promise<{
        message: string;
        teacher: import("./schemas/teacher.schema").TeacherDocument;
    }>;
    getAllTeachers(status?: 'pending' | 'approved' | 'rejected' | 'all', page?: number, limit?: number, req?: any): Promise<{
        teachers: import("./schemas/teacher.schema").TeacherDocument[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getTeacherById(id: string): Promise<{
        teacher: import("./schemas/teacher.schema").TeacherDocument;
    }>;
    updateTeacher(id: string, updateTeacherDto: UpdateTeacherDto, req?: any): Promise<{
        message: string;
        teacher: import("./schemas/teacher.schema").TeacherDocument;
    }>;
    approveTeacher(id: string, approvalDto: TeacherApprovalDto, req?: any): Promise<{
        message: string;
        teacher: import("./schemas/teacher.schema").TeacherDocument;
    }>;
    assignCourseToTeacher(teacherId: string, courseId: string): Promise<{
        message: string;
        teacher: import("./schemas/teacher.schema").TeacherDocument;
    }>;
    removeCourseFromTeacher(teacherId: string, courseId: string): Promise<{
        message: string;
        teacher: import("./schemas/teacher.schema").TeacherDocument;
    }>;
    deleteTeacher(id: string): Promise<{
        message: string;
    }>;
    getPendingApplications(page?: number, limit?: number): Promise<{
        applications: import("./schemas/teacher.schema").TeacherDocument[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getTeacherStatistics(id: string): Promise<{
        teacherId: string;
        statistics: any;
    }>;
    blockTeacher(id: string, isBlocked: boolean, reason?: string): Promise<{
        message: string;
        teacher: import("./schemas/teacher.schema").TeacherDocument;
    }>;
    getTeacherCourses(id: string): Promise<{
        teacherId: string;
        courses: CourseDocument[];
        totalCourses: number;
        publishedCourses: number;
        activeCourses: number;
    }>;
}
