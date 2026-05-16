import { dataCache } from '../utils/cache';

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
  _id?: string;
  name: string;
  cover: string;
  description: string;
  category: string;
  categories?: string[];
  platforms?: string[];
  subCategory?: 'raw' | 'cooked';
  isYuzusoft?: boolean;
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
  order: number;
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

export interface FAQ {
  _id?: string;
  question: string;
  answer: string;
  order: number;
}

export interface Tool {
  _id?: string;
  name: string;
  description: string;
  size: string;
  downloads: number;
  tags: string[];
  icon: string;
  downloadUrl: string;
  order: number;
}

const createTimeoutSignal = (ms: number): AbortSignal => {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
};

// 前端自动重试2次，模拟CDN重试
const fetchApi = async <T>(url: string, options?: RequestInit, retryCount: number = 0): Promise<T> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...options?.headers
      },
      signal: createTimeoutSignal(25000)
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    if (retryCount < 2) {
      console.log(`请求失败，${800}ms后重试（第${retryCount + 1}次）`);
      await new Promise(resolve => setTimeout(resolve, 800));
      return fetchApi(url, options, retryCount + 1);
    }
    throw error;
  }
};

export const gameApi = {
  getAllGames: async (): Promise<Game[]> => {
    const cacheKey = 'games_all';
    if (dataCache.has(cacheKey)) {
      return dataCache.get<Game[]>(cacheKey)!;
    }
    const data = await fetchApi(`${BASE_URL}/games`);
    dataCache.set(cacheKey, data);
    return data;
  },

  getGameById: async (id: string): Promise<Game> => {
    const cacheKey = `game_${id}`;
    if (dataCache.has(cacheKey)) {
      return dataCache.get<Game>(cacheKey)!;
    }
    const data = await fetchApi(`${BASE_URL}/games/${id}`);
    dataCache.set(cacheKey, data);
    return data;
  },

  getGamesByCategory: async (category: string): Promise<Game[]> => {
    const cacheKey = `games_category_${category}`;
    if (dataCache.has(cacheKey)) {
      return dataCache.get<Game[]>(cacheKey)!;
    }
    const data = await fetchApi(`${BASE_URL}/games/category/${category}`);
    dataCache.set(cacheKey, data);
    return data;
  },

  createGame: async (game: Game): Promise<Game> => {
    return fetchApi(`${BASE_URL}/games`, {
      method: 'POST',
      body: JSON.stringify(game)
    });
  },

  updateGame: async (id: string, game: Partial<Game>): Promise<Game> => {
    return fetchApi(`${BASE_URL}/games/${id}`, {
      method: 'PUT',
      body: JSON.stringify(game)
    });
  },

  deleteGame: async (id: string): Promise<void> => {
    await fetchApi(`${BASE_URL}/games/${id}`, { method: 'DELETE' });
  },

  downloadGame: async (id: string): Promise<{ downloads: number }> => {
    return fetchApi(`${BASE_URL}/games/${id}/download`, { method: 'POST' });
  }
};

export const categoryApi = {
  getAllCategories: async (): Promise<CategoryItem[]> => {
    const cacheKey = 'categories_all';
    if (dataCache.has(cacheKey)) {
      return dataCache.get<CategoryItem[]>(cacheKey)!;
    }
    const data = await fetchApi(`${BASE_URL}/categories`);
    dataCache.set(cacheKey, data);
    return data;
  },

  getCategoryById: async (id: string): Promise<CategoryItem> => {
    const cacheKey = `category_${id}`;
    if (dataCache.has(cacheKey)) {
      return dataCache.get<CategoryItem>(cacheKey)!;
    }
    const data = await fetchApi(`${BASE_URL}/categories/${id}`);
    dataCache.set(cacheKey, data);
    return data;
  },

  createCategory: async (category: CategoryItem): Promise<CategoryItem> => {
    return fetchApi(`${BASE_URL}/categories`, {
      method: 'POST',
      body: JSON.stringify(category)
    });
  }
};

export const featureApi = {
  getAllFeatures: async (): Promise<Feature[]> => {
    return fetchApi(`${BASE_URL}/features`);
  }
};

export const bannerApi = {
  getAllBanners: async (): Promise<Banner[]> => {
    const cacheKey = 'banners_all';
    if (dataCache.has(cacheKey)) {
      return dataCache.get<Banner[]>(cacheKey)!;
    }
    const data = await fetchApi(`${BASE_URL}/banners`);
    dataCache.set(cacheKey, data);
    return data;
  }
};

