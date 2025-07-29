export declare class CategoryResponseDto {
    id: string;
    name: string;
    slug: string;
    description: string;
    short_description?: string;
    icon?: string;
    image_url?: string;
    color?: string;
    parent_id?: string;
    isActive: boolean;
    isFeatured: boolean;
    order: number;
    courses_count: number;
    students_count: number;
    createdAt: Date;
    updatedAt: Date;
}
