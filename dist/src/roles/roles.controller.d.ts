import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    create(createRoleDto: CreateRoleDto): Promise<import("./schemas/role.schema").Role>;
    findAll(): Promise<import("./schemas/role.schema").Role[]>;
    findOne(id: string): Promise<import("./schemas/role.schema").Role>;
    update(id: string, updateRoleDto: UpdateRoleDto): Promise<import("./schemas/role.schema").Role>;
}
