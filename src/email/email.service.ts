// src/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || '',
            },
        });
    }

    /**
     * Отправка письма подтверждения email
     */
    async sendVerificationEmail(email: string, verificationUrl: string, name?: string): Promise<void> {
        const subject = 'Подтверждение регистрации';
        const html = `
            <h2>Добро пожаловать${name ? `, ${name}` : ''}!</h2>
            <p>Спасибо за регистрацию на нашей образовательной платформе.</p>
            <p>Для подтверждения вашего email адреса, пожалуйста, перейдите по ссылке:</p>
            <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Подтвердить email
            </a>
            <p>Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:</p>
            <p>${verificationUrl}</p>
            <p>Ссылка действительна в течение 24 часов.</p>
        `;

        await this.sendEmail(email, subject, html);
    }

    /**
     * Отправка письма с кодом восстановления пароля
     */
    async sendPasswordResetCode(email: string, resetCode: string, name?: string): Promise<void> {
        const subject = 'Восстановление пароля';
        const html = `
            <h2>Восстановление пароля</h2>
            <p>Здравствуйте${name ? `, ${name}` : ''}!</p>
            <p>Вы запросили восстановление пароля для вашего аккаунта.</p>
            <p>Ваш код восстановления:</p>
            <h3 style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace; letter-spacing: 2px;">
                ${resetCode}
            </h3>
            <p>Введите этот код на странице восстановления пароля.</p>
            <p>Код действителен в течение 15 минут.</p>
            <p>Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.</p>
        `;

        await this.sendEmail(email, subject, html);
    }

    /**
     * Уведомление об одобрении/отклонении заявки преподавателя
     */
    async sendTeacherApprovalNotification(
        email: string,
        name: string,
        status: 'approved' | 'rejected',
        reason?: string
    ): Promise<void> {
        const isApproved = status === 'approved';
        const subject = isApproved ? 'Заявка одобрена!' : 'Заявка отклонена';

        let html = `<h2>Статус вашей заявки на преподавание</h2>`;
        html += `<p>Здравствуйте, ${name}!</p>`;

        if (isApproved) {
            html += `
                <p style="color: #28a745;">🎉 Поздравляем! Ваша заявка на преподавание была одобрена.</p>
                <p>Теперь вы можете:</p>
                <ul>
                    <li>Создавать курсы</li>
                    <li>Загружать домашние задания</li>
                    <li>Проверять работы студентов</li>
                    <li>Управлять своими курсами</li>
                </ul>
                <p>Добро пожаловать в команду преподавателей!</p>
            `;
        } else {
            html += `
                <p style="color: #dc3545;">К сожалению, ваша заявка на преподавание была отклонена.</p>
                ${reason ? `<p><strong>Причина:</strong> ${reason}</p>` : ''}
                <p>Вы можете подать новую заявку после устранения указанных замечаний.</p>
            `;
        }

        await this.sendEmail(email, subject, html);
    }

    /**
     * Уведомление о блокировке/разблокировке
     */
    async sendBlockNotification(
        email: string,
        name: string,
        isBlocked: boolean,
        reason?: string
    ): Promise<void> {
        const subject = isBlocked ? 'Аккаунт заблокирован' : 'Аккаунт разблокирован';

        let html = `<h2>Изменение статуса аккаунта</h2>`;
        html += `<p>Здравствуйте, ${name}!</p>`;

        if (isBlocked) {
            html += `
                <p style="color: #dc3545;">Ваш аккаунт был заблокирован администратором.</p>
                ${reason ? `<p><strong>Причина:</strong> ${reason}</p>` : ''}
                <p>Для получения дополнительной информации обратитесь к администратору.</p>
            `;
        } else {
            html += `
                <p style="color: #28a745;">Ваш аккаунт был разблокирован.</p>
                <p>Теперь вы снова можете пользоваться всеми функциями платформы.</p>
            `;
        }

        await this.sendEmail(email, subject, html);
    }

    /**
     * Уведомление об изменении email
     */
    async sendEmailChangeNotification(
        oldEmail: string,
        newEmail: string,
        verificationUrl: string
    ): Promise<void> {
        // Уведомление на старый email
        const oldEmailSubject = 'Email адрес изменен';
        const oldEmailHtml = `
            <h2>Изменение email адреса</h2>
            <p>Ваш email адрес был изменен с ${oldEmail} на ${newEmail}.</p>
            <p>Если это были не вы, немедленно обратитесь к администратору.</p>
        `;

        // Уведомление на новый email с подтверждением
        const newEmailSubject = 'Подтвердите новый email адрес';
        const newEmailHtml = `
            <h2>Подтверждение нового email адреса</h2>
            <p>Ваш email адрес был изменен на ${newEmail}.</p>
            <p>Для подтверждения нового адреса перейдите по ссылке:</p>
            <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Подтвердить новый email
            </a>
        `;

        await Promise.all([
            this.sendEmail(oldEmail, oldEmailSubject, oldEmailHtml),
            this.sendEmail(newEmail, newEmailSubject, newEmailHtml)
        ]);
    }

    /**
     * Уведомления о подписках
     */
    async sendSubscriptionActivationNotification(email: string, name: string): Promise<void> {
        const subject = 'Подписка активирована';
        const html = `
            <h2>Подписка успешно активирована!</h2>
            <p>Здравствуйте, ${name}!</p>
            <p>Ваша подписка была успешно активирована.</p>
            <p>Теперь у вас есть доступ ко всем материалам курса.</p>
            <p>Удачного обучения! 📚</p>
        `;

        await this.sendEmail(email, subject, html);
    }

    async sendSubscriptionCancellationNotification(
        email: string,
        name: string,
        reason: string,
        immediate: boolean
    ): Promise<void> {
        const subject = 'Подписка отменена';
        const html = `
            <h2>Подписка отменена</h2>
            <p>Здравствуйте, ${name}!</p>
            <p>Ваша подписка была отменена.</p>
            <p><strong>Причина:</strong> ${reason}</p>
            <p>Доступ к материалам ${immediate ? 'прекращен немедленно' : 'будет прекращен в конце текущего периода'}.</p>
        `;

        await this.sendEmail(email, subject, html);
    }

    async sendSubscriptionExpirationNotification(email: string, name: string): Promise<void> {
        const subject = 'Подписка истекла';
        const html = `
            <h2>Подписка истекла</h2>
            <p>Здравствуйте, ${name}!</p>
            <p>Ваша подписка истекла.</p>
            <p>Для продолжения обучения продлите подписку в личном кабинете.</p>
        `;

        await this.sendEmail(email, subject, html);
    }

    async sendSubscriptionExpiringNotification(email: string, name: string, endDate: Date): Promise<void> {
        const daysLeft = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const subject = 'Подписка скоро истечет';
        const html = `
            <h2>Подписка истекает</h2>
            <p>Здравствуйте, ${name}!</p>
            <p>Ваша подписка истекает через ${daysLeft} ${daysLeft === 1 ? 'день' : 'дней'}.</p>
            <p>Продлите подписку, чтобы не потерять доступ к материалам.</p>
        `;

        await this.sendEmail(email, subject, html);
    }

    /**
     * Базовый метод отправки email
     */
    private async sendEmail(to: string, subject: string, html: string): Promise<void> {
        try {
            if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
                this.logger.warn('SMTP настройки не заданы. Письмо не отправлено.');
                this.logger.debug(`TO: ${to}, SUBJECT: ${subject}`);
                return;
            }

            const info = await this.transporter.sendMail({
                from: `"Образовательная платформа" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html
            });

            this.logger.log(`Email отправлен: ${info.messageId} -> ${to}`);
        } catch (error) {
            this.logger.error(`Ошибка отправки email: ${error.message}`, error.stack);
            throw error;
        }
    }
}