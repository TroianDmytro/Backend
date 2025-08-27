//block-user-response.dto.ts
import { ApiProperty } from "@nestjs/swagger";

export class BlockUserResponseDto {
    @ApiProperty({
        example: 'Пользователь успешно заблокирован',
        description: 'Сообщение о результате операции'
    })
    message: string;

    @ApiProperty({
        description: 'Обновленный статус пользователя',
        type: Object
    })
    user: {
        id: string;
        email: string;
        isBlocked: boolean;
    };
}