import { ConfigService } from '@nestjs/config';
declare const GoogleStrategy_base: any;
export declare class GoogleStrategy extends GoogleStrategy_base {
    private configService;
    constructor(configService: ConfigService);
    validate(_accessToken: string, _refreshToken: string, profile: any, done: any): Promise<void>;
}
export {};
