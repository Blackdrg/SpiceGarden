import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";

@Controller()
export class AuthGrpcController {
  @GrpcMethod("AuthService", "Login")
  async login(data: { email: string; password: string }) {
    return {
      accessToken: "test-token",
      refreshToken: "test-refresh",
      user: { id: "1", email: data.email, role: "customer" },
    };
  }
}
