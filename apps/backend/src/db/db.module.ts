import { Module, Global } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import * as crypto from "crypto";
import { ReviewDocument, ReviewSchema } from "./schemas/review.schema";
import { LocalSqliteRepositoryModule } from "./local-sqlite-repository.module";

const entitiesGlob: string[] =
  process.env.LOCAL_DB === "sqlite" || process.env.LOCAL_DB === "sqlite-file"
    ? ["dist/src/**/*.entity.js"]
    : [__dirname + "/../**/*.entity.js"];

const localSqlite = process.env.LOCAL_DB === "sqlite";
const localSqliteFile = process.env.LOCAL_DB === "sqlite-file";

const logger = new Logger('DbModule');

function localReviewModelProvider() {
  const store = new Map<string, any>();
  const all = () => Array.from(store.values());
  const persist = (doc: any) => {
    const id = doc.id || crypto.randomUUID();
    const record = { ...doc, id, save: async () => record };
    store.set(id, record);
    return record;
  };
  return {
    provide: getModelToken(ReviewDocument.name),
    useValue: {
      create: (data: any) => persist({ ...data }),
      new: (data: any) => persist({ ...data }),
      findOne: async (filter: any = {}) => all().find((r) => Object.entries(filter).every(([k, v]) => r[k] === v)) || null,
      find: async (filter: any = {}) =>
        all().filter((r) => Object.entries(filter).every(([k, v]) => r[k] === v)),
      aggregate: async () => [],
    },
  };
}

function createSqliteImports() {
  return [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "sqlite",
        database: configService.get<string>("LOCAL_DB_PATH") || "./local-dev.sqlite",
        entities: entitiesGlob,
        synchronize: true,
        logging: configService.get<string>("DB_LOGGING", "false") === "true",
      }),
      inject: [ConfigService],
    }),
    LocalSqliteRepositoryModule,
  ];
}

const useLocalSqlite = localSqliteFile || localSqlite;

const imports: any[] = useLocalSqlite
  ? createSqliteImports()
  : [
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          type: "postgres",
          host: configService.get<string>("DB_HOST") || "localhost",
          port: configService.get<number>("DB_PORT", 5432),
          username: configService.get<string>("DB_USER") || "spicegarden",
          password: configService.get<string>("DB_PASS") || "spicegarden_dev",
          database: configService.get<string>("DB_NAME") || "spicegarden",
          entities: entitiesGlob,
          synchronize: false,
          migrations: ["dist/db/migrations/*.js", "dist/src/db/migrations/*.js"],
          migrationsRun: true,
          poolSize: configService.get<number>("DB_POOL_SIZE", 20),
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 30000,
          maxQueryExecutionTime: 1000,
          keepAlive: true,
          statementTimeout: 30000,
          logging: configService.get<string>("DB_LOGGING", "false") === "true",
        }),
        inject: [ConfigService],
      }),
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          uri: configService.get<string>("MONGO_URI") || "mongodb://localhost:27017/spicegarden",
          connectionFactory: (connection: any) => {
            connection.on("error", (err: unknown) => {
              logger.error("MongoDB connection error", err instanceof Error ? err.message : String(err));
            });
            connection.on("connected", () => {
              logger.log("MongoDB connected successfully");
            });
            return connection;
          },
        }),
        inject: [ConfigService],
      } as any),
      MongooseModule.forFeature([{ name: ReviewDocument.name, schema: ReviewSchema }]) as any,
    ];

@Global()
@Module({
  imports,
  providers: [
    ...(useLocalSqlite ? [localReviewModelProvider()] : []),
  ],
  exports: useLocalSqlite
    ? [TypeOrmModule, LocalSqliteRepositoryModule, getModelToken(ReviewDocument.name)]
    : [TypeOrmModule, MongooseModule],
})
export class DbModule {}

