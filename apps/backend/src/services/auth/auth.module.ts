import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type * as jwt from 'jsonwebtoken';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalRepositoryModule } from '../../db/local-repository.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SessionEntity } from '../../db/entities/session.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { SecurityModule } from '../../security/security.module';

function requireJwtSecret(configService: ConfigService): string {
  const secret = configService.get<string>('JWT_SECRET');
  if (!secret) {
    throw new Error('JWT_SECRET must be configured');
  }
  if (secret.includes('CHANGE_ME') || secret.includes('secret_here') || secret.includes('placeholder')) {
    throw new Error('JWT_SECRET contains a placeholder value');
  }
  return secret;
}

@Module({
  imports: [
    PassportModule,
    SecurityModule,
    LocalRepositoryModule,
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
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthServiceModule {}
