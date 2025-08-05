// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'defaultJwtSecretKey',
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

    // Преобразуем роли в массив строк для удобного использования в гвардах
    const roles = user.roles?.map(role =>
      typeof role === 'object' ? role.name : role
    ) || [];

    return {
      userId: payload.sub,
      email: payload.email,
      login: user.login,
      name: user.name,
      second_name: user.second_name,
      age: user.age,
      telefon_number: user.telefon_number,
      isEmailVerified: user.isEmailVerified,
      roles: roles
    };
  }
}