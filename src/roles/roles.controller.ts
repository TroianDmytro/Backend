// src/roles/roles.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Post()
    @Roles('admin')
    @ApiOperation({ summary: 'Создание новой роли' })
    @ApiResponse({ status: 201, description: 'Роль успешно создана' })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 409, description: 'Роль с таким названием уже существует' })
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.rolesService.create(createRoleDto);
    }

    @Get()
    @Roles('admin')
    @ApiOperation({ summary: 'Получение всех ролей' })
    @ApiResponse({ status: 200, description: 'Список всех ролей' })
    findAll() {
        return this.rolesService.findAll();
    }

    @Get(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Получение роли по ID' })
    @ApiResponse({ status: 200, description: 'Данные роли' })
    @ApiResponse({ status: 404, description: 'Роль не найдена' })
    findOne(@Param('id') id: string) {
        return this.rolesService.findOne(id);
    }

    @Patch(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Обновление роли' })
    @ApiResponse({ status: 200, description: 'Роль успешно обновлена' })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 404, description: 'Роль не найдена' })
    @ApiResponse({ status: 409, description: 'Роль с таким названием уже существует' })
    update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
        return this.rolesService.update(id, updateRoleDto);
    }

    // @Delete(':id')
    // @Roles('admin')
    // @ApiOperation({ summary: 'Удаление роли' })
    // @ApiResponse({ status: 200, description: 'Роль успешно удалена' })
    // @ApiResponse({ status: 404, description: 'Роль не найдена' })
    // @ApiResponse({ status: 409, description: 'Нельзя удалить базовую роль "user"' })
    // remove(@Param('id') id: string) {
    //     this.rolesService.remove(id);
    //     return { message: 'Роль успешно удалена' };
    // }
}