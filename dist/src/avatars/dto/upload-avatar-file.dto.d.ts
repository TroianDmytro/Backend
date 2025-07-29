export declare class UploadAvatarFileDto {
    avatar: any;
}
export declare class AvatarUploadResponseDto {
    message: string;
    avatar: {
        id: string;
        userId: string;
        mimeType: string;
        size: number;
        width: number;
        height: number;
        createdAt: Date;
    };
}
