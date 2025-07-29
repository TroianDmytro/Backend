import { Document, Schema as MongooseSchema } from 'mongoose';
export type CourseDocument = Course & Document;
export declare class Course {
    title: string;
    slug: string;
    description: string;
    image_url?: string;
    price: number;
    discount_percent: number;
    currency: string;
    is_active: boolean;
    is_featured: boolean;
    isPublished: boolean;
    duration_hours: number;
    lessons_count: number;
    tags: string[];
    preview_video_url?: string;
    certificate_template?: string;
    allow_comments: boolean;
    requires_approval: boolean;
    teacherId: MongooseSchema.Types.ObjectId;
    categoryId: MongooseSchema.Types.ObjectId;
    difficultyLevelId: MongooseSchema.Types.ObjectId;
    short_description: string;
    logo_url: string;
    rating: number;
    current_students_count: number;
    max_students: number;
    level: string;
    students_count: number;
    average_rating: number;
    reviews_count: number;
    completed_count: number;
    completion_rate: number;
    published_at: Date;
    updated_at?: Date;
}
export declare const CourseSchema: MongooseSchema<Course, import("mongoose").Model<Course, any, any, any, Document<unknown, any, Course, any> & Course & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Course, Document<unknown, {}, import("mongoose").FlatRecord<Course>, {}> & import("mongoose").FlatRecord<Course> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
