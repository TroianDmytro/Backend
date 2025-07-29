import { HomeworkFileDto, MaterialDto, VideoDto } from './create-lesson.dto';
export declare class UpdateLessonDto {
    title?: string;
    description?: string;
    short_description?: string;
    order?: number;
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
