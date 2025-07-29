"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const role_schema_1 = require("./schemas/role.schema");
let RolesService = class RolesService {
    roleModel;
    constructor(roleModel) {
        this.roleModel = roleModel;
        this.initRoles();
    }
    async initRoles() {
        const count = await this.roleModel.estimatedDocumentCount();
        if (count === 0) {
            await Promise.all([
                this.create({ name: 'user' }),
                this.create({ name: 'admin' }),
                this.create({ name: 'owner' }),
                this.create({ name: 'teacher' })
            ]);
            console.log('Стандартные роли созданы');
        }
    }
    async create(createRoleDto) {
        const existingRole = await this.roleModel.findOne({ name: createRoleDto.name }).exec();
        if (existingRole) {
            throw new common_1.ConflictException(`Роль с названием ${createRoleDto.name} уже существует`);
        }
        const createdRole = new this.roleModel(createRoleDto);
        return createdRole.save();
    }
    async findAll() {
        return this.roleModel.find().exec();
    }
    async findOne(id) {
        const role = await this.roleModel.findById(id).exec();
        if (!role) {
            throw new common_1.NotFoundException(`Роль с ID ${id} не найдена`);
        }
        return role;
    }
    async findByName(name) {
        const role = await this.roleModel.findOne({ name }).exec();
        if (!role) {
            throw new common_1.NotFoundException(`Роль с названием ${name} не найдена`);
        }
        return role;
    }
    async getUserRole() {
        const userRole = await this.roleModel.findOne({ name: 'user' }).exec();
        if (!userRole) {
            throw new common_1.NotFoundException('Роль "user" не найдена');
        }
        return userRole;
    }
    async update(id, updateRoleDto) {
        if (updateRoleDto.name) {
            const existingRole = await this.roleModel.findOne({
                name: updateRoleDto.name,
                _id: { $ne: id }
            }).exec();
            if (existingRole) {
                throw new common_1.ConflictException(`Роль с названием ${updateRoleDto.name} уже существует`);
            }
        }
        const updatedRole = await this.roleModel
            .findByIdAndUpdate(id, updateRoleDto, { new: true })
            .exec();
        if (!updatedRole) {
            throw new common_1.NotFoundException(`Роль с ID ${id} не найдена`);
        }
        return updatedRole;
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(role_schema_1.Role.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], RolesService);
//# sourceMappingURL=roles.service.js.map