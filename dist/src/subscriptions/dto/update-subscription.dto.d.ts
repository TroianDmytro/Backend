export declare class UpdateSubscriptionDto {
    status?: 'active' | 'expired' | 'cancelled' | 'pending';
    end_date?: string;
    price?: number;
    is_paid?: boolean;
    payment_transaction_id?: string;
    payment_date?: string;
    auto_renewal?: boolean;
    next_billing_date?: string;
    progress_percentage?: number;
    completed_lessons?: number;
    email_notifications?: boolean;
    cancellation_reason?: string;
}
