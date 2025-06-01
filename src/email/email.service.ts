// email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter;
    private readonly logger = new Logger(EmailService.name);

    constructor() {
        // Логируем параметры подключения
        this.logger.log(`Настройка SMTP: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}`);

        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'localhost',
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER || '',
                pass: process.env.EMAIL_PASSWORD || '',
            },
        });

        // Проверка подключения к SMTP серверу
        this.transporter.verify((error, success) => {
            if (error) {
                this.logger.error(`Ошибка подключения к SMTP серверу: ${error.message}`);
            } else {
                this.logger.log('SMTP сервер готов к отправке сообщений');
            }
        });
    }

    async sendVerificationEmail(to: string, verificationUrl: string, name?: string) {
        const userName = name || 'пользователь';

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@example.com',
            to,
            subject: 'Подтверждение email',
            html: `
            <h3>Здравствуйте, ${userName}!</h3>
            <p>Спасибо за регистрацию на нашем сайте. Пожалуйста, подтвердите ваш email, перейдя по ссылке ниже:</p>
            <p><a href="${verificationUrl}">Подтвердить email</a></p>
            <p>Эта ссылка действительна в течение 24 часов.</p>
            <p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
          `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Письмо отправлено:', info.messageId);
            return info;
        } catch (error) {
            console.error('Ошибка отправки письма:', error);
            throw error;
        }
    }

    async sendResetPasswordEmail(to: string, resetUrl: string) {
        try {
            this.logger.log(`Попытка отправки письма на: ${to}`);
            const mailOptions = {
                from: process.env.EMAIL_FROM || 'noreply@example.com',
                to,
                subject: 'Сброс пароля',
                html: `
        <h3>Сброс пароля на сайте</h3>
        <p>Вы запросили сброс пароля. Пожалуйста, перейдите по ссылке ниже, чтобы сбросить ваш пароль:</p>
        <p><a href="${resetUrl}">Сбросить пароль</a></p>
        <p>Эта ссылка действительна в течение 1 часа.</p>
        <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
      `,
            };

            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Письмо успешно отправлено: ${info.messageId}`);
            return info;
        } catch (error) {
            this.logger.error(`Ошибка отправки письма: ${error.message}`);
            throw error;
        }
    }

    async sendEmailChangeNotification(oldEmail: string, newEmail: string, verificationUrl: string): Promise<void> {
        // 1. Отправляем уведомление на старый email
        const oldEmailMailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'Ваше приложение'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: oldEmail,
            subject: 'Ваш email был изменен',
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2>Изменение адреса электронной почты</h2>
              <p>Ваш email в учетной записи был изменен с ${oldEmail} на ${newEmail}.</p>
              <p>Если вы не производили это изменение, пожалуйста, немедленно свяжитесь с нами, ответив на это письмо.</p>
              <p>С уважением,<br>Команда поддержки</p>
            </div>
          `,
        };

        // 2. Отправляем письмо с подтверждением на новый email
        const newEmailMailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'Ваше приложение'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: newEmail,
            subject: 'Подтверждение нового email',
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2>Подтверждение нового адреса электронной почты</h2>
              <p>Ваш email в учетной записи был изменен с ${oldEmail} на ${newEmail}.</p>
              <p>Пожалуйста, подтвердите новый адрес электронной почты, перейдя по ссылке ниже:</p>
              <p><a href="${verificationUrl}">${verificationUrl}</a></p>
              <p>Ссылка действительна в течение 24 часов.</p>
              <p>Если вы не производили это изменение, пожалуйста, проигнорируйте это письмо.</p>
              <p>С уважением,<br>Команда поддержки</p>
            </div>
          `,
        };

        try {
            // Отправляем оба письма
            await this.transporter.sendMail(oldEmailMailOptions);
            this.logger.log(`Отправлено уведомление на старый email: ${oldEmail}`);

            await this.transporter.sendMail(newEmailMailOptions);
            this.logger.log(`Отправлено подтверждение на новый email: ${newEmail}`);
        } catch (error) {
            this.logger.error(`Ошибка при отправке уведомлений об изменении email: ${error.message}`);
            throw error;
        }
    }


    async sendResetPasswordCode(to: string, code: string, name?: string): Promise<void> {
        const userName = name || 'пользователь';

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@example.com',
            to,
            subject: 'Код восстановления пароля',
            html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Восстановление пароля</h2>
            <p>Здравствуйте, ${userName}!</p>
            <p>Вы запросили восстановление пароля. Ваш код подтверждения:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #333; letter-spacing: 5px; margin: 0;">${code}</h1>
            </div>
            <p>Код действителен в течение 15 минут.</p>
            <p>Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #666; font-size: 14px;">С уважением,<br>Команда поддержки</p>
        </div>
        `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Код восстановления отправлен на: ${to}`);
        } catch (error) {
            this.logger.error(`Ошибка отправки кода: ${error.message}`);
            throw error;
        }
    }
}