// src/subjects/subjects.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { Subject, SubjectSchema } from './schemas/subject.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { CoursesModule } from 'src/courses/courses.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Subject.name, schema: SubjectSchema },
            { name: Course.name, schema: CourseSchema }
        ]),
        // Настройка Multer для загрузки учебных материалов
        MulterModule.register({
            dest: './uploads/study-materials',
            limits: {
                fileSize: 100 * 1024 * 1024, // 100MB
                files: 5,
            },
        }),
        forwardRef(() => CoursesModule) // При необходимости
    ],
    controllers: [SubjectsController],
    providers: [SubjectsService],
    exports: [SubjectsService],
})
export class SubjectsModule { }
