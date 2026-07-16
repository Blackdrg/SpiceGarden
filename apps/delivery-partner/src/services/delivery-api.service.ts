import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getApiBaseUrl = (): string => {
  const apiUrl = globalThis.process?.env?.API_BASE_URL || globalThis.process?.env?.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    if (globalThis.process?.env?.NODE_ENV === 'production') {
      return 'https://api.spicegarden.com';
    }
    return 'http://localhost:3001';
  }
  return apiUrl;
};

const API_BASE_URL = getApiBaseUrl();

export interface DriverProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  licenseNumber: string;
  vehicleNumber: string;
  rating: number;
  totalDeliveries: number;
  isOnline: boolean;
  isAvailable: boolean;
  kycStatus: string;
}

export interface DeliveryOrder {
  id: string;
  orderId: string;
  status: 'assigned' | 'accepted' | 'pickedUp' | 'onTheWay' | 'delivered' | 'failed';
  restaurant: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  customer: {
    name: string;
    address: string;
    lat: number;
    lng: number;
    phone: string;
  };
  amount: number;
  estimatedTimeMinutes: number;
  distanceKm: number;
  otpCode?: string;
}

export interface EarningsSummary {
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
  weeklyEarnings: number;
  todayEarnings: number;
}

export interface Location {
  lat: number;
  lng: number;
}

