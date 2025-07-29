export declare class UserResponseDto {
    id: string;
    email: string;
    name?: string;
    second_name?: string;
    age?: number;
    telefon_number?: string;
    isEmailVerified: boolean;
    isBlocked: boolean;
    avatarId?: string | null;
    hasAvatar: boolean;
    avatarUrl?: string | null;
    roles: string[];
    createdAt: Date;
    updatedAt: Date;
    password: string;
    verificationToken: string;
    resetPasswordToken: string;
    verificationTokenExpires: Date;
    resetPasswordExpires: Date;
}
