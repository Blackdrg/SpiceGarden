import { AuthService } from './auth.service';
import { Repository } from 'typeorm';
import { UserEntity } from '../../db/entities/user.entity';
import { Request } from 'express';
interface LoginBody {
    email: string;
    password: string;
    deviceName?: string;
    deviceType?: string;
}
interface RegisterBody extends LoginBody {
    phone: string;
    fullName: string;
}
interface RefreshBody {
    refresh_token: string;
    deviceName?: string;
    deviceType?: string;
}
export declare class AuthController {
    private authService;
    private readonly userRepo;
    constructor(authService: AuthService, userRepo: Repository<UserEntity>);
    login(body: LoginBody, req: Request): Promise<import("./auth.service").LoginTokenResponse>;
    register(body: RegisterBody, req: Request): Promise<import("./auth.service").LoginTokenResponse>;
    refreshToken(body: RefreshBody, req: Request): Promise<import("./auth.service").LoginTokenResponse>;
    logout(body: RefreshBody): Promise<{
        revoked: boolean;
    }>;
    private getDeviceInfo;
}
export {};
