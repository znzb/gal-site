<template>
  <div class="join-group-page">
    <div class="header-section">
      <button @click="router.back()" class="back-btn">← 返回</button>
      <h1>💬 加入Q群</h1>
    </div>

    <div class="content-container">
      <div v-if="isLoading" class="loading">
        <div class="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto"></div>
        <p class="text-white mt-4">加载中...</p>
      </div>

      <div v-else class="qrcode-card">
        <div class="card-icon">🐧</div>
        <h2>QQ群</h2>
        
        <div class="qrcode-section">
          <img v-if="groupInfo.qrCode" :src="groupInfo.qrCode" alt="群二维码" class="qrcode-img" onerror="this.style.display='none'" />
          <div v-else class="qrcode-placeholder">
            <div class="qrcode-icon">📱</div>
            <p>群二维码</p>
          </div>
        </div>

        <div class="group-info">
          <div class="info-item">
            <span class="label">群号</span>
            <span class="value">{{ groupInfo.groupNumber }}</span>
            <button @click="copyGroupNumber" class="copy-btn">复制</button>
          </div>
          <div v-if="groupInfo.groupName" class="info-item">
            <span class="label">群名称</span>
            <span class="value">{{ groupInfo.groupName }}</span>
          </div>
        </div>

        <div v-if="groupInfo.description" class="description">
          <p>{{ groupInfo.description }}</p>
        </div>

        <div class="instructions">
          <h3>加群方式</h3>
          <ul>
            <li>方法一：扫描上方二维码</li>
            <li>方法二：复制群号搜索添加</li>
            <li>方法三：点击复制按钮后直接粘贴搜索</li>
          </ul>
        </div>

        <div class="notice">
          <div class="notice-icon">ℹ️</div>
          <p>入群申请会在24小时内通过，请耐心等待</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

const router = useRouter()
const isLoading = ref(true)
const groupInfo = ref({
  groupNumber: '123456789',
  groupName: '',
  qrCode: '',
  description: ''
})

const loadGroupInfo = async () => {
  try {
    const response = await fetch('https://game-api-p1zc.onrender.com/api/group-info')
    const data = await response.json()
    if (data) {
      groupInfo.value = {
        groupNumber: data.groupNumber || '123456789',
        groupName: data.groupName || '',
        qrCode: data.qrCode || '',
        description: data.description || ''
      }
    }
  } catch (error) {
    console.error('Failed to load group info:', error)
  } finally {
    isLoading.value = false
  }
}

const copyGroupNumber = async () => {
  try {
    await navigator.clipboard.writeText(groupInfo.value.groupNumber)
    alert('群号已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    alert('复制失败，请手动复制群号：' + groupInfo.value.groupNumber)
  }
}

onMounted(() => {
  loadGroupInfo()
})
</script>

<style scoped>
.join-group-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.header-section {
  max-width: 500px;
  margin: 0 auto 30px;
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

.content-container {
  max-width: 500px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.qrcode-card {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.card-icon {
  text-align: center;
  font-size: 80px;
  margin-bottom: 16px;
}

.qrcode-card h2 {
  text-align: center;
  margin: 0 0 30px 0;
  color: #333;
  font-size: 24px;
}

.qrcode-section {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.qrcode-img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 16px;
}

.qrcode-placeholder {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.qrcode-icon {
  font-size: 48px;
}

.qrcode-placeholder p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.group-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.label {
  color: #666;
  font-size: 14px;
  min-width: 70px;
}

.value {
  flex: 1;
  color: #333;
  font-weight: 600;
  font-size: 16px;
}

.copy-btn {
  padding: 6px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: transform 0.2s;
}

.copy-btn:hover {
  transform: scale(1.05);
}

.description {
  margin-bottom: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border-radius: 12px;
}

.description p {
  margin: 0;
  color: #e65100;
  font-size: 14px;
  line-height: 1.6;
}

.instructions {
  margin-bottom: 30px;
}

.instructions h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
}

.instructions ul {
  margin: 0;
  padding-left: 20px;
  color: #555;
  line-height: 2;
}

.notice {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 12px;
}

.notice-icon {
  font-size: 24px;
}

.notice p {
  margin: 0;
  color: #1565c0;
  font-size: 14px;
  line-height: 1.5;
}
</style>
