import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
export declare class RolesService {
    private roleModel;
    constructor(roleModel: Model<RoleDocument>);
    private initRoles;
    create(createRoleDto: CreateRoleDto): Promise<Role>;
    findAll(): Promise<Role[]>;
    findOne(id: string): Promise<Role>;
    findByName(name: string): Promise<Role>;
    getUserRole(): Promise<Role>;
    update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role>;
}
