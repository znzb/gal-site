<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Menu } from 'lucide-vue-next'
import GameCard from '@/components/GameCard.vue'
import { gameApi, type Game } from '@/api/api'
import { appState } from '@/store/appStore'

const route = useRoute()
const router = useRouter()

const categoryType = computed(() => route.params.type as string)
const filteredGames = ref<Game[]>([])
const isLoading = ref(true)
const activeSubCategory = ref<'all' | 'raw' | 'cooked'>('all')

const showSubCategory = computed(() => {
  return true
})

const displayGames = computed(() => {
  if (!showSubCategory.value || activeSubCategory.value === 'all') {
    return filteredGames.value
  }
  return filteredGames.value.filter(game => game.subCategory === activeSubCategory.value)
})

const loadGames = async () => {
  try {
    filteredGames.value = await gameApi.getGamesByCategory(categoryType.value)
  } catch (error) {
    console.error('Failed to load games:', error)
  } finally {
    isLoading.value = false
  }
}

const setSubCategory = (sub: 'all' | 'raw' | 'cooked') => {
  activeSubCategory.value = sub
}

const loadGamesForCategory = async (type: string) => {
  isLoading.value = true
  activeSubCategory.value = 'all'
  try {
    filteredGames.value = await gameApi.getGamesByCategory(type)
  } catch (error) {
    console.error('Failed to load games:', error)
  } finally {
    isLoading.value = false
  }
}

watch(
  () => route.params.type,
  (newType) => {
    if (newType) {
      loadGamesForCategory(newType as string)
    }
  }
)

onMounted(() => {
  loadGames()
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
        <h1 class="flex-1 text-lg font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent text-center">{{ categoryType }}</h1>
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
      <div v-if="showSubCategory" class="flex gap-2 mb-4">
        <button 
          @click="setSubCategory('all')"
          class="flex-1 py-2.5 rounded-xl font-medium transition-all text-sm"
          :class="activeSubCategory === 'all' 
            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg' 
            : 'bg-white text-gray-600 hover:bg-gray-50 shadow'"
        >
          全部
        </button>
        <button 
          @click="setSubCategory('raw')"
          class="flex-1 py-2.5 rounded-xl font-medium transition-all text-sm"
          :class="activeSubCategory === 'raw' 
            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg' 
            : 'bg-white text-gray-600 hover:bg-gray-50 shadow'"
        >
          🍖 生肉
        </button>
        <button 
          @click="setSubCategory('cooked')"
          class="flex-1 py-2.5 rounded-xl font-medium transition-all text-sm"
          :class="activeSubCategory === 'cooked' 
            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg' 
            : 'bg-white text-gray-600 hover:bg-gray-50 shadow'"
        >
          🍳 熟肉
        </button>
      </div>
      
      <div v-if="displayGames.length > 0" class="grid grid-cols-2 gap-4">
        <div 
          v-for="game in displayGames" 
          :key="game.id" 
          class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          @click="router.push(`/game/${game.id}`)"
        >
          <div class="relative">
            <img 
              :src="game.cover" 
              :alt="game.name"
              class="w-full aspect-[3/4] object-cover"
            />
            <div class="absolute top-2 right-2 px-3 py-1 bg-gradient-to-r from-primary to-pink-500 text-white text-xs font-medium rounded-full shadow-md">
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
                class="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
              >
                {{ tag }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-400 text-xs">{{ game.downloads.toLocaleString() }} 下载</span>
              <button class="px-4 py-1.5 bg-gradient-to-r from-primary to-pink-500 text-white text-xs font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md">
                下载
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-20">
        <div class="text-6xl mb-4">🎮</div>
        <p class="text-gray-400">暂无该分类的游戏</p>
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
