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