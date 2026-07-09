import { Controller, Post, Body, Req, UseGuards, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { MfaService } from './mfa.service';
import { AuthenticatedUser } from './auth.service';

interface AuthenticatedRequest extends Request {
    user: AuthenticatedUser;
}

@Controller('mfa')
@UseGuards(JwtAuthGuard)
export class MfaController {
    constructor(private readonly mfaService: MfaService) { }

    /**
     * Generates a new MFA secret and returns it as a QR code data URL.
     * The user must be authenticated to access this endpoint.
     */
    @Post('setup')
    async setup(@Req() req: AuthenticatedRequest) {
        if (!req.user) {
            throw new UnauthorizedException();
        }
        return this.mfaService.generateSecret(req.user);
    }

    /**
     * Verifies the provided TOTP code and enables MFA for the user.
     */
    @Post('enable')
    async enable(@Req() req: AuthenticatedRequest, @Body() body: { code: string }) {
        if (!req.user) {
            throw new UnauthorizedException();
        }
        if (!body.code) {
            throw new BadRequestException('MFA code is required.');
        }

        const isSuccess = await this.mfaService.enableMfa(req.user.id, body.code);
        return { enabled: isSuccess };
    }

    /**
     * Verifies the provided TOTP code and disables MFA for the user.
     */
    @Post('disable')
    async disable(@Req() req: AuthenticatedRequest, @Body() body: { code: string }) {
        if (!req.user) {
            throw new UnauthorizedException();
        }
        if (!body.code) {
            throw new BadRequestException('MFA code is required.');
        }

        const isSuccess = await this.mfaService.disableMfa(req.user.id, body.code);
        if (!isSuccess) throw new UnauthorizedException('Invalid MFA code.');
        return { disabled: isSuccess };
    }
}