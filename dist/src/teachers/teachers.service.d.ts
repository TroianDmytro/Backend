import { Model } from 'mongoose';
import { TeacherDocument } from './schemas/teacher.schema';
import { CourseDocument } from '../courses/schemas/course.schema';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { EmailService } from '../email/email.service';
export declare class TeachersService {
    private teacherModel;
    private courseModel;
    private readonly emailService;
    private readonly logger;
    constructor(teacherModel: Model<TeacherDocument>, courseModel: Model<CourseDocument>, emailService: EmailService);
    createApplication(createTeacherDto: CreateTeacherDto): Promise<TeacherDocument>;
    findAll(status?: 'pending' | 'approved' | 'rejected' | 'all', page?: number, limit?: number): Promise<{
        teachers: TeacherDocument[];
        totalItems: number;
        totalPages: number;
    }>;
    findById(id: string): Promise<TeacherDocument | null>;
    findByEmail(email: string): Promise<TeacherDocument | null>;
    update(id: string, updateTeacherDto: UpdateTeacherDto): Promise<TeacherDocument>;
    approveApplication(teacherId: string, status: 'approved' | 'rejected', adminId: string, rejectionReason?: string): Promise<TeacherDocument>;
    assignCourse(teacherId: string, courseId: string): Promise<TeacherDocument>;
    removeCourse(teacherId: string, courseId: string): Promise<TeacherDocument>;
    getTeacherCourses(teacherId: string): Promise<CourseDocument[]>;
    getTeacherStatistics(teacherId: string): Promise<any>;
    blockTeacher(teacherId: string, isBlocked: boolean, reason?: string): Promise<TeacherDocument>;
    delete(teacherId: string): Promise<void>;
    private notifyAdminsAboutNewApplication;
}
