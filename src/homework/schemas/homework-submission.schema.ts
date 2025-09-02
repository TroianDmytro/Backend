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
    GRADED = 'graded',
    RETURNED = 'returned'
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
    homework: Homework;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    @Type(() => User)
    student: User;

    @Prop({ required: true })
    fileUrl: string;

    @Prop({ enum: SubmissionStatus, default: SubmissionStatus.SUBMITTED })
    status: SubmissionStatus;

    @Prop({ min: 1, max: 5 })
    grade?: number;

    @Prop({ trim: true })
    feedback?: string;

    @Prop()
    gradedAt?: Date;

    @Prop({ type: Types.ObjectId, ref: 'Teacher' })
    @Type(() => Teacher)
    gradedBy?: Teacher;

    createdAt: Date;
    updatedAt: Date;
}

export const HomeworkSubmissionSchema = SchemaFactory.createForClass(HomeworkSubmission);
