import { ConfigService } from '@nestjs/config';
import { UserRole, UserStatus } from '../../../shared/domain/user.interface';
interface JwtPayload {
    sub: string;
    email: string;
    fullName: string;
    role: UserRole;
    status: UserStatus;
    isMfaEnabled: boolean;
}
interface JwtUser {
    id: string;
    sub: string;
    userId: string;
    email: string;
    fullName: string;
    role: UserRole;
    status: UserStatus;
    isMfaEnabled: boolean;
}
declare const JwtStrategy_base: new (...args: unknown[]) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    constructor(configService: ConfigService);
    validate(payload: JwtPayload): Promise<JwtUser>;
}
export {};
