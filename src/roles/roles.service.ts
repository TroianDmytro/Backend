// src/roles/roles.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
    constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {
        // Инициализация стандартных ролей при старте приложения
        this.initRoles();
    }

    private async initRoles() {
        const count = await this.roleModel.estimatedDocumentCount();
        if (count === 0) {
            // Создаем базовые роли, если их нет
            await Promise.all([
                this.create({ name: 'user' }),
                this.create({ name: 'admin' }),
                this.create({ name: 'owner' }),
                this.create({ name: 'teacher' })
            ]);
            console.log('Стандартные роли созданы');
        }
    }

    async create(createRoleDto: CreateRoleDto): Promise<Role> {
        const existingRole = await this.roleModel.findOne({ name: createRoleDto.name }).exec();
        if (existingRole) {
            throw new ConflictException(`Роль с названием ${createRoleDto.name} уже существует`);
        }

        const createdRole = new this.roleModel(createRoleDto);
        return createdRole.save();
    }

    async findAll(): Promise<Role[]> {
        return this.roleModel.find().exec();
    }

    async findOne(id: string): Promise<Role> {
        const role = await this.roleModel.findById(id).exec();
        if (!role) {
            throw new NotFoundException(`Роль с ID ${id} не найдена`);
        }
        return role;
    }

    async findByName(name: string): Promise<Role> {
        const role = await this.roleModel.findOne({ name }).exec();
        if (!role) {
            throw new NotFoundException(`Роль с названием ${name} не найдена`);
        }
        return role;
    }

    async getUserRole(): Promise<Role> {
        // Получаем базовую роль 'user' вместо роли по умолчанию
        const userRole = await this.roleModel.findOne({ name: 'user' }).exec();
        if (!userRole) {
            throw new NotFoundException('Роль "user" не найдена');
        }
        return userRole;
    }

    async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
        if (updateRoleDto.name) {
            const existingRole = await this.roleModel.findOne({
                name: updateRoleDto.name,
                _id: { $ne: id }
            }).exec();

            if (existingRole) {
                throw new ConflictException(`Роль с названием ${updateRoleDto.name} уже существует`);
            }
        }

        const updatedRole = await this.roleModel
            .findByIdAndUpdate(id, updateRoleDto, { new: true })
            .exec();

        if (!updatedRole) {
            throw new NotFoundException(`Роль с ID ${id} не найдена`);
        }

        return updatedRole;
    }

    // async remove(id: string): Promise<void> {
    //     const role = await this.roleModel.findById(id).exec();
    //     if (!role) {
    //         throw new NotFoundException(`Роль с ID ${id} не найдена`);
    //     }

    //     // Защита от удаления базовой роли 'user'
    //     if (role.name === 'user') {
    //         throw new ConflictException('Нельзя удалить базовую роль "user"');
    //     }

    //     await this.roleModel.findByIdAndDelete(id).exec();
    // }
}