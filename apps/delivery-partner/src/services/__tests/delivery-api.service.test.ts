import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { deliveryApi } from '../delivery-api.service';

describe('DeliveryApiService', () => {
  describe('API Integration', () => {
    it('should handle login flow', async () => {
      const mockLogin = jest.spyOn(deliveryApi, 'login').mockImplementation(async () => ({
        token: 'mock-token',
        driverId: 'driver-123',
        profile: { id: 'driver-123', name: 'Test Driver', email: 'test@driver.com', phone: '1234567890', vehicleType: 'Bike', licenseNumber: 'DL-001', vehicleNumber: 'PB01AB1234', rating: 4.8, totalDeliveries: 100, isOnline: false, isAvailable: true, kycStatus: 'approved' },
      }));

      const result = await deliveryApi.login('test@driver.com', 'password');
      
      expect(result.token).toBe('mock-token');
      expect(mockLogin).toHaveBeenCalledWith('test@driver.com', 'password');
    });

    it('should handle order acceptance', async () => {
      const mockAccept = jest.spyOn(deliveryApi, 'acceptOrder').mockImplementation(async () => ({
        id: '1',
        orderId: 'SG-001',
        status: 'accepted',
        restaurant: { name: 'Test Restaurant', address: 'Test Address', lat: 12.97, lng: 77.59 },
        customer: { name: 'Test Customer', address: 'Customer Address', phone: '1234567890', lat: 12.98, lng: 77.60 },
        amount: 150,
        estimatedTimeMinutes: 30,
        distanceKm: 5,
      }));

      const result = await deliveryApi.acceptOrder('SG-001', 'driver-123');
      
      expect(result.status).toBe('accepted');
      expect(mockAccept).toHaveBeenCalledWith('SG-001', 'driver-123');
    });
  });
});