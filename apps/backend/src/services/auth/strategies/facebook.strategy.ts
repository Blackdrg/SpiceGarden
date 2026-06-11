import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID'),
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET'),
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL'),
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