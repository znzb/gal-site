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
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token.value) {
    headers['Authorization'] = `Bearer ${token.value}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}