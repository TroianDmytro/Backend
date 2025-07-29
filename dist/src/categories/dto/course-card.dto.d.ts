export declare class CourseCardDto {
    id: string;
    title: string;
    short_description?: string;
    logo_url?: string;
    price: number;
    discount_price?: number;
    currency: string;
    rating: number;
    reviews_count: number;
    current_students_count: number;
    duration_hours: number;
    lessons_count: number;
    difficulty_level: string;
    teacher: {
        id: string;
        name: string;
        second_name: string;
        rating?: number;
    };
}
