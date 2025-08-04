import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app') // Группировка в Swagger
@Controller() // Базовый контроллер без префикса
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Проверка работоспособности API',
    description: 'Возвращает приветственное сообщение для проверки работы API'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'API работает корректно',
    schema: {
      type: 'string',
      example: 'Hello World!'
    }
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Health check endpoint',
    description: 'Проверка состояния сервиса'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Сервис работает',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-01-01T00:00:00.000Z' },
        uptime: { type: 'number', example: 12345 }
      }
    }
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}