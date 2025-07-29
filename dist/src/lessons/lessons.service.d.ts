import { Model } from 'mongoose';
import { LessonDocument } from './schemas/lesson.schema';
import { CourseDocument } from '../courses/schemas/course.schema';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
export declare class LessonsService {
    private lessonModel;
    private courseModel;
    private readonly logger;
    constructor(lessonModel: Model<LessonDocument>, courseModel: Model<CourseDocument>);
    create(createLessonDto: CreateLessonDto, userId: string, isAdmin: boolean): Promise<LessonDocument>;
    findByCourse(courseId: string, includeUnpublished?: boolean): Promise<LessonDocument[]>;
    findById(id: string): Promise<LessonDocument | null>;
    update(id: string, updateLessonDto: UpdateLessonDto, userId: string, isAdmin: boolean): Promise<LessonDocument>;
    delete(id: string, userId: string, isAdmin: boolean): Promise<void>;
    updatePublishStatus(id: string, isPublished: boolean, userId: string, isAdmin: boolean): Promise<LessonDocument>;
    getNextLesson(currentLessonId: string): Promise<LessonDocument | null>;
    getPreviousLesson(currentLessonId: string): Promise<LessonDocument | null>;
    private updateCourseLessonsCount;
    getLessonHomeworkSubmissions(lessonId: string, status?: string, page?: number, limit?: number): Promise<{
        submissions: any[];
        totalItems: number;
        totalPages: number;
    }>;
    getLessonProgress(lessonId: string): Promise<any>;
    markLessonComplete(lessonId: string, userId: string): Promise<void>;
    reorderLessons(lessons: Array<{
        lessonId: string;
        order: number;
    }>, userId: string, isAdmin: boolean): Promise<void>;
    duplicateLesson(originalId: string, newTitle: string, userId: string, isAdmin: boolean, targetCourseId?: string): Promise<LessonDocument>;
}
