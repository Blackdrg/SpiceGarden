"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppLocalDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const entities_index_1 = require("./entities.index");
exports.AppLocalDataSource = new typeorm_1.DataSource({
    type: "sqlite",
    database: process.env.LOCAL_DB_PATH || "./local-dev.sqlite",
    entities: entities_index_1.entities,
    synchronize: true,
    logging: process.env.DB_LOGGING === "true",
    migrations: [],
});
