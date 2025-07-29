import { Document } from 'mongoose';
export type DifficultyLevelDocument = DifficultyLevel & Document;
export declare class DifficultyLevel {
    id?: string;
    name: string;
    slug: string;
    code: string;
    description: string;
    short_description?: string;
    icon?: string;
    color?: string;
    level: number;
    order: number;
    prerequisites: string[];
    target_audience: string[];
    recommended_hours?: number;
    min_experience_years?: number;
    isActive: boolean;
    courses_count: number;
    students_count: number;
    average_completion_rate: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const DifficultyLevelSchema: import("mongoose").Schema<DifficultyLevel, import("mongoose").Model<DifficultyLevel, any, any, any, Document<unknown, any, DifficultyLevel, any> & DifficultyLevel & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DifficultyLevel, Document<unknown, {}, import("mongoose").FlatRecord<DifficultyLevel>, {}> & import("mongoose").FlatRecord<DifficultyLevel> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
