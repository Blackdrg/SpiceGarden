export const GRPC_PORT = 50051;
export const GRPC_HOST = '0.0.0.0';
export const GRPC_URL = `${GRPC_HOST}:${GRPC_PORT}`;
export const PROTO_PACKAGE = 'spicegarden';

export interface GRPCMetadata {
  authorization?: string;
  'x-request-id'?: string;
}

export interface ProtoDriver {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  licenseNumber: string;
  vehicleNumber: string;
  isOnline: boolean;
  isAvailable: boolean;
  rating: number;
  kycStatus: 'pending' | 'verified' | 'rejected';
}

export interface ProtoOrder {
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