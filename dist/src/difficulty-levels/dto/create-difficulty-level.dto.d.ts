export declare class CreateDifficultyLevelDto {
    name: string;
    slug: string;
    code: string;
    description: string;
    short_description?: string;
    icon?: string;
    color?: string;
    level: number;
    order?: number;
    prerequisites?: string[];
    target_audience?: string[];
    recommended_hours?: number;
    min_experience_years?: number;
    isActive?: boolean;
}
