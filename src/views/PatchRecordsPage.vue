<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const patchRequests = ref([])
const isLoading = ref(true)
const activeTab = ref('all')

const allRecords = computed(() => patchRequests.value)
const completedRecords = computed(() => 
  patchRequests.value.filter(r => r.status === 'completed' || r.status === '已处理')
)
const pendingRecords = computed(() => 
  patchRequests.value.filter(r => r.status === 'pending' || r.status === '待处理' || r.status === 'processing')
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

const formatDate = (date) => {
  if (!date) return '未知时间'
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const getStatusText = (status) => {
  const statusMap = {
    'pending': '待处理',
    'processing': '处理中',
    'completed': '已完成',
    '已处理': '已完成',
    '待处理': '待处理',
    'rejected': '已拒绝'
  }
  return statusMap[status] || status || '未知状态'
}

const getStatusClass = (status) => {
  const classMap = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'processing': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    '已处理': 'bg-green-100 text-green-800',
    '待处理': 'bg-yellow-100 text-yellow-800',
    'rejected': 'bg-red-100 text-red-800'
  }
  return classMap[status] || 'bg-gray-100 text-gray-800'
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

<template>
  <div class="min-h-screen bg-gray-100 pb-20">
    <header class="fixed top-0 left-0 right-0 bg-white shadow-sm z-30">
      <div class="flex items-center px-4 py-3">
        <button 
          @click="router.back()"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors mr-3"
        >
          <ArrowLeft class="w-6 h-6 text-gray-600" />
        </button>
        <h1 class="text-lg font-bold text-gray-800">📋 补档记录</h1>
      </div>
    </header>
    
    <div v-if="isLoading" class="pt-14 flex items-center justify-center h-40">
      <div class="w-10 h-10 border-3 border-gray-300 border-t-primary rounded-full animate-spin"></div>
    </div>
    
    <div v-else class="pt-14 px-4 mt-4">
      <div class="bg-white rounded-xl p-4 mb-4">
        <p class="text-sm text-gray-600">补档是指游戏资源失效后重新上传的文件</p>
      </div>
      
      <div class="flex gap-2 mb-4 overflow-x-auto">
        <button 
          :class="['px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors', 
            activeTab === 'all' ? 'bg-primary text-white' : 'bg-white text-gray-600']"
          @click="activeTab = 'all'"
        >
          全部 ({{ allRecords.length }})
        </button>
        <button 
          :class="['px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors', 
            activeTab === 'completed' ? 'bg-primary text-white' : 'bg-white text-gray-600']"
          @click="activeTab = 'completed'"
        >
          已完成 ({{ completedRecords.length }})
        </button>
        <button 
          :class="['px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors', 
            activeTab === 'pending' ? 'bg-primary text-white' : 'bg-white text-gray-600']"
          @click="activeTab = 'pending'"
        >
          处理中 ({{ pendingRecords.length }})
        </button>
      </div>
      
      <div v-if="displayedRecords.length === 0" class="text-center py-20 bg-white rounded-xl">
        <p class="text-gray-400">暂无相关记录</p>
      </div>
      
      <div v-else class="space-y-3">
        <div v-for="record in displayedRecords" :key="record.id || record._id" class="bg-white rounded-xl p-4">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h3 class="font-bold text-gray-800 mb-1">{{ record.gameName || '未知游戏' }}</h3>
              <p class="text-sm text-gray-500">{{ formatDate(record.createdAt) }}</p>
            </div>
            <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusClass(record.status)]">
              {{ getStatusText(record.status) }}
            </span>
          </div>
          
          <p class="text-sm text-gray-600 mb-3">{{ record.description || '无描述' }}</p>
          
          <div v-if="record.adminReply" class="bg-blue-50 rounded-lg p-3 mb-3">
            <p class="text-xs text-blue-600 font-medium mb-1">👨‍💼 管理员回复</p>
            <p class="text-sm text-gray-700">{{ record.adminReply }}</p>
          </div>
          
          <div v-if="record.downloadUrl" class="mt-3">
            <a :href="record.downloadUrl" target="_blank" class="block w-full py-2 bg-primary text-white text-center rounded-lg text-sm font-medium">
              ⬇️ 下载文件
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
