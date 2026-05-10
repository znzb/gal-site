import { games as mockGames, categories as mockCategories, features as mockFeatures, banners as mockBanners } from '../data/mockData';

const RENDER_URL = 'https://game-api-p1zc.onrender.com';

const BASE_URL = RENDER_URL + '/api';

export interface ResourceLink {
  id?: string;
  name: string;
  url: string;
  type: 'main' | 'patch' | 'update';
  size: string;
  date: string;
  language: string;
  platform: string;
  dateDisplay: string;
  authorName: string;
  authorAvatar: string;
  authorResources: number;
}

export interface Comment {
  id?: string;
  user: string;
  avatar: string;
  content: string;
  rating: number;
  date: string;
  likes: number;
}

export interface Game {
  id: string;
  name: string;
  cover: string;
  description: string;
  category: string;
  subCategory?: 'raw' | 'cooked';
  size: string;
  releaseDate: string;
  downloads: number;
  tags: string[];
  resources?: ResourceLink[];
  comments?: Comment[];
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

export interface Announcement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
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
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(game)
    });
  },

  updateGame: async (id: string, game: Partial<Game>): Promise<Game> => {
    return fetchWithFallback(`${BASE_URL}/games/${id}`, { ...mockGames.find(g => g.id === id), ...game } as Game, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
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
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
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

export const announcementApi = {
  getAllAnnouncements: async (): Promise<Announcement[]> => {
    return fetchWithFallback(`${BASE_URL}/announcements`, []);
  }
};

export const resourceApi = {
  getResourcesByGameId: async (gameId: string): Promise<ResourceLink[]> => {
    try {
      const response = await fetch(`${BASE_URL}/games/${gameId}/resources`, {
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) throw new Error('Resources not found');
      return response.json();
    } catch {
      return [
        {
          id: '1',
          name: '完整版游戏本体',
          url: '#',
          type: 'main',
          size: '2.5GB',
          date: '2024-06-15',
          language: '简体中文',
          platform: 'Android',
          dateDisplay: '3天前',
          authorName: '愚者',
          authorAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar%20boy%20white%20hair&image_size=square',
          authorResources: 198
        }
      ];
    }
  },

  createResource: async (gameId: string, resource: ResourceLink): Promise<ResourceLink> => {
    try {
      const response = await fetch(`${BASE_URL}/games/${gameId}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(resource),
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) throw new Error('Failed to create resource');
      return response.json();
    } catch {
      return resource;
    }
  },

  updateResource: async (gameId: string, resourceId: string, resource: Partial<ResourceLink>): Promise<ResourceLink> => {
    try {
      const response = await fetch(`${BASE_URL}/games/${gameId}/resources/${resourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(resource),
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) throw new Error('Failed to update resource');
      return response.json();
    } catch {
      return { id: resourceId, ...resource } as ResourceLink;
    }
  },

  deleteResource: async (gameId: string, resourceId: string): Promise<void> => {
    try {
      await fetch(`${BASE_URL}/games/${gameId}/resources/${resourceId}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(5000)
      });
    } catch {
      console.warn('Delete resource failed');
    }
  }
};

export const commentApi = {
  getCommentsByGameId: async (gameId: string): Promise<Comment[]> => {
    try {
      const response = await fetch(`${BASE_URL}/games/${gameId}/comments`, {
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) throw new Error('Comments not found');
      return response.json();
    } catch {
      return [
        {
          id: '1',
          user: '玩家小明',
          avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20anime%20avatar%20girl%20portrait&image_size=square',
          content: '非常棒的游戏！剧情很感人，画面也很漂亮，强烈推荐！',
          rating: 5,
          date: '2天前',
          likes: 128
        },
        {
          id: '2',
          user: '樱花控',
          avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar%20girl%20pink%20hair&image_size=square',
          content: '夏日的氛围营造得很好，音乐也很治愈，很享受游戏过程。',
          rating: 4,
          date: '5天前',
          likes: 76
        }
      ];
    }
  },

  createComment: async (gameId: string, comment: Comment): Promise<Comment> => {
    try {
      const response = await fetch(`${BASE_URL}/games/${gameId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(comment),
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) throw new Error('Failed to create comment');
      return response.json();
    } catch {
      return comment;
    }
  },

  deleteComment: async (gameId: string, commentId: string): Promise<void> => {
    try {
      await fetch(`${BASE_URL}/games/${gameId}/comments/${commentId}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(5000)
      });
    } catch {
      console.warn('Delete comment failed');
    }
  },

  likeComment: async (gameId: string, commentId: string): Promise<{ likes: number }> => {
    try {
      const response = await fetch(`${BASE_URL}/games/${gameId}/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      return response.json();
    } catch {
      return { likes: 0 };
    }
  }
};