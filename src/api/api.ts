const BASE_URL = 'http://localhost:3000/api';

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

export const gameApi = {
  getAllGames: async (): Promise<Game[]> => {
    const response = await fetch(`${BASE_URL}/games`);
    return response.json();
  },

  getGameById: async (id: string): Promise<Game> => {
    const response = await fetch(`${BASE_URL}/games/${id}`);
    return response.json();
  },

  getGamesByCategory: async (category: string): Promise<Game[]> => {
    const response = await fetch(`${BASE_URL}/games/category/${category}`);
    return response.json();
  },

  createGame: async (game: Game): Promise<Game> => {
    const response = await fetch(`${BASE_URL}/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(game)
    });
    return response.json();
  },

  updateGame: async (id: string, game: Partial<Game>): Promise<Game> => {
    const response = await fetch(`${BASE_URL}/games/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(game)
    });
    return response.json();
  },

  deleteGame: async (id: string): Promise<void> => {
    await fetch(`${BASE_URL}/games/${id}`, { method: 'DELETE' });
  },

  downloadGame: async (id: string): Promise<{ downloads: number }> => {
    const response = await fetch(`${BASE_URL}/games/${id}/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }
};

export const categoryApi = {
  getAllCategories: async (): Promise<CategoryItem[]> => {
    const response = await fetch(`${BASE_URL}/categories`);
    return response.json();
  },

  getCategoryById: async (id: string): Promise<CategoryItem> => {
    const response = await fetch(`${BASE_URL}/categories/${id}`);
    return response.json();
  },

  createCategory: async (category: CategoryItem): Promise<CategoryItem> => {
    const response = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category)
    });
    return response.json();
  }
};

export const featureApi = {
  getAllFeatures: async (): Promise<Feature[]> => {
    const response = await fetch(`${BASE_URL}/features`);
    return response.json();
  }
};

export const bannerApi = {
  getAllBanners: async (): Promise<Banner[]> => {
    const response = await fetch(`${BASE_URL}/banners`);
    return response.json();
  }
};