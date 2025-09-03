// src/teachers / schemas / teacher.schema.ts - ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TeacherDocument = Teacher & Document;

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
export class Teacher {
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

    @Prop()
    bio?: string;

    // ДОБАВЛЕНО: поля которые отсутствовали
    @Prop({ default: true })
    isApproved: boolean;

    @Prop({ default: false })
    isBlocked: boolean;

    @Prop([{
        type: Types.ObjectId,
        ref: 'Subject'
    }])
    subjects: Types.ObjectId[];

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: false })
    isEmailVerified: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);

TeacherSchema.index({ email: 1 });
TeacherSchema.index({ subjects: 1 });