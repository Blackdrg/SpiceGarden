"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("../../../../../../../../../reflect-metadata");
const typeorm_1 = require("typeorm");
const entities_index_1 = require("./entities.index");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "spicegarden",
    password: process.env.DB_PASS || "spicegarden_dev",
    database: process.env.DB_NAME || "spicegarden",
    entities: entities_index_1.entities,
    migrations: ["src/db/migrations/*.ts"],
    synchronize: false,
    migrationsRun: true,
    poolSize: parseInt(process.env.DB_POOL_SIZE || "20"),
    connectTimeoutMS: 5000,
    keepAlive: true,
});