export const announcementApi = {
  getAllAnnouncements: async (): Promise<Announcement[]> => {
    const cacheKey = 'announcements_all';
    if (dataCache.has(cacheKey)) {
      return dataCache.get<Announcement[]>(cacheKey)!;
    }
    const data = await fetchApi(`${BASE_URL}/announcements`);
    dataCache.set(cacheKey, data);
    return data;
  }
};

export const resourceApi = {
  getResourcesByGameId: async (gameId: string): Promise<ResourceLink[]> => {
    return fetchApi(`${BASE_URL}/games/${gameId}/resources`);
  },

  createResource: async (gameId: string, resource: ResourceLink): Promise<ResourceLink> => {
    return fetchApi(`${BASE_URL}/games/${gameId}/resources`, {
      method: 'POST',
      body: JSON.stringify(resource)
    });
  },

  updateResource: async (gameId: string, resourceId: string, resource: Partial<ResourceLink>): Promise<ResourceLink> => {
    return fetchApi(`${BASE_URL}/games/${gameId}/resources/${resourceId}`, {
      method: 'PUT',
      body: JSON.stringify(resource)
    });
  },

  deleteResource: async (gameId: string, resourceId: string): Promise<void> => {
    await fetchApi(`${BASE_URL}/games/${gameId}/resources/${resourceId}`, { method: 'DELETE' });
  }
};

export const commentApi = {
  getCommentsByGameId: async (gameId: string): Promise<Comment[]> => {
    return fetchApi(`${BASE_URL}/games/${gameId}/comments`);
  },

  createComment: async (gameId: string, comment: Comment): Promise<Comment> => {
    return fetchApi(`${BASE_URL}/games/${gameId}/comments`, {
      method: 'POST',
      body: JSON.stringify(comment)
    });
  },

  deleteComment: async (gameId: string, commentId: string): Promise<void> => {
    await fetchApi(`${BASE_URL}/games/${gameId}/comments/${commentId}`, { method: 'DELETE' });
  },

  likeComment: async (gameId: string, commentId: string): Promise<{ likes: number }> => {
    return fetchApi(`${BASE_URL}/games/${gameId}/comments/${commentId}/like`, { method: 'POST' });
  }
};

export const faqApi = {
  getAllFAQs: async (): Promise<FAQ[]> => {
    return fetchApi(`${BASE_URL}/faq`);
  },

  createFAQ: async (faq: FAQ): Promise<FAQ> => {
    return fetchApi(`${BASE_URL}/faq`, {
      method: 'POST',
      body: JSON.stringify(faq)
    });
  },

  updateFAQ: async (id: string, faq: Partial<FAQ>): Promise<FAQ> => {
    return fetchApi(`${BASE_URL}/faq/${id}`, {
      method: 'PUT',
      body: JSON.stringify(faq)
    });
  },

  deleteFAQ: async (id: string): Promise<void> => {
    await fetchApi(`${BASE_URL}/faq/${id}`, { method: 'DELETE' });
  }
};

export interface ToolGuideItem {
  order: number;
  content: string;
}

export interface TutorialSection {
  title: string;
  content: string;
  subsections?: {
    title: string;
    content: string;
  }[];
}

export interface TutorialContent {
  sections: TutorialSection[];
}

export interface TutorialCard {
  id?: string;
  title: string;
  description: string;
  url?: string;
  order: number;
  content?: TutorialContent;
}

export interface ToolGuide {
  id?: string;
  title: string;
  items: ToolGuideItem[];
  tutorials?: TutorialCard[];
}

export const toolApi = {
  getAllTools: async (): Promise<Tool[]> => {
    return fetchApi(`${BASE_URL}/tools`);
  },

  createTool: async (tool: Tool): Promise<Tool> => {
    return fetchApi(`${BASE_URL}/tools`, {
      method: 'POST',
      body: JSON.stringify(tool)
    });
  },

  updateTool: async (id: string, tool: Partial<Tool>): Promise<Tool> => {
    return fetchApi(`${BASE_URL}/tools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tool)
    });
  },

  deleteTool: async (id: string): Promise<void> => {
    await fetchApi(`${BASE_URL}/tools/${id}`, { method: 'DELETE' });
  },

  downloadTool: async (id: string): Promise<{ downloads: number }> => {
    return fetchApi(`${BASE_URL}/tools/${id}/download`, { method: 'POST' });
  }
};

export const toolGuideApi = {
  getGuide: async (): Promise<ToolGuide> => {
    return fetchApi(`${BASE_URL}/tool-guide`);
  },

  updateGuide: async (guide: Partial<ToolGuide>): Promise<ToolGuide> => {
    return fetchApi(`${BASE_URL}/tool-guide`, {
      method: 'PUT',
      body: JSON.stringify(guide)
    });
  }
};
