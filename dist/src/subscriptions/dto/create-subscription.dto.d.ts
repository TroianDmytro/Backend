export declare class CreateSubscriptionDto {
    userId: string;
    subscription_type: 'course' | 'period';
    courseId?: string;
    period_type?: '1_month' | '3_months' | '6_months' | '12_months';
    start_date: string;
    end_date: string;
    price: number;
    currency?: string;
    discount_amount?: number;
    discount_code?: string;
    payment_method?: string;
    auto_renewal?: boolean;
    email_notifications?: boolean;
}
