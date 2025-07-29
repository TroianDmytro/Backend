export declare class LessonResponseDto {
    id: string;
    courseId: string;
    title: string;
    description: string;
    short_description?: string;
    order: number;
    duration_minutes: number;
    text_content?: string;
    content_html?: string;
    videos: Array<{
        title: string;
        url: string;
        duration_minutes: number;
        order: number;
    }>;
    materials: Array<{
        title: string;
        url: string;
        type: string;
        size_bytes: number;
    }>;
    homework_description?: string;
    homework_files: Array<{
        title: string;
        url: string;
        type: string;
    }>;
    homework_deadline?: Date;
    homework_max_score?: number;
    isActive: boolean;
    isPublished: boolean;
    isFree: boolean;
    prerequisites: string[];
    createdAt: Date;
    updatedAt: Date;
}
