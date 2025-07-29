export declare class CreateCategoryDto {
    name: string;
    slug: string;
    description: string;
    short_description?: string;
    icon?: string;
    image_url?: string;
    color?: string;
    parent_id?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    order?: number;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string[];
}
