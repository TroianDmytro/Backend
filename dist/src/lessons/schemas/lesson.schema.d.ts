import { Document, Schema as MongooseSchema } from 'mongoose';
export type LessonDocument = Lesson & Document;
export declare class Lesson {
    id?: string;
    courseId: MongooseSchema.Types.ObjectId;
    title: string;
    description: string;
    short_description: string;
    order: number;
    duration_minutes: number;
    text_content: string;
    content_html: string;
    videos: Array<{
        title: string;
        url: string;
        duration_minutes: number;
        order: number;
    }>;
    materials: Array<{
        title: string;
        url: string;
        type: 'pdf' | 'doc' | 'ppt' | 'image' | 'link' | 'other';
        size_bytes: number;
    }>;
    homework_description: string;
    homework_files: Array<{
        title: string;
        url: string;
        type: 'document' | 'template' | 'example';
    }>;
    homework_deadline?: Date;
    homework_max_score?: number;
    isActive: boolean;
    isPublished: boolean;
    isFree: boolean;
    prerequisites: MongooseSchema.Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const LessonSchema: MongooseSchema<Lesson, import("mongoose").Model<Lesson, any, any, any, Document<unknown, any, Lesson, any> & Lesson & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Lesson, Document<unknown, {}, import("mongoose").FlatRecord<Lesson>, {}> & import("mongoose").FlatRecord<Lesson> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
