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
exports.CategoryWithCoursesDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const course_card_dto_1 = require("./course-card.dto");
const category_response_dto_1 = require("./category-response.dto");
class CategoryWithCoursesDto extends category_response_dto_1.CategoryResponseDto {
    courses;
    subcategories_count;
}
exports.CategoryWithCoursesDto = CategoryWithCoursesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [course_card_dto_1.CourseCardDto],
        description: 'Список курсов в категории'
    }),
    __metadata("design:type", Array)
], CategoryWithCoursesDto.prototype, "courses", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5, description: 'Количество подкатегорий' }),
    __metadata("design:type", Number)
], CategoryWithCoursesDto.prototype, "subcategories_count", void 0);
//# sourceMappingURL=category-with-courses.dto.js.map