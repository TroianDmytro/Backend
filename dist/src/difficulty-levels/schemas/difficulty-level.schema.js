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
exports.DifficultyLevelSchema = exports.DifficultyLevel = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let DifficultyLevel = class DifficultyLevel {
    id;
    name;
    slug;
    code;
    description;
    short_description;
    icon;
    color;
    level;
    order;
    prerequisites;
    target_audience;
    recommended_hours;
    min_experience_years;
    isActive;
    courses_count;
    students_count;
    average_completion_rate;
    createdAt;
    updatedAt;
};
exports.DifficultyLevel = DifficultyLevel;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], DifficultyLevel.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], DifficultyLevel.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], DifficultyLevel.prototype, "code", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DifficultyLevel.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], DifficultyLevel.prototype, "short_description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], DifficultyLevel.prototype, "icon", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '#4caf50' }),
    __metadata("design:type", String)
], DifficultyLevel.prototype, "color", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, unique: true }),
    __metadata("design:type", Number)
], DifficultyLevel.prototype, "level", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], DifficultyLevel.prototype, "order", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], DifficultyLevel.prototype, "prerequisites", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], DifficultyLevel.prototype, "target_audience", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: 0 }),
    __metadata("design:type", Number)
], DifficultyLevel.prototype, "recommended_hours", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: 0 }),
    __metadata("design:type", Number)
], DifficultyLevel.prototype, "min_experience_years", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], DifficultyLevel.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], DifficultyLevel.prototype, "courses_count", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], DifficultyLevel.prototype, "students_count", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: 0, max: 100, default: 0 }),
    __metadata("design:type", Number)
], DifficultyLevel.prototype, "average_completion_rate", void 0);
exports.DifficultyLevel = DifficultyLevel = __decorate([
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
], DifficultyLevel);
exports.DifficultyLevelSchema = mongoose_1.SchemaFactory.createForClass(DifficultyLevel);
exports.DifficultyLevelSchema.virtual('id').get(function () {
    return this._id.toString();
});
exports.DifficultyLevelSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'difficultyLevelId'
});
exports.DifficultyLevelSchema.index({ isActive: 1 });
exports.DifficultyLevelSchema.index({ order: 1 });
//# sourceMappingURL=difficulty-level.schema.js.map