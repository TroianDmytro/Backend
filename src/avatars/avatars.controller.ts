// src/avatars/avatars.controller.ts
import {
  Controller, Post, Put, Delete, Get,
  Param, UseGuards, Request,
  UseInterceptors, UploadedFile,
  BadRequestException, Logger,
  ParseFilePipe, MaxFileSizeValidator,
  FileTypeValidator,
  NotFoundException, Res
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiConsumes, ApiParam,
  ApiBody
} from '@nestjs/swagger';
import { Response } from 'express';
import { AvatarsService } from './avatars.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AvatarUploadResponseDto, UploadAvatarFileDto } from './dto/upload-avatar-file.dto';
import { CustomFileTypeValidator, CustomMaxFileSizeValidator, ImageDimensionsValidator } from './validators/custom-file-validators';
import { maxSizeKB, minSizeKB } from './schemas/avatar.schema';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('avatars')
@Controller('avatars')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AvatarsController {
  private readonly logger = new Logger(AvatarsController.name);

  constructor(private readonly avatarsService: AvatarsService) { }

  /**
   * GET /avatars/:userId - получение аватара пользователя
   */
  @Get(':userId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'user')
  @ApiOperation({
    summary: 'Получение аватара пользователя',
    description: 'Возвращает изображение аватара в формате base64'
  })
  @ApiParam({ name: 'userId', description: 'ID пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Аватар успешно получен',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        avatar: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            imageData: { type: 'string', description: 'Base64 данные изображения без префикса' },
            mimeType: { type: 'string', example: 'image/jpeg' },
            size: { type: 'number', example: 524288 },
            width: { type: 'number', example: 1024 },
            height: { type: 'number', example: 1024 },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Аватар не найден' })
  async getAvatar(
    @Param('userId') userId: string,
    @Request() req
  ) {
    // Проверяем права доступа
    // const isAdmin = req.user.roles && req.user.roles.includes('admin');
    // const isOwner = userId === req.user.userId;

    // if (!isAdmin && !isOwner) {
    //   throw new BadRequestException('У вас нет прав на просмотр аватара этого пользователя');
    // }

    this.logger.log(`Пользователь ${req.user.email} запрашивает аватар для пользователя ${userId}`);

    try {
      const avatar = await this.avatarsService.getAvatarByUserId(userId);

      if (!avatar) {
        throw new NotFoundException(`Аватар для пользователя ${userId} не найден`);
      }

      // Очищаем base64 от префикса data:image/type;base64,
      const cleanBase64 = avatar.imageData.replace(/^data:image\/[a-z]+;base64,/, '');

      return {
        success: true,
        avatar: {
          id: avatar.id,
          userId: avatar.userId.toString(),
          imageData: cleanBase64, // Возвращаем чистый base64 без префикса
          mimeType: avatar.mimeType,
          size: avatar.size,
          width: avatar.width,
          height: avatar.height,
          createdAt: avatar.createdAt
        }
      };
    } catch (error) {
      this.logger.error(`Ошибка получения аватара: ${error.message}`);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException('Ошибка при получении аватара');
    }
  }


  /**
   * POST /avatars/upload/:userId - загрузка аватара для пользователя
   */
  @Post('upload/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'user')
  @UseInterceptors(FileInterceptor('avatar', {
    limits: {
      fileSize: 1.5 * 1024 * 1024, // 1.5MB
    },
    fileFilter: (req, file, callback) => {
      // Базовая проверка типа файла на уровне Multer
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return callback(
          new BadRequestException('Поддерживаются только файлы JPG, JPEG и PNG'),
          false
        );
      }
      callback(null, true);
    },
  }))
  @ApiOperation({
    summary: 'Загрузка аватара для пользователя',
    description: `
    Загружает файл изображения как аватар пользователя.
    
    **Требования к файлу:**
    - Форматы: JPEG, JPG, PNG
    - Минимальный размер: 512x512 пикселей
    - Размер файла: от 300KB до 1.5MB
    - Поле формы: 'avatar'
    
    **Права доступа:**
    - Пользователь может загружать только свой аватар
    - Администратор может загружать аватар любому пользователю
    `
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'userId',
    description: 'ID пользователя, для которого загружается аватар',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiBody({
    description: 'Файл изображения аватара',
    type: UploadAvatarFileDto,
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Файл изображения (JPEG/PNG)'
        }
      },
      required: ['avatar']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Аватар успешно загружен',
    type: AvatarUploadResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Ошибка валидации файла или прав доступа',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Файл не соответствует требованиям: Размер файла (250KB) меньше минимального (300KB)'
        },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован'
  })
  @ApiResponse({
    status: 403,
    description: 'Недостаточно прав доступа'
  })
  @ApiResponse({
    status: 404,
    description: 'Пользователь не найден'
  })
  @ApiResponse({
    status: 413,
    description: 'Файл слишком большой'
  })
  async uploadAvatar(
    @Param('userId') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // Используем кастомные валидаторы с сообщениями
          new CustomMaxFileSizeValidator({
            maxSize: 1.5 * 1024 * 1024, // 1.5MB
            message: 'Размер файла не должен превышать 1.5MB'
          }),
          new CustomFileTypeValidator({
            fileType: /(jpeg|jpg|png)$/i,
            message: 'Поддерживаются только файлы формата JPEG, JPG и PNG'
          }),
          new ImageDimensionsValidator({
            minWidth: 512,
            minHeight: 512,
            message: 'Минимальный размер изображения: 512x512 пикселей'
          })
        ],
        fileIsRequired: true,
        exceptionFactory: (errors) => {
          const errorMessages = Array.isArray(errors) ? errors : [errors];
          return new BadRequestException(`Ошибка валидации файла: ${errorMessages.join(', ')}`);
        }
      })
    ) file: Express.Multer.File,
    @Request() req
  ): Promise<AvatarUploadResponseDto> {

    // Детальное логирование
    this.logger.log(
      `Попытка загрузки аватара. ` +
      `Пользователь: ${req.user?.email || 'неизвестен'}, ` +
      `целевой userId: ${userId}, ` +
      `файл: ${file?.originalname || 'неизвестен'} ` +
      `(${file ? Math.round(file.size / 1024) + 'KB, ' + file.mimetype : 'данные недоступны'})`
    );

    // Базовые проверки
    if (!file) {
      throw new BadRequestException(
        'Файл не был загружен. Убедитесь, что файл прикреплен к полю "avatar"'
      );
    }

    if (!userId || userId.trim() === '') {
      throw new BadRequestException('ID пользователя не указан или пуст');
    }

    // Проверка прав доступа
    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    const isOwner = userId === req.user.userId;

    if (!isAdmin && !isOwner) {
      this.logger.warn(
        `Отказано в доступе. Пользователь ${req.user.email} ` +
        `(ID: ${req.user.userId}) пытается загрузить аватар для ${userId}. ` +
        `isAdmin: ${isAdmin}, isOwner: ${isOwner}`
      );
      throw new BadRequestException(
        'У вас нет прав на загрузку аватара для этого пользователя'
      );
    }

    // Дополнительная валидация
    await this.performAdditionalFileValidation(file);

    // Логирование успешной проверки
    this.logger.log(
      `Все проверки пройдены. Загружаем аватар для пользователя ${userId}. ` +
      `Файл: ${file.originalname} (${Math.round(file.size / 1024)}KB, ${file.mimetype})`
    );

    try {
      // Загрузка через сервис
      const avatar = await this.avatarsService.uploadAvatarFromFile(userId, file);

      // Формирование ответа
      const response: AvatarUploadResponseDto = {
        message: 'Аватар успешно загружен',
        avatar: {
          id: avatar.id,
          userId: avatar.userId.toString(),
          mimeType: avatar.mimeType,
          size: avatar.size,
          width: avatar.width,
          height: avatar.height,
          createdAt: avatar.createdAt!
        }
      };

      this.logger.log(
        `✅ Аватар успешно загружен и сохранен. ` +
        `ID аватара: ${avatar.id}, ` +
        `размер изображения: ${avatar.width}x${avatar.height}, ` +
        `размер файла: ${Math.round(avatar.size / 1024)}KB`
      );

      return response;

    } catch (error) {
      this.logger.error(
        `❌ Ошибка загрузки аватара для пользователя ${userId}: ${error.message}`,
        error.stack
      );

      // Проброс известных ошибок
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Обработка неожиданных ошибок
      throw new BadRequestException(
        `Внутренняя ошибка при загрузке аватара: ${error.message}`
      );
    }
  }

  /**
   * Дополнительная валидация файла
   */
  private async performAdditionalFileValidation(file: Express.Multer.File): Promise<void> {
    const validationErrors: string[] = [];

    // Проверка MIME типа
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      validationErrors.push(
        `Недопустимый тип файла: ${file.mimetype}. ` +
        `Поддерживаются: ${allowedMimeTypes.join(', ')}`
      );
    }

    // Проверка размера файла
    const fileSizeKB = Math.round(file.size / 1024);

    if (fileSizeKB < minSizeKB) {
      validationErrors.push(
        `Размер файла (${fileSizeKB}KB) меньше минимального (${minSizeKB}KB)`
      );
    }

    if (fileSizeKB > maxSizeKB) {
      validationErrors.push(
        `Размер файла (${fileSizeKB}KB) превышает максимальный (${maxSizeKB}KB)`
      );
    }

    // Проверка данных файла
    if (!file.buffer || file.buffer.length === 0) {
      validationErrors.push('Файл пуст или поврежден');
    }

    // Проверка расширения файла
    const originalName = file.originalname.toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const hasValidExtension = allowedExtensions.some(ext => originalName.endsWith(ext));

    if (!hasValidExtension) {
      validationErrors.push(
        `Недопустимое расширение файла. ` +
        `Поддерживаются: ${allowedExtensions.join(', ')}`
      );
    }

    // Проверка размеров изображения с помощью sharp
    if (file.buffer && file.buffer.length > 0) {
      try {
        const sharp = require('sharp');
        const metadata = await sharp(file.buffer).metadata();

        if (!metadata.width || !metadata.height) {
          validationErrors.push('Не удалось определить размеры изображения');
        } else {
          if (metadata.width < 512) {
            validationErrors.push(
              `Ширина изображения (${metadata.width}px) меньше минимальной (512px)`
            );
          }

          if (metadata.height < 512) {
            validationErrors.push(
              `Высота изображения (${metadata.height}px) меньше минимальной (512px)`
            );
          }

          this.logger.debug(
            `Размеры изображения: ${metadata.width}x${metadata.height}px, ` +
            `формат: ${metadata.format}, плотность: ${metadata.density || 'неизвестна'}`
          );
        }
      } catch (sharpError) {
        validationErrors.push(
          `Ошибка анализа изображения: ${sharpError.message}`
        );
      }
    }

    // Если есть ошибки валидации, выбрасываем исключение
    if (validationErrors.length > 0) {
      const errorMessage = `Файл не соответствует требованиям:\n${validationErrors.join('\n')}`;
      this.logger.warn(`Файл не прошел валидацию: ${file.originalname}. Ошибки: ${validationErrors.join('; ')}`);
      throw new BadRequestException(errorMessage);
    }

    this.logger.debug(
      `✅ Файл успешно прошел дополнительную валидацию: ${file.originalname}`
    );
  }

  /**
   * Дополнительная валидация загруженного файла
   */
  private validateUploadedFile(file: Express.Multer.File): void {
    // Проверка MIME типа
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      throw new BadRequestException(
        `Недопустимый тип файла: ${file.mimetype}. ` +
        `Поддерживаются: ${allowedMimeTypes.join(', ')}`
      );
    }

    // Проверка размера файла
    const fileSizeKB = Math.round(file.size / 1024);

    if (fileSizeKB < minSizeKB) {
      throw new BadRequestException(
        `Размер файла (${fileSizeKB}KB) меньше минимального (${minSizeKB}KB)`
      );
    }

    if (fileSizeKB > maxSizeKB) {
      throw new BadRequestException(
        `Размер файла (${fileSizeKB}KB) превышает максимальный (${maxSizeKB}KB)`
      );
    }

    // Проверка наличия данных файла
    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('Файл пуст или поврежден');
    }

    this.logger.debug(
      `Файл прошел валидацию: ${file.originalname}, ` +
      `тип: ${file.mimetype}, размер: ${fileSizeKB}KB`
    );
  }

  /**
   * PUT /avatars/replace/:userId - замена аватара пользователя
   */
  @Put('replace/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'user')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({
    summary: 'Замена аватара пользователя',
    description: 'Старый аватар будет удален после успешной загрузки нового. Требования: JPEG/PNG файл, минимум 512x512px, 300KB-1.5MB'
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'userId', description: 'ID пользователя' })
  @ApiResponse({ status: 200, description: 'Аватар успешно заменен' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации файла' })
  async replaceAvatar(
    @Param('userId') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1.5 * 1024 * 1024 }), // 1.5MB
          new FileTypeValidator({ fileType: /(jpeg|jpg|png)$/ })
        ],
        fileIsRequired: true
      })
    ) file: Express.Multer.File,
    @Request() req
  ) {
    // Проверяем права доступа
    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    const isOwner = userId === req.user.userId;

    if (!isAdmin && !isOwner) {
      throw new BadRequestException('У вас нет прав на замену аватара для этого пользователя');
    }

    this.logger.log(
      `Пользователь ${req.user.email} заменяет аватар для пользователя ${userId}. ` +
      `Файл: ${file.originalname} (${Math.round(file.size / 1024)}KB)`
    );

    try {
      const avatar = await this.avatarsService.replaceAvatarFromFile(userId, file);

      return {
        message: 'Аватар успешно заменен',
        avatar: {
          id: avatar.id,
          userId: avatar.userId.toString(),
          mimeType: avatar.mimeType,
          size: avatar.size,
          width: avatar.width,
          height: avatar.height,
          createdAt: avatar.createdAt
        }
      };
    } catch (error) {
      this.logger.error(`Ошибка замены аватара: ${error.message}`);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Ошибка при замене аватара');
    }
  }

  /**
   * DELETE /avatars/:userId - удаление аватара пользователя
   */
  @Delete(':userId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Удаление аватара пользователя' })
  @ApiParam({ name: 'userId', description: 'ID пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Аватар успешно удален',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Аватар успешно удален' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Пользователь или аватар не найден' })
  async deleteAvatar(
    @Param('userId') userId: string,
    @Request() req
  ) {
    // Проверяем права доступа
    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    const isOwner = userId === req.user.userId;

    if (!isAdmin && !isOwner) {
      throw new BadRequestException('У вас нет прав на удаление аватара для этого пользователя');
    }

    this.logger.log(`Пользователь ${req.user.email} удаляет аватар для пользователя ${userId}`);

    try {
      await this.avatarsService.deleteAvatar(userId);

      return {
        message: `Аватар для пользователя ${userId} успешно удален`
      };
    } catch (error) {
      this.logger.error(`Ошибка удаления аватара: ${error.message}`);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException('Ошибка при удалении аватара');
    }
  }
}