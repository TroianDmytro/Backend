// src/users/schemas/user.schema.ts - ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../enums/user-role.enum';

export type UserDocument = User & Document;

@Schema({
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            delete ret.password;
            return ret;
        }
    }
})
export class User {
    _id: Types.ObjectId;

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true, trim: true })
    second_name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop()
    phone?: string;

    @Prop({ enum: UserRole, default: UserRole.STUDENT })
    role: UserRole;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: false })
    isEmailVerified: boolean;

    @Prop()
    dateOfBirth?: Date;

    createdAt: Date;
    updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });