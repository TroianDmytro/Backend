// src/avatars/avatars.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AvatarsService } from './avatars.service';
import { AvatarsController } from './avatars.controller';
import { Avatar, AvatarSchema } from './schemas/avatar.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { FileUploadValidator } from './validators/file-upload.validator';
import { MulterModule } from '@nestjs/platform-express';
import { CustomFileTypeValidator, CustomMaxFileSizeValidator, ImageDimensionsValidator } from './validators/custom-file-validators';

@Module({
  imports: [
    // MongooseModule.forFeature() регистрирует схемы в модуле
    MongooseModule.forFeature([
      { name: Avatar.name, schema: AvatarSchema },
      { name: User.name, schema: UserSchema }
    ]),
    // Настройка Multer для загрузки файлов
    MulterModule.register({
      dest: './temp', // Временная папка (можно удалить файлы после обработки)
      limits: {
        fileSize: 1.5 * 1024 * 1024, // 1.5MB
        files: 1, // Только один файл за раз
      },
    }),
  ],
  controllers: [AvatarsController], // Регистрируем контроллеры
  providers: [
    AvatarsService,
    FileUploadValidator,
    CustomFileTypeValidator,
    CustomMaxFileSizeValidator,
    ImageDimensionsValidator
  ], // Регистрируем сервисы
  exports: [
    AvatarsService,
    FileUploadValidator,
    CustomFileTypeValidator,
    CustomMaxFileSizeValidator,
    ImageDimensionsValidator
  ] // Экспортируем сервисы для использования в других модулях
})
export class AvatarsModule { }