// src/difficulty-levels/dto/update-difficulty-level.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateDifficultyLevelDto } from './create-difficulty-level.dto';

export class UpdateDifficultyLevelDto extends PartialType(CreateDifficultyLevelDto) { }
