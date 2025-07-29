import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
export type AvatarDocument = Avatar & Document;
export declare class Avatar {
    id?: string;
    userId: User;
    imageData: string;
    mimeType: string;
    size: number;
    width: number;
    height: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const AvatarSchema: MongooseSchema<Avatar, import("mongoose").Model<Avatar, any, any, any, Document<unknown, any, Avatar, any> & Avatar & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Avatar, Document<unknown, {}, import("mongoose").FlatRecord<Avatar>, {}> & import("mongoose").FlatRecord<Avatar> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare const minSizeKB = 10;
export declare const maxSizeKB = 1536;
export declare const minWidth = 256;
export declare const minHeight = 256;
