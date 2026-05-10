<template>
  <div class="admin-layout">
    <aside class="sidebar" v-if="isLoggedIn">
      <div class="sidebar-header">
        <h2>后台管理</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/admin" exact class="nav-item">
          <span>📊</span> 控制台
        </router-link>
        <router-link to="/admin/games" class="nav-item">
          <span>🎮</span> 游戏管理
        </router-link>
        <router-link to="/admin/categories" class="nav-item">
          <span>📁</span> 分类管理
        </router-link>
        <router-link to="/admin/banners" class="nav-item">
          <span>🎠</span> 轮播图管理
        </router-link>
        <router-link to="/admin/announcements" class="nav-item">
          <span>📢</span> 公告管理
        </router-link>
        <router-link to="/admin/patch-requests" class="nav-item">
          <span>🔧</span> 补档管理
        </router-link>
        <router-link to="/admin/search-logs" class="nav-item">
          <span>🔍</span> 搜索统计
        </router-link>
      </nav>
      <button @click="logout" class="logout-btn">退出登录</button>
    </aside>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { clearToken } from './api';

const router = useRouter();

const isLoggedIn = computed(() => localStorage.getItem('adminToken'));

function logout() {
  clearToken();
  router.push('/admin/login');
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.2);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.nav-item {
  display: block;
  padding: 15px 20px;
  color: white;
  text-decoration: none;
  transition: background 0.2s;
}

.nav-item:hover, .nav-item.router-link-active {
  background: rgba(255,255,255,0.1);
}

.logout-btn {
  margin: 20px;
  padding: 10px;
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  border-radius: 8px;
  cursor: pointer;
}

.main-content {
  flex: 1;
  padding: 20px;
  background: #f5f7fa;
  overflow-y: auto;
}
</style>