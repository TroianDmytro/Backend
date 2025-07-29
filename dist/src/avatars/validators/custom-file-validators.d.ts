import { FileValidator } from '@nestjs/common';
export interface CustomFileTypeValidatorOptions {
    fileType: string | RegExp;
    message?: string;
}
export declare class CustomFileTypeValidator extends FileValidator<CustomFileTypeValidatorOptions> {
    protected readonly validationOptions: CustomFileTypeValidatorOptions;
    constructor(validationOptions: CustomFileTypeValidatorOptions);
    isValid(file?: Express.Multer.File): boolean;
    buildErrorMessage(): string;
}
export interface CustomMaxFileSizeValidatorOptions {
    maxSize: number;
    message?: string;
}
export declare class CustomMaxFileSizeValidator extends FileValidator<CustomMaxFileSizeValidatorOptions> {
    protected readonly validationOptions: CustomMaxFileSizeValidatorOptions;
    constructor(validationOptions: CustomMaxFileSizeValidatorOptions);
    isValid(file?: Express.Multer.File): boolean;
    buildErrorMessage(): string;
}
export interface ImageDimensionsValidatorOptions {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    message?: string;
}
export declare class ImageDimensionsValidator extends FileValidator<ImageDimensionsValidatorOptions> {
    protected readonly validationOptions: ImageDimensionsValidatorOptions;
    constructor(validationOptions: ImageDimensionsValidatorOptions);
    isValid(file?: Express.Multer.File): Promise<boolean>;
    buildErrorMessage(): string;
}
