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
        ref: 'Homework',
        required: true,
    })
    homeworkId: MongooseSchema.Types.ObjectId; // ID домашнего задания

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
    student_comment?: string; // Комментарий студента к работе

    // Файлы домашнего задания (ZIP архивы, хранятся как Base64)
    @Prop({
        type: [{
            filename: { type: String, required: true },
            original_name: { type: String, required: true },
            data: { type: String, required: true }, // Base64 данные ZIP файла
            size_bytes: { type: Number, required: true },
            mime_type: { type: String, default: 'application/zip' },
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
        data: string; // Base64 строка
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

    @Prop({ type: Date, default: Date.now })
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

    @Prop({ type: Boolean, default: false })
    is_late: boolean; // Сдано ли задание с опозданием

    @Prop({ type: Date })
    deadline?: Date; // Срок сдачи (копируется из задания)

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
HomeworkSubmissionSchema.virtual('homework', {
    ref: 'Homework',
    localField: 'homeworkId',
    foreignField: '_id',
    justOne: true
});

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
HomeworkSubmissionSchema.index({ homeworkId: 1 });
HomeworkSubmissionSchema.index({ courseId: 1 });
HomeworkSubmissionSchema.index({ studentId: 1 });
HomeworkSubmissionSchema.index({ status: 1 });
HomeworkSubmissionSchema.index({ reviewed_by: 1 });
HomeworkSubmissionSchema.index({ submitted_at: -1 });
HomeworkSubmissionSchema.index({ reviewed_at: -1 });

// Уникальный индекс для предотвращения дублирования попыток
HomeworkSubmissionSchema.index(
    { homeworkId: 1, studentId: 1, attempt_number: 1 },
    { unique: true }
);

/**
 * Объяснение обновленной схемы сдачи заданий:
 * 
 * 1. **СВЯЗИ:**
 *    - homeworkId - связь с заданием
 *    - lessonId - связь с уроком
 *    - studentId - связь с студентом
 *    - courseId - связь с курсом
 * 
 * 2. **ХРАНЕНИЕ ФАЙЛОВ:**
 *    - Файлы ZIP архивов хранятся как Base64 в MongoDB
 *    - Сохраняется оригинальное имя и размер файла
 *    - Дата загрузки каждого файла
 * 
 * 3. **СТАТУСЫ:**
 *    - submitted - отправлено студентом
 *    - in_review - на проверке у преподавателя
 *    - reviewed - проверено преподавателем
 *    - returned_for_revision - возвращено на доработку
 * 
 * 4. **ОЦЕНИВАНИЕ:**
 *    - score - общая оценка (0-100)
 *    - teacher_comment - комментарий преподавателя
 *    - detailed_feedback - детальная оценка по критериям
 * 
 * 5. **КОНТРОЛЬ ПОПЫТОК:**
 *    - attempt_number - номер попытки
 *    - is_late - флаг опоздания
 *    - deadline - срок сдачи
 */