import "reflect-metadata";
import { DataSource } from "typeorm";
import { entities } from "./entities.index";

export const AppLocalDataSource = new DataSource({
  type: "sqlite",
  database: process.env.LOCAL_DB_PATH || "./local-dev.sqlite",
  entities,
  synchronize: true,
  logging: process.env.DB_LOGGING === "true",
  migrations: [],
});
