import { MfaService } from './mfa.service';
import { AuthenticatedUser } from './auth.service';
interface AuthenticatedRequest extends Request {
    user: AuthenticatedUser;
}
export declare class MfaController {
    private readonly mfaService;
    constructor(mfaService: MfaService);
    setup(req: AuthenticatedRequest): Promise<{
        otpAuthUrl: string;
        qrCodeDataUrl: string;
    }>;
    enable(req: AuthenticatedRequest, body: {
        code: string;
    }): Promise<{
        enabled: boolean;
    }>;
    disable(req: AuthenticatedRequest, body: {
        code: string;
    }): Promise<{
        disabled: true;
    }>;
}
export {};
