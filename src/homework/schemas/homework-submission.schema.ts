// src/homework/schemas/homework-submission.schema.ts - ИСПРАВЛЕННАЯ СХЕМА
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HomeworkSubmissionDocument = HomeworkSubmission & Document;

// ИСПРАВЛЕНО: правильные статусы
export enum SubmissionStatus {
    SUBMITTED = 'submitted',
    IN_REVIEW = 'in_review',
    REVIEWED = 'reviewed', // ИСПРАВЛЕНО: вместо 'graded'
    RETURNED_FOR_REVISION = 'returned_for_revision'
}

@Schema({
    timestamps: true,
    collection: 'homework_submissions'
})
export class HomeworkSubmission {
    @Prop({ type: Types.ObjectId, ref: 'Homework', required: true })
    homework: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    student: Types.ObjectId;

    @Prop({ enum: SubmissionStatus, default: SubmissionStatus.SUBMITTED })
    status: SubmissionStatus;

    // ИСПРАВЛЕНО: правильная структура файлов
    @Prop([{
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        mimeType: { type: String },
        size: { type: Number },
        url: { type: String, required: true }
    }])
    files: Array<{
        filename: string;
        originalName: string;
        mimeType?: string;
        size?: number;
        url: string;
    }>;

    @Prop({ min: 0, max: 100 })
    score?: number;

    @Prop()
    teacher_comment?: string;

    @Prop()
    detailed_feedback?: string;

    @Prop({ type: Types.ObjectId, ref: 'Teacher' })
    reviewed_by?: Types.ObjectId;

    @Prop()
    reviewed_at?: Date;

    @Prop({ default: false })
    is_late?: boolean;

    @Prop({ default: Date.now })
    submitted_at: Date;

    createdAt: Date;
    updatedAt: Date;
}

export const HomeworkSubmissionSchema = SchemaFactory.createForClass(HomeworkSubmission);

HomeworkSubmissionSchema.index({ homework: 1, student: 1 }, { unique: true });
HomeworkSubmissionSchema.index({ status: 1 });
HomeworkSubmissionSchema.index({ reviewed_by: 1 });