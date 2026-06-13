"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchServiceModule = void 0;
const common_1 = require("@nestjs/common");
const local_repository_module_1 = require("../../db/local-repository.module");
const search_service_1 = require("./search.service");
const search_controller_1 = require("./search.controller");
let SearchServiceModule = class SearchServiceModule {
};
exports.SearchServiceModule = SearchServiceModule;
exports.SearchServiceModule = SearchServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [local_repository_module_1.LocalRepositoryModule],
        providers: [search_service_1.SearchService],
        controllers: [search_controller_1.SearchController],
        exports: [search_service_1.SearchService],
    })
], SearchServiceModule);
//# sourceMappingURL=search.module.js.map