<template>
  <div class="login-container">
    <div class="bg-bubbles">
      <div v-for="n in 6" :key="n" class="bubble" :class="`bubble-${n}`"></div>
    </div>
    <div class="login-box">
      <div class="logo-section">
        <div class="logo-icon">🎮</div>
        <h1>后台管理</h1>
        <p class="subtitle">三菜鱼小站 · 管理系统</p>
      </div>
      <form @submit.prevent="login">
        <div class="form-group">
          <label>用户名</label>
          <div class="input-wrapper">
            <span class="input-icon">👤</span>
            <input v-model="username" type="text" placeholder="请输入用户名" required autofocus />
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
  background: linear-gradient(135deg, #ff6b9d 0%, #c44fff 100%);
  background-attachment: fixed;
  position: relative;
  overflow: hidden;
}

.bg-bubbles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bubble {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  animation: float 8s ease-in-out infinite;
}

.bubble-1 { width: 80px; height: 80px; top: 10%; left: 8%; animation-delay: 0s; }
.bubble-2 { width: 40px; height: 40px; top: 20%; right: 12%; animation-delay: 1s; animation-duration: 6s; }
.bubble-3 { width: 60px; height: 60px; bottom: 18%; left: 15%; animation-delay: 2s; animation-duration: 9s; }
.bubble-4 { width: 30px; height: 30px; bottom: 25%; right: 20%; animation-delay: 0.5s; }
.bubble-5 { width: 100px; height: 100px; top: 55%; left: 5%; animation-delay: 3s; animation-duration: 10s; }
.bubble-6 { width: 50px; height: 50px; top: 40%; right: 6%; animation-delay: 1.5s; animation-duration: 7s; }

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
}

.login-box {
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(20px);
  padding: 44px 40px;
  border-radius: 28px;
  box-shadow: 0 25px 80px rgba(196, 79, 255, 0.35), 0 0 0 1px rgba(255,255,255,0.5) inset;
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 1;
}

.logo-section {
  text-align: center;
  margin-bottom: 36px;
}

.logo-icon {
  font-size: 56px;
  width: 88px;
  height: 88px;
  margin: 0 auto 18px;
  background: linear-gradient(135deg, #ffe0ec 0%, #f3e0ff 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(196, 79, 255, 0.2);
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
  letter-spacing: 0.5px;
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
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #c44fff;
}

.form-group input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1.5px solid #f0e6f6;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #faf7fc;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #c44fff;
  box-shadow: 0 0 0 4px rgba(196, 79, 255, 0.1);
  background: white;
}

.form-group input::placeholder {
  color: #c0b8cc;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44fff 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 8px 20px rgba(196, 79, 255, 0.35);
  margin-top: 8px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(196, 79, 255, 0.45);
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
  font-size: 0.85rem;
  padding: 10px 14px;
  background: #fef2f2;
  border-radius: 10px;
  border: 1px solid #fee2e2;
}

@media (max-width: 768px) {
  .login-container {
    padding: 20px;
  }
  
  .login-box {
    padding: 32px 20px;
    border-radius: 22px;
  }
  
  .logo-icon {
    width: 72px;
    height: 72px;
    font-size: 44px;
  }
  
  .login-box h1 {
    font-size: 1.5rem;
  }
}
</style>
