import { Test, TestingModule } from '@nestjs/testing';
import { NotificationPreferencesService } from '../src/services/notifications/notification-preferences.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationPreferenceEntity } from '../src/db/entities/notification-preference.entity';

describe('NotificationPreferencesService', () => {
  let service: NotificationPreferencesService;
  let prefRepo: jest.Mocked<Repository<NotificationPreferenceEntity>>;

  beforeEach(async () => {
    prefRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationPreferencesService,
        { provide: getRepositoryToken(NotificationPreferenceEntity), useValue: prefRepo },
      ],
    }).compile();

    service = module.get(NotificationPreferencesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPreferences', () => {
    it('should return existing preferences', async () => {
      const mockPrefs = { id: 'pref-1', userId: 'user-1', pushOrders: true, pushPromotions: false, pushDeliveryUpdates: true } as any;
      prefRepo.findOne.mockResolvedValue(mockPrefs);

      const result = await service.getPreferences('user-1');

      expect(result).toEqual(mockPrefs);
      expect(prefRepo.findOne).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
      expect(prefRepo.save).not.toHaveBeenCalled();
    });

    it('should create and return new preferences when none exist', async () => {
      prefRepo.findOne.mockResolvedValue(null);
      prefRepo.create.mockReturnValue({ userId: 'user-1', pushOrders: true, pushPromotions: true, pushDeliveryUpdates: true } as any);
      prefRepo.save.mockResolvedValue({ id: 'pref-2', userId: 'user-1', pushOrders: true, pushPromotions: true, pushDeliveryUpdates: true } as any);

      const result = await service.getPreferences('user-1');

      expect(prefRepo.create).toHaveBeenCalledWith({ userId: 'user-1' } as any);
      expect(prefRepo.save).toHaveBeenCalled();
      expect(result.userId).toBe('user-1');
    });
  });

  describe('updatePreferences', () => {
    it('should create new preferences when none exist', async () => {
      prefRepo.findOne.mockResolvedValue(null);
      prefRepo.create.mockReturnValue({ userId: 'user-1', pushOrders: false } as any);
      prefRepo.save.mockResolvedValue({ id: 'pref-3', userId: 'user-1', pushOrders: false } as any);

      const result = await service.updatePreferences('user-1', { pushOrders: false });

      expect(prefRepo.create).toHaveBeenCalledWith({ userId: 'user-1', pushOrders: false } as any);
      expect(prefRepo.save).toHaveBeenCalled();
      expect(result.pushOrders).toBe(false);
    });

    it('should update existing preferences', async () => {
      const existingPrefs = { id: 'pref-4', userId: 'user-1', pushOrders: true, pushPromotions: true, pushDeliveryUpdates: true } as any;
      prefRepo.findOne.mockResolvedValue(existingPrefs);
      prefRepo.save.mockResolvedValue(existingPrefs);

      const result = await service.updatePreferences('user-1', { pushOrders: false });

      expect(prefRepo.save).toHaveBeenCalled();
      expect(result.pushOrders).toBe(false);
      expect(prefRepo.findOne).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    });
  });

  describe('shouldSendPush', () => {
    it('should return true for orders category when pushOrders is true', async () => {
      prefRepo.findOne.mockResolvedValue({ userId: 'user-1', pushOrders: true, pushPromotions: false, pushDeliveryUpdates: true } as any);

      const result = await service.shouldSendPush('user-1', 'orders');

      expect(result).toBe(true);
    });

    it('should return false for promotions when disabled', async () => {
      prefRepo.findOne.mockResolvedValue({ userId: 'user-1', pushOrders: true, pushPromotions: false, pushDeliveryUpdates: true } as any);

      const result = await service.shouldSendPush('user-1', 'promotions');

      expect(result).toBe(false);
    });

    it('should return true for deliveryUpdates when enabled', async () => {
      prefRepo.findOne.mockResolvedValue({ userId: 'user-1', pushOrders: true, pushPromotions: false, pushDeliveryUpdates: true } as any);

      const result = await service.shouldSendPush('user-1', 'deliveryUpdates');

      expect(result).toBe(true);
    });

    it('should return true for unknown category (default)', async () => {
      prefRepo.findOne.mockResolvedValue({ userId: 'user-1', pushOrders: true, pushPromotions: false, pushDeliveryUpdates: true } as any);

      const result = await service.shouldSendPush('user-1', 'unknown' as any);

      expect(result).toBe(true);
    });
  });
});
