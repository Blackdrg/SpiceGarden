export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status?: string;
  client_secret?: string;
  payment_method?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  id: string;
  amount: number;
  currency: string;
  status?: string;
  payment_method?: string;
}

export interface RefundResult {
  id: string;
  amount: number;
  status?: string;
  note?: string;
}

export interface GatewayEvent {
  data: {
    object: Record<string, unknown>;
  };
}
