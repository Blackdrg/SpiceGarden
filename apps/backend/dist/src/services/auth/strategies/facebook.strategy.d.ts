import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-facebook';
declare const FacebookStrategy_base: new (...args: [] | [options: Record<string, any>]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class FacebookStrategy extends FacebookStrategy_base {
    private configService;
    constructor(configService: ConfigService);
    validate(_accessToken: string, _refreshToken: string, profile: any, done: any): Promise<void>;
}
export {};
