// src/difficulty-levels/interfaces/level-statistics.interface.ts
export interface LevelStatistics {
    totalLevels: number;
    activeLevels: number;
    inactiveLevels: number;
    totalCourses: number;
    totalStudents: number;
    averageRating: number;
    levelBreakdown: Array<{
        id: string;
        name: string;
        code: string;
        level: number;
        courses_count: number;
        students_count: number;
        average_rating: number;
        isActive: boolean;
    }>;
}

export interface LevelAdminStatistics {
    totalCourses: number;
    publishedCourses: number;
    activeCourses: number;
    totalStudents: number;
    averageRating: number;
}