class DeliveryApiService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private driverId: string | null = null;

  async login(email: string, password: string): Promise<{ token: string; driverId: string; profile: DriverProfile }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    this.token = data.access_token;
    this.driverId = (data.driverId as string) || (data.user && (data.user as { id?: string }).id) || null;
    
    if (this.token && this.driverId) {
      await Promise.all([
        AsyncStorage.setItem('driver_token', this.token),
        AsyncStorage.setItem('driver_id', this.driverId),
        ...(data.refresh_token ? [AsyncStorage.setItem('driver_refresh_token', data.refresh_token)] : []),
      ]);
    }

    const profile = await this.getProfile();
    return { token: this.token!, driverId: this.driverId!, profile };
  }

  async registerDriver(data: {
    name: string;
    phone: string;
    email: string;
    licenseNumber: string;
    vehicleType: string;
    vehicleNumber: string;
  }): Promise<DriverProfile> {
    const response = await fetch(`${API_BASE_URL}/drivers/onboarding`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    return response.json();
  }

  async getProfile(): Promise<DriverProfile> {
    const token = await this.getStoredToken();
    const response = await fetch(`${API_BASE_URL}/drivers/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const profile = await response.json();
    if (profile && profile.id) {
      this.driverId = profile.id;
      await AsyncStorage.setItem('driver_id', profile.id);
    }
    await AsyncStorage.setItem('sg_driver_data', JSON.stringify(profile));
    return profile;
  }

  async updateLocation(lat: number, lng: number, driverId?: string): Promise<void> {
    const token = await this.getStoredToken();
    const id = driverId || await this.getStoredDriverId();
    
    if (!id) return;
    
    if (this.socket && id) {
      this.socket.emit('updateLocation', { driverId: id, lat, lng });
    }

    await fetch(`${API_BASE_URL}/drivers/${id}/location`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ lat, lng }),
    });
  }

  async toggleOnline(isOnline: boolean, driverId?: string): Promise<void> {
    const token = await this.getStoredToken();
    const id = driverId || await this.getStoredDriverId();

    await fetch(`${API_BASE_URL}/drivers/${id}/availability`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ isAvailable: isOnline }),
    });
  }

  async getEarnings(driverId?: string): Promise<EarningsSummary> {
    const token = await this.getStoredToken();
    const id = driverId || await this.getStoredDriverId();

    const response = await fetch(`${API_BASE_URL}/drivers/${id}/earnings`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      return {
        availableBalance: 0,
        pendingBalance: 0,
        lifetimeEarnings: 0,
        weeklyEarnings: 0,
        todayEarnings: 0,
      };
    }

    return response.json();
  }

  async acceptOrder(orderId: string, driverId?: string): Promise<DeliveryOrder> {
    const token = await this.getStoredToken();
    const id = driverId || await this.getStoredDriverId();

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/accept`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ driverId: id }),
    });

    if (!response.ok) {
      throw new Error('Failed to accept order');
    }

    return response.json();
  }

  async rejectOrder(orderId: string, driverId?: string): Promise<void> {
    const token = await this.getStoredToken();
    const id = driverId || await this.getStoredDriverId();

    await fetch(`${API_BASE_URL}/orders/${orderId}/reject`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ driverId: id }),
    });
  }

  async updateOrderStatus(
    orderId: string, 
    status: 'pickedUp' | 'onTheWay' | 'delivered' | 'failed',
    actualTimeMinutes?: number,
    failureReason?: string
  ): Promise<DeliveryOrder> {
    const token = await this.getStoredToken();

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status, actualTimeMinutes, failureReason }),
    });

    if (!response.ok) {
      throw new Error('Failed to update order status');
    }

    return response.json();
  }

  async verifyOTP(orderId: string, otp: string, driverId?: string): Promise<boolean> {
    const token = await this.getStoredToken();
    const id = driverId || await this.getStoredDriverId();

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/verify-otp`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ otp, driverId: id }),
    });

    return response.ok;
  }

  async reportIssue(orderId: string, issue: string, details: string): Promise<void> {
    const token = await this.getStoredToken();

    await fetch(`${API_BASE_URL}/orders/${orderId}/issues`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ issue, details }),
    });
  }

  async getDriverPerformance(driverId?: string): Promise<any> {
    const token = await this.getStoredToken();
    const id = driverId || await this.getStoredDriverId();

    const response = await fetch(`${API_BASE_URL}/fleet/performance/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch driver performance');
    }

    return response.json();
  }

  async getTransactions(driverId?: string): Promise<any[]> {
    const token = await this.getStoredToken();
    const id = driverId || await this.getStoredDriverId();

    const response = await fetch(`${API_BASE_URL}/wallet/transactions?driverId=${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }

    const data = await response.json();
    return data.transactions || [];
  }

  connectWebSocket(onOrderReceived: (order: DeliveryOrder) => void, onOrderCancelled?: (orderId: string) => void): void {
    const token = this.getStoredTokenSync();
    
    this.socket = io(API_BASE_URL, {
      transports: ['websocket'],
      auth: { token },
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('orderAssigned', (order: DeliveryOrder) => {
      onOrderReceived(order);
    });

    this.socket.on('orderCancelled', (orderId: string) => {
      onOrderCancelled?.(orderId);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
  }

  disconnectWebSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  async getStoredToken(): Promise<string | null> {
    if (this.token) return this.token;
    this.token = await AsyncStorage.getItem('driver_token');
    return this.token;
  }

  private getStoredTokenSync(): string | null {
    return this.token;
  }

  async getStoredDriverId(): Promise<string | null> {
    if (this.driverId) return this.driverId;
    this.driverId = await AsyncStorage.getItem('driver_id');
    return this.driverId;
  }

  async getNotifications(driverId?: string): Promise<any[]> {
    const token = await this.getStoredToken();
    const id = driverId || await this.getStoredDriverId();

    const response = await fetch(`${API_BASE_URL}/notification-queue/recipient/${id}?recipientType=user`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    return response.json();
  }

  async getDeliveryHistory(driverId?: string): Promise<any[]> {
    const token = await this.getStoredToken();
    const id = driverId || await this.getStoredDriverId();

    const response = await fetch(`${API_BASE_URL}/driver-assignment/driver/${id}/assignments`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch delivery history');
    }

    return response.json();
  }

  async logout(): Promise<void> {
    this.disconnectWebSocket();
    await AsyncStorage.removeItem('driver_token');
    await AsyncStorage.removeItem('driver_id');
    await AsyncStorage.removeItem('driver_refresh_token');
    this.token = null;
    this.driverId = null;
  }
}

export const deliveryApi = new DeliveryApiService();