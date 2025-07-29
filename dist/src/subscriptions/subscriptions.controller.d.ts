import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionFilterDto } from './dto/subscription-filter.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    private readonly logger;
    constructor(subscriptionsService: SubscriptionsService);
    createSubscription(createSubscriptionDto: CreateSubscriptionDto, req?: any): Promise<{
        message: string;
        subscription: import("./schemas/subscription.schema").SubscriptionDocument;
    }>;
    getAllSubscriptions(page: number | undefined, limit: number | undefined, filters: SubscriptionFilterDto, req?: any): Promise<{
        subscriptions: import("./schemas/subscription.schema").SubscriptionDocument[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
        filters: SubscriptionFilterDto;
    }>;
    getSubscriptionById(id: string, req?: any): Promise<{
        subscription: import("./schemas/subscription.schema").SubscriptionDocument;
    }>;
    updateSubscription(id: string, updateSubscriptionDto: UpdateSubscriptionDto, req?: any): Promise<{
        message: string;
        subscription: import("./schemas/subscription.schema").SubscriptionDocument;
    }>;
    deleteSubscription(id: string): Promise<{
        message: string;
    }>;
    cancelSubscription(id: string, cancelDto: CancelSubscriptionDto, req?: any): Promise<{
        message: string;
        subscription: import("./schemas/subscription.schema").SubscriptionDocument;
    }>;
    renewSubscription(id: string, period: '1_month' | '3_months' | '6_months' | '12_months', autoRenewal?: boolean, req?: any): Promise<{
        message: string;
        subscription: import("./schemas/subscription.schema").SubscriptionDocument;
    }>;
    activateSubscription(id: string, transactionId: string, paymentMethod?: string): Promise<{
        message: string;
        subscription: import("./schemas/subscription.schema").SubscriptionDocument;
    }>;
    getUserSubscriptions(userId: string, status?: 'active' | 'expired' | 'cancelled' | 'pending', req?: any): Promise<{
        userId: string;
        subscriptions: import("./schemas/subscription.schema").SubscriptionDocument[];
        totalSubscriptions: number;
    }>;
    getCourseSubscriptions(courseId: string, status?: 'active' | 'expired' | 'cancelled' | 'pending', page?: number, limit?: number): Promise<{
        courseId: string;
        subscriptions: import("./schemas/subscription.schema").SubscriptionDocument[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getSubscriptionsStatistics(): Promise<{
        statistics: any;
    }>;
    checkExpiringSubscriptions(): Promise<{
        message: string;
        expiredCount: number;
        notifiedCount: number;
    }>;
}
