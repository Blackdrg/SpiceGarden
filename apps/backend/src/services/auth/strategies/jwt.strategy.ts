import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = requireJwtSecret(configService);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
