import { Document } from 'mongoose';
export type CategoryDocument = Category & Document;
export declare class Category {
    id?: string;
    name: string;
    slug: string;
    description: string;
    short_description?: string;
    icon?: string;
    image_url?: string;
    color?: string;
    parent_id?: string;
    isActive: boolean;
    isFeatured: boolean;
    order: number;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string[];
    courses_count: number;
    students_count: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const CategorySchema: import("mongoose").Schema<Category, import("mongoose").Model<Category, any, any, any, Document<unknown, any, Category, any> & Category & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Category, Document<unknown, {}, import("mongoose").FlatRecord<Category>, {}> & import("mongoose").FlatRecord<Category> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
