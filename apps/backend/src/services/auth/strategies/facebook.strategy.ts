import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private configService: ConfigService) {
    const appId = configService.get<string>('FACEBOOK_APP_ID') || 'development-app-id';
    const appSecret = configService.get<string>('FACEBOOK_APP_SECRET') || 'development-app-secret';
    const callbackURL = configService.get<string>('FACEBOOK_CALLBACK_URL');

    super({
      clientID: appId,
      clientSecret: appSecret,
      callbackURL: callbackURL || 'http://localhost:3001/auth/facebook/callback',
      profileFields: ['email', 'name', 'picture.type(large)'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any, done: any) {
    const { emails, name, photos, id } = profile;
    const user = {
      email: emails?.[0]?.value,
      fullName: name?.givenName + ' ' + name?.familyName || name?.displayName,
      profileImage: photos?.[0]?.value,
      socialId: id,
      socialProvider: 'facebook',
    };
    done(null, user);
  }
}