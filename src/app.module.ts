// В файле app.module.ts добавьте логирование:
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { RolesModule } from './roles/roles.module';
import { AvatarsController } from './avatars/avatars.controller';
import { AvatarsModule } from './avatars/avatars.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-api', {
      connectionFactory: (connection) => {
        connection.on('connected', () => {
          console.log('MongoDB успешно подключена');
        });
        connection.on('error', (error) => {
          console.error('Ошибка подключения к MongoDB:', error);
        });
        return connection;
      },
    }),
    RolesModule, // Важно: сначала RolesModule
    UsersModule, // Затем UsersModule
    EmailModule,
    AuthModule,
    AvatarsModule
  ],
  controllers: [AvatarsController],
})
export class AppModule { }

