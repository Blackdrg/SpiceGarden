import { NestFactory } from "@nestjs/core";
import { AppGrpcModule } from "./grpc/grpc-app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppGrpcModule, {
    transport: Transport.GRPC,
    options: {
      package: "spicegarden",
      protoPath: [join(__dirname, "../proto/auth/auth.proto")],
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
