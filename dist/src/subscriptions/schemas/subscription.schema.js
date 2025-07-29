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
exports.SubscriptionSchema = exports.Subscription = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Subscription = class Subscription {
    id;
    userId;
    subscription_type;
    courseId;
    period_type;
    start_date;
    end_date;
    status;
    price;
    currency;
    discount_amount;
    discount_code;
    payment_method;
    payment_transaction_id;
    payment_date;
    is_paid;
    auto_renewal;
    next_billing_date;
    accessible_courses;
    progress_percentage;
    completed_lessons;
    total_lessons;
    last_accessed;
    email_notifications;
    cancellation_reason;
    cancelled_at;
    cancelled_by;
    createdAt;
    updatedAt;
};
exports.Subscription = Subscription;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Subscription.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['course', 'period'],
        required: true
    }),
    __metadata("design:type", String)
], Subscription.prototype, "subscription_type", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'Course'
    }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Subscription.prototype, "courseId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['1_month', '3_months', '6_months', '12_months'],
        required: function () {
            return this.subscription_type === 'period';
        }
    }),
    __metadata("design:type", String)
], Subscription.prototype, "period_type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date }),
    __metadata("design:type", Date)
], Subscription.prototype, "start_date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date }),
    __metadata("design:type", Date)
], Subscription.prototype, "end_date", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['active', 'expired', 'cancelled', 'pending'],
        default: 'pending'
    }),
    __metadata("design:type", String)
], Subscription.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number, min: 0 }),
    __metadata("design:type", Number)
], Subscription.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['USD', 'EUR', 'UAH'], default: 'USD' }),
    __metadata("design:type", String)
], Subscription.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: 0 }),
    __metadata("design:type", Number)
], Subscription.prototype, "discount_amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Subscription.prototype, "discount_code", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Subscription.prototype, "payment_method", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Subscription.prototype, "payment_transaction_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Subscription.prototype, "payment_date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Subscription.prototype, "is_paid", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Subscription.prototype, "auto_renewal", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Subscription.prototype, "next_billing_date", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{ type: mongoose_2.Schema.Types.ObjectId, ref: 'Course' }],
        default: []
    }),
    __metadata("design:type", Array)
], Subscription.prototype, "accessible_courses", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0, min: 0, max: 100 }),
    __metadata("design:type", Number)
], Subscription.prototype, "progress_percentage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Subscription.prototype, "completed_lessons", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Subscription.prototype, "total_lessons", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Subscription.prototype, "last_accessed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: true }),
    __metadata("design:type", Boolean)
], Subscription.prototype, "email_notifications", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Subscription.prototype, "cancellation_reason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Subscription.prototype, "cancelled_at", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'User'
    }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Subscription.prototype, "cancelled_by", void 0);
exports.Subscription = Subscription = __decorate([
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
], Subscription);
exports.SubscriptionSchema = mongoose_1.SchemaFactory.createForClass(Subscription);
exports.SubscriptionSchema.virtual('id').get(function () {
    return this._id.toString();
});
exports.SubscriptionSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});
exports.SubscriptionSchema.virtual('course', {
    ref: 'Course',
    localField: 'courseId',
    foreignField: '_id',
    justOne: true
});
exports.SubscriptionSchema.virtual('is_active').get(function () {
    const now = new Date();
    return this.status === 'active' &&
        this.start_date <= now &&
        this.end_date >= now;
});
exports.SubscriptionSchema.virtual('days_remaining').get(function () {
    const now = new Date();
    const timeDiff = this.end_date.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
});
exports.SubscriptionSchema.index({ userId: 1 });
exports.SubscriptionSchema.index({ courseId: 1 });
exports.SubscriptionSchema.index({ status: 1 });
exports.SubscriptionSchema.index({ subscription_type: 1 });
exports.SubscriptionSchema.index({ start_date: 1, end_date: 1 });
exports.SubscriptionSchema.index({ end_date: 1 });
exports.SubscriptionSchema.index({ next_billing_date: 1 });
exports.SubscriptionSchema.index({ userId: 1, courseId: 1 });
exports.SubscriptionSchema.index({ userId: 1, courseId: 1, status: 1 }, {
    unique: true,
    partialFilterExpression: {
        status: { $in: ['active', 'pending'] },
        courseId: { $ne: null }
    }
});
//# sourceMappingURL=subscription.schema.js.map