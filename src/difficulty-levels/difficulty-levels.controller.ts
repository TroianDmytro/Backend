// src/difficulty-levels/difficulty-levels.controller.ts
import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DifficultyLevelsService } from './difficulty-levels.service';

@ApiTags('difficulty-levels')
@Controller('difficulty-levels')
export class DifficultyLevelsController {
    constructor(private readonly difficultyLevelsService: DifficultyLevelsService) { }

    @Get()
    @ApiOperation({ summary: 'Получение всех уровней сложности' })
    @ApiResponse({ status: 200, description: 'Список уровней сложности' })
    async getAllLevels() {
        const levels = await this.difficultyLevelsService.findAll();
        return { levels };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Получение уровня сложности по ID' })
    @ApiResponse({ status: 200, description: 'Данные уровня сложности' })
    async getLevelById(@Param('id') id: string) {
        const level = await this.difficultyLevelsService.findById(id);
        if (!level) {
            throw new NotFoundException('Уровень сложности не найден');
        }
        return { level };
    }
}