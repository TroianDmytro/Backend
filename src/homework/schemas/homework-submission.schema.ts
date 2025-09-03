// src/homework/schemas/homework-submission.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Transform, Type } from 'class-transformer';
import { Homework } from './homework.schema';
import { User } from '../../users/schemas/user.schema';
import { Teacher } from '../../teachers/schemas/teacher.schema';

export type HomeworkSubmissionDocument = HomeworkSubmission & Document;

export enum SubmissionStatus {
    SUBMITTED = 'submitted',
    IN_REVIEW = 'in_review',
    REVIEWED = 'reviewed',              
    RETURNED_FOR_REVISION = 'returned_for_revision' 
}

@Schema({
    timestamps: true,
    collection: 'homework_submissions'
})
export class HomeworkSubmission {
    @Transform(({ value }) => value.toString())
    _id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Homework', required: true })
    @Type(() => Homework)
    homework: Homework; // ИСПРАВЛЕНО: вместо homeworkId

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    @Type(() => User)
    student: User; // ИСПРАВЛЕНО: вместо studentId

    @Prop({ enum: SubmissionStatus, default: SubmissionStatus.SUBMITTED })
    status: SubmissionStatus;

    @Prop([{
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        mimeType: { type: String },
        size: { type: Number },
        url: { type: String, required: true }
    }])
    files: {
        filename: string;
        originalName: string;
        mimeType?: string;
        size?: number;
        url: string;
    }[]; // ДОБАВЛЕНО

    @Prop({ min: 0 })
    score?: number; // ДОБАВЛЕНО

    @Prop()
    teacher_comment?: string; // ДОБАВЛЕНО

    @Prop()
    detailed_feedback?: string; // ДОБАВЛЕНО

    @Prop({ type: Types.ObjectId, ref: 'Teacher' })
    reviewed_by?: Teacher; // ДОБАВЛЕНО

    @Prop()
    reviewed_at?: Date; // ДОБАВЛЕНО

    @Prop({ default: false })
    is_late?: boolean; // ДОБАВЛЕНО

    @Prop({ default: Date.now })
    submitted_at: Date;

    createdAt: Date;
    updatedAt: Date;
}

export const HomeworkSubmissionSchema = SchemaFactory.createForClass(HomeworkSubmission);

HomeworkSubmissionSchema.index({ homework: 1, student: 1 }, { unique: true });
HomeworkSubmissionSchema.index({ status: 1 });