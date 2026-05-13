<template>
  <div class="search-logs-manage">
    <h1>🔍 搜索统计</h1>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>❌ {{ error }}</p>
    </div>

    <div v-else class="trending-section">
      <h2>热门搜索</h2>
      <div class="trending-list">
        <div v-for="(log, index) in trending" :key="log._id || log.keyword" class="trending-item">
          <span class="rank">{{ index + 1 }}</span>
          <span class="keyword">{{ log.keyword }}</span>
          <span class="count">{{ log.count }} 次</span>
        </div>
      </div>
      
      <div v-if="trending.length === 0" class="empty">
        <p>暂无搜索记录</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { request } from '../api';

const trending = ref([]);
const isLoading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const result = await request('/admin/search-logs/trending');
    trending.value = Array.isArray(result) ? result : [];
  } catch (err) {
    console.error('Failed to load search logs:', err);
    trending.value = [];
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
h1 {
  margin-bottom: 20px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ec4899;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  padding: 40px;
  text-align: center;
  color: #ef4444;
}

.trending-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
}

.trending-section h2 {
  margin-top: 0;
  margin-bottom: 20px;
}

.trending-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trending-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.empty {
  text-align: center;
  padding: 20px;
  color: #9ca3af;
}

.rank {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: white;
  border-radius: 50%;
  font-weight: bold;
}

.keyword {
  flex: 1;
  font-weight: 500;
}

.count {
  color: #666;
}

@media (max-width: 768px) {
  h2 {
    font-size: 1.25rem;
  }
  
  .rank {
    width: 26px;
    height: 26px;
    font-size: 12px;
  }
  
  .keyword {
    font-size: 14px;
  }
  
  .count {
    font-size: 14px;
  }
}
</style>
