// src/homework/schemas/homework.schema.ts - ОБНОВЛЕННАЯ СХЕМА
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Transform, Type } from 'class-transformer';
import { Lesson } from '../../lessons/schemas/lesson.schema';
import { Teacher } from '../../teachers/schemas/teacher.schema';

export type HomeworkDocument = Homework & Document;

@Schema({
    timestamps: true,
    collection: 'homework'
})
export class Homework {
    @Transform(({ value }) => value.toString())
    _id: Types.ObjectId;

    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ required: true, trim: true })
    description: string;

    @Prop({ required: true })
    fileUrl: string; // PDF файл с заданием

    @Prop({ required: true })
    dueDate: Date;

    @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true })
    @Type(() => Lesson)
    lesson: Lesson;

    @Prop({ type: Types.ObjectId, ref: 'Teacher', required: true })
    @Type(() => Teacher)
    assignedBy: Teacher;

    @Prop({ default: true })
    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export const HomeworkSchema = SchemaFactory.createForClass(Homework);