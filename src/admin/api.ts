import { ref } from 'vue';

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

export async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    ...options.headers
  };
  
  if (token.value) {
    headers['Authorization'] = `Bearer ${token.value}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
    signal: AbortSignal.timeout(10000)
  });

  if (response.status === 401) {
    // Token失效，清除token并跳转到登录页
    clearToken();
    window.location.href = '/admin/login';
    throw new Error('登录已过期，请重新登录');
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
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