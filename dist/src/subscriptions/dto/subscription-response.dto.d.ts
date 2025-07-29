export declare class SubscriptionResponseDto {
    id: string;
    userId: string;
    user?: {
        id: string;
        email: string;
        name: string;
        second_name: string;
    };
    subscription_type: 'course' | 'period';
    courseId?: string;
    course?: {
        id: string;
        title: string;
        description: string;
        price: number;
        teacherId: string;
        teacher?: {
            name: string;
            second_name: string;
        };
    };
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
    progress_percentage: number;
    completed_lessons: number;
    total_lessons: number;
    last_accessed?: Date;
    email_notifications: boolean;
    cancellation_reason?: string;
    cancelled_at?: Date;
    cancelled_by?: string;
    createdAt: Date;
    updatedAt: Date;
    is_active?: boolean;
    days_remaining?: number;
}
