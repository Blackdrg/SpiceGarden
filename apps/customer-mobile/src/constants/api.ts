export const getApiBaseUrl = (): string => {
  const apiUrl = globalThis.process?.env?.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    if (globalThis.process?.env?.NODE_ENV === 'production') {
      return 'https://api.spicegarden.com';
    }
    return 'http://localhost:3001';
  }
  return apiUrl;
};

export const API_BASE_URL = getApiBaseUrl();
export const API_URL = `${API_BASE_URL}/api`;
export const SOCKET_URL = API_BASE_URL;
