// Test utilities for frontend testing

export const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

export const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

export const setupDomMocks = () => {
  Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
  Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });
  
  Object.defineProperty(window, 'navigator', {
    value: {
      onLine: true,
      userAgent: 'test-user-agent',
    },
    writable: true,
    configurable: true,
  });

  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};

export const mockFetch = (response: any, ok: boolean = true) => {
  return jest.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(response),
    status: ok ? 200 : 400,
    statusText: ok ? 'OK' : 'Error',
  } as Response);
};

export const mockNextRouter = (pathname: string = '/', query: Record<string, string> = {}) => {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    reload: jest.fn(),
    pathname,
    query,
    asPath: pathname,
    isFallback: false,
    isLocale: false,
    isReady: true,
    isPreview: false,
    route: pathname,
    forward: jest.fn(),
  };
};

export const mockApiResponse = {
  restaurants: [
    { id: '1', name: 'Test Restaurant', description: 'Test description', rating: 4.5, deliveryTime: 30, isActive: true },
  ],
  orders: [
    { id: '1', status: 'DELIVERED', grandTotal: 250 },
    { id: '2', status: 'ON_THE_WAY', grandTotal: 350 },
  ],
  user: { 
    id: 'user-1', 
    email: 'test@example.com', 
    name: 'Test User',
    fullName: 'Test User Full',
    phone: '+1234567890',
  },
};