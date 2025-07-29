import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    private emailService;
    constructor(usersService: UsersService, jwtService: JwtService, emailService: EmailService);
    validateUser(email: string, pass: string): Promise<any>;
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
    verifyEmail(token: string): Promise<{
        message: string;
        user: {
            email: string;
            isEmailVerified: boolean;
        };
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPasswordWithCode(code: string, newPassword: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    resendVerificationEmail(email: string): Promise<{
        message: string;
    }>;
}
