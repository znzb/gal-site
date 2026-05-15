<template>
  <div class="announcements-page">
    <div class="header-section">
      <button @click="router.back()" class="back-btn">← 返回</button>
      <h1>📢 网站公告</h1>
    </div>

    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
    </div>

    <div v-else-if="announcements.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <h2>暂无公告</h2>
      <p>敬请期待更多精彩内容</p>
    </div>

    <div v-else class="announcements-list">
      <div 
        v-for="announcement in announcements" 
        :key="announcement.id || announcement._id"
        class="announcement-card"
      >
        <div class="card-header">
          <div class="header-left">
            <span v-if="announcement.isPinned" class="pinned-badge">置顶</span>
            <h2>{{ announcement.title }}</h2>
          </div>
          <span class="date">{{ formatDate(announcement.createdAt) }}</span>
        </div>
        <div class="card-body">
          <p>{{ announcement.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { announcementApi } from '@/api/api'

const router = useRouter()
const announcements = ref([])
const isLoading = ref(true)
let dataRefreshTimer: number | null = null

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadAnnouncements = async () => {
  try {
    const data = await announcementApi.getAllAnnouncements()
    announcements.value = data || []
  } catch (error) {
    console.error('Failed to load announcements:', error)
    announcements.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadAnnouncements()
  dataRefreshTimer = window.setInterval(() => {
    loadAnnouncements()
  }, 60000)
})

onUnmounted(() => {
  if (dataRefreshTimer) {
    clearInterval(dataRefreshTimer)
  }
})
</script>

<style scoped>
.announcements-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%);
  padding: 20px;
}

.header-section {
  max-width: 800px;
  margin: 0 auto 30px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  padding: 10px 20px;
  background: rgba(236, 72, 153, 0.1);
  border: 1px solid rgba(236, 72, 153, 0.2);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #ec4899;
  transition: all 0.3s;
}

.back-btn:hover {
  background: rgba(236, 72, 153, 0.2);
  transform: translateX(-2px);
}

.header-section h1 {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 28px;
  font-weight: bold;
  margin: 0;
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
  border: 4px solid rgba(236, 72, 153, 0.2);
  border-top-color: #ec4899;
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
  max-width: 400px;
  margin: 0 auto;
  box-shadow: 0 10px 40px rgba(236, 72, 153, 0.1);
  border: 1px solid rgba(236, 72, 153, 0.1);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.empty-state p {
  color: #ec4899;
  margin: 0;
}

.announcements-list {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.announcement-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(236, 72, 153, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid rgba(236, 72, 153, 0.1);
}

.announcement-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(236, 72, 153, 0.15);
}

.card-header {
  padding: 24px;
  background: linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%);
  border-bottom: 1px solid rgba(236, 72, 153, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.pinned-badge {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.date {
  color: #ec4899;
  font-size: 14px;
  white-space: nowrap;
}

.card-body {
  padding: 24px;
}

.card-body p {
  margin: 0;
  color: #555;
  line-height: 1.8;
  font-size: 15px;
}
</style>
