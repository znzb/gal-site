<template>
  <div class="dashboard">
    <h1>📊 控制台</h1>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🎮</div>
        <div class="stat-content">
          <h3>游戏总数</h3>
          <p class="stat-number">{{ stats.totalGames }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📁</div>
        <div class="stat-content">
          <h3>分类数</h3>
          <p class="stat-number">{{ stats.totalCategories }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📢</div>
        <div class="stat-content">
          <h3>公告数</h3>
          <p class="stat-number">{{ stats.totalAnnouncements }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🔧</div>
        <div class="stat-content">
          <h3>补档申请</h3>
          <p class="stat-number">{{ stats.totalPatchRequests }}</p>
        </div>
      </div>
    </div>

    <div class="recent-section">
      <h2>最近添加的游戏</h2>
      <div class="games-list">
        <div v-for="game in stats.recentGames" :key="game._id" class="game-item">
          <img :src="game.cover" class="game-cover" />
          <div class="game-info">
            <h4>{{ game.name }}</h4>
            <p>{{ game.category }}</p>
          </div>
        </div>
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
.dashboard h1 {
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 48px;
}

.stat-content h3 {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}

.stat-number {
  margin: 0;
  font-size: 32px;
  font-weight: bold;
  color: #667eea;
}

.recent-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
}

.games-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.game-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.game-cover {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.game-info h4 {
  margin: 0 0 4px 0;
}

.game-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}
</style>