// src/difficulty-levels/interfaces/level-course-data.interface.ts
export interface LevelCourseData {
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
    category?: {
        name: string;
        slug: string;
        color: string;
        icon: string;
    };
    teacher?: {
        id: string;
        name: string;
        second_name: string;
        rating: number;
    };
}

export interface LevelCoursesResult {
    courses: LevelCourseData[];
    totalItems: number;
    totalPages: number;
    level: any;
}