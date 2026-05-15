<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Search, X, Menu } from 'lucide-vue-next'
import GameCard from '@/components/GameCard.vue'
import { gameApi, type Game } from '@/api/api'
import { appState } from '@/store/appStore'

const router = useRouter()
const route = useRoute()
const searchQuery = ref('')
const games = ref<Game[]>([])
const isLoading = ref(false)
const hasSearched = ref(false)

const mockGames: Game[] = []

const filteredGames = computed(() => {
  if (!searchQuery.value.trim()) return []
  const query = searchQuery.value.toLowerCase()
  return games.value.filter(game => {
    const name = (game.name || '').toLowerCase()
    const description = (game.description || '').toLowerCase()
    const category = (game.category || '').toLowerCase()
    const tags = (game.tags || []).map(t => t.toLowerCase())
    return name.includes(query) || 
           description.includes(query) || 
           category.includes(query) || 
           tags.some(tag => tag.includes(query))
  })
})

const performSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  hasSearched.value = true
  isLoading.value = true
  
  try {
    const data = await gameApi.searchGames(searchQuery.value)
    games.value = data.games || data || mockGames
  } catch (error) {
    console.error('Search failed:', error)
    games.value = mockGames
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    performSearch()
  }
}

const handleGameClick = (id: string) => {
  router.push(`/game/${id}`)
}

const clearSearch = () => {
  searchQuery.value = ''
  hasSearched.value = false
  games.value = []
}

onMounted(() => {
  games.value = mockGames
  
  const queryParam = route.query.q
  if (queryParam && typeof queryParam === 'string') {
    searchQuery.value = decodeURIComponent(queryParam)
    performSearch()
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
        <div class="flex-1 relative mx-2">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400" />
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="搜索游戏名称、分类、标签..."
            class="w-full pl-10 pr-10 py-2 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all border border-pink-200"
            @keyup.enter="handleSearch"
          />
          <button 
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-600"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
        <button 
          @click="router.back()"
          class="p-2 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 transition-all duration-300 shadow-sm border border-pink-100"
        >
          <ArrowLeft class="w-5 h-5 text-pink-600" />
        </button>
      </div>
    </header>
    
    <div class="pt-16 px-4 mt-4">
      <div v-if="isLoading" class="flex items-center justify-center h-40">
        <div class="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
      
      <div v-else-if="!hasSearched" class="text-center py-20">
        <div class="text-6xl mb-4">🔍</div>
        <p class="text-pink-400 mb-4">输入关键词开始搜索</p>
        <div class="flex flex-wrap justify-center gap-2">
          <span 
            v-for="tag in ['恋爱', '校园', '奇幻', '冒险', '治愈']" 
            :key="tag"
            class="px-3 py-1 bg-white text-pink-600 text-sm rounded-full cursor-pointer hover:bg-pink-100 transition-all shadow-sm border border-pink-100"
            @click="searchQuery = tag; handleSearch()"
          >
            {{ tag }}
          </span>
        </div>
      </div>
      
      <div v-else-if="filteredGames.length === 0" class="text-center py-20">
        <div class="text-6xl mb-4">😕</div>
        <p class="text-pink-400">未找到相关游戏</p>
        <button 
          @click="clearSearch"
          class="mt-4 px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-pink-200"
        >
          重新搜索
        </button>
      </div>
      
      <div v-else class="grid grid-cols-2 gap-4">
        <div 
          v-for="game in filteredGames" 
          :key="game.id" 
          class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-pink-100"
          @click="handleGameClick(game.id)"
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
    </div>
  </div>
</template>
