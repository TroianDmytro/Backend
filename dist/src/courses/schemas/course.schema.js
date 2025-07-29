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
exports.CourseSchema = exports.Course = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Course = class Course {
    title;
    slug;
    description;
    image_url;
    price;
    discount_percent;
    currency;
    is_active;
    is_featured;
    isPublished;
    duration_hours;
    lessons_count;
    tags;
    preview_video_url;
    certificate_template;
    allow_comments;
    requires_approval;
    teacherId;
    categoryId;
    difficultyLevelId;
    short_description;
    logo_url;
    rating;
    current_students_count;
    max_students;
    level;
    students_count;
    average_rating;
    reviews_count;
    completed_count;
    completion_rate;
    published_at;
    updated_at;
};
exports.Course = Course;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Course.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, trim: true }),
    __metadata("design:type", String)
], Course.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Course.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Course.prototype, "image_url", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 0, max: 100, default: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "discount_percent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['USD', 'EUR', 'UAH', 'RUB'], default: 'USD' }),
    __metadata("design:type", String)
], Course.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Course.prototype, "is_active", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Course.prototype, "is_featured", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Course.prototype, "isPublished", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 0, default: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "duration_hours", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 0, default: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "lessons_count", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Course.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Course.prototype, "preview_video_url", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Course.prototype, "certificate_template", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Course.prototype, "allow_comments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Course.prototype, "requires_approval", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Course.prototype, "teacherId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Course.prototype, "categoryId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'DifficultyLevel',
        required: true
    }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Course.prototype, "difficultyLevelId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Course.prototype, "short_description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Course.prototype, "logo_url", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0, max: 5 }),
    __metadata("design:type", Number)
], Course.prototype, "rating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "current_students_count", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "max_students", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'beginner', enum: ['beginner', 'intermediate', 'advanced'] }),
    __metadata("design:type", String)
], Course.prototype, "level", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 0, default: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "students_count", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 0, max: 5, default: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "average_rating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 0, default: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "reviews_count", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 0, default: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "completed_count", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 0, max: 100, default: 0 }),
    __metadata("design:type", Number)
], Course.prototype, "completion_rate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], Course.prototype, "published_at", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Course.prototype, "updated_at", void 0);
exports.Course = Course = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: 'courses'
    })
], Course);
exports.CourseSchema = mongoose_1.SchemaFactory.createForClass(Course);
exports.CourseSchema.index({ categoryId: 1 });
exports.CourseSchema.index({ difficultyLevelId: 1 });
exports.CourseSchema.index({ teacherId: 1 });
exports.CourseSchema.index({ is_active: 1, is_featured: 1 });
exports.CourseSchema.index({ price: 1 });
exports.CourseSchema.index({ average_rating: 1 });
exports.CourseSchema.index({ created_at: -1 });
//# sourceMappingURL=course.schema.js.map