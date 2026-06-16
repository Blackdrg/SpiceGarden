"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverShiftEntity = exports.DriverShiftStatus = void 0;
const typeorm_1 = require("typeorm");
var DriverShiftStatus;
(function (DriverShiftStatus) {
    DriverShiftStatus["SCHEDULED"] = "scheduled";
    DriverShiftStatus["ACTIVE"] = "active";
    DriverShiftStatus["COMPLETED"] = "completed";
    DriverShiftStatus["CANCELLED"] = "cancelled";
})(DriverShiftStatus || (exports.DriverShiftStatus = DriverShiftStatus = {}));
let DriverShiftEntity = class DriverShiftEntity {
    id;
    driverId;
    startTime;
    endTime;
    status;
    totalEarnings;
    totalDeliveries;
    totalDistance;
    totalHours;
    notes;
    createdAt;
    updatedAt;
};
exports.DriverShiftEntity = DriverShiftEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DriverShiftEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DriverShiftEntity.prototype, "driverId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], DriverShiftEntity.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], DriverShiftEntity.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: DriverShiftStatus, default: DriverShiftStatus.SCHEDULED }),
    __metadata("design:type", String)
], DriverShiftEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DriverShiftEntity.prototype, "totalEarnings", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], DriverShiftEntity.prototype, "totalDeliveries", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], DriverShiftEntity.prototype, "totalDistance", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], DriverShiftEntity.prototype, "totalHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DriverShiftEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], DriverShiftEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], DriverShiftEntity.prototype, "updatedAt", void 0);
exports.DriverShiftEntity = DriverShiftEntity = __decorate([
    (0, typeorm_1.Entity)('driver_shifts')
], DriverShiftEntity);
