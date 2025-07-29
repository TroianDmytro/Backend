import { Model } from 'mongoose';
import { SubscriptionDocument } from './schemas/subscription.schema';
import { CourseDocument } from '../courses/schemas/course.schema';
import { UserDocument } from '../users/schemas/user.schema';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionFilterDto } from './dto/subscription-filter.dto';
import { EmailService } from '../email/email.service';
export declare class SubscriptionsService {
    private subscriptionModel;
    private courseModel;
    private userModel;
    private readonly emailService;
    private readonly logger;
    constructor(subscriptionModel: Model<SubscriptionDocument>, courseModel: Model<CourseDocument>, userModel: Model<UserDocument>, emailService: EmailService);
    create(createSubscriptionDto: CreateSubscriptionDto): Promise<SubscriptionDocument>;
    findAll(filters: SubscriptionFilterDto, page?: number, limit?: number): Promise<{
        subscriptions: SubscriptionDocument[];
        totalItems: number;
        totalPages: number;
    }>;
    findById(id: string): Promise<SubscriptionDocument | null>;
    update(id: string, updateSubscriptionDto: UpdateSubscriptionDto, userId: string, isAdmin: boolean): Promise<SubscriptionDocument>;
    delete(id: string): Promise<void>;
    cancel(id: string, reason: string, userId: string, isAdmin: boolean, immediate?: boolean): Promise<SubscriptionDocument>;
    renew(id: string, period: '1_month' | '3_months' | '6_months' | '12_months', autoRenewal: boolean, userId: string, isAdmin: boolean): Promise<SubscriptionDocument>;
    activate(id: string, transactionId: string, paymentMethod?: string): Promise<SubscriptionDocument>;
    findByUserId(userId: string, status?: 'active' | 'expired' | 'cancelled' | 'pending'): Promise<SubscriptionDocument[]>;
    findByCourseId(courseId: string, status?: 'active' | 'expired' | 'cancelled' | 'pending', page?: number, limit?: number): Promise<{
        subscriptions: SubscriptionDocument[];
        totalItems: number;
        totalPages: number;
    }>;
    getStatistics(): Promise<any>;
    checkAndUpdateExpiredSubscriptions(): Promise<{
        expiredCount: number;
        notifiedCount: number;
    }>;
}
