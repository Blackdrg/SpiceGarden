import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { AuthService } from "../services/auth/auth.service";
import { AuthenticatedUser } from "../services/auth/auth.service";

@Controller()
export class AuthGrpcController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod("AuthService", "Login")
  async login(data: { email: string; password: string }) {
    const user = await this.authService.validateUser(data.email, data.password);
    const tokens = await this.authService.login(user, { name: 'grpc', type: 'grpc', ip: '0.0.0.0' });
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}
