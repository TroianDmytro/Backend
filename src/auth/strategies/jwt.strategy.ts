// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Используем единый источник секрета из конфигурации, чтобы избежать несовпадения
      secretOrKey: configService.get<string>('jwt.secret') || process.env.JWT_SECRET || 'cd2c18d6c7f64a37a1a404c4d4c5a75ee76ec2b13949e3a67e1e0e1a3cf6a8db',
    });
  }

  async validate(payload: any) {
    // Пытаемся найти пользователя по email из токена
    let user = await this.usersService.findOne(payload.email);

    // Если не найден по email, пытаемся найти по логину (для совместимости)
    if (!user && payload.login) {
      user = await this.usersService.findByLogin(payload.login);
    }

    if (!user) {
      return {
        userId: payload.sub,
        email: payload.email,
        login: payload.login || null,
        isEmailVerified: false,
        roles: []
      };
    }

    // Роли из БД
    let roles = user.roles?.map(role =>
      typeof role === 'object' ? (role as any).name : role
    ) || (user.role ? [user.role] : []);

    // Fallback: если в БД нет ролей, используем те, что пришли в токене (payload.roles)
    if ((!roles || roles.length === 0) && Array.isArray(payload.roles)) {
      roles = payload.roles;
    }

    return {
      userId: payload.sub,
      email: payload.email,
      login: user.login,
      name: user.name,
      second_name: user.second_name,
  age: (user as any).age,
  telefon_number: (user as any).telefon_number,
      isEmailVerified: user.isEmailVerified,
      roles: roles
    };
  }
}