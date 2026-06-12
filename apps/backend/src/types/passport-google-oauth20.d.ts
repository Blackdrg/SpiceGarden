declare module 'passport-google-oauth20' {
  import { Strategy as PassportStrategy } from 'passport';

  export interface GoogleProfile {
    id: string;
    displayName?: string;
    name?: { familyName?: string; givenName?: string; middleName?: string };
    emails?: Array<{ value: string; type?: string }>;
    photos?: Array<{ value: string }>;
  }

  export class Strategy extends PassportStrategy {
    constructor(options: Record<string, any>, verify: (accessToken: string, refreshToken: string, profile: GoogleProfile, done: (error: any, user?: any, info?: any) => void) => void);
    constructor(verify: (accessToken: string, refreshToken: string, profile: GoogleProfile, done: (error: any, user?: any, info?: any) => void) => void);
  }
}
