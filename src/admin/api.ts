import { ref } from 'vue';
import { games as mockGames, categories as mockCategories } from '../data/mockData';

const API_BASE_URL = 'https://game-api-p1zc.onrender.com/api';

const token = ref(localStorage.getItem('adminToken') || '');

export function setToken(newToken) {
  token.value = newToken;
  localStorage.setItem('adminToken', newToken);
}

export function clearToken() {
  token.value = '';
  localStorage.removeItem('adminToken');
}

const mockCategoriesWithId = mockCategories.map(cat => ({ ...cat, _id: cat.id }));
const mockGamesWithId = mockGames.map(game => ({ ...game, _id: game.id }));

export async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    ...options.headers
  };
  
  if (token.value) {
    headers['Authorization'] = `Bearer ${token.value}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    return response.json();
  } catch (error) {
    console.warn(`API call failed, using mock data: ${error}`);
    
    if (url === '/admin/categories' && (!options.method || options.method === 'GET')) {
      return mockCategoriesWithId;
    }
    if (url === '/admin/games' && (!options.method || options.method === 'GET')) {
      return mockGamesWithId;
    }
    if (url.startsWith('/categories')) {
      return mockCategoriesWithId;
    }
    if (url.startsWith('/admin/games/') && options.method === 'DELETE') {
      return { success: true };
    }
    if (url.startsWith('/admin/categories/') && options.method === 'DELETE') {
      return { success: true };
    }
    if (url === '/admin/games' && options.method === 'POST') {
      const newGame = JSON.parse(options.body);
      return { ...newGame, _id: Date.now().toString(), id: Date.now().toString(), downloads: 0 };
    }
    if (url === '/admin/categories' && options.method === 'POST') {
      const newCat = JSON.parse(options.body);
      return { ...newCat, _id: Date.now().toString(), id: Date.now().toString() };
    }
    if (url.startsWith('/admin/games/') && options.method === 'PUT') {
      const updatedGame = JSON.parse(options.body);
      const id = url.split('/')[3];
      return { ...updatedGame, _id: id, id };
    }
    if (url.startsWith('/admin/categories/') && options.method === 'PUT') {
      const updatedCat = JSON.parse(options.body);
      const id = url.split('/')[3];
      return { ...updatedCat, _id: id, id };
    }
    
    throw error;
  }
}

export async function getResourcesByGameId(gameId) {
  try {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}/resources`, {
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error('Resources not found');
    return response.json();
  } catch {
    return [];
  }
}

export async function createResource(gameId, resource) {
  try {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(resource),
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error('Failed to create resource');
    return response.json();
  } catch {
    return { ...resource, id: Date.now().toString() };
  }
}

export async function updateResource(gameId, resourceId, resource) {
  try {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}/resources/${resourceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(resource),
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error('Failed to update resource');
    return response.json();
  } catch {
    return { ...resource, id: resourceId };
  }
}

export async function deleteResource(gameId, resourceId) {
  try {
    await fetch(`${API_BASE_URL}/games/${gameId}/resources/${resourceId}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(5000)
    });
    return { success: true };
  } catch {
    return { success: true };
  }
}

export async function getCommentsByGameId(gameId) {
  try {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}/comments`, {
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error('Comments not found');
    return response.json();
  } catch {
    return [];
  }
}

export async function createComment(gameId, comment) {
  try {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(comment),
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error('Failed to create comment');
    return response.json();
  } catch {
    return { ...comment, id: Date.now().toString() };
  }
}

export async function deleteComment(gameId, commentId) {
  try {
    await fetch(`${API_BASE_URL}/games/${gameId}/comments/${commentId}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(5000)
    });
    return { success: true };
  } catch {
    return { success: true };
  }
}