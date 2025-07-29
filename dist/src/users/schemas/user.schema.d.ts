import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Role } from '../../roles/schemas/role.schema';
import { Course } from 'src/courses/schemas/course.schema';
export type UserDocument = User & Document;
export declare class User {
    id?: string;
    avatarId?: MongooseSchema.Types.ObjectId;
    email: string;
    password: string;
    name: string;
    second_name: string;
    age: number;
    telefon_number: string;
    isEmailVerified: boolean;
    isBlocked: boolean;
    verificationToken: string | null;
    verificationTokenExpires: Date | null;
    resetPasswordToken: string | null;
    resetPasswordExpires: Date | null;
    roles: Role[];
    assignedCourses: Types.ObjectId[] | Course[];
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const UserSchema: MongooseSchema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any> & User & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}> & import("mongoose").FlatRecord<User> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
