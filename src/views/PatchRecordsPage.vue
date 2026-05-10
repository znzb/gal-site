<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Menu } from 'lucide-vue-next'
import { appState } from '@/store/appStore'

const router = useRouter()
const records = ref<any[]>([])
const isLoading = ref(true)

const mockRecords = [
  { id: '1', gameName: '夏日物语', status: '已补档', time: '2024-06-15 10:30', reason: '链接失效' },
  { id: '2', gameName: '星空幻想', status: '已补档', time: '2024-06-14 15:20', reason: '资源更新' },
  { id: '3', gameName: '樱花飘落时', status: '处理中', time: '2024-06-13 09:15', reason: '链接失效' },
  { id: '4', gameName: '永恒之约', status: '已补档', time: '2024-06-12 14:45', reason: '资源更新' },
]

const loadRecords = async () => {
  try {
    records.value = mockRecords
  } catch (error) {
    console.error('Failed to load records:', error)
    records.value = mockRecords
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadRecords()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
    <header class="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-lg shadow-sm z-30">
      <div class="flex items-center px-4 py-3">
        <button 
          @click="appState.toggleSideMenu()"
          class="p-2 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 mr-2 shadow-sm"
        >
          <Menu class="w-5 h-5 text-gray-700" />
        </button>
        <h1 class="flex-1 text-lg font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent text-center">📋 补档记录</h1>
        <button 
          @click="router.back()"
          class="p-2 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 ml-2 shadow-sm"
        >
          <ArrowLeft class="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </header>
    
    <div v-if="isLoading" class="pt-16 flex items-center justify-center h-40">
      <div class="w-12 h-12 border-4 border-gradient-to-r from-primary via-secondary to-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
    
    <div v-else class="pt-16 px-4 mt-4">
      <div v-if="records.length > 0" class="space-y-3">
        <div 
          v-for="record in records" 
          :key="record.id"
          class="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-all duration-300"
        >
          <div class="flex items-start justify-between mb-2">
            <h3 class="font-semibold text-gray-800">{{ record.gameName }}</h3>
            <span 
              :class="[
                'px-3 py-1 text-xs font-medium rounded-full',
                record.status === '已补档' ? 'bg-green-100 text-green-600' : 
                record.status === '处理中' ? 'bg-yellow-100 text-yellow-600' : 
                'bg-gray-100 text-gray-600'
              ]"
            >
              {{ record.status }}
            </span>
          </div>
          <p class="text-gray-500 text-xs mb-1">补档原因：{{ record.reason }}</p>
          <p class="text-gray-400 text-xs">{{ record.time }}</p>
        </div>
      </div>
      
      <div v-else class="text-center py-20">
        <div class="text-6xl mb-4">📝</div>
        <p class="text-gray-400">暂无补档记录</p>
        <button 
          @click="router.push('/')"
          class="mt-4 px-6 py-2 bg-gradient-to-r from-primary to-pink-500 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md"
        >
          返回首页
        </button>
      </div>
    </div>
  </div>
</template>
