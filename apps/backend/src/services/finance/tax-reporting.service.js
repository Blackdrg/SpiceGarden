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
exports.TaxReportingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let TaxReportingService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TaxReportingService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TaxReportingService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        orderRepo;
        gstDetailRepo;
        restaurantRepo;
        restaurantGstRepo;
        orderItemRepo;
        dataSource;
        logger = new common_1.Logger(TaxReportingService.name);
        constructor(orderRepo, gstDetailRepo, restaurantRepo, restaurantGstRepo, orderItemRepo, dataSource) {
            this.orderRepo = orderRepo;
            this.gstDetailRepo = gstDetailRepo;
            this.restaurantRepo = restaurantRepo;
            this.restaurantGstRepo = restaurantGstRepo;
            this.orderItemRepo = orderItemRepo;
            this.dataSource = dataSource;
        }
        async generateGSTReport(restaurantId, month, year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            const orders = await this.orderRepo.find({
                where: {
                    restaurantId: restaurantId,
                    createdAt: (0, typeorm_1.Between)(startDate, endDate),
                },
                relations: ['gstDetail', 'items', 'items.menuItem'],
            });
            const gstDetails = orders
                .filter(o => o.gstDetail)
                .map(o => o.gstDetail);
            const summary = {
                period: { month, year },
                totalTaxableValue: gstDetails.reduce((sum, g) => sum + Number(g.taxableValue), 0),
                totalCGST: gstDetails.reduce((sum, g) => sum + Number(g.cgstAmount), 0),
                totalSGST: gstDetails.reduce((sum, g) => sum + Number(g.sgstAmount), 0),
                totalIGST: gstDetails.reduce((sum, g) => sum + Number(g.igstAmount), 0),
                totalGST: gstDetails.reduce((sum, g) => sum + Number(g.totalGstAmount), 0),
                totalInvoices: orders.length,
                hsnWise: await this.getHSNBreakdown(orders),
            };
            return {
                summary,
                invoices: orders.map(o => ({
                    invoiceNumber: `INV-${o.id}`,
                    date: o.createdAt,
                    orderNumber: o.orderNumber,
                    taxableValue: o.gstDetail?.taxableValue || 0,
                    cgstAmount: o.gstDetail?.cgstAmount || 0,
                    sgstAmount: o.gstDetail?.sgstAmount || 0,
                    igstAmount: o.gstDetail?.igstAmount || 0,
                    totalGST: o.gstDetail?.totalGstAmount || 0,
                })),
            };
        }
        async getHSNBreakdown(orders) {
            const hsnMap = new Map();
            for (const order of orders) {
                if (!order.gstDetail)
                    continue;
                for (const item of order.items) {
                    const hsnCode = item.hsnSac?.hsnCode || 'NOT_SPECIFIED';
                    const existing = hsnMap.get(hsnCode) || {
                        hsnCode,
                        taxableValue: 0,
                        cgst: 0,
                        sgst: 0,
                        igst: 0,
                        total: 0,
                        quantity: 0,
                    };
                    existing.taxableValue += Number(item.totalPrice);
                    existing.cgst += Number(item.cgstAmount || 0);
                    existing.sgst += Number(item.sgstAmount || 0);
                    existing.igst += Number(item.igstAmount || 0);
                    existing.total += Number(item.totalTax || 0);
                    existing.quantity += item.quantity;
                    hsnMap.set(hsnCode, existing);
                }
            }
            return Array.from(hsnMap.values());
        }
        async exportGSTR1(restaurantId, month, year) {
            const report = await this.generateGSTReport(restaurantId, month, year);
            return report.invoices.map((inv) => ({
                'Invoice Number': inv.invoiceNumber,
                'Invoice Date': inv.date,
                'Customer Name': 'Customer',
                'Customer GSTIN': '',
                'Taxable Value': inv.taxableValue,
                'CGST Rate': inv.cgstAmount ? 9 : 0,
                'CGST Amount': inv.cgstAmount,
                'SGST Rate': inv.sgstAmount ? 9 : 0,
                'SGST Amount': inv.sgstAmount,
                'IGST Rate': inv.igstAmount ? 18 : 0,
                'IGST Amount': inv.igstAmount,
                'Total Tax': inv.totalGST,
            }));
        }
        async getTaxLiability(reportingMonth) {
            const month = reportingMonth.getMonth() + 1;
            const year = reportingMonth.getFullYear();
            const orders = await this.orderRepo.find({
                where: { createdAt: (0, typeorm_1.Between)(new Date(year, month - 1, 1), new Date(year, month, 0)) },
                relations: ['gstDetail'],
            });
            const totalGST = orders.reduce((sum, o) => sum + Number(o.tax || 0), 0);
            const taxReceivable = totalGST;
            const taxPayable = totalGST; // In real scenario, this would include input credits
            return {
                reportingPeriod: { month, year },
                taxReceivable,
                taxPayable,
                netLiability: taxPayable - taxReceivable,
                ordersCount: orders.length,
            };
        }
        async getMonthlyTaxSummary(restaurantId, months = 12) {
            const summaries = [];
            const now = new Date();
            for (let i = 0; i < months; i++) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                summaries.push(await this.generateGSTReport(restaurantId, date.getMonth() + 1, date.getFullYear()));
            }
            return summaries;
        }
    };
    return TaxReportingService = _classThis;
})();
exports.TaxReportingService = TaxReportingService;
