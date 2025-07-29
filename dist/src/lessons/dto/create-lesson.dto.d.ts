export declare class VideoDto {
    title: string;
    url: string;
    duration_minutes?: number;
    order?: number;
}
export declare class MaterialDto {
    title: string;
    url: string;
    type: 'pdf' | 'doc' | 'ppt' | 'image' | 'link' | 'other';
    size_bytes?: number;
}
export declare class HomeworkFileDto {
    title: string;
    url: string;
    type?: 'document' | 'template' | 'example';
}
export declare class CreateLessonDto {
    courseId: string;
    title: string;
    description: string;
    short_description?: string;
    order: number;
    duration_minutes?: number;
    text_content?: string;
    content_html?: string;
    videos?: VideoDto[];
    materials?: MaterialDto[];
    homework_description?: string;
    homework_files?: HomeworkFileDto[];
    homework_deadline?: string;
    homework_max_score?: number;
    isActive?: boolean;
    isPublished?: boolean;
    isFree?: boolean;
    prerequisites?: string[];
}
