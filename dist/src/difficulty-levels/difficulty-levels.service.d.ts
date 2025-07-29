import { Model } from 'mongoose';
import { DifficultyLevelDocument } from './schemas/difficulty-level.schema';
import { CourseDocument } from '../courses/schemas/course.schema';
import { SubscriptionDocument } from '../subscriptions/schemas/subscription.schema';
import { CreateDifficultyLevelDto } from './dto/create-difficulty-level.dto';
import { UpdateDifficultyLevelDto } from './dto/update-difficulty-level.dto';
export declare class DifficultyLevelsService {
    private difficultyLevelModel;
    private courseModel;
    private subscriptionModel;
    private readonly logger;
    constructor(difficultyLevelModel: Model<DifficultyLevelDocument>, courseModel: Model<CourseDocument>, subscriptionModel: Model<SubscriptionDocument>);
    private initDefaultLevels;
    create(createDifficultyLevelDto: CreateDifficultyLevelDto): Promise<DifficultyLevelDocument>;
    findAll(onlyActive?: boolean): Promise<DifficultyLevelDocument[]>;
    findById(id: string): Promise<DifficultyLevelDocument | null>;
    findBySlug(slug: string): Promise<DifficultyLevelDocument | null>;
    findByCode(code: string): Promise<DifficultyLevelDocument | null>;
    update(id: string, updateDto: UpdateDifficultyLevelDto): Promise<DifficultyLevelDocument>;
    delete(id: string): Promise<void>;
    getLevelCourses(levelId: string, page?: number, limit?: number, onlyPublished?: boolean): Promise<{
        courses: any[];
        totalItems: number;
        totalPages: number;
        level: DifficultyLevelDocument;
    }>;
    updateLevelStatistics(levelId: string): Promise<void>;
    updateAllLevelsStatistics(): Promise<void>;
    getLevelsStatistics(): Promise<any[]>;
}
