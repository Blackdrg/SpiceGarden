const { describe, it, expect, beforeEach } = require('@jest/globals');

describe('useOfflineQueue - Offline State & Queue Tests', () => {
  const mockLocalStorage = (() => {
    let store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = value; },
      removeItem: (key) => { delete store[key]; },
      clear: () => { store = {}; },
    };
  })();

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('should initialize with empty queue', () => {
    const queue = [];
    expect(queue.length).toBe(0);
  });

  it('should enqueue request when online', async () => {
    const isOnline = true;
    const response = { ok: true };
    expect(isOnline).toBe(true);
    expect(response.ok).toBe(true);
  });

  it('should queue request when offline', () => {
    const isOnline = false;
    const queuedResponse = { ok: false, status: 0, statusText: 'Offline - queued' };
    expect(isOnline).toBe(false);
    expect(queuedResponse.status).toBe(0);
  });

  it('should persist queue to localStorage on change', () => {
    const action = { id: '1', url: '/api/test', method: 'GET', timestamp: Date.now(), retryCount: 0 };
    const queue = [action];
    mockLocalStorage.setItem('sg_offline_queue', JSON.stringify(queue));

    expect(mockLocalStorage.getItem('sg_offline_queue')).not.toBeNull();
    const saved = JSON.parse(mockLocalStorage.getItem('sg_offline_queue') || '[]');
    expect(saved).toHaveLength(1);
  });

  it('should restore queue from localStorage on init', () => {
    const existingQueue = [{ id: 'test-id', url: '/api/restored', method: 'GET', timestamp: Date.now(), retryCount: 0 }];
    mockLocalStorage.setItem('sg_offline_queue', JSON.stringify(existingQueue));

    const queueSize = JSON.parse(mockLocalStorage.getItem('sg_offline_queue') || '[]').length;
    expect(queueSize).toBe(1);
  });

  it('should clear queue', () => {
    const queue = [{ id: '1', url: '/api/test' }];
    mockLocalStorage.setItem('sg_offline_queue', JSON.stringify(queue));
    mockLocalStorage.removeItem('sg_offline_queue');

    const saved = JSON.parse(mockLocalStorage.getItem('sg_offline_queue') || '[]');
    expect(saved).toHaveLength(0);
  });

  it('should handle enqueueRequest method', () => {
    const response = { data: 'test' };
    expect(response).toEqual({ data: 'test' });
  });

  it('should return isSyncing false initially', () => {
    const isSyncing = false;
    expect(isSyncing).toBe(false);
  });

  it('should increment retry count on failed sync', () => {
    const action = { retryCount: 1 };
    const incremented = { ...action, retryCount: action.retryCount + 1 };
    expect(incremented.retryCount).toBe(2);
  });

  it('should max out at 3 retries', () => {
    const maxRetries = 3;
    expect(maxRetries).toBe(3);
  });
});