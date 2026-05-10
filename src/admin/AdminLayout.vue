<template>
  <div class="admin-layout">
    <button 
      v-if="isLoggedIn"
      @click="showSidebar = !showSidebar" 
      class="mobile-menu-btn"
    >
      ☰
    </button>
    
    <aside class="sidebar" :class="{ 'show': showSidebar, 'mobile': isMobile }" v-if="isLoggedIn">
      <div class="sidebar-header">
        <h2>后台管理</h2>
        <button @click="showSidebar = false" class="close-btn" v-if="isMobile">×</button>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/admin" exact class="nav-item" @click.native="showSidebar = false">
          <span>📊</span> 控制台
        </router-link>
        <router-link to="/admin/games" class="nav-item" @click.native="showSidebar = false">
          <span>🎮</span> 游戏管理
        </router-link>
        <router-link to="/admin/categories" class="nav-item" @click.native="showSidebar = false">
          <span>📁</span> 分类管理
        </router-link>
        <router-link to="/admin/banners" class="nav-item" @click.native="showSidebar = false">
          <span>🎠</span> 轮播图管理
        </router-link>
        <router-link to="/admin/announcements" class="nav-item" @click.native="showSidebar = false">
          <span>📢</span> 公告管理
        </router-link>
        <router-link to="/admin/patch-requests" class="nav-item" @click.native="showSidebar = false">
          <span>🔧</span> 补档管理
        </router-link>
        <router-link to="/admin/search-logs" class="nav-item" @click.native="showSidebar = false">
          <span>🔍</span> 搜索统计
        </router-link>
      </nav>
      <button @click="logout" class="logout-btn">退出登录</button>
    </aside>
    
    <div class="overlay" v-if="showSidebar && isMobile" @click="showSidebar = false"></div>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { clearToken } from './api';

const router = useRouter();
const showSidebar = ref(false);
const isMobile = ref(false);

const isLoggedIn = computed(() => localStorage.getItem('adminToken'));

function checkMobile() {
  isMobile.value = window.innerWidth < 768;
  if (!isMobile.value) {
    showSidebar.value = true;
  }
}

function logout() {
  clearToken();
  router.push('/admin/login');
}

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.mobile-menu-btn {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 100;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  display: none;
}

.sidebar {
  width: 250px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 50;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
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
  font-size: 14px;
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

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 40;
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .sidebar {
    position: fixed;
    left: -250px;
    top: 0;
    bottom: 0;
    transition: left 0.3s ease;
    z-index: 100;
  }
  
  .sidebar.mobile.show {
    left: 0;
  }
  
  .close-btn {
    display: block;
  }
  
  .main-content {
    padding: 60px 10px 10px;
  }
  
  .nav-item {
    padding: 14px 20px;
    font-size: 16px;
  }
}
</style>