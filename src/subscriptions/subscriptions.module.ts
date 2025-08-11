// src/subscriptions/subscriptions.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { Subscription, SubscriptionSchema } from './schemas/subscription.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { EmailModule } from '../email/email.module';
import { CoursesModule } from 'src/courses/courses.module';
import { UsersModule } from 'src/users/users.module';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Subscription.name, schema: SubscriptionSchema },
            { name: Course.name, schema: CourseSchema },
            { name: User.name, schema: UserSchema }
        ]),
        EmailModule,
        forwardRef(() => PaymentModule),
        forwardRef(() => CoursesModule), // Избегаем циклических зависимостей
        forwardRef(() => UsersModule)
    ],
    controllers: [SubscriptionsController],
    providers: [SubscriptionsService],
    exports: [SubscriptionsService],
})
export class SubscriptionsModule { }
