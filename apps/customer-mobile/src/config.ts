export const getApiUrl = () => {
  const apiUrl = globalThis.process?.env?.API_URL || globalThis.process?.env?.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    if (globalThis.process?.env?.NODE_ENV === 'production') {
      return 'https://api.spicegarden.com';
    }
    return 'http://localhost:3001';
  }
  return apiUrl;
};

export const getSocketUrl = () => {
  const socketUrl = globalThis.process?.env?.SOCKET_URL || globalThis.process?.env?.NEXT_PUBLIC_SOCKET_URL;
  if (!socketUrl) {
    if (globalThis.process?.env?.NODE_ENV === 'production') {
      return 'https://api.spicegarden.com';
    }
    return 'http://localhost:3001';
  }
  return socketUrl;
};

export const API_URL = getApiUrl();
export const SOCKET_URL = getSocketUrl();

export const config = {
  api: {
    baseUrl: API_URL,
  },
  socket: {
    baseUrl: SOCKET_URL,
  },
  env: globalThis.process?.env?.NODE_ENV || 'development',
} as const;