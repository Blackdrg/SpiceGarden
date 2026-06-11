"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const grpc_app_module_1 = require("./grpc/grpc-app.module");
const microservices_1 = require("@nestjs/microservices");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(grpc_app_module_1.AppGrpcModule, {
        transport: microservices_1.Transport.GRPC,
        options: {
            package: "spicegarden",
            protoPath: [(0, path_1.join)(__dirname, "../proto/auth/auth.proto")],
            url: "0.0.0.0:50051",
            loader: {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
            },
        },
    });
    await app.listen();
    console.log("gRPC server listening on 0.0.0.0:50051");
}
bootstrap();
//# sourceMappingURL=main-grpc.js.map