import { Test, TestingModule } from '@nestjs/testing';
import { TaxReportingService } from '../src/services/finance/tax-reporting.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OrderEntity } from '../src/db/entities/order.entity';
import { GSTDetailEntity } from '../src/db/entities/gst-detail.entity';
import { RestaurantEntity } from '../src/db/entities/restaurant.entity';
import { RestaurantGSTEntity } from '../src/db/entities/restaurant-gst.entity';
import { OrderItemEntity } from '../src/db/entities/order-item.entity';

describe('TaxReportingService', () => {
  let service: TaxReportingService;

  const mockOrderRepo = { find: jest.fn() } as any;
  const mockGstDetailRepo = { find: jest.fn() } as any;
  const mockRestaurantRepo = { find: jest.fn() } as any;
  const mockRestaurantGstRepo = { find: jest.fn() } as any;
  const mockOrderItemRepo = { find: jest.fn() } as any;

  const mockDataSource = {
    createQueryBuilder: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxReportingService,
        { provide: getRepositoryToken(OrderEntity), useValue: mockOrderRepo },
        { provide: getRepositoryToken(GSTDetailEntity), useValue: mockGstDetailRepo },
        { provide: getRepositoryToken(RestaurantEntity), useValue: mockRestaurantRepo },
        { provide: getRepositoryToken(RestaurantGSTEntity), useValue: mockRestaurantGstRepo },
        { provide: getRepositoryToken(OrderItemEntity), useValue: mockOrderItemRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get(TaxReportingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateGSTReport', () => {
    it('should return empty summary when no orders have gstDetail', async () => {
      mockOrderRepo.find.mockResolvedValue([]);
      const result = await service.generateGSTReport('rest-1', 6, 2026);
      expect(result.summary.totalInvoices).toBe(0);
      expect(result.summary.totalTaxableValue).toBe(0);
      expect(result.invoices).toEqual([]);
    });

    it('should calculate GST totals from orders', async () => {
      const orders = [
        {
          id: 'o1',
          orderNumber: 'ORD-001',
          createdAt: new Date('2026-06-15'),
          gstDetail: { taxableValue: 1000, cgstAmount: 90, sgstAmount: 90, igstAmount: 0, totalGstAmount: 180 },
          items: [
            { hsnSac: { hsnCode: '1001' }, totalPrice: 500, cgstAmount: 45, sgstAmount: 45, igstAmount: 0, totalTax: 90, quantity: 2 },
          ],
        },
      ];
      mockOrderRepo.find.mockResolvedValue(orders);
      const result = await service.generateGSTReport('rest-1', 6, 2026);
      expect(result.summary.totalInvoices).toBe(1);
      expect(result.summary.totalTaxableValue).toBe(1000);
      expect(result.summary.totalCGST).toBe(90);
      expect(result.summary.totalSGST).toBe(90);
      expect(result.summary.totalIGST).toBe(0);
      expect(result.summary.totalGST).toBe(180);
      expect(result.invoices.length).toBe(1);
      expect(result.invoices[0].invoiceNumber).toBe('INV-o1');
    });

    it('should build HSN-wise breakdown', async () => {
      const orders = [
        {
          id: 'o1',
          orderNumber: 'ORD-001',
          createdAt: new Date('2026-06-15'),
          gstDetail: { taxableValue: 1000, cgstAmount: 90, sgstAmount: 90, igstAmount: 0, totalGstAmount: 180 },
          items: [
            { hsnSac: { hsnCode: '1001' }, totalPrice: 500, cgstAmount: 45, sgstAmount: 45, igstAmount: 0, totalTax: 90, quantity: 2 },
            { hsnSac: { hsnCode: '1001' }, totalPrice: 300, cgstAmount: 27, sgstAmount: 27, igstAmount: 0, totalTax: 54, quantity: 1 },
          ],
        },
      ];
      mockOrderRepo.find.mockResolvedValue(orders);
      const result = await service.generateGSTReport('rest-1', 6, 2026);
      expect(result.summary.hsnWise.length).toBe(1);
      expect(result.summary.hsnWise[0].hsnCode).toBe('1001');
      expect(result.summary.hsnWise[0].taxableValue).toBe(800);
      expect(result.summary.hsnWise[0].quantity).toBe(3);
    });

    it('should use NOT_SPECIFIED for missing hsnCode', async () => {
      const orders = [
        {
          id: 'o1',
          orderNumber: 'ORD-001',
          createdAt: new Date('2026-06-15'),
          gstDetail: { taxableValue: 500, cgstAmount: 45, sgstAmount: 45, igstAmount: 0, totalGstAmount: 90 },
          items: [
            { totalPrice: 500, cgstAmount: 45, sgstAmount: 45, igstAmount: 0, totalTax: 90, quantity: 1 },
          ],
        },
      ];
      mockOrderRepo.find.mockResolvedValue(orders);
      const result = await service.generateGSTReport('rest-1', 6, 2026);
      expect(result.summary.hsnWise.length).toBe(1);
      expect(result.summary.hsnWise[0].hsnCode).toBe('NOT_SPECIFIED');
    });
  });

  describe('exportGSTR1', () => {
    it('should map invoice data to GSTR1 format', async () => {
      const orders = [
        {
          id: 'o1',
          orderNumber: 'ORD-001',
          createdAt: new Date('2026-06-15'),
          gstDetail: { taxableValue: 1000, cgstAmount: 90, sgstAmount: 90, igstAmount: 180, totalGstAmount: 360 },
          items: [],
        },
      ];
      mockOrderRepo.find.mockResolvedValue(orders);
      const result = await service.exportGSTR1('rest-1', 6, 2026);
      expect(result.length).toBe(1);
      expect(result[0]['Invoice Number']).toBe('INV-o1');
      expect(result[0]['CGST Amount']).toBe(90);
      expect(result[0]['SGST Amount']).toBe(90);
      expect(result[0]['IGST Amount']).toBe(180);
      expect(result[0]['Total Tax']).toBe(360);
    });
  });

  describe('getTaxLiability', () => {
    it('should calculate tax liability for a month', async () => {
      const orders = [
        { tax: 100 },
        { tax: 200 },
      ];
      mockOrderRepo.find.mockResolvedValue(orders);
      const result = await service.getTaxLiability(new Date('2026-06-15'));
      expect(result.taxReceivable).toBe(300);
      expect(result.taxPayable).toBe(300);
      expect(result.netLiability).toBe(0);
      expect(result.ordersCount).toBe(2);
    });

    it('should handle zero orders', async () => {
      mockOrderRepo.find.mockResolvedValue([]);
      const result = await service.getTaxLiability(new Date('2026-06-15'));
      expect(result.taxReceivable).toBe(0);
      expect(result.netLiability).toBe(0);
    });
  });

  describe('getMonthlyTaxSummary', () => {
    it('should return summaries for requested months', async () => {
      mockOrderRepo.find.mockResolvedValue([]);
      const result = await service.getMonthlyTaxSummary('rest-1', 3);
      expect(result.length).toBe(3);
    });
  });
});
