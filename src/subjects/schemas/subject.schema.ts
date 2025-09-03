// src/subjects/schemas/subject.schema.ts - НОВАЯ СХЕМА
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Transform } from 'class-transformer';

export type SubjectDocument = Subject & Document;

@Schema({
    timestamps: true,
    collection: 'subjects'
})
export class Subject {
    @Transform(({ value }) => value.toString())
    _id: Types.ObjectId;

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ trim: true })
    description?: string;

    @Prop({ default: true })
    isActive: boolean;

    // НОВОЕ: Учебные материалы для предмета
    @Prop([{
        title: { type: String, required: true },
        description: { type: String },
        type: {
            type: String,
            enum: ['video', 'pdf_book', 'lecture_files', 'document_link'],
            required: true
        },
        fileUrl: { type: String }, // для файлов (PDF, ZIP)
        externalUrl: { type: String }, // для видео и документов
        createdAt: { type: Date, default: Date.now }
    }])
    studyMaterials: {
        title: string;
        description?: string;
        type: 'video' | 'pdf_book' | 'lecture_files' | 'document_link';
        fileUrl?: string;
        externalUrl?: string;
        createdAt: Date;
    }[];

    createdAt: Date;
    updatedAt: Date;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
