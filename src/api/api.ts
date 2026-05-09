import { games as mockGames, categories as mockCategories, features as mockFeatures, banners as mockBanners } from '../data/mockData';

const RENDER_URL = 'https://game-api-p1zc.onrender.com';

const BASE_URL = RENDER_URL + '/api';

export interface Game {
  id: string;
  name: string;
  cover: string;
  description: string;
  category: string;
  size: string;
  releaseDate: string;
  downloads: number;
  tags: string[];
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
}

export interface Feature {
  id: string;
  name: string;
  icon: string;
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
}

const fetchWithFallback = async <T>(url: string, mockData: T[], options?: RequestInit): Promise<T> => {
  try {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  } catch (error) {
    console.warn(`API call failed, using mock data: ${error}`);
    return mockData as unknown as T;
  }
};

export const gameApi = {
  getAllGames: async (): Promise<Game[]> => {
    return fetchWithFallback(`${BASE_URL}/games`, mockGames);
  },

  getGameById: async (id: string): Promise<Game> => {
    try {
      const response = await fetch(`${BASE_URL}/games/${id}`, {
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) throw new Error('Game not found');
      return response.json();
    } catch {
      return mockGames.find(g => g.id === id) || mockGames[0];
    }
  },

  getGamesByCategory: async (category: string): Promise<Game[]> => {
    return fetchWithFallback(`${BASE_URL}/games/category/${category}`, mockGames.filter(g => g.category === category));
  },

  createGame: async (game: Game): Promise<Game> => {
    return fetchWithFallback(`${BASE_URL}/games`, game, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(game)
    });
  },

  updateGame: async (id: string, game: Partial<Game>): Promise<Game> => {
    return fetchWithFallback(`${BASE_URL}/games/${id}`, { ...mockGames.find(g => g.id === id), ...game } as Game, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(game)
    });
  },

  deleteGame: async (id: string): Promise<void> => {
    try {
      await fetch(`${BASE_URL}/games/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(5000)
      });
    } catch (error) {
      console.warn('Delete failed, continuing with mock data');
    }
  },

  downloadGame: async (id: string): Promise<{ downloads: number }> => {
    try {
      const response = await fetch(`${BASE_URL}/games/${id}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      return response.json();
    } catch {
      const game = mockGames.find(g => g.id === id);
      return { downloads: (game?.downloads || 0) + 1 };
    }
  }
};

export const categoryApi = {
  getAllCategories: async (): Promise<CategoryItem[]> => {
    return fetchWithFallback(`${BASE_URL}/categories`, mockCategories);
  },

  getCategoryById: async (id: string): Promise<CategoryItem> => {
    try {
      const response = await fetch(`${BASE_URL}/categories/${id}`, {
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) throw new Error('Category not found');
      return response.json();
    } catch {
      return mockCategories.find(c => c.id === id) || mockCategories[0];
    }
  },

  createCategory: async (category: CategoryItem): Promise<CategoryItem> => {
    return fetchWithFallback(`${BASE_URL}/categories`, category, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category)
    });
  }
};

export const featureApi = {
  getAllFeatures: async (): Promise<Feature[]> => {
    return fetchWithFallback(`${BASE_URL}/features`, mockFeatures);
  }
};

export const bannerApi = {
  getAllBanners: async (): Promise<Banner[]> => {
    return fetchWithFallback(`${BASE_URL}/banners`, mockBanners);
  }
};