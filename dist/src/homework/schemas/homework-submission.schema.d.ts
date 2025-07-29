import { Document, Schema as MongooseSchema } from 'mongoose';
export type HomeworkSubmissionDocument = HomeworkSubmission & Document;
export declare class HomeworkSubmission {
    id?: string;
    lessonId: MongooseSchema.Types.ObjectId;
    studentId: MongooseSchema.Types.ObjectId;
    courseId: MongooseSchema.Types.ObjectId;
    student_comment: string;
    files: Array<{
        filename: string;
        original_name: string;
        url: string;
        size_bytes: number;
        mime_type: string;
        uploaded_at: Date;
    }>;
    status: 'submitted' | 'in_review' | 'reviewed' | 'returned_for_revision';
    submitted_at: Date;
    reviewed_by?: MongooseSchema.Types.ObjectId;
    reviewed_at?: Date;
    score?: number;
    teacher_comment?: string;
    detailed_feedback?: Array<{
        criteria: string;
        score: number;
        comment?: string;
    }>;
    attempt_number: number;
    max_attempts: number;
    is_late: boolean;
    deadline?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const HomeworkSubmissionSchema: MongooseSchema<HomeworkSubmission, import("mongoose").Model<HomeworkSubmission, any, any, any, Document<unknown, any, HomeworkSubmission, any> & HomeworkSubmission & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, HomeworkSubmission, Document<unknown, {}, import("mongoose").FlatRecord<HomeworkSubmission>, {}> & import("mongoose").FlatRecord<HomeworkSubmission> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
