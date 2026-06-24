import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeParse } from '../utils/safe-parse';
import { STORAGE_KEYS, StorageKey } from '../constants/storage.keys';
import { validateCart } from '../utils/validation';

const CRASH_REPORT_KEY = 'spicegarden_crash_report';

export async function safeGetItem(key: StorageKey): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    securityLog('STORAGE_READ_FAIL', key, error);
    return null;
  }
}

async function safeGetJSON<T>(key: StorageKey, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = safeParse(raw);
    return parsed as T;
  } catch (error) {
    securityLog('STORAGE_PARSE_FAIL', key, error);
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      /* ignore cleanup failure */
    }
    return fallback;
  }
}

async function safeSetItem(key: StorageKey, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    securityLog('STORAGE_WRITE_FAIL', key, error);
  }
}

async function safeSetJSON(key: StorageKey, value: unknown): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    await AsyncStorage.setItem(key, serialized);
  } catch (error) {
    securityLog('STORAGE_SERIALIZE_FAIL', key, error);
  }
}

async function safeRemoveItem(key: StorageKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    securityLog('STORAGE_REMOVE_FAIL', key, error);
  }
}

function validateCartStructure(cart: unknown): boolean {
  if (!Array.isArray(cart)) return false;
  return cart.every((item) => {
    return (
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      typeof item.price === 'number' &&
      !isNaN(item.price) &&
      item.price >= 0 &&
      typeof item.quantity === 'number' &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
    );
  });
}

export async function getCartSafe(): Promise<unknown[]> {
  try {
    const cartJson = await AsyncStorage.getItem(STORAGE_KEYS.CART);
    if (!cartJson) return [];
    const parsed = safeParse(cartJson) as unknown[] | undefined;
    if (!validateCartStructure(parsed)) {
      await AsyncStorage.removeItem(STORAGE_KEYS.CART);
      return [];
    }
    return parsed ?? [];
  } catch (error) {
    securityLog('CART_LOAD_FAIL', STORAGE_KEYS.CART, error);
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CART);
    } catch {
      /* ignore cleanup failure */
    }
    return [];
  }
}

export async function saveCartSafe(cart: unknown[]): Promise<boolean> {
  if (!validateCartStructure(cart)) {
    securityLog('CART_VALIDATION_FAIL', STORAGE_KEYS.CART, 'Invalid cart structure');
    return false;
  }
  try {
    const safeCart = validateCart(cart).map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      description: item.description,
    }));
    await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(safeCart));
    return true;
  } catch (error) {
    securityLog('CART_SAVE_FAIL', STORAGE_KEYS.CART, error);
    return false;
  }
}

async function secureClearStorage(): Promise<void> {
  const keysToRemove = Object.values(STORAGE_KEYS);
  try {
    await AsyncStorage.multiRemove(keysToRemove);
  } catch (error) {
    securityLog('STORAGE_CLEAR_FAIL', 'multi_remove', error);
  }
}

function securityLog(event: string, key: string, error: unknown): void {
  const sanitizedError = error instanceof Error ? error.message : String(error);
  const report = {
    event,
    key,
    error: sanitizedError,
    timestamp: Date.now(),
  };
  try {
    AsyncStorage.setItem(CRASH_REPORT_KEY, JSON.stringify(report)).catch(() => undefined);
  } catch {
    /* storage logging at capacity */
  }
  console.error(`[Security][${event}] key=${key}: ${sanitizedError}`);
}
