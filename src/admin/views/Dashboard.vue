<template>
  <div class="dashboard">
    <div class="page-header">
      <div>
        <h1>控制台</h1>
        <p class="page-subtitle">欢迎回来，查看站点数据概览</p>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card stat-pink">
        <div class="stat-icon-wrap">
          <span class="stat-emoji">🎮</span>
        </div>
        <div class="stat-content">
          <h3>游戏总数</h3>
          <p class="stat-number">{{ stats.totalGames }}</p>
        </div>
      </div>
      <div class="stat-card stat-purple">
        <div class="stat-icon-wrap">
          <span class="stat-emoji">📁</span>
        </div>
        <div class="stat-content">
          <h3>分类数</h3>
          <p class="stat-number">{{ stats.totalCategories }}</p>
        </div>
      </div>
      <div class="stat-card stat-blue">
        <div class="stat-icon-wrap">
          <span class="stat-emoji">📢</span>
        </div>
        <div class="stat-content">
          <h3>公告数</h3>
          <p class="stat-number">{{ stats.totalAnnouncements }}</p>
        </div>
      </div>
      <div class="stat-card stat-orange">
        <div class="stat-icon-wrap">
          <span class="stat-emoji">🔧</span>
        </div>
        <div class="stat-content">
          <h3>补档申请</h3>
          <p class="stat-number">{{ stats.totalPatchRequests }}</p>
        </div>
      </div>
    </div>

    <div class="recent-section">
      <div class="section-header">
        <h2>最近添加的游戏</h2>
      </div>
      <div v-if="stats.recentGames && stats.recentGames.length > 0" class="games-list">
        <div v-for="game in stats.recentGames" :key="game._id" class="game-item">
          <img :src="game.cover" class="game-cover" />
          <div class="game-info">
            <h4>{{ game.name }}</h4>
            <p>{{ game.category }}</p>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <span class="empty-emoji">🎮</span>
        <p>暂无游戏数据</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { request } from '../api';

const stats = ref({
  totalGames: 0,
  totalCategories: 0,
  totalAnnouncements: 0,
  totalPatchRequests: 0,
  recentGames: []
});

onMounted(async () => {
  try {
    const data = await request('/admin/stats');
    stats.value = data;
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
});
</script>

<style scoped>
.page-header {
  margin-bottom: 28px;
}

.page-header h1 {
  margin: 0 0 6px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f1f36;
}

.page-subtitle {
  margin: 0;
  color: #8a86a0;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  gap: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.03);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.08);
}

.stat-icon-wrap {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-emoji {
  font-size: 26px;
}

.stat-pink .stat-icon-wrap {
  background: linear-gradient(135deg, #ffe0ec 0%, #ffb3d1 100%);
}
.stat-purple .stat-icon-wrap {
  background: linear-gradient(135deg, #f3e0ff 0%, #d9b3ff 100%);
}
.stat-blue .stat-icon-wrap {
  background: linear-gradient(135deg, #e0e8ff 0%, #b3c6ff 100%);
}
.stat-orange .stat-icon-wrap {
  background: linear-gradient(135deg, #ffe8e0 0%, #ffc2b3 100%);
}

.stat-content h3 {
  margin: 0 0 6px 0;
  color: #8a86a0;
  font-size: 13px;
  font-weight: 500;
}

.stat-number {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  color: #1f1f36;
  letter-spacing: -0.5px;
}

.stat-pink .stat-number { color: #ff6b9d; }
.stat-purple .stat-number { color: #c44fff; }
.stat-blue .stat-number { color: #5b7cfa; }
.stat-orange .stat-number { color: #ff7a45; }

.recent-section {
  background: white;
  padding: 24px;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.03);
}

.section-header {
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f0ecf4;
}

.section-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1f1f36;
}

.games-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}

.game-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #faf7fc;
  border-radius: 12px;
  border: 1px solid #f0ecf4;
  transition: all 0.25s;
}

.game-item:hover {
  background: #fff;
  border-color: #e0d5f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(196, 79, 255, 0.08);
}

.game-cover {
  width: 54px;
  height: 72px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.game-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.game-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f1f36;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.game-info p {
  margin: 0;
  color: #8a86a0;
  font-size: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #8a86a0;
}

.empty-emoji {
  font-size: 40px;
  display: block;
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 20px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .stat-card {
    padding: 16px;
    gap: 12px;
  }
  
  .stat-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 12px;
  }
  
  .stat-emoji {
    font-size: 22px;
  }
  
  .stat-number {
    font-size: 22px;
  }
  
  .recent-section {
    padding: 16px;
  }
  
  .games-list {
    grid-template-columns: 1fr;
  }
}
</style>
