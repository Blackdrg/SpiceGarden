import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SessionEntity } from '../../db/entities/session.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { SecurityModule } from '../../security/security.module';

@Module({
  imports: [
    PassportModule,
    SecurityModule,
    TypeOrmModule.forFeature([SessionEntity, UserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          if (configService.get<string>('NODE_ENV') === 'production') {
            throw new Error('JWT_SECRET not configured');
          }
          console.warn('JWT_SECRET not configured. Using fallback for development.');
          return { secret: 'dev-secret-change-in-production-please', signOptions: { expiresIn: '60m' } };
        }
        if (secret.includes('CHANGE_ME') || secret.includes('secret_here')) {
          if (configService.get<string>('NODE_ENV') === 'production') {
            throw new Error('JWT_SECRET not properly configured');
          }
          console.warn('JWT_SECRET has placeholder value. Using fallback for development.');
          return { secret: 'dev-secret-change-in-production-please', signOptions: { expiresIn: '60m' } };
        }
        return {
          secret,
          signOptions: { expiresIn: '60m' },
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
