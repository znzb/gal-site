<template>
  <div class="group-info-manage">
    <div class="header">
      <h1>🐧 Q群管理</h1>
    </div>

    <div class="content">
      <div v-if="isLoading" class="loading">
        <div class="animate-spin w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full mx-auto"></div>
        <p class="text-gray-500 mt-4">加载中...</p>
      </div>

      <div v-else class="form-container">
        <form @submit.prevent="saveGroupInfo" class="space-y-6">
          <div class="form-group">
            <label>群号</label>
            <input 
              v-model="formData.groupNumber" 
              type="text" 
              placeholder="请输入QQ群号"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div class="form-group">
            <label>群名称</label>
            <input 
              v-model="formData.groupName" 
              type="text" 
              placeholder="请输入群名称"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div class="form-group">
            <label>二维码图片URL</label>
            <input 
              v-model="formData.qrCode" 
              type="text" 
              placeholder="请输入二维码图片链接"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <div v-if="formData.qrCode" class="mt-4">
              <p class="text-sm text-gray-500 mb-2">预览：</p>
              <img :src="formData.qrCode" alt="二维码预览" class="w-40 h-40 object-cover rounded-lg border border-gray-200" onerror="this.style.display='none'" />
            </div>
          </div>

          <div class="form-group">
            <label>描述/说明</label>
            <textarea 
              v-model="formData.description" 
              rows="4" 
              placeholder="请输入群描述或说明"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            ></textarea>
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              :disabled="isSaving"
              class="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSaving ? '保存中...' : '保存修改' }}
            </button>
          </div>
        </form>

        <div class="preview-section">
          <h3 class="text-lg font-bold text-gray-800 mb-4">效果预览</h3>
          <div class="bg-white rounded-2xl overflow-hidden shadow-lg max-w-md">
            <div class="bg-gradient-to-r from-pink-500 to-pink-600 p-6 text-white text-center">
              <h2 class="text-2xl font-bold">💬 加入Q群</h2>
            </div>
            
            <div class="p-6 text-center">
              <div class="w-40 h-40 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-pink-100">
                <span class="text-6xl">{{ formData.qrCode ? '📷' : '🐧' }}</span>
              </div>
              
              <div class="bg-pink-50 rounded-xl p-4 mb-4 border border-pink-100">
                <p class="text-gray-600 text-sm mb-2">{{ formData.groupName }}</p>
                <p class="text-2xl font-bold text-gray-800 mb-3">{{ formData.groupNumber }}</p>
                <button class="px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg">
                  复制群号
                </button>
              </div>
              
              <p class="text-sm text-gray-500">{{ formData.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { request } from '../api';

const isLoading = ref(true);
const isSaving = ref(false);
const formData = ref({
  groupNumber: '',
  groupName: '',
  qrCode: '',
  description: ''
});

const loadGroupInfo = async () => {
  try {
    const data = await request('/group-info');
    if (data) {
      formData.value = {
        groupNumber: data.groupNumber || '',
        groupName: data.groupName || '',
        qrCode: data.qrCode || '',
        description: data.description || ''
      };
    }
  } catch (error) {
    console.error('加载Q群信息失败:', error);
    alert('加载失败');
  } finally {
    isLoading.value = false;
  }
};

const saveGroupInfo = async () => {
  if (!formData.value.groupNumber.trim()) {
    alert('请输入群号');
    return;
  }

  isSaving.value = true;
  try {
    await request('/group-info', {
      method: 'PUT',
      body: JSON.stringify(formData.value)
    });
    alert('保存成功！');
  } catch (error) {
    console.error('保存失败:', error);
    alert('保存失败');
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  loadGroupInfo();
});
</script>

<style scoped>
.group-info-manage {
  padding: 20px;
}

.header {
  margin-bottom: 30px;
}

.header h1 {
  font-size: 1.75rem;
  font-weight: bold;
  color: #1f2937;
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.form-container {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
}

.form-actions {
  padding-top: 10px;
}

.preview-section {
  background: #f8fafc;
  padding: 30px;
  border-radius: 12px;
}

@media (max-width: 1024px) {
  .content {
    grid-template-columns: 1fr;
  }
}
</style>
