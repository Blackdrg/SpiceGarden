import { ConfigService } from '@nestjs/config';
import { UserRole, UserStatus } from '../../../shared/domain/user.interface';
interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
    status: UserStatus;
}
interface JwtUser {
    id: string;
    email: string;
    role: UserRole;
    status: UserStatus;
}
declare const JwtStrategy_base: new (...args: unknown[]) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    constructor(configService: ConfigService);
    validate(payload: JwtPayload): Promise<JwtUser>;
}
export {};
