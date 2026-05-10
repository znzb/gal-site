<template>
  <div class="search-logs-manage">
    <h1>🔍 搜索统计</h1>

    <div class="trending-section">
      <h2>热门搜索</h2>
      <div class="trending-list">
        <div v-for="(log, index) in trending" :key="log._id" class="trending-item">
          <span class="rank">{{ index + 1 }}</span>
          <span class="keyword">{{ log.keyword }}</span>
          <span class="count">{{ log.count }} 次</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { request } from '../api';

const trending = ref([]);

onMounted(async () => {
  trending.value = await request('/admin/search-logs/trending');
});
</script>

<style scoped>
h1 {
  margin-bottom: 20px;
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

.rank {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
</style>