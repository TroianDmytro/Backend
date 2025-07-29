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
exports.minHeight = exports.minWidth = exports.maxSizeKB = exports.minSizeKB = exports.AvatarSchema = exports.Avatar = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../users/schemas/user.schema");
let Avatar = class Avatar {
    id;
    userId;
    imageData;
    mimeType;
    size;
    width;
    height;
    createdAt;
    updatedAt;
};
exports.Avatar = Avatar;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }),
    __metadata("design:type", user_schema_1.User)
], Avatar.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Avatar.prototype, "imageData", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Avatar.prototype, "mimeType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Avatar.prototype, "size", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Avatar.prototype, "width", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Avatar.prototype, "height", void 0);
exports.Avatar = Avatar = __decorate([
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
], Avatar);
exports.AvatarSchema = mongoose_1.SchemaFactory.createForClass(Avatar);
exports.AvatarSchema.virtual('id').get(function () {
    return this._id.toString();
});
exports.AvatarSchema.index({ userId: 1 });
exports.minSizeKB = 10;
exports.maxSizeKB = 1536;
exports.minWidth = 256;
exports.minHeight = 256;
//# sourceMappingURL=avatar.schema.js.map