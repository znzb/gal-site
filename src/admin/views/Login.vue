<template>
  <div class="login-container">
    <div class="login-box">
      <h1>🔐 后台登录</h1>
      <form @submit.prevent="login">
        <div class="form-group">
          <label>用户名</label>
          <input v-model="username" type="text" required />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="password" type="password" required />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
      <p class="hint">默认账号: admin / admin123</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { request, setToken } from '../api';

const router = useRouter();
const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function login() {
  loading.value = true;
  error.value = '';
  
  try {
    const data = await request('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: username.value, password: password.value })
    });
    setToken(data.token);
    router.push('/admin');
  } catch (err) {
    error.value = '用户名或密码错误';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 400px;
}

.login-box h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #667eea;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
}

button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  font-weight: 600;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #e74c3c;
  text-align: center;
  margin-top: 15px;
}

.hint {
  text-align: center;
  margin-top: 20px;
  color: #888;
  font-size: 14px;
}
</style>