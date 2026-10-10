import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type * as jwt from 'jsonwebtoken';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { NotificationModule } from '../notifications/notification.module';
import { getRequiredSecret } from '../../common/errors/missing-env.error';

function requireJwtSecret(configService: ConfigService): string {
  return getRequiredSecret(configService, 'JWT_SECRET');
}

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    NotificationModule,
    DbRepositoriesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = requireJwtSecret(configService);
        const expiresIn = (configService.get<string>('JWT_EXPIRES_IN') || '60m') as jwt.SignOptions['expiresIn'];
        return {
          secret,
          signOptions: { expiresIn },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, PasswordResetService, JwtStrategy, GoogleStrategy, FacebookStrategy],
  controllers: [AuthController],
  exports: [AuthService, PasswordResetService],
})
export class AuthServiceModule {}