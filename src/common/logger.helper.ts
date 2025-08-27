// src/common/helpers/logger.helper.ts
import { Logger } from '@nestjs/common';

export class LoggerHelper {
    /**
     * Логирует кто и к какому профилю обращается
     * @param logger - экземпляр Logger из контроллера
     * @param currentUserId - ID текущего пользователя
     * @param targetId - ID запрашиваемого профиля
     * @param isAdmin - является ли пользователь админом
     * @param action - действие (по умолчанию 'просматривает')
     */
    static logAccessType(
logger: Logger, currentUserId: string, targetId: string, isAdmin: boolean, action: string = 'просматривает'  ): void {
        let accessType = '';
        if (targetId === currentUserId) {
            accessType = '👤 СВОЙ ПРОФИЛЬ';
        } else if (isAdmin) {
            accessType = '👑 АДМИН';
        } else {
            accessType = '❌ ЧУЖОЙ ПРОФИЛЬ';
        }
        logger.log(`[${accessType}] ${currentUserId} → ${action} → ${targetId}`);
    }
}