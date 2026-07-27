import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { AppGrpcModule } from "./grpc/grpc-app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { join } from "path";

const logger = new Logger('Bootstrap');

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
  logger.log("gRPC server listening on 0.0.0.0:50051");
}

bootstrap();
