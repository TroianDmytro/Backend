import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    private readonly logger;
    constructor(usersService: UsersService);
    getUserById(id: string): Promise<{
        id: any;
        avatar: import("mongoose").Schema.Types.ObjectId | undefined;
        email: string;
        name: string;
        second_name: string;
        age: number;
        telefon_number: string;
        isEmailVerified: boolean;
        isBlocked: boolean;
        roles: string[];
        createdAt: Date | undefined;
        updatedAt: Date | undefined;
    }>;
    updateUser(id: string, req: any, updateUserDto: UpdateUserDto): Promise<{
        message: string;
        user: {
            id: any;
            email: string;
            name: string;
            second_name: string;
            age: number;
            telefon_number: string;
            isEmailVerified: boolean;
            roles: string[];
        };
    }>;
    blockUser(id: string, isBlocked: boolean, req: any): Promise<{
        message: string;
        user: {
            id: any;
            email: string;
            isBlocked: boolean;
        };
    }>;
    deleteUser(id: string, req: any): Promise<{
        message: string;
    }>;
    addRoleToUser(userId: string, roleId: string): Promise<import("./schemas/user.schema").User | null>;
    removeRoleFromUser(userId: string, roleId: string): Promise<import("./schemas/user.schema").User | null>;
    getAllUsers(req: any): Promise<{
        id: any;
        email: string;
        name: string;
        second_name: string;
        age: number;
        telefon_number: string;
        isEmailVerified: boolean;
        isBlocked: boolean;
        hasAvatar: boolean;
        avatarUrl: string | null;
        roles: string[];
        createdAt: Date | undefined;
        updatedAt: Date | undefined;
    }[]>;
}
