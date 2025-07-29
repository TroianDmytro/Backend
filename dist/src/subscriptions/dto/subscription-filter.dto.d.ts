export declare class SubscriptionFilterDto {
    userId?: string;
    courseId?: string;
    status?: 'active' | 'expired' | 'cancelled' | 'pending';
    subscription_type?: 'course' | 'period';
    period_type?: '1_month' | '3_months' | '6_months' | '12_months';
    is_paid?: boolean;
    auto_renewal?: boolean;
    start_date_from?: string;
    start_date_to?: string;
    currency?: string;
}
