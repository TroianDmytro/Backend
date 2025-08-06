// src/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {

    private readonly logger = new Logger(EmailService.name);
    private transporter: nodemailer.Transporter;
    private emailHost;
    private emailPort;
    private emailSecureBoolean;
    private emailUser;
    private emailPassword;
    private app_url;
    constructor(private configService: ConfigService) {
        this.createTransporter();
        this.app_url = this.configService.get<string>('app.url');
    }

    private createTransporter() {
        try {

            this.emailHost = this.configService.get<string>('email.host');
            this.emailPort = this.configService.get<string>('email.port');
            this.emailUser = this.configService.get<string>('email.user');
            this.emailPassword = this.configService.get<string>('email.password');
            this.emailSecureBoolean = this.configService.get<string>('email.secure') === 'true';

            // Детальное логирование для диагностики
            this.logger.log(`🔧 Настройка SMTP: ${this.emailHost}:${this.emailPort}`);
            this.logger.log(`📧 Email пользователь: ${this.emailUser ? 'ОК' : 'НЕТ'}`);
            this.logger.log(`🔑 Email пароль: ${this.emailPassword ? 'ОК' : 'НЕТ'}`);
            this.logger.log(`🔒 Secure: ${this.emailSecureBoolean}`);

            if (!this.emailHost || !this.emailPort || !this.emailUser || !this.emailPassword) {
                this.logger.warn('⚠️  Не все email переменные окружения настроены');
                this.logger.warn(`HOST: ${this.emailHost ? '✅' : '❌'}, PORT: ${this.emailPort ? '✅' : '❌'}, USER: ${this.emailUser ? '✅' : '❌'}, PASS: ${this.emailPassword ? '✅' : '❌'}`);
                return;
            }

            this.transporter = nodemailer.createTransport({
                host: this.emailHost,
                port: parseInt(this.emailPort),
                secure: this.emailSecureBoolean, // true для 465, false для других портов
                auth: {
                    user: this.emailUser,
                    pass: this.emailPassword,
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
     * Отправка 6-значного кода подтверждения на email
     */
    async sendVerificationCode(email: string, code: string): Promise<void> {
        const subject = 'Код подтверждения регистрации';
        const html = `
            <h2>Добро пожаловать на нашу образовательную платформу!</h2>
            <p>Вы начали процесс регистрации на нашей платформе.</p>
            <p>Ваш код подтверждения:</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h1 style="font-family: monospace; font-size: 36px; color: #007bff; letter-spacing: 5px; margin: 0;">
                    ${code}
                </h1>
            </div>
            <p>Введите этот код на странице регистрации для продолжения.</p>
            <p><strong>Код действителен в течение 15 минут.</strong></p>
            <p>Если вы не регистрировались на нашей платформе, просто проигнорируйте это письмо.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
                Это автоматическое письмо, не отвечайте на него.
            </p>
        `;

        await this.sendEmail(email, subject, html);
    }

    /**
     * Отправка логина и пароля после успешной регистрации
     */
    async sendLoginCredentials(email: string, login: string, password: string, name?: string): Promise<void> {
        const subject = 'Ваши учетные данные для входа';
        const html = `
            <h2>Регистрация завершена успешно!</h2>
            <p>Здравствуйте${name ? `, ${name}` : ''}!</p>
            <p>Ваша регистрация на образовательной платформе завершена.</p>
            
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #28a745;">Ваши учетные данные:</h3>
                <p style="margin: 10px 0;"><strong>Логин:</strong> 
                    <span style="font-family: monospace; background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 16px;">
                        ${login}
                    </span>
                </p>
                <p style="margin: 10px 0;"><strong>Пароль:</strong> 
                    <span style="font-family: monospace; background-color: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 16px;">
                        ${password}
                    </span>
                </p>
            </div>

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #856404;">🔒 Важные рекомендации по безопасности:</h4>
                <ul style="color: #856404; margin: 10px 0 0 20px;">
                    <li>Сохраните эти данные в надежном месте</li>
                    <li>Не передавайте пароль третьим лицам</li>
                    <li>Рекомендуем изменить пароль после первого входа</li>
                    <li>Пароль содержит: заглавные буквы, цифры и специальные символы</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${this.app_url || 'http://localhost:3000'}/login" 
                   style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Войти в систему
                </a>
            </div>

            <p>Теперь вы можете войти в систему, используя указанные выше учетные данные.</p>
            <p>Добро пожаловать в нашу образовательную платформу! 🎓</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
                Это автоматическое письмо, не отвечайте на него.<br>
                Если у вас возникли проблемы со входом, обратитесь в службу поддержки.
            </p>
        `;

        await this.sendEmail(email, subject, html);
    }

    /**
     * Отправка письма подтверждения email (старый метод для обратной совместимости)
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
     * Отправка кода сброса пароля (синоним для совместимости)
     */
    async sendResetPasswordCode(email: string, resetCode: string, name?: string): Promise<void> {
        return this.sendPasswordResetCode(email, resetCode, name);
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
 * Приветственное письмо для пользователей, зарегистрированных через Google
 */
    async sendWelcomeEmailForGoogleUser(email: string, name?: string): Promise<void> {
        const subject = 'Добро пожаловать! Регистрация через Google';
        const html = `
        <h2>Добро пожаловать на образовательную платформу!</h2>
        <p>Здравствуйте${name ? `, ${name}` : ''}!</p>
        
        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #28a745;">🎉 Регистрация завершена успешно!</h3>
            <p>Вы успешно зарегистрировались на нашей платформе используя свой Google аккаунт.</p>
        </div>

        <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #155724;">✅ Преимущества авторизации через Google:</h4>
            <ul style="color: #155724; margin: 10px 0 0 20px;">
                <li>Быстрый и безопасный вход без запоминания паролей</li>
                <li>Автоматическая синхронизация профиля</li>
                <li>Ваш email уже подтвержден</li>
                <li>Безопасность на уровне Google</li>
            </ul>
        </div>

        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #856404;">📚 Что дальше?</h4>
            <ul style="color: #856404; margin: 10px 0 0 20px;">
                <li>Изучите доступные курсы</li>
                <li>Заполните свой профиль</li>
                <li>Начните обучение</li>
                <li>При необходимости можете установить дополнительный пароль в настройках</li>
            </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${this.app_url || 'https://neuronest.pp.ua'}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Перейти к обучению
            </a>
        </div>

        <p style="margin-top: 30px;">
            <strong>Важно:</strong> Для входа в систему в дальнейшем используйте кнопку "Войти через Google" 
            или можете установить обычный пароль в настройках профиля.
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
            Это автоматическое письмо, не отвечайте на него.<br>
            Если у вас возникли вопросы, обратитесь в службу поддержки.
        </p>
    `;

        await this.sendEmail(email, subject, html);
    }

    // Базовый метод отправки email (если не существует)
    private async sendEmail(to: string, subject: string, html: string): Promise<void> {
        try {
            if (!this.transporter) {
                console.warn('SMTP транспорт не настроен. Письмо не отправлено.');
                console.debug(`TO: ${to}, SUBJECT: ${subject}`);
                return;
            }

            const info = await this.transporter.sendMail({
                from: `"Образовательная платформа" <${this.emailUser}>`,
                to,
                subject,
                html
            });

            console.log(`Email отправлен: ${info.messageId} -> ${to}`);
        } catch (error) {
            console.error(`Ошибка отправки email: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Уведомление о связывании Google аккаунта с существующим профилем
     */
    async sendGoogleAccountLinkedNotification(email: string, name?: string): Promise<void> {
        const subject = 'Google аккаунт успешно привязан';
        const html = `
        <h2>Google аккаунт привязан к вашему профилю</h2>
        <p>Здравствуйте${name ? `, ${name}` : ''}!</p>
        
        <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #28a745;">🔗 Связывание выполнено успешно!</h3>
            <p>Ваш Google аккаунт теперь привязан к профилю на нашей платформе.</p>
        </div>

        <p><strong>Теперь вы можете:</strong></p>
        <ul>
            <li>Входить в систему через Google одним кликом</li>
            <li>Использовать как Google авторизацию, так и обычный пароль</li>
            <li>Синхронизировать данные профиля с Google</li>
        </ul>

        <p><strong>Безопасность:</strong> Если это были не вы, немедленно обратитесь в службу поддержки 
        и измените пароль вашего аккаунта.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
            Это автоматическое письмо, не отвечайте на него.
        </p>
    `;

        await this.sendEmail(email, subject, html);
    }

    /**
     * Уведомление об отвязке Google аккаунта
     */
    async sendGoogleAccountUnlinkedNotification(email: string, name?: string): Promise<void> {
        const subject = 'Google аккаунт отвязан от профиля';
        const html = `
        <h2>Google аккаунт отвязан</h2>
        <p>Здравствуйте${name ? `, ${name}` : ''}!</p>
        
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #856404;">🔓 Google аккаунт отвязан</h3>
            <p>Ваш Google аккаунт больше не привязан к профилю на нашей платформе.</p>
        </div>

        <p><strong>Что изменилось:</strong></p>
        <ul>
            <li>Вход через Google больше недоступен</li>
            <li>Для входа используйте email и пароль</li>
            <li>Все ваши курсы и прогресс сохранены</li>
        </ul>

        <p><strong>Безопасность:</strong> Если это были не вы, немедленно обратитесь в службу поддержки.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
            Это автоматическое письмо, не отвечайте на него.
        </p>
    `;

        await this.sendEmail(email, subject, html);
    }

}