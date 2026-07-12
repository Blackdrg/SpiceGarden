import "reflect-metadata";
import * as path from "path";
import * as dotenv from "dotenv";
import { DataSource } from "typeorm";
import { entities } from "./entities.index";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const migrationGlobs = [
  path.join(__dirname, "migrations", "*.js"),
  path.join(__dirname, "migrations", "*.ts"),
];

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "spicegarden",
  password: process.env.DB_PASS || "spicegarden_dev",
  database: process.env.DB_NAME || "spicegarden",
  entities,
  migrations: migrationGlobs,
  synchronize: false,
  migrationsRun: true,
  poolSize: parseInt(process.env.DB_POOL_SIZE || "20"),
  connectTimeoutMS: 5000,
  keepAlive: true,
} as any);
