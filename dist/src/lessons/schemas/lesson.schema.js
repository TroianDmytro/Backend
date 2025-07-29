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
exports.LessonSchema = exports.Lesson = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Lesson = class Lesson {
    id;
    courseId;
    title;
    description;
    short_description;
    order;
    duration_minutes;
    text_content;
    content_html;
    videos;
    materials;
    homework_description;
    homework_files;
    homework_deadline;
    homework_max_score;
    isActive;
    isPublished;
    isFree;
    prerequisites;
    createdAt;
    updatedAt;
};
exports.Lesson = Lesson;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Lesson.prototype, "courseId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Lesson.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Lesson.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Lesson.prototype, "short_description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number }),
    __metadata("design:type", Number)
], Lesson.prototype, "order", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Lesson.prototype, "duration_minutes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Lesson.prototype, "text_content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Lesson.prototype, "content_html", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{
                title: { type: String, required: true },
                url: { type: String, required: true },
                duration_minutes: { type: Number, default: 0 },
                order: { type: Number, default: 0 }
            }],
        default: []
    }),
    __metadata("design:type", Array)
], Lesson.prototype, "videos", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{
                title: { type: String, required: true },
                url: { type: String, required: true },
                type: {
                    type: String,
                    enum: ['pdf', 'doc', 'ppt', 'image', 'link', 'other'],
                    required: true
                },
                size_bytes: { type: Number, default: 0 }
            }],
        default: []
    }),
    __metadata("design:type", Array)
], Lesson.prototype, "materials", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Lesson.prototype, "homework_description", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{
                title: { type: String, required: true },
                url: { type: String, required: true },
                type: {
                    type: String,
                    enum: ['document', 'template', 'example'],
                    default: 'document'
                }
            }],
        default: []
    }),
    __metadata("design:type", Array)
], Lesson.prototype, "homework_files", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Lesson.prototype, "homework_deadline", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: 0, max: 100 }),
    __metadata("design:type", Number)
], Lesson.prototype, "homework_max_score", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Lesson.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Lesson.prototype, "isPublished", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Lesson.prototype, "isFree", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{ type: mongoose_2.Schema.Types.ObjectId, ref: 'Lesson' }],
        default: []
    }),
    __metadata("design:type", Array)
], Lesson.prototype, "prerequisites", void 0);
exports.Lesson = Lesson = __decorate([
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
], Lesson);
exports.LessonSchema = mongoose_1.SchemaFactory.createForClass(Lesson);
exports.LessonSchema.virtual('id').get(function () {
    return this._id.toString();
});
exports.LessonSchema.virtual('course', {
    ref: 'Course',
    localField: 'courseId',
    foreignField: '_id',
    justOne: true
});
exports.LessonSchema.virtual('homework_submissions', {
    ref: 'HomeworkSubmission',
    localField: '_id',
    foreignField: 'lessonId'
});
exports.LessonSchema.index({ courseId: 1 });
exports.LessonSchema.index({ isActive: 1, isPublished: 1 });
exports.LessonSchema.index({ isFree: 1 });
exports.LessonSchema.index({ order: 1 });
exports.LessonSchema.index({ courseId: 1, order: 1 }, { unique: true });
//# sourceMappingURL=lesson.schema.js.map