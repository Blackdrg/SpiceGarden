declare module 'passport-facebook' {
  import { Strategy as PassportStrategy } from 'passport';

  export interface FacebookProfile {
    id: string;
    displayName?: string;
    name?: { familyName?: string; givenName?: string; middleName?: string };
    emails?: Array<{ value: string; type?: string }>;
    photos?: Array<{ value: string }>;
  }

  export class Strategy extends PassportStrategy {
    constructor(options: Record<string, any>, verify: (accessToken: string, refreshToken: string, profile: FacebookProfile, done: (error: any, user?: any, info?: any) => void) => void);
    constructor(verify: (accessToken: string, refreshToken: string, profile: FacebookProfile, done: (error: any, user?: any, info?: any) => void) => void);
  }
}
