<template>
  <div class="patch-records-page">
    <div class="header-section">
      <button @click="router.back()" class="back-btn">← 返回</button>
      <h1>📋 补档记录</h1>
    </div>

    <div class="records-container">
      <div class="info-card">
        <div class="info-icon">💡</div>
        <div class="info-content">
          <h3>什么是补档？</h3>
          <p>补档是指游戏资源因各种原因失效后，通过玩家申请重新上传的游戏文件。</p>
        </div>
      </div>

      <div class="tabs">
        <button 
          :class="{ active: activeTab === 'all' }"
          @click="activeTab = 'all'"
        >
          全部记录 ({{ allRecords.length }})
        </button>
        <button 
          :class="{ active: activeTab === 'completed' }"
          @click="activeTab = 'completed'"
        >
          已完成 ({{ completedRecords.length }})
        </button>
        <button 
          :class="{ active: activeTab === 'pending' }"
          @click="activeTab = 'pending'"
        >
          处理中 ({{ pendingRecords.length }})
        </button>
      </div>

      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
      </div>

      <div v-else-if="displayedRecords.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>{{ emptyStateMessage }}</h3>
        <p>暂无相关补档记录</p>
      </div>

      <div v-else class="records-list">
        <div 
          v-for="record in displayedRecords" 
          :key="record.id || record._id"
          class="record-card"
        >
          <div class="record-header">
            <div class="record-title">
              <span class="status-badge" :class="record.status">
                {{ getStatusText(record.status) }}
              </span>
              <h3>{{ record.gameName || '未知游戏' }}</h3>
            </div>
            <span class="record-date">{{ formatDate(record.createdAt) }}</span>
          </div>

          <div class="record-body">
            <p class="record-description">{{ record.description || '无描述' }}</p>
            
            <div class="record-meta">
              <span class="meta-item">👤 {{ record.requester || '匿名用户' }}</span>
              <span class="meta-item">📅 {{ formatDate(record.createdAt) }}</span>
            </div>

            <div v-if="record.adminReply" class="admin-reply">
              <div class="reply-header">
                <span class="reply-icon">👨‍💼</span>
                <span>管理员回复</span>
              </div>
              <p>{{ record.adminReply }}</p>
            </div>

            <div v-if="record.downloadUrl" class="download-section">
              <a :href="record.downloadUrl" target="_blank" class="download-btn">
                ⬇️ 下载补档文件
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const patchRequests = ref([])
const isLoading = ref(true)
const activeTab = ref('all')

const allRecords = computed(() => patchRequests.value)
const completedRecords = computed(() => 
  patchRequests.value.filter(r => r.status === 'completed' || r.status === '已处理')
)
const pendingRecords = computed(() => 
  patchRequests.value.filter(r => r.status === 'pending' || r.status === '待处理')
)

const displayedRecords = computed(() => {
  switch (activeTab.value) {
    case 'completed':
      return completedRecords.value
    case 'pending':
      return pendingRecords.value
    default:
      return allRecords.value
  }
})

const emptyStateMessage = computed(() => {
  switch (activeTab.value) {
    case 'completed':
      return '暂无已完成的补档'
    case 'pending':
      return '暂无处理中的补档'
    default:
      return '暂无补档记录'
  }
})

const formatDate = (date) => {
  if (!date) return '未知时间'
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusText = (status) => {
  const statusMap = {
    'pending': '待处理',
    'processing': '处理中',
    'completed': '已完成',
    'rejected': '已拒绝'
  }
  return statusMap[status] || status || '未知状态'
}

onMounted(async () => {
  try {
    const response = await fetch('https://game-api-p1zc.onrender.com/api/patch-requests')
    const data = await response.json()
    patchRequests.value = data.requests || data || []
  } catch (error) {
    console.error('Failed to load patch records:', error)
    patchRequests.value = []
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.patch-records-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 40px;
}

.header-section {
  max-width: 900px;
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

.records-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.info-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.info-icon {
  font-size: 48px;
  flex-shrink: 0;
}

.info-content h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.info-content p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.tabs button {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid transparent;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  font-weight: 500;
}

.tabs button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.tabs button.active {
  background: white;
  color: #667eea;
  border-color: white;
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

.records-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.record-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.record-card:hover {
  transform: translateY(-4px);
}

.record-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.record-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.pending,
.status-badge.processing {
  background: #fff3cd;
  color: #856404;
}

.status-badge.completed {
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.record-title h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.record-date {
  color: #999;
  font-size: 14px;
  white-space: nowrap;
}

.record-body {
  padding: 24px;
}

.record-description {
  margin: 0 0 16px 0;
  color: #555;
  line-height: 1.6;
}

.record-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.meta-item {
  color: #999;
  font-size: 14px;
}

.admin-reply {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.admin-reply p {
  margin: 0;
  color: #555;
  line-height: 1.6;
}

.download-section {
  margin-top: 16px;
}

.download-btn {
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.2s;
}

.download-btn:hover {
  transform: scale(1.05);
}
</style>
