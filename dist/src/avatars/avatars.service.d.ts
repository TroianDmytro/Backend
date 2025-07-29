import { Model } from 'mongoose';
import { AvatarDocument } from './schemas/avatar.schema';
import { UserDocument } from '../users/schemas/user.schema';
import { FileUploadValidator } from './validators/file-upload.validator';
export declare class AvatarsService {
    private avatarModel;
    private userModel;
    private readonly fileUploadValidator;
    private readonly logger;
    constructor(avatarModel: Model<AvatarDocument>, userModel: Model<UserDocument>, fileUploadValidator: FileUploadValidator);
    uploadAvatarFromFile(userId: string, file: Express.Multer.File): Promise<AvatarDocument>;
    replaceAvatarFromFile(userId: string, file: Express.Multer.File): Promise<AvatarDocument>;
    getAvatarByUserId(userId: string): Promise<AvatarDocument | null>;
    deleteAvatar(userId: string): Promise<void>;
    hasAvatar(userId: string): Promise<boolean>;
    getAvatarImageDataById(userId: string): Promise<{
        imageData: string;
        mimeType: string;
    } | null>;
}
