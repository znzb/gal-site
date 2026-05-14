<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo-section">
        <div class="logo-icon">🎮</div>
        <h1>后台管理</h1>
        <p class="subtitle">三菜鱼小站管理系统</p>
      </div>
      <form @submit.prevent="login">
        <div class="form-group">
          <label>用户名</label>
          <div class="input-wrapper">
            <span class="input-icon">👤</span>
            <input v-model="username" type="text" placeholder="请输入用户名" required />
          </div>
        </div>
        <div class="form-group">
          <label>密码</label>
          <div class="input-wrapper">
            <span class="input-icon">🔑</span>
            <input v-model="password" type="password" placeholder="请输入密码" required />
          </div>
        </div>
        <button type="submit" :disabled="loading" class="login-btn">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '登录中...' : '登 录' }}
        </button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
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
  background: linear-gradient(135deg, #ff6b9d 0%, #c44fff 50%, #ffecd2 100%);
  background-attachment: fixed;
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(255, 107, 157, 0.3);
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(255, 107, 157, 0.2);
}

.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  font-size: 48px;
  margin-bottom: 16px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.login-box h1 {
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.subtitle {
  color: #9ca3af;
  font-size: 0.875rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.input-wrapper {
  position: relative;
  padding: 0 8px;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #9ca3af;
}

.form-group input {
  width: 100%;
  padding: 10px 10px 10px 36px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.form-group input:focus {
  outline: none;
  border-color: #ff6b9d;
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.1);
  background: white;
}

.form-group input::placeholder {
  color: #9ca3af;
}

form {
  padding: 0 8px;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44fff 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 157, 0.4);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  color: #ef4444;
  text-align: center;
  margin-top: 16px;
  font-size: 0.875rem;
  padding: 12px;
  background: #fef2f2;
  border-radius: 8px;
  border: 1px solid #fee2e2;
}

@media (max-width: 768px) {
  .login-container {
    padding: 20px;
    min-height: 100vh;
  }
  
  .login-box {
    padding: 32px 24px;
    margin: 10px;
    max-width: none;
    width: calc(100% - 20px);
    border-radius: 20px;
  }
  
  .logo-icon {
    font-size: 40px;
  }
  
  .login-box h1 {
    font-size: 1.5rem;
    margin-bottom: 6px;
  }
  
  .subtitle {
    font-size: 0.8125rem;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-group input {
    width: 100%;
    padding: 10px 10px 10px 36px;
    font-size: 14px;
    border-radius: 8px;
  }
  
  .login-btn {
    width: 100%;
    padding: 12px;
    font-size: 15px;
    border-radius: 8px;
  }
  
  .error {
    padding: 10px;
    font-size: 0.8125rem;
  }
}
</style>
