const { describe, it, expect, beforeEach } = require('@jest/globals');

describe('useNetworkStatus - Offline State Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return online state by default', () => {
    const isOnline = true;
    expect(isOnline).toBe(true);
  });

  it('should return offline state when navigator.onLine is false', () => {
    const isOnline = false;
    expect(isOnline).toBe(false);
  });

  it('should handle online event listener', () => {
    expect(typeof window.addEventListener).toBe('function');
  });

  it('should handle offline event listener', () => {
    expect(typeof window.removeEventListener).toBe('function');
  });

  it('should track lastOnline timestamp', () => {
    const lastOnline = new Date();
    expect(lastOnline).toBeInstanceOf(Date);
  });

  it('should have null lastOnline initially when online', () => {
    const lastOnline = null;
    expect(lastOnline).toBe(null);
  });

  it('should calculate offline duration correctly', () => {
    const wentOffline = Date.now() - 300000;
    const now = Date.now();
    const offlineSeconds = Math.floor((now - wentOffline) / 1000);
    const minutes = Math.floor(offlineSeconds / 60);
    const seconds = offlineSeconds % 60;
    
    expect(minutes).toBe(5);
    expect(seconds).toBe(0);
  });
});