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
        <div class="brand">
          <div class="brand-icon">🎮</div>
          <div class="brand-text">
            <h2>后台管理</h2>
            <span>三菜鱼小站</span>
          </div>
        </div>
        <button @click="showSidebar = false" class="close-btn" v-if="isMobile">×</button>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/admin" exact class="nav-item" @click.native="showSidebar = false">
          <span class="nav-icon">📊</span>
          <span>控制台</span>
        </router-link>
        <router-link to="/admin/games" class="nav-item" @click.native="showSidebar = false">
          <span class="nav-icon">🎮</span>
          <span>游戏管理</span>
        </router-link>
        <router-link to="/admin/categories" class="nav-item" @click.native="showSidebar = false">
          <span class="nav-icon">📁</span>
          <span>分类管理</span>
        </router-link>
        <router-link to="/admin/banners" class="nav-item" @click.native="showSidebar = false">
          <span class="nav-icon">🎠</span>
          <span>轮播图管理</span>
        </router-link>
        <router-link to="/admin/announcements" class="nav-item" @click.native="showSidebar = false">
          <span class="nav-icon">📢</span>
          <span>公告管理</span>
        </router-link>
        <router-link to="/admin/patch-requests" class="nav-item" @click.native="showSidebar = false">
          <span class="nav-icon">🔧</span>
          <span>补档管理</span>
        </router-link>
        <router-link to="/admin/search-logs" class="nav-item" @click.native="showSidebar = false">
          <span class="nav-icon">🔍</span>
          <span>搜索统计</span>
        </router-link>
        <router-link to="/admin/tools" class="nav-item" @click.native="showSidebar = false">
          <span class="nav-icon">🛠️</span>
          <span>工具下载</span>
        </router-link>
        <router-link to="/admin/batch-import" class="nav-item" @click.native="showSidebar = false">
          <span class="nav-icon">📥</span>
          <span>批量导入</span>
        </router-link>
        <router-link to="/admin/group-info" class="nav-item" @click.native="showSidebar = false">
          <span class="nav-icon">🐧</span>
          <span>Q群管理</span>
        </router-link>
      </nav>
      <button @click="logout" class="logout-btn">
        <span>🚪</span> 退出登录
      </button>
    </aside>
    
    <div class="overlay" v-if="showSidebar && isMobile" @click="showSidebar = false"></div>
    
    <main class="main-content">
      <div class="content-wrapper">
        <router-view />
      </div>
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
  background: #f8f5fb;
}

.mobile-menu-btn {
  position: fixed;
  top: 14px;
  left: 14px;
  z-index: 100;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44fff 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(196, 79, 255, 0.4);
  display: none;
}

.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #ff6b9d 0%, #c44fff 100%);
  color: white;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 50;
  box-shadow: 4px 0 24px rgba(196, 79, 255, 0.15);
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  font-size: 28px;
  width: 44px;
  height: 44px;
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.brand-text h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.brand-text span {
  font-size: 11px;
  opacity: 0.75;
  display: block;
  margin-top: 2px;
}

.close-btn {
  display: none;
  background: rgba(255,255,255,0.15);
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  line-height: 1;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  transition: all 0.25s ease;
  font-size: 14px;
  border-radius: 12px;
  margin-bottom: 4px;
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(255,255,255,0.15);
  color: white;
  transform: translateX(2px);
}

.nav-item.router-link-active {
  background: rgba(255,255,255,0.22);
  color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.nav-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.logout-btn {
  margin: 16px 12px 20px;
  padding: 12px;
  background: rgba(255,255,255,0.18);
  border: 1px solid rgba(255,255,255,0.25);
  color: white;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.logout-btn:hover {
  background: rgba(255,255,255,0.28);
}

.main-content {
  flex: 1;
  overflow-y: auto;
}

.content-wrapper {
  padding: 28px 32px;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(2px);
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
    left: -260px;
    top: 0;
    bottom: 0;
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .sidebar.mobile.show {
    left: 0;
  }
  
  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .content-wrapper {
    padding: 68px 14px 14px;
  }
  
  .nav-item {
    padding: 14px;
    font-size: 15px;
  }
}
</style>
