import { DifficultyLevelsService } from './difficulty-levels.service';
import { CreateDifficultyLevelDto } from './dto/create-difficulty-level.dto';
import { UpdateDifficultyLevelDto } from './dto/update-difficulty-level.dto';
export declare class DifficultyLevelsController {
    private readonly difficultyLevelsService;
    private readonly logger;
    constructor(difficultyLevelsService: DifficultyLevelsService);
    create(createDifficultyLevelDto: CreateDifficultyLevelDto): Promise<{
        message: string;
        level: import("./schemas/difficulty-level.schema").DifficultyLevelDocument;
    }>;
    findAll(onlyActive: boolean): Promise<{
        levels: import("./schemas/difficulty-level.schema").DifficultyLevelDocument[];
        total: number;
    }>;
    findById(id: string): Promise<{
        level: import("./schemas/difficulty-level.schema").DifficultyLevelDocument;
    }>;
    findBySlug(slug: string): Promise<{
        level: import("./schemas/difficulty-level.schema").DifficultyLevelDocument;
    }>;
    update(id: string, updateDifficultyLevelDto: UpdateDifficultyLevelDto): Promise<{
        message: string;
        level: import("./schemas/difficulty-level.schema").DifficultyLevelDocument;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    getLevelCourses(id: string, page: number, limit: number): Promise<{
        level: {
            id: any;
            name: string;
            slug: string;
            description: string;
            color: string | undefined;
            level: number;
        };
        courses: any[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    updateLevelStatistics(id: string): Promise<{
        message: string;
    }>;
    updateAllLevelsStatistics(): Promise<{
        message: string;
    }>;
    getLevelsStatistics(): Promise<{
        statistics: any[];
    }>;
}
