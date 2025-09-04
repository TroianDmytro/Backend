// src/teachers / schemas / teacher.schema.ts - ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TeacherDocument = Teacher & Document;

@Schema({
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_doc, ret: any) => {
            if (ret._id) ret.id = ret._id.toString();
            if (ret._id !== undefined) delete ret._id; // operands now optional-checked
            if (ret.__v !== undefined) delete ret.__v;
            if (ret.password !== undefined) delete ret.password;
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

    // Поля для верификации email и утверждения заявки
    @Prop({ type: String, default: null })
    verificationToken?: string | null;

    @Prop({ type: Date, default: null })
    verificationTokenExpires?: Date | null;

    @Prop({ default: 'pending' })
    approvalStatus?: 'pending' | 'approved' | 'rejected';

    @Prop({ type: Date, default: null })
    approvedAt?: Date | null;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    approvedBy?: Types.ObjectId;

    @Prop({ type: String, default: null })
    rejectionReason?: string | null;

    // Назначенные курсы
    @Prop({ type: [Types.ObjectId], ref: 'Course', default: [] })
    assignedCourses: Types.ObjectId[];

    // Рейтинг и отзывы
    @Prop({ type: Number, default: 0 })
    rating: number;

    @Prop({ type: Number, default: 0 })
    reviewsCount: number;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: false })
    isEmailVerified: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);

TeacherSchema.index({ subjects: 1 });