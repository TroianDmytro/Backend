export declare class TeacherResponseDto {
    id: string;
    email: string;
    name: string;
    second_name: string;
    age?: number;
    telefon_number?: string;
    description: string;
    specialization?: string;
    education?: string;
    experience_years?: number;
    skills?: string[];
    cv_file_url?: string;
    assignedCourses: string[];
    isEmailVerified: boolean;
    isBlocked: boolean;
    isApproved: boolean;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    rating: number;
    reviewsCount: number;
    createdAt: Date;
    updatedAt: Date;
}
