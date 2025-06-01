// src/teachers/dto/teacher-approval.dto.ts
import { 
    IsNotEmpty, 
    IsString, 
    IsOptional, 
    IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TeacherApprovalDto {
    @ApiProperty({
        example: 'approved',
        description: 'Статус одобрения заявки',
        enum: ['approved', 'rejected']
    })
    @IsEnum(['approved', 'rejected'])
    @IsNotEmpty()
    approvalStatus: 'approved' | 'rejected';

    @ApiProperty({
        example: 'Недостаточно опыта работы',
        description: 'Причина отклонения (обязательна при отклонении)',
        required: false
    })
    @IsOptional()
    @IsString()
    rejectionReason?: string;
}