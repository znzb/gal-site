<template>
  <div class="yuzusoft-page">
    <div class="header-section">
      <button @click="router.back()" class="back-btn">← 返回</button>
      <h1>🎵 柚子社</h1>
    </div>

    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">🍊</div>
        <h2>柚子社 (Yuzusoft)</h2>
        <p>日本知名美少女游戏制作公司</p>
      </div>
    </div>

    <div class="games-section">
      <div class="section-header">
        <h3>柚子社作品集</h3>
        <span class="game-count">共 {{ filteredGames.length }} 部作品</span>
      </div>

      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
      </div>

      <div v-else-if="filteredGames.length === 0" class="empty-state">
        <div class="empty-icon">🎮</div>
        <h3>暂无柚子社作品</h3>
        <p>敬请期待更多柚子社游戏</p>
      </div>

      <div v-else class="games-grid">
        <div 
          v-for="game in filteredGames" 
          :key="game.id || game._id"
          class="game-card"
          @click="showGameDetail(game)"
        >
          <div class="game-cover">
            <img :src="game.cover" :alt="game.name" />
            <div class="overlay">
              <span class="view-btn">查看详情</span>
            </div>
          </div>
          <div class="game-info">
            <h4>{{ game.name }}</h4>
            <p class="game-size">{{ game.size || '未知大小' }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedGame" class="modal-overlay" @click="selectedGame = null">
      <div class="game-modal" @click.stop>
        <button class="close-btn" @click="selectedGame = null">×</button>
        <div class="modal-cover">
          <img :src="selectedGame.cover" :alt="selectedGame.name" />
        </div>
        <div class="modal-content">
          <h2>{{ selectedGame.name }}</h2>
          <div class="game-meta">
            <span class="meta-item">📦 {{ selectedGame.size || '未知大小' }}</span>
            <span class="meta-item">📅 {{ formatDate(selectedGame.releaseDate) }}</span>
            <span class="meta-item">⬇️ {{ selectedGame.downloads || 0 }} 下载</span>
          </div>
          <div class="game-tags">
            <span v-for="tag in selectedGame.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <p class="game-description">{{ selectedGame.description }}</p>
          <button class="download-btn">立即下载</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { gameApi } from '@/api/api'

const router = useRouter()
const games = ref([])
const isLoading = ref(true)
const selectedGame = ref(null)

const filteredGames = computed(() => {
  return games.value.filter(game => {
    const name = (game.name || '').toLowerCase()
    const tags = (game.tags || []).map(t => t.toLowerCase())
    return name.includes('柚子') || tags.some(tag => tag.includes('柚子'))
  })
})

const formatDate = (date) => {
  if (!date) return '未知'
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const showGameDetail = (game) => {
  selectedGame.value = game
}

onMounted(async () => {
  try {
    const data = await gameApi.getGames()
    games.value = data.games || data || []
  } catch (error) {
    console.error('Failed to load games:', error)
    games.value = []
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.yuzusoft-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding-bottom: 40px;
}

.header-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.back-btn:hover {
  background: white;
  transform: translateX(-2px);
}

.header-section h1 {
  color: white;
  font-size: 28px;
  font-weight: bold;
  margin: 0;
}

.hero-section {
  max-width: 1200px;
  margin: 0 auto 40px;
  padding: 0 20px;
}

.hero-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.hero-icon {
  font-size: 100px;
  margin-bottom: 20px;
}

.hero-content h2 {
  margin: 0 0 12px 0;
  font-size: 36px;
  color: #333;
}

.hero-content p {
  margin: 0;
  color: #666;
  font-size: 18px;
}

.games-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h3 {
  margin: 0;
  color: white;
  font-size: 24px;
}

.game-count {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  background: white;
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.empty-state p {
  margin: 0;
  color: #666;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.game-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.game-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.game-cover {
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
}

.game-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.game-card:hover .overlay {
  opacity: 1;
}

.view-btn {
  background: white;
  color: #333;
  padding: 10px 24px;
  border-radius: 24px;
  font-weight: 600;
}

.game-info {
  padding: 16px;
}

.game-info h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
}

.game-size {
  margin: 0;
  color: #999;
  font-size: 14px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.game-modal {
  background: white;
  border-radius: 24px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  font-size: 24px;
  cursor: pointer;
  z-index: 1;
}

.modal-cover {
  aspect-ratio: 16/9;
  overflow: hidden;
}

.modal-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-content {
  padding: 32px;
}

.modal-content h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 28px;
}

.game-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.meta-item {
  color: #666;
  font-size: 14px;
}

.game-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.tag {
  background: #f0f0f0;
  color: #666;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
}

.game-description {
  color: #555;
  line-height: 1.8;
  margin-bottom: 30px;
}

.download-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.download-btn:hover {
  transform: scale(1.02);
}
</style>
