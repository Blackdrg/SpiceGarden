const API_BASE_URL = (() => {
  const apiUrl = globalThis.process?.env?.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    if (globalThis.process?.env?.NODE_ENV === 'production') {
      return 'https://api.spicegarden.com';
    }
    return 'http://localhost:3001';
  }
  return apiUrl;
})();

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3): Promise<Response> {
  const attemptFetch = async (attempt: number): Promise<Response> => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      if (attempt >= retries) {
        throw error;
      }

      const delay = 1000 * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      return attemptFetch(attempt + 1);
    }
  };

  return attemptFetch(1);
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  slug: string;
  status: string;
  logoUrl: string;
  bannerUrl: string;
  branches: Branch[];
}

export interface Branch {
  id: string;
  branchName: string;
  address: string;
  location: { lat: number; lng: number };
  openingTime: string;
  closingTime: string;
  isOnline: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  spiceLevel: string;
  status: string;
  addons: Addon[];
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
}

export const restaurantService = {
  async getRestaurants(): Promise<Restaurant[]> {
    const response = await fetchWithRetry(`${API_BASE_URL}/restaurants`);
    return (await response.json()) as Restaurant[];
  },

  async getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/restaurants/${encodeURIComponent(slug)}`);
      return (await response.json()) as Restaurant;
    } catch {
      return null;
    }
  },

  async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    const response = await fetchWithRetry(`${API_BASE_URL}/menus/${encodeURIComponent(restaurantId)}/items`);
    return (await response.json()) as MenuItem[];
  },

  async getCategories(restaurantId: string): Promise<Category[]> {
    const response = await fetchWithRetry(`${API_BASE_URL}/menus/categories/${encodeURIComponent(restaurantId)}`);
    return (await response.json()) as Category[];
  },
};
