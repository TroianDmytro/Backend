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
exports.ReorderLessonsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class ReorderLessonsDto {
    lessons;
}
exports.ReorderLessonsDto = ReorderLessonsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [
            { lessonId: '507f1f77bcf86cd799439011', order: 1 },
            { lessonId: '507f1f77bcf86cd799439012', order: 2 }
        ],
        description: 'Массив объектов с ID урока и новым порядковым номером'
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => Object),
    __metadata("design:type", Array)
], ReorderLessonsDto.prototype, "lessons", void 0);
//# sourceMappingURL=reorder-lessons.dto.js.map