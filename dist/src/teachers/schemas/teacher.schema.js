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
exports.TeacherSchema = exports.Teacher = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Teacher = class Teacher {
    id;
    avatarId;
    email;
    password;
    name;
    second_name;
    age;
    telefon_number;
    description;
    specialization;
    education;
    experience_years;
    skills;
    cv_file_url;
    assignedCourses;
    isEmailVerified;
    isBlocked;
    isApproved;
    approvalStatus;
    rejectionReason;
    approvedAt;
    approvedBy;
    verificationToken;
    verificationTokenExpires;
    resetPasswordToken;
    resetPasswordExpires;
    rating;
    reviewsCount;
    createdAt;
    updatedAt;
};
exports.Teacher = Teacher;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'Avatar',
        default: null,
    }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Teacher.prototype, "avatarId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Teacher.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Teacher.prototype, "password", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Teacher.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Teacher.prototype, "second_name", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Teacher.prototype, "age", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Teacher.prototype, "telefon_number", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String }),
    __metadata("design:type", String)
], Teacher.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Teacher.prototype, "specialization", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Teacher.prototype, "education", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Teacher.prototype, "experience_years", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Teacher.prototype, "skills", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Teacher.prototype, "cv_file_url", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{ type: mongoose_2.Types.ObjectId, ref: 'Course' }],
        default: []
    }),
    __metadata("design:type", Array)
], Teacher.prototype, "assignedCourses", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Teacher.prototype, "isEmailVerified", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Teacher.prototype, "isBlocked", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Teacher.prototype, "isApproved", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'pending' }),
    __metadata("design:type", String)
], Teacher.prototype, "approvalStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Teacher.prototype, "rejectionReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Teacher.prototype, "approvedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'User'
    }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Teacher.prototype, "approvedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Teacher.prototype, "verificationToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Teacher.prototype, "verificationTokenExpires", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Teacher.prototype, "resetPasswordToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Teacher.prototype, "resetPasswordExpires", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0, min: 0, max: 5 }),
    __metadata("design:type", Number)
], Teacher.prototype, "rating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Teacher.prototype, "reviewsCount", void 0);
exports.Teacher = Teacher = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
                delete ret.password;
                return ret;
            }
        }
    })
], Teacher);
exports.TeacherSchema = mongoose_1.SchemaFactory.createForClass(Teacher);
exports.TeacherSchema.virtual('id').get(function () {
    return this._id.toString();
});
exports.TeacherSchema.virtual('courses').get(function () {
    return this.assignedCourses;
});
exports.TeacherSchema.index({ avatarId: 1 });
exports.TeacherSchema.index({ isBlocked: 1 });
exports.TeacherSchema.index({ isEmailVerified: 1 });
exports.TeacherSchema.index({ isApproved: 1 });
exports.TeacherSchema.index({ approvalStatus: 1 });
exports.TeacherSchema.index({ rating: -1 });
exports.TeacherSchema.index({ courses: 1 });
//# sourceMappingURL=teacher.schema.js.map