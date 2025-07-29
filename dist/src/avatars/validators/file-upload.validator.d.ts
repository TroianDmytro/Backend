export interface FileValidationResult {
    isValid: boolean;
    errors: string[];
    imageData?: {
        width: number;
        height: number;
        size: number;
        mimeType: string;
        base64: string;
    };
}
export interface FileValidationConfig {
    minWidth: number;
    minHeight: number;
    minSizeKB: number;
    maxSizeKB: number;
    allowedMimeTypes: string[];
}
export declare class FileUploadValidator {
    private readonly logger;
    private readonly defaultConfig;
    validateUploadedFile(file: Express.Multer.File, config?: Partial<FileValidationConfig>): Promise<FileValidationResult>;
    private analyzeImage;
    private convertToCleanBase64;
    private convertToBase64WithPrefix;
    private validateMimeType;
    private logValidationResult;
}
