// src/subjects/dto/subject.dto.ts
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubjectDto {
    @ApiProperty({ description: 'Название предмета' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Описание предмета', required: false })
    @IsOptional()
    @IsString()
    description?: string;
}

export class UpdateSubjectDto {
    @ApiProperty({ description: 'Название предмета', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ description: 'Описание предмета', required: false })
    @IsOptional()
    @IsString()
    description?: string;
}

export enum StudyMaterialType {
    VIDEO = 'video',
    PDF_BOOK = 'pdf_book',
    LECTURE_FILES = 'lecture_files',
    DOCUMENT_LINK = 'document_link'
}

export class AddStudyMaterialDto {
    @ApiProperty({ description: 'Название материала' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Описание материала', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Тип материала', enum: StudyMaterialType })
    @IsEnum(StudyMaterialType)
    type: StudyMaterialType;

    @ApiProperty({ description: 'Внешняя ссылка (для видео и документов)', required: false })
    @IsOptional()
    @IsString()
    externalUrl?: string;
}
