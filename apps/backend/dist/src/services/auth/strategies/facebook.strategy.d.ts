import { ConfigService } from '@nestjs/config';
declare const FacebookStrategy_base: any;
export declare class FacebookStrategy extends FacebookStrategy_base {
    private configService;
    constructor(configService: ConfigService);
    validate(_accessToken: string, _refreshToken: string, profile: any, done: any): Promise<void>;
}
export {};
