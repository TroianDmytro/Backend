import { Document, Types } from 'mongoose';
export type RoleDocument = Role & Document;
export declare class Role {
    _id?: Types.ObjectId;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const RoleSchema: import("mongoose").Schema<Role, import("mongoose").Model<Role, any, any, any, Document<unknown, any, Role, any> & Role & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Role, Document<unknown, {}, import("mongoose").FlatRecord<Role>, {}> & import("mongoose").FlatRecord<Role> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
