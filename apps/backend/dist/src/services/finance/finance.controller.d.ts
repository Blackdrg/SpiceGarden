import { TaxReportingService } from './tax-reporting.service';
import { ReconciliationService } from './reconciliation.service';
export declare class FinanceController {
    private taxService;
    private reconciliationService;
    constructor(taxService: TaxReportingService, reconciliationService: ReconciliationService);
    getGSTReport(restaurantId: string, month: string, year: string): unknown;
    reconcilePayments(body: {
        startDate: string;
        endDate: string;
    }): unknown;
    reconcilePayouts(body: {
        restaurantId: string;
        startDate: string;
        endDate: string;
    }): unknown;
    reconcileDriverPayments(body: {
        driverId: string;
        startDate: string;
        endDate: string;
    }): unknown;
    runFullReconciliation(body: {
        startDate: string;
        endDate: string;
    }): unknown;
}
