// email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(EmailService.name);

    constructor() {
        this.createTransporter();
    }

    private createTransporter() {
        try {
            // Проверяем наличие всех переменных окружения
            const emailHost = process.env.EMAIL_HOST;
            const emailPort = process.env.EMAIL_PORT;
            const emailUser = process.env.EMAIL_USER;
            const emailPassword = process.env.EMAIL_PASSWORD;

            // Детальное логирование для диагностики
            this.logger.log(`🔧 Настройка SMTP: ${emailHost}:${emailPort}`);
            this.logger.log(`📧 Email пользователь: ${emailUser ? 'ОК' : 'НЕТ'}`);
            this.logger.log(`🔑 Email пароль: ${emailPassword ? 'ОК' : 'НЕТ'}`);
            this.logger.log(`🔒 Secure: ${process.env.EMAIL_SECURE}`);

            if (!emailHost || !emailPort || !emailUser || !emailPassword) {
                this.logger.warn('⚠️  Не все email переменные окружения настроены');
                this.logger.warn(`HOST: ${emailHost ? '✅' : '❌'}, PORT: ${emailPort ? '✅' : '❌'}, USER: ${emailUser ? '✅' : '❌'}, PASS: ${emailPassword ? '✅' : '❌'}`);
                return;
            }

            this.transporter = nodemailer.createTransport({
                host: emailHost,
                port: parseInt(emailPort),
                secure: process.env.EMAIL_SECURE === 'true', // true для 465, false для других портов
                auth: {
                    user: emailUser,
                    pass: emailPassword,
                },
                tls: {
                    rejectUnauthorized: false, // Для Gmail
                },
            });

            // Проверяем соединение асинхронно
            this.verifyConnection();
        } catch (error) {
            this.logger.error('❌ Ошибка создания SMTP транспорта:', error);
        }
    }

    private async verifyConnection() {
        try {
            if (!this.transporter) {
                this.logger.error('❌ Транспорт не создан');
                return;
            }

            await this.transporter.verify();
            this.logger.log('✅ SMTP соединение успешно установлено');
        } catch (error) {
            this.logger.error(`❌ Ошибка подключения к SMTP серверу: ${error.message}`);
        }
    }

    /**
     * Базовый метод отправки email
     */
    async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
        try {
            if (!this.transporter) {
                this.logger.error('❌ SMTP транспорт не настроен');
                return false;
            }

            const mailOptions = {
                from: `${process.env.EMAIL_FROM_NAME || 'Education Platform'} <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
                to,
                subject,
                html,
            };

            const result = await this.transporter.sendMail(mailOptions);
            this.logger.log(`✅ Email отправлен: ${result.messageId}`);
            return true;
        } catch (error) {
            this.logger.error(`❌ Ошибка отправки email: ${error.message}`);
            return false;
        }
    }

    async sendVerificationEmail(to: string, verificationUrl: string, name?: string) {
        const userName = name || 'пользователь';

        const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                <h3>Здравствуйте, ${userName}!</h3>
                <p>Спасибо за регистрацию на нашем сайте. Пожалуйста, подтвердите ваш email, перейдя по ссылке ниже:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" 
                       style="background-color: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Подтвердить email
                    </a>
                </div>
                <p>Эта ссылка действительна в течение 24 часов.</p>
                <p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #666; font-size: 14px;">С уважением,<br>Команда Education Platform</p>
            </div>
        `;

        try {
            const success = await this.sendEmail(to, 'Подтверждение email', html);
            if (success) {
                this.logger.log(`📧 Письмо подтверждения отправлено: ${to}`);
            }
            return success;
        } catch (error) {
            this.logger.error(`❌ Ошибка отправки письма подтверждения: ${error.message}`);
            throw error;
        }
    }

    async sendResetPasswordEmail(to: string, resetUrl: string) {
        const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                <h3>Сброс пароля на сайте</h3>
                <p>Вы запросили сброс пароля. Пожалуйста, перейдите по ссылке ниже, чтобы сбросить ваш пароль:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" 
                       style="background-color: #2196F3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Сбросить пароль
                    </a>
                </div>
                <p>Эта ссылка действительна в течение 1 часа.</p>
                <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #666; font-size: 14px;">С уважением,<br>Команда Education Platform</p>
            </div>
        `;

        try {
            this.logger.log(`📧 Попытка отправки письма сброса пароля на: ${to}`);
            const success = await this.sendEmail(to, 'Сброс пароля', html);
            if (success) {
                this.logger.log(`✅ Письмо сброса пароля успешно отправлено: ${to}`);
            }
            return success;
        } catch (error) {
            this.logger.error(`❌ Ошибка отправки письма сброса пароля: ${error.message}`);
            throw error;
        }
    }

    async sendEmailChangeNotification(oldEmail: string, newEmail: string, verificationUrl: string): Promise<void> {
        // 1. Отправляем уведомление на старый email
        const oldEmailHtml = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                <h2>Изменение адреса электронной почты</h2>
                <p>Ваш email в учетной записи был изменен с ${oldEmail} на ${newEmail}.</p>
                <p>Если вы не производили это изменение, пожалуйста, немедленно свяжитесь с нами, ответив на это письмо.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #666; font-size: 14px;">С уважением,<br>Команда поддержки</p>
            </div>
        `;

        // 2. Отправляем письмо с подтверждением на новый email
        const newEmailHtml = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                <h2>Подтверждение нового адреса электронной почты</h2>
                <p>Ваш email в учетной записи был изменен с ${oldEmail} на ${newEmail}.</p>
                <p>Пожалуйста, подтвердите новый адрес электронной почты, перейдя по ссылке ниже:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" 
                       style="background-color: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Подтвердить новый email
                    </a>
                </div>
                <p>Ссылка действительна в течение 24 часов.</p>
                <p>Если вы не производили это изменение, пожалуйста, проигнорируйте это письмо.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #666; font-size: 14px;">С уважением,<br>Команда поддержки</p>
            </div>
        `;

        try {
            // Отправляем оба письма
            await this.sendEmail(oldEmail, 'Ваш email был изменен', oldEmailHtml);
            this.logger.log(`📧 Отправлено уведомление на старый email: ${oldEmail}`);

            await this.sendEmail(newEmail, 'Подтверждение нового email', newEmailHtml);
            this.logger.log(`📧 Отправлено подтверждение на новый email: ${newEmail}`);
        } catch (error) {
            this.logger.error(`❌ Ошибка при отправке уведомлений об изменении email: ${error.message}`);
            throw error;
        }
    }

    async sendResetPasswordCode(to: string, code: string, name?: string): Promise<void> {
        const userName = name || 'пользователь';

        const html = `
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
        `;

        try {
            await this.sendEmail(to, 'Код восстановления пароля', html);
            this.logger.log(`📧 Код восстановления отправлен на: ${to}`);
        } catch (error) {
            this.logger.error(`❌ Ошибка отправки кода: ${error.message}`);
            throw error;
        }
    }

    /**
     * Отправка уведомления об одобрении/отклонении заявки преподавателя
     */
    async sendTeacherApprovalNotification(
        to: string,
        teacherName: string,
        status: 'approved' | 'rejected',
        rejectionReason?: string
    ): Promise<void> {
        const subject = status === 'approved'
            ? 'Ваша заявка на преподавание одобрена!'
            : 'Ваша заявка на преподавание отклонена';

        const htmlContent = status === 'approved'
            ? this.getApprovedTeacherTemplate(teacherName)
            : this.getRejectedTeacherTemplate(teacherName, rejectionReason);

        try {
            await this.sendEmail(to, subject, htmlContent);
            this.logger.log(`📧 Уведомление об ${status} заявки отправлено: ${to}`);
        } catch (error) {
            this.logger.error(`❌ Ошибка отправки уведомления: ${error.message}`);
            throw error;
        }
    }

    /**
     * Отправка уведомления о блокировке/разблокировке преподавателя
     */
    async sendBlockNotification(
        to: string,
        teacherName: string,
        isBlocked: boolean,
        reason?: string
    ): Promise<void> {
        const subject = isBlocked
            ? 'Ваш аккаунт преподавателя заблокирован'
            : 'Ваш аккаунт преподавателя разблокирован';

        const htmlContent = isBlocked
            ? this.getBlockedTeacherTemplate(teacherName, reason)
            : this.getUnblockedTeacherTemplate(teacherName);

        try {
            await this.sendEmail(to, subject, htmlContent);
            this.logger.log(`📧 Уведомление о ${isBlocked ? 'блокировке' : 'разблокировке'} отправлено: ${to}`);
        } catch (error) {
            this.logger.error(`❌ Ошибка отправки уведомления: ${error.message}`);
            throw error;
        }
    }

    // ... остальные методы подписок остаются без изменений

    /**
     * Шаблоны писем
     */
    private getApprovedTeacherTemplate(teacherName: string): string {
        return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">🎉 Поздравляем!</h1>
            </div>
            <div style="padding: 30px;">
                <h2 style="color: #333;">Здравствуйте, ${teacherName}!</h2>
                <p>Отличные новости! Ваша заявка на преподавание была <strong>одобрена</strong> нашей командой.</p>
                
                <div style="background-color: #e8f5e8; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0;">
                    <h3 style="color: #2e7d32; margin-top: 0;">Что дальше?</h3>
                    <ul style="color: #2e7d32;">
                        <li>Теперь вы можете создавать курсы в личном кабинете</li>
                        <li>Добавляйте уроки и материалы к своим курсам</li>
                        <li>Управляйте домашними заданиями студентов</li>
                        <li>Отслеживайте прогресс обучения</li>
                    </ul>
                </div>

                <p>Мы рады приветствовать вас в нашей команде преподавателей!</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.APP_URL}/teacher/dashboard" 
                       style="background-color: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Перейти в личный кабинет
                    </a>
                </div>

                <p>Если у вас есть вопросы, не стесняйтесь обращаться к нам.</p>
            </div>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #666;">
                <p>С уважением,<br>Команда образовательной платформы</p>
            </div>
        </div>
        `;
    }

    private getRejectedTeacherTemplate(teacherName: string, reason?: string): string {
        return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f44336; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">Заявка отклонена</h1>
            </div>
            <div style="padding: 30px;">
                <h2 style="color: #333;">Здравствуйте, ${teacherName}!</h2>
                <p>К сожалению, ваша заявка на преподавание была отклонена.</p>
                
                ${reason ? `
                <div style="background-color: #ffebee; padding: 20px; border-left: 4px solid #f44336; margin: 20px 0;">
                    <h3 style="color: #c62828; margin-top: 0;">Причина отклонения:</h3>
                    <p style="color: #c62828; margin-bottom: 0;">${reason}</p>
                </div>
                ` : ''}

                <div style="background-color: #e3f2fd; padding: 20px; border-left: 4px solid #2196F3; margin: 20px 0;">
                    <h3 style="color: #1565c0; margin-top: 0;">Что можно сделать?</h3>
                    <ul style="color: #1565c0;">
                        <li>Изучите требования к преподавателям на нашем сайте</li>
                        <li>Улучшите свой профиль и опыт работы</li>
                        <li>Подайте заявку повторно через некоторое время</li>
                        <li>Обратитесь к нам за дополнительной информацией</li>
                    </ul>
                </div>

                <p>Не расстраивайтесь! Вы всегда можете улучшить свою заявку и попробовать снова.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.APP_URL}/teacher/requirements" 
                       style="background-color: #2196F3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Узнать требования
                    </a>
                </div>
            </div>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #666;">
                <p>С уважением,<br>Команда образовательной платформы</p>
            </div>
        </div>
        `;
    }

    private getBlockedTeacherTemplate(teacherName: string, reason?: string): string {
        return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #ff9800; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">⚠️ Аккаунт заблокирован</h1>
            </div>
            <div style="padding: 30px;">
                <h2 style="color: #333;">Здравствуйте, ${teacherName}!</h2>
                <p>Мы вынуждены сообщить, что ваш аккаунт преподавателя был временно заблокирован.</p>
                
                ${reason ? `
                <div style="background-color: #fff3e0; padding: 20px; border-left: 4px solid #ff9800; margin: 20px 0;">
                    <h3 style="color: #ef6c00; margin-top: 0;">Причина блокировки:</h3>
                    <p style="color: #ef6c00; margin-bottom: 0;">${reason}</p>
                </div>
                ` : ''}

                <div style="background-color: #e8f5e8; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0;">
                    <h3 style="color: #2e7d32; margin-top: 0;">Как разблокировать аккаунт?</h3>
                    <ul style="color: #2e7d32;">
                        <li>Свяжитесь с нашей службой поддержки</li>
                        <li>Предоставьте объяснения по ситуации</li>
                        <li>Дождитесь рассмотрения вашего обращения</li>
                    </ul>
                </div>

                <p>Мы всегда готовы к диалогу и рассмотрению спорных ситуаций.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="mailto:${process.env.EMAIL_FROM}" 
                       style="background-color: #ff9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Связаться с поддержкой
                    </a>
                </div>
            </div>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #666;">
                <p>С уважением,<br>Команда образовательной платформы</p>
            </div>
        </div>
        `;
    }

    private getUnblockedTeacherTemplate(teacherName: string): string {
        return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">✅ Аккаунт разблокирован</h1>
            </div>
            <div style="padding: 30px;">
                <h2 style="color: #333;">Здравствуйте, ${teacherName}!</h2>
                <p>Хорошие новости! Ваш аккаунт преподавателя был разблокирован.</p>
                
                <div style="background-color: #e8f5e8; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0;">
                    <h3 style="color: #2e7d32; margin-top: 0;">Теперь вы можете:</h3>
                    <ul style="color: #2e7d32;">
                        <li>Войти в свой личный кабинет</li>
                        <li>Продолжить ведение курсов</li>
                        <li>Взаимодействовать со студентами</li>
                        <li>Создавать новые курсы</li>
                    </ul>
                </div>

                <p>Спасибо за понимание и соблюдение правил нашей платформы.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.APP_URL}/teacher/dashboard" 
                       style="background-color: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Войти в личный кабинет
                    </a>
                </div>
            </div>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; color: #666;">
                <p>С уважением,<br>Команда образовательной платформы</p>
            </div>
        </div>
        `;
    }

    // Добавляем остальные методы подписок...
    async sendSubscriptionCancellationNotification(to: string, userName: string, reason: string, immediate: boolean): Promise<void> {
        const subject = 'Ваша подписка отменена';
        const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Подписка отменена</h2>
                <p>Здравствуйте, ${userName}!</p>
                <p>Ваша подписка была отменена${immediate ? ' немедленно' : ' и будет действовать до окончания периода'}.</p>
                <p><strong>Причина отмены:</strong> ${reason}</p>
                <p>Если у вас есть вопросы, обратитесь в службу поддержки.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #666; font-size: 14px;">С уважением,<br>Команда Education Platform</p>
            </div>
        `;
        try {
            await this.sendEmail(to, subject, html);
            this.logger.log(`📧 Уведомление об отмене подписки отправлено: ${to}`);
        } catch (error) {
            this.logger.error(`❌ Ошибка отправки уведомления об отмене: ${error.message}`);
            throw error;
        }
    }

    async sendSubscriptionActivationNotification(to: string, userName: string): Promise<void> {
        const subject = 'Ваша подписка активирована!';
        const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4CAF50;">Подписка активирована!</h2>
                <p>Здравствуйте, ${userName}!</p>
                <p>Ваша подписка была успешно активирована после получения оплаты.</p>
                <p>Теперь вы можете пользоваться всеми преимуществами вашей подписки.</p>
                <p>Спасибо за доверие!</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #666; font-size: 14px;">С уважением,<br>Команда Education Platform</p>
            </div>
        `;
        try {
            await this.sendEmail(to, subject, html);
            this.logger.log(`📧 Уведомление об активации подписки отправлено: ${to}`);
        } catch (error) {
            this.logger.error(`❌ Ошибка отправки уведомления об активации: ${error.message}`);
            throw error;
        }
    }

    async sendSubscriptionExpirationNotification(to: string, userName: string): Promise<void> {
        const subject = 'Ваша подписка истекла';
        const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ff9800;">Подписка истекла</h2>
                <p>Здравствуйте, ${userName}!</p>
                <p>Ваша подписка истекла.</p>
                <p>Чтобы продолжить пользоваться нашими услугами, пожалуйста, продлите подписку.</p>
                <p>Спасибо за то, что были с нами!</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #666; font-size: 14px;">С уважением,<br>Команда Education Platform</p>
            </div>
        `;
        try {
            await this.sendEmail(to, subject, html);
            this.logger.log(`📧 Уведомление об истечении подписки отправлено: ${to}`);
        } catch (error) {
            this.logger.error(`❌ Ошибка отправки уведомления об истечении: ${error.message}`);
            throw error;
        }
    }

    async sendSubscriptionExpiringNotification(to: string, userName: string, expirationDate: Date): Promise<void> {
        const subject = 'Ваша подписка скоро истечет';
        const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ff9800;">Подписка скоро истечет</h2>
                <p>Здравствуйте, ${userName}!</p>
                <p>Ваша подписка истекает ${expirationDate.toLocaleDateString()}.</p>
                <p>Не забудьте продлить подписку, чтобы продолжить пользоваться нашими услугами.</p>
                <p>Спасибо!</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #666; font-size: 14px;">С уважением,<br>Команда Education Platform</p>
            </div>
        `;
        try {
            await this.sendEmail(to, subject, html);
            this.logger.log(`📧 Уведомление о скором истечении подписки отправлено: ${to}`);
        } catch (error) {
            this.logger.error(`❌ Ошибка отправки уведомления о скором истечении: ${error.message}`);
            throw error;
        }
    }
}