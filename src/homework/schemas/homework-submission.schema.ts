// src/homework/schemas/homework-submission.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type HomeworkSubmissionDocument = HomeworkSubmission & Document;

/**
 * Схема выполненного домашнего задания
 */
@Schema({
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
})
export class HomeworkSubmission {
    // Виртуальное поле ID
    id?: string;

    // Связи с основными сущностями
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Lesson',
        required: true,
    })
    lessonId: MongooseSchema.Types.ObjectId; // ID урока

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        required: true,
    })
    studentId: MongooseSchema.Types.ObjectId; // ID студента

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Course',
        required: true,
    })
    courseId: MongooseSchema.Types.ObjectId; // ID курса

    // Информация о сдаче задания
    @Prop({ type: String })
    student_comment: string; // Комментарий студента к работе

    // Файлы домашнего задания (zip, rar)
    @Prop({
        type: [{
            filename: { type: String, required: true },
            original_name: { type: String, required: true },
            url: { type: String, required: true }, // Ссылка на файл в хранилище
            size_bytes: { type: Number, required: true },
            mime_type: { type: String, required: true },
            uploaded_at: { type: Date, default: Date.now }
        }],
        required: true,
        validate: {
            validator: function (files: any[]) {
                return files && files.length > 0;
            },
            message: 'Необходимо загрузить хотя бы один файл'
        }
    })
    files: Array<{
        filename: string;
        original_name: string;
        url: string;
        size_bytes: number;
        mime_type: string;
        uploaded_at: Date;
    }>;

    // Статус проверки
    @Prop({
        type: String,
        enum: ['submitted', 'in_review', 'reviewed', 'returned_for_revision'],
        default: 'submitted'
    })
    status: 'submitted' | 'in_review' | 'reviewed' | 'returned_for_revision';

    @Prop({ type: Date })
    submitted_at: Date; // Дата и время сдачи

    // Проверка преподавателем
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Teacher'
    })
    reviewed_by?: MongooseSchema.Types.ObjectId; // ID преподавателя, который проверил

    @Prop({ type: Date })
    reviewed_at?: Date; // Дата и время проверки

    @Prop({ type: Number, min: 0, max: 100 })
    score?: number; // Оценка за задание (0-100)

    @Prop({ type: String })
    teacher_comment?: string; // Комментарий преподавателя

    // Дополнительная информация о проверке
    @Prop({
        type: [{
            criteria: { type: String, required: true },
            score: { type: Number, required: true, min: 0, max: 100 },
            comment: { type: String }
        }],
        default: []
    })
    detailed_feedback?: Array<{
        criteria: string; // Критерий оценки
        score: number; // Оценка по критерию
        comment?: string; // Комментарий по критерию
    }>;

    // Попытки сдачи
    @Prop({ type: Number, default: 1 })
    attempt_number: number; // Номер попытки сдачи

    @Prop({ type: Number, default: 3 })
    max_attempts: number; // Максимальное количество попыток

    @Prop({ type: Boolean, default: false })
    is_late: boolean; // Сдано ли задание с опозданием

    @Prop({ type: Date })
    deadline?: Date; // Срок сдачи (копируется из урока)

    // Системные поля
    createdAt?: Date;
    updatedAt?: Date;
}

export const HomeworkSubmissionSchema = SchemaFactory.createForClass(HomeworkSubmission);

// Виртуальное поле id
HomeworkSubmissionSchema.virtual('id').get(function () {
    return this._id.toString();
});

// Виртуальные поля для связей
HomeworkSubmissionSchema.virtual('lesson', {
    ref: 'Lesson',
    localField: 'lessonId',
    foreignField: '_id',
    justOne: true
});

HomeworkSubmissionSchema.virtual('student', {
    ref: 'User',
    localField: 'studentId',
    foreignField: '_id',
    justOne: true
});

HomeworkSubmissionSchema.virtual('course', {
    ref: 'Course',
    localField: 'courseId',
    foreignField: '_id',
    justOne: true
});

HomeworkSubmissionSchema.virtual('teacher', {
    ref: 'Teacher',
    localField: 'reviewed_by',
    foreignField: '_id',
    justOne: true
});

// Индексы для оптимизации
HomeworkSubmissionSchema.index({ courseId: 1 });
HomeworkSubmissionSchema.index({ studentId: 1 });
HomeworkSubmissionSchema.index({ status: 1 });
HomeworkSubmissionSchema.index({ reviewed_by: 1 });
HomeworkSubmissionSchema.index({ submitted_at: -1 });
HomeworkSubmissionSchema.index({ reviewed_at: -1 });

// Уникальный индекс для предотвращения дублирования попыток
HomeworkSubmissionSchema.index(
    { lessonId: 1, studentId: 1, attempt_number: 1 },
    { unique: true }
);