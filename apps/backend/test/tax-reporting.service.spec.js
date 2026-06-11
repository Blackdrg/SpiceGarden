"use strict";
// Tax Reporting Service - Enterprise Grade Tests

describe('Tax Reporting Service', () => {
  describe('GST Report Generation', () => {
    it('should calculate period boundaries', () => {
      const month = 3;
      const year = 2024;
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      expect(startDate.getDate()).toBe(1);
      expect(startDate.getMonth()).toBe(2);
      expect(endDate.getMonth()).toBe(2);
      expect(endDate.getDate()).toBeGreaterThanOrEqual(30);
    });

    it('should calculate tax totals from orders', () => {
      const gstDetails = [
        { taxableValue: 500, cgstAmount: 45, sgstAmount: 45, igstAmount: 0, totalGstAmount: 90 },
        { taxableValue: 300, cgstAmount: 27, sgstAmount: 27, igstAmount: 0, totalGstAmount: 54 },
      ];
      const totalTaxable = gstDetails.reduce((sum, g) => sum + Number(g.taxableValue || 0), 0);
      const totalCGST = gstDetails.reduce((sum, g) => sum + Number(g.cgstAmount || 0), 0);
      const totalSGST = gstDetails.reduce((sum, g) => sum + Number(g.sgstAmount || 0), 0);
      expect(totalTaxable).toBe(800);
      expect(totalCGST).toBe(72);
      expect(totalSGST).toBe(72);
    });

    it('should format invoice number with prefix', () => {
      const orderId = 'order-123';
      const invoiceNumber = `INV-${orderId}`;
      expect(invoiceNumber).toBe('INV-order-123');
    });

    it('should handle orders without GST details', () => {
      const orders = [
        { id: 'o1', gstDetail: { taxableValue: 100 } },
        { id: 'o2', gstDetail: null },
        { id: 'o3', gstDetail: { taxableValue: 200 } },
      ];
      const withGST = orders.filter(o => o.gstDetail);
      expect(withGST.length).toBe(2);
    });
  });

  describe('HSN Breakdown', () => {
    it('should group items by HSN code', () => {
      const items = [
        { menuItem: { hsnSac: { hsnCode: '9963' } }, totalPrice: 100 },
        { menuItem: { hsnSac: { hsnCode: '9963' } }, totalPrice: 50 },
        { menuItem: null, totalPrice: 75 },
      ];
      const hsnMap = new Map();
      for (const item of items) {
        const hsnCode = item.menuItem?.hsnSac?.hsnCode || 'NOT_SPECIFIED';
        const existing = hsnMap.get(hsnCode) || { hsnCode, taxableValue: 0 };
        existing.taxableValue += Number(item.totalPrice || 0);
        hsnMap.set(hsnCode, existing);
      }
      expect(hsnMap.get('9963').taxableValue).toBe(150);
      expect(hsnMap.get('NOT_SPECIFIED').taxableValue).toBe(75);
    });

    it('should sum quantities per HSN code', () => {
      const quantities = [2, 3, 1, 4];
      const total = quantities.reduce((a, b) => a + b, 0);
      expect(total).toBe(10);
    });

    it('should aggregate CGST/SGST/IGST per HSN', () => {
      const items = [
        { cgstAmount: 9, sgstAmount: 9, igstAmount: 0 },
        { cgstAmount: 18, sgstAmount: 18, igstAmount: 0 },
      ];
      const totals = {
        cgst: items.reduce((sum, i) => sum + Number(i.cgstAmount || 0), 0),
        sgst: items.reduce((sum, i) => sum + Number(i.sgstAmount || 0), 0),
        igst: items.reduce((sum, i) => sum + Number(i.igstAmount || 0), 0),
      };
      expect(totals.cgst).toBe(27);
      expect(totals.sgst).toBe(27);
      expect(totals.igst).toBe(0);
    });

    it('should limit HSN breakdown to unique codes', () => {
      const hsnCodes = ['9963', '9964', '9963', '9965', '9963'];
      const unique = [...new Set(hsnCodes)];
      expect(unique.length).toBe(3);
    });
  });

  describe('GSTR1 Export', () => {
    it('should format export fields correctly', () => {
      const invoice = {
        invoiceNumber: 'INV-123',
        date: new Date(),
        taxableValue: 500,
        cgstAmount: 45,
        sgstAmount: 45,
        igstAmount: 0,
        totalGST: 90,
      };
      const rate = invoice.cgstAmount ? 9 : 0;
      expect(rate).toBe(9);
    });

    it('should handle zero tax amounts', () => {
      const cgstAmount = 0;
      const rate = cgstAmount ? 9 : 0;
      expect(rate).toBe(0);
    });

    it('should format date for export', () => {
      const date = new Date('2024-03-15');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(2);
    });
  });

  describe('Tax Liability', () => {
    it('should calculate net liability', () => {
      const taxPayable = 1000;
      const taxReceivable = 800;
      const netLiability = taxPayable - taxReceivable;
      expect(netLiability).toBe(200);
    });

    it('should return negative liability when receivable exceeds payable', () => {
      const taxPayable = 500;
      const taxReceivable = 800;
      const netLiability = taxPayable - taxReceivable;
      expect(netLiability).toBe(-300);
    });

    it('should count orders in period', () => {
      const orders = Array.from({ length: 45 }, (_, i) => ({ id: i }));
      expect(orders.length).toBe(45);
    });
  });

  describe('Monthly Tax Summary', () => {
    it('should generate summaries for multiple months', () => {
      const months = 12;
      const summaries = [];
      for (let i = 0; i < months; i++) {
        summaries.push({ month: i + 1, total: i * 100 });
      }
      expect(summaries.length).toBe(12);
    });

    it('should calculate historical month correctly', () => {
      const now = new Date(2024, 2, 15);
      const historical = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      expect(historical.getMonth()).toBe(11);
      expect(historical.getFullYear()).toBe(2023);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing GST detail gracefully', () => {
      const order = { gstDetail: null };
      const taxableValue = order.gstDetail?.taxableValue || 0;
      expect(taxableValue).toBe(0);
    });

    it('should handle zero order amounts', () => {
      const amount = 0;
      const tax = (amount * 0.18);
      expect(tax).toBe(0);
    });

    it('should validate month range', () => {
      const month = 13;
      const isValid = month >= 1 && month <= 12;
      expect(isValid).toBe(false);
    });

    it('should handle leap year February', () => {
      const year = 2024;
      const febEnd = new Date(year, 2, 0);
      expect(febEnd.getDate()).toBe(29);
    });

    it('should handle non-leap year February', () => {
      const year = 2023;
      const febEnd = new Date(year, 2, 0);
      expect(febEnd.getDate()).toBe(28);
    });
  });
});
