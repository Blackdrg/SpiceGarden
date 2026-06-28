import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const clientId = configService.get<string>('GOOGLE_CLIENT_ID') || 'development-client-id';
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET') || 'development-client-secret';
    
    super({
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3001/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any, done: any) {
    const { emails, displayName, photos, id } = profile;
    const user = {
      email: emails?.[0]?.value,
      fullName: displayName,
      profileImage: photos?.[0]?.value,
      socialId: id,
      socialProvider: 'google',
    };
    done(null, user);
  }
}