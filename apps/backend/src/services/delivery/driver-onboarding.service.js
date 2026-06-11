"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverOnboardingService = void 0;
const common_1 = require("@nestjs/common");
const driver_document_entity_1 = require("../../db/entities/driver-document.entity");
let DriverOnboardingService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DriverOnboardingService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DriverOnboardingService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        driverRepo;
        documentRepo;
        userRepo;
        driverAssignmentRepo;
        dataSource;
        logger = new common_1.Logger(DriverOnboardingService.name);
        constructor(driverRepo, documentRepo, userRepo, driverAssignmentRepo, dataSource) {
            this.driverRepo = driverRepo;
            this.documentRepo = documentRepo;
            this.userRepo = userRepo;
            this.driverAssignmentRepo = driverAssignmentRepo;
            this.dataSource = dataSource;
        }
        async startOnboarding(userId, data) {
            let driver = await this.driverRepo.findOne({ where: { userId } });
            if (!driver) {
                driver = this.driverRepo.create({
                    userId,
                    ...data,
                    kycStatus: 'pending',
                });
            }
            else {
                await this.driverRepo.update(driver.id, {
                    ...data,
                    kycStatus: 'pending',
                });
                driver = await this.driverRepo.findOne({ where: { userId } });
            }
            const savedDriver = await this.driverRepo.save(driver);
            await this.createInitialDocuments(savedDriver.id, data);
            return savedDriver;
        }
        async createInitialDocuments(driverId, data) {
            if (data.licenseNumber) {
                await this.documentRepo.save({
                    driverId,
                    documentType: driver_document_entity_1.DocumentType.DRIVING_LICENSE,
                    documentUrl: '',
                    status: driver_document_entity_1.DocumentStatus.PENDING,
                });
            }
            if (data.vehicleNumber) {
                await this.documentRepo.save({
                    driverId,
                    documentType: driver_document_entity_1.DocumentType.VEHICLE_REGISTRATION,
                    documentUrl: '',
                    status: driver_document_entity_1.DocumentStatus.PENDING,
                });
            }
        }
        async uploadDocument(driverId, documentType, documentUrl, expiryDate) {
            const driver = await this.driverRepo.findOne({ where: { id: driverId } });
            if (!driver) {
                throw new common_1.NotFoundException('Driver not found');
            }
            const document = this.documentRepo.create({
                driverId,
                documentType,
                documentUrl,
                status: driver_document_entity_1.DocumentStatus.UPLOADED,
                expiryDate,
            });
            return this.documentRepo.save(document);
        }
        async getDocuments(driverId) {
            return this.documentRepo.find({
                where: { driver: { id: driverId } },
                order: { createdAt: 'DESC' },
            });
        }
        async verifyDocument(documentId, status, notes, verifierId) {
            const document = await this.documentRepo.findOne({ where: { id: documentId } });
            if (!document) {
                throw new common_1.NotFoundException('Document not found');
            }
            await this.documentRepo.update(documentId, {
                status,
                verificationNotes: notes,
                verifiedBy: verifierId,
                verifiedAt: new Date(),
            });
            const driver = await this.driverRepo.findOne({ where: { id: document.driverId } });
            if (driver && status === driver_document_entity_1.DocumentStatus.VERIFIED) {
                const allDocs = await this.documentRepo.find({
                    where: { driverId: document.driverId },
                });
                const requiredDocs = [
                    driver_document_entity_1.DocumentType.DRIVING_LICENSE,
                    driver_document_entity_1.DocumentType.VEHICLE_REGISTRATION,
                ];
                const allRequiredVerified = requiredDocs.every(docType => allDocs.some(d => d.documentType === docType && d.status === driver_document_entity_1.DocumentStatus.VERIFIED));
                if (allRequiredVerified) {
                    await this.driverRepo.update(document.driverId, { kycStatus: 'approved' });
                }
            }
            return this.documentRepo.findOne({ where: { id: documentId } });
        }
        async getOnboardingStatus(driverId) {
            const driver = await this.driverRepo.findOne({ where: { id: driverId } });
            if (!driver) {
                throw new common_1.NotFoundException('Driver not found');
            }
            const documents = await this.documentRepo.find({
                where: { driverId: driverId },
            });
            const requiredDocs = [
                driver_document_entity_1.DocumentType.DRIVING_LICENSE,
                driver_document_entity_1.DocumentType.VEHICLE_REGISTRATION,
                driver_document_entity_1.DocumentType.INSURANCE,
                driver_document_entity_1.DocumentType.ID_PROOF,
            ];
            const documentStatus = requiredDocs.map(docType => ({
                type: docType,
                status: documents.find(d => d.documentType === docType)?.status || driver_document_entity_1.DocumentStatus.PENDING,
            }));
            return {
                kycStatus: driver.kycStatus,
                documents: documentStatus,
                isApproved: driver.kycStatus === 'approved',
            };
        }
        async updateDriverStatus(driverId, isOnline) {
            const driver = await this.driverRepo.findOne({ where: { id: driverId } });
            if (!driver) {
                throw new common_1.NotFoundException('Driver not found');
            }
            if (driver.kycStatus !== 'approved') {
                throw new common_1.BadRequestException('Driver must have approved KYC to go online');
            }
            await this.driverRepo.update(driverId, { isOnline });
        }
    };
    return DriverOnboardingService = _classThis;
})();
exports.DriverOnboardingService = DriverOnboardingService;
