export declare class DifficultyLevelResponseDto {
    id: string;
    name: string;
    slug: string;
    code: string;
    description: string;
    short_description?: string;
    icon?: string;
    color?: string;
    level: number;
    order: number;
    prerequisites: string[];
    target_audience: string[];
    recommended_hours?: number;
    isActive: boolean;
    courses_count: number;
    students_count: number;
    average_completion_rate: number;
    createdAt: Date;
    updatedAt: Date;
}
