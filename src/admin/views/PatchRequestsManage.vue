<template>
  <div class="patch-requests-manage">
    <h1>🔧 补档管理</h1>

    <div class="filters">
      <select v-model="filterStatus">
        <option value="">所有状态</option>
        <option value="pending">待处理</option>
        <option value="approved">已批准</option>
        <option value="rejected">已拒绝</option>
        <option value="completed">已完成</option>
      </select>
    </div>

    <div class="requests-list">
      <div v-for="req in filteredRequests" :key="req._id" class="request-card">
        <div class="request-header">
          <h3>{{ req.gameName }}</h3>
          <span :class="['status-badge', req.status">{{ statusText(req.status) }}"></span>
        </div>
        <p v-if="req.userEmail" class="email">申请人: {{ req.userEmail }}</p>
        <p v-if="req.description" class="description">{{ req.description }}</p>
        <div class="request-footer">
          <span>{{ new Date(req.createdAt).toLocaleString() }}</span>
          <div class="request-actions">
            <button v-if="req.status === 'pending'" @click="updateStatus(req._id, 'approved')" class="approve-btn">批准</button>
            <button v-if="req.status === 'pending'" @click="updateStatus(req._id, 'rejected')" class="reject-btn">拒绝</button>
            <button v-if="req.status === 'approved'" @click="updateStatus(req._id, 'completed')" class="complete-btn">完成</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { request } from '../api';

const requests = ref([]);
const filterStatus = ref('');

const filteredRequests = computed(() => {
  if (!filterStatus.value) return requests.value;
  return requests.value.filter(r => r.status === filterStatus.value);
});

onMounted(async () => {
  await loadRequests();
});

async function loadRequests() {
  const url = filterStatus.value ? `/admin/patch-requests?status=${filterStatus.value}` : '/admin/patch-requests';
  requests.value = await request(url);
}

function statusText(status) {
  const map = {
    pending: '待处理',
    approved: '已批准',
    rejected: '已拒绝',
    completed: '已完成'
  };
  return map[status] || status;
}

async function updateStatus(id, status) {
  await request(`/admin/patch-requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
  await loadRequests();
}
</script>

<style scoped>
h1 {
  margin-bottom: 20px;
}

.filters {
  margin-bottom: 20px;
}

.filters select {
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.request-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.request-header h3 {
  margin: 0;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.pending {
  background: #f39c12;
  color: white;
}

.status-badge.approved {
  background: #3498db;
  color: white;
}

.status-badge.rejected {
  background: #e74c3c;
  color: white;
}

.status-badge.completed {
  background: #27ae60;
  color: white;
}

.email {
  color: #666;
  font-size: 14px;
  margin: 4px 0;
}

.description {
  color: #444;
  margin: 8px 0;
}

.request-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #888;
  font-size: 14px;
  margin-top: 12px;
}

.request-actions {
  display: flex;
  gap: 8px;
}

.approve-btn {
  padding: 6px 12px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.reject-btn {
  padding: 6px 12px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.complete-btn {
  padding: 6px 12px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>