import { AvatarsService } from './avatars.service';
import { AvatarUploadResponseDto } from './dto/upload-avatar-file.dto';
export declare class AvatarsController {
    private readonly avatarsService;
    private readonly logger;
    constructor(avatarsService: AvatarsService);
    getAvatar(userId: string, req: any): Promise<{
        success: boolean;
        avatar: {
            id: any;
            userId: string;
            imageData: string;
            mimeType: string;
            size: number;
            width: number;
            height: number;
            createdAt: Date | undefined;
        };
    }>;
    uploadAvatar(userId: string, file: Express.Multer.File, req: any): Promise<AvatarUploadResponseDto>;
    private performAdditionalFileValidation;
    private validateUploadedFile;
    replaceAvatar(userId: string, file: Express.Multer.File, req: any): Promise<{
        message: string;
        avatar: {
            id: any;
            userId: string;
            mimeType: string;
            size: number;
            width: number;
            height: number;
            createdAt: Date | undefined;
        };
    }>;
    deleteAvatar(userId: string, req: any): Promise<{
        message: string;
    }>;
}
