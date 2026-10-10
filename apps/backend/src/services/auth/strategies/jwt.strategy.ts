import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getRequiredSecret } from '../../../common/errors/missing-env.error';
import { UserRole, UserStatus } from '../../../shared/domain/user.interface';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

interface JwtUser {
  id: string;
  sub: string;
  userId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

function requireJwtSecret(configService: ConfigService): string {
  return getRequiredSecret(configService, 'JWT_SECRET');
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = requireJwtSecret(configService);
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Record<string, Record<string, string | undefined>> | null) => {
          const cookies = req?.cookies;
          return cookies?.access_token ?? null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtUser> {
    return {
      id: payload.sub,
      sub: payload.sub,
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      status: payload.status,
    };
  }
}
