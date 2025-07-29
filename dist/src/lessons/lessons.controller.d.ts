import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
export declare class LessonsController {
    private readonly lessonsService;
    private readonly logger;
    constructor(lessonsService: LessonsService);
    createLesson(createLessonDto: CreateLessonDto, req?: any): Promise<{
        message: string;
        lesson: import("./schemas/lesson.schema").LessonDocument;
    }>;
    getLessonsByCourse(courseId: string, includeUnpublished?: boolean, req?: any): Promise<{
        courseId: string;
        lessons: import("./schemas/lesson.schema").LessonDocument[];
        totalLessons: number;
    }>;
    getLessonById(id: string): Promise<{
        lesson: import("./schemas/lesson.schema").LessonDocument;
    }>;
    updateLesson(id: string, updateLessonDto: UpdateLessonDto, req?: any): Promise<{
        message: string;
        lesson: import("./schemas/lesson.schema").LessonDocument;
    }>;
    deleteLesson(id: string, req?: any): Promise<{
        message: string;
    }>;
    publishLesson(id: string, isPublished: boolean, req?: any): Promise<{
        message: string;
        lesson: import("./schemas/lesson.schema").LessonDocument;
    }>;
    getNextLesson(currentLessonId: string): Promise<{
        message: string;
        nextLesson: null;
    } | {
        nextLesson: import("./schemas/lesson.schema").LessonDocument;
        message?: undefined;
    }>;
    getPreviousLesson(currentLessonId: string): Promise<{
        message: string;
        previousLesson: null;
    } | {
        previousLesson: import("./schemas/lesson.schema").LessonDocument;
        message?: undefined;
    }>;
}
