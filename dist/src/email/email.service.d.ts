export declare class EmailService {
    private transporter;
    private readonly logger;
    constructor();
    sendVerificationEmail(to: string, verificationUrl: string, name?: string): Promise<any>;
    sendResetPasswordEmail(to: string, resetUrl: string): Promise<any>;
    sendEmailChangeNotification(oldEmail: string, newEmail: string, verificationUrl: string): Promise<void>;
    sendResetPasswordCode(to: string, code: string, name?: string): Promise<void>;
    sendTeacherApprovalNotification(to: string, teacherName: string, status: 'approved' | 'rejected', rejectionReason?: string): Promise<void>;
    sendBlockNotification(to: string, teacherName: string, isBlocked: boolean, reason?: string): Promise<void>;
    sendSubscriptionCancellationNotification(to: string, userName: string, reason: string, immediate: boolean): Promise<void>;
    sendSubscriptionActivationNotification(to: string, userName: string): Promise<void>;
    sendSubscriptionExpirationNotification(to: string, userName: string): Promise<void>;
    sendSubscriptionExpiringNotification(to: string, userName: string, expirationDate: Date): Promise<void>;
    private getApprovedTeacherTemplate;
    private getRejectedTeacherTemplate;
    private getBlockedTeacherTemplate;
    private getUnblockedTeacherTemplate;
}
