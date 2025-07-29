import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
export declare class AuthController {
    private authService;
    private readonly logger;
    constructor(authService: AuthService);
    register(createUserDto: CreateUserDto): Promise<{
        message: string;
        user: {
            email: string;
            name: string;
            second_name: string;
            age: number;
            telefon_number: string;
            isEmailVerified: boolean;
        };
    }>;
    login(loginUserDto: LoginUserDto): Promise<{
        access_token: string;
        user: {
            id: any;
            avatar: any;
            email: any;
            name: any;
            second_name: any;
            isEmailVerified: any;
            roles: any;
        };
    }>;
    verifyEmail(token: string, res: Response): Promise<Response<any, Record<string, any>>>;
    resendVerificationEmail(email: string): Promise<{
        success: boolean;
        message: any;
    }>;
    forgotPassword(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(code: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    changePassword(req: any, body: {
        userId?: string;
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    private getSuccessPage;
    private getErrorPage;
}
