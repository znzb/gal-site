<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Menu } from 'lucide-vue-next'
import GameCard from '@/components/GameCard.vue'
import { gameApi, type Game } from '@/api/api'
import { appState } from '@/store/appStore'

const router = useRouter()
const games = ref<Game[]>([])
const isLoading = ref(true)

const mockGames: Game[] = []

const filteredGames = computed(() => {
  return games.value.filter(game => game.isYuzusoft === true)
})

const loadGames = async () => {
  try {
    const data = await gameApi.getAllGames()
    console.log('API返回的原始数据:', data)
    games.value = Array.isArray(data) ? data : data.games || data || mockGames
    console.log('处理后的games:', games.value)
    console.log('筛选后的柚子社游戏:', games.value.filter(game => game.isYuzusoft === true))
  } catch (error) {
    console.error('Failed to load games:', error)
    games.value = mockGames
  } finally {
    isLoading.value = false
  }
}

let dataRefreshTimer: number | null = null

onMounted(() => {
  loadGames()
  dataRefreshTimer = window.setInterval(() => {
    loadGames()
  }, 60000)
})

onUnmounted(() => {
  if (dataRefreshTimer) {
    clearInterval(dataRefreshTimer)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50/50 to-white pb-20">
    <header class="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-lg shadow-sm z-30 border-b border-pink-100">
      <div class="flex items-center px-4 py-3">
        <button 
          @click="appState.toggleSideMenu()"
          class="p-2 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 transition-all duration-300 mr-2 shadow-sm border border-pink-100"
        >
          <Menu class="w-5 h-5 text-pink-600" />
        </button>
        <h1 class="flex-1 text-lg font-bold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent text-center">🎵 柚子社</h1>
        <button 
          @click="router.back()"
          class="p-2 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 transition-all duration-300 ml-2 shadow-sm border border-pink-100"
        >
          <ArrowLeft class="w-5 h-5 text-pink-600" />
        </button>
      </div>
    </header>
    
    <div v-if="isLoading" class="pt-16 flex items-center justify-center h-40">
      <div class="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
    </div>
    
    <div v-else class="pt-16 px-4 mt-4">
      <div v-if="filteredGames.length > 0" class="grid grid-cols-2 gap-4">
        <div 
          v-for="game in filteredGames" 
          :key="game.id || game._id" 
          class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-pink-100"
          @click="router.push(`/game/${game.id || game._id}`)"
        >
          <div class="relative">
            <img 
              :src="game.cover" 
              :alt="game.name"
              class="w-full aspect-[3/4] object-cover"
            />
            <div class="absolute top-2 right-2 px-3 py-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs font-medium rounded-full shadow-md shadow-pink-200">
              {{ game.size }}
            </div>
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <h3 class="text-white font-bold text-sm">{{ game.name }}</h3>
            </div>
          </div>
          <div class="p-3">
            <p class="text-gray-600 text-xs line-clamp-2 mb-2">{{ game.description }}</p>
            <div class="flex flex-wrap gap-1 mb-2">
              <span 
                v-for="tag in game.tags.slice(0, 3)" 
                :key="tag"
                class="px-2 py-0.5 bg-pink-100 text-pink-600 text-xs rounded-full border border-pink-200"
              >
                {{ tag }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-pink-400 text-xs">{{ game.downloads.toLocaleString() }} 下载</span>
              <button class="px-4 py-1.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-pink-200">
                下载
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-20">
        <div class="text-6xl mb-4">🎵</div>
        <p class="text-pink-400">暂无柚子社相关游戏</p>
        <button 
          @click="router.push('/')"
          class="mt-4 px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-pink-200"
        >
          返回首页
        </button>
      </div>
    </div>
  </div>
</template>
