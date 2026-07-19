export const STORAGE_KEYS = {
  CART: 'spicegarden_cart',
  USER: 'spicegarden_user',
  ADDRESS: 'spicegarden_address',
  ADDRESSES: 'spicegarden_addresses',
  ORDERS_CACHE: 'spicegarden_orders_cache',
  AUTH_TOKEN: 'spicegarden_auth_token',
  REFRESH_TOKEN: 'spicegarden_refresh_token',
  RECENT_SEARCHES: 'spicegarden_recent_searches',
  WALLET_CACHE: 'spicegarden_wallet_cache',
  WALLET_TXN_CACHE: 'spicegarden_wallet_txn_cache',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
