"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeworkSubmissionSchema = exports.HomeworkSubmission = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let HomeworkSubmission = class HomeworkSubmission {
    id;
    lessonId;
    studentId;
    courseId;
    student_comment;
    files;
    status;
    submitted_at;
    reviewed_by;
    reviewed_at;
    score;
    teacher_comment;
    detailed_feedback;
    attempt_number;
    max_attempts;
    is_late;
    deadline;
    createdAt;
    updatedAt;
};
exports.HomeworkSubmission = HomeworkSubmission;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true,
    }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], HomeworkSubmission.prototype, "lessonId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], HomeworkSubmission.prototype, "studentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], HomeworkSubmission.prototype, "courseId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], HomeworkSubmission.prototype, "student_comment", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{
                filename: { type: String, required: true },
                original_name: { type: String, required: true },
                url: { type: String, required: true },
                size_bytes: { type: Number, required: true },
                mime_type: { type: String, required: true },
                uploaded_at: { type: Date, default: Date.now }
            }],
        required: true,
        validate: {
            validator: function (files) {
                return files && files.length > 0;
            },
            message: 'Необходимо загрузить хотя бы один файл'
        }
    }),
    __metadata("design:type", Array)
], HomeworkSubmission.prototype, "files", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['submitted', 'in_review', 'reviewed', 'returned_for_revision'],
        default: 'submitted'
    }),
    __metadata("design:type", String)
], HomeworkSubmission.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], HomeworkSubmission.prototype, "submitted_at", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'Teacher'
    }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], HomeworkSubmission.prototype, "reviewed_by", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], HomeworkSubmission.prototype, "reviewed_at", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: 0, max: 100 }),
    __metadata("design:type", Number)
], HomeworkSubmission.prototype, "score", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], HomeworkSubmission.prototype, "teacher_comment", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{
                criteria: { type: String, required: true },
                score: { type: Number, required: true, min: 0, max: 100 },
                comment: { type: String }
            }],
        default: []
    }),
    __metadata("design:type", Array)
], HomeworkSubmission.prototype, "detailed_feedback", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 1 }),
    __metadata("design:type", Number)
], HomeworkSubmission.prototype, "attempt_number", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 3 }),
    __metadata("design:type", Number)
], HomeworkSubmission.prototype, "max_attempts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], HomeworkSubmission.prototype, "is_late", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], HomeworkSubmission.prototype, "deadline", void 0);
exports.HomeworkSubmission = HomeworkSubmission = __decorate([
    (0, mongoose_1.Schema)({
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
], HomeworkSubmission);
exports.HomeworkSubmissionSchema = mongoose_1.SchemaFactory.createForClass(HomeworkSubmission);
exports.HomeworkSubmissionSchema.virtual('id').get(function () {
    return this._id.toString();
});
exports.HomeworkSubmissionSchema.virtual('lesson', {
    ref: 'Lesson',
    localField: 'lessonId',
    foreignField: '_id',
    justOne: true
});
exports.HomeworkSubmissionSchema.virtual('student', {
    ref: 'User',
    localField: 'studentId',
    foreignField: '_id',
    justOne: true
});
exports.HomeworkSubmissionSchema.virtual('course', {
    ref: 'Course',
    localField: 'courseId',
    foreignField: '_id',
    justOne: true
});
exports.HomeworkSubmissionSchema.virtual('teacher', {
    ref: 'Teacher',
    localField: 'reviewed_by',
    foreignField: '_id',
    justOne: true
});
exports.HomeworkSubmissionSchema.index({ courseId: 1 });
exports.HomeworkSubmissionSchema.index({ studentId: 1 });
exports.HomeworkSubmissionSchema.index({ status: 1 });
exports.HomeworkSubmissionSchema.index({ reviewed_by: 1 });
exports.HomeworkSubmissionSchema.index({ submitted_at: -1 });
exports.HomeworkSubmissionSchema.index({ reviewed_at: -1 });
exports.HomeworkSubmissionSchema.index({ lessonId: 1, studentId: 1, attempt_number: 1 }, { unique: true });
//# sourceMappingURL=homework-submission.schema.js.map