import { Document, Schema as MongooseSchema } from 'mongoose';
export type SubscriptionDocument = Subscription & Document;
export declare class Subscription {
    id?: string;
    userId: MongooseSchema.Types.ObjectId;
    subscription_type: 'course' | 'period';
    courseId?: MongooseSchema.Types.ObjectId;
    period_type?: '1_month' | '3_months' | '6_months' | '12_months';
    start_date: Date;
    end_date: Date;
    status: 'active' | 'expired' | 'cancelled' | 'pending';
    price: number;
    currency: string;
    discount_amount?: number;
    discount_code?: string;
    payment_method?: string;
    payment_transaction_id?: string;
    payment_date?: Date;
    is_paid: boolean;
    auto_renewal: boolean;
    next_billing_date?: Date;
    accessible_courses?: MongooseSchema.Types.ObjectId[];
    progress_percentage: number;
    completed_lessons: number;
    total_lessons: number;
    last_accessed?: Date;
    email_notifications: boolean;
    cancellation_reason?: string;
    cancelled_at?: Date;
    cancelled_by?: MongooseSchema.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const SubscriptionSchema: MongooseSchema<Subscription, import("mongoose").Model<Subscription, any, any, any, Document<unknown, any, Subscription, any> & Subscription & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Subscription, Document<unknown, {}, import("mongoose").FlatRecord<Subscription>, {}> & import("mongoose").FlatRecord<Subscription> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
