import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Course } from 'src/courses/schemas/course.schema';
export type TeacherDocument = Teacher & Document;
export declare class Teacher {
    id?: string;
    avatarId?: MongooseSchema.Types.ObjectId;
    email: string;
    password: string;
    name: string;
    second_name: string;
    age: number;
    telefon_number: string;
    description: string;
    specialization: string;
    education: string;
    experience_years: number;
    skills: string[];
    cv_file_url: string;
    assignedCourses: Types.ObjectId[] | Course[];
    isEmailVerified: boolean;
    isBlocked: boolean;
    isApproved: boolean;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    approvedAt?: Date;
    approvedBy?: MongooseSchema.Types.ObjectId;
    verificationToken: string | null;
    verificationTokenExpires: Date | null;
    resetPasswordToken: string | null;
    resetPasswordExpires: Date | null;
    rating: number;
    reviewsCount: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const TeacherSchema: MongooseSchema<Teacher, import("mongoose").Model<Teacher, any, any, any, Document<unknown, any, Teacher, any> & Teacher & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Teacher, Document<unknown, {}, import("mongoose").FlatRecord<Teacher>, {}> & import("mongoose").FlatRecord<Teacher> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
