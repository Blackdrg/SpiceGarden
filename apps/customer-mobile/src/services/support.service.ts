import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storage.keys';
import { API_URL } from '../constants/api';

export type SupportCategory =
  | 'order_issue'
  | 'payment_issue'
  | 'refund_request'
  | 'delivery_issue'
  | 'app_issue'
  | 'other';

export interface SupportTicketPayload {
  orderId: string;
  customerId: string;
  type: SupportCategory;
  description: string;
}

export interface SupportTicketResult {
  id: string;
  status: string;
  message: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000;

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<Response> {
  const attempt = async (n: number): Promise<Response> => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers },
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const err: any = new Error(body?.message || `Request failed (${response.status})`);
        err.status = response.status;
        throw err;
      }
      return response;
    } catch (error) {
      if (n >= retries || (error as any).status) throw error;
      const delay = RETRY_DELAY_BASE * Math.pow(2, n - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return attempt(n + 1);
    }
  };
  return attempt(1);
}

export const supportService = {
  async raiseTicket(payload: SupportTicketPayload): Promise<SupportTicketResult> {
    const response = await fetchWithRetry(`${API_URL}/support/disputes`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({
        orderId: payload.orderId,
        customerId: payload.customerId,
        type: payload.type,
        description: payload.description,
      }),
    });
    const data = (await response.json()) as SupportTicketResult;
    return data;
  },
};
