<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Menu, MessageSquare, Eye, Heart, Calendar } from 'lucide-vue-next'
import GameCard from '@/components/GameCard.vue'
import { gameApi, type Game } from '@/api/api'
import { appState } from '@/store/appStore'

const route = useRoute()
const router = useRouter()

const categoryType = computed(() => route.params.type as string)
const filteredGames = ref<Game[]>([])
const isLoading = ref(true)
const activeSubCategory = ref<'all' | 'raw' | 'cooked'>('all')
const activeSort = ref('update')

const showSubCategory = computed(() => {
  return !['图集资源11', '图集资源', '游戏CG', '新人必读'].includes(categoryType.value)
})

const displayGames = computed(() => {
  let games = filteredGames.value
  if (showSubCategory.value && activeSubCategory.value !== 'all') {
    games = games.filter(game => game.subCategory === activeSubCategory.value)
  }
  return games
})

const categoryInfo = computed(() => {
  const infoMap: Record<string, { desc: string, bgImg: string }> = {
    'PC资源': { desc: '这里是PC资源，资源请使用Bandizip等工具解压后打开', bgImg: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20girl%20beach%20summer%20visual%20novel%20background&image_size=landscape_16_9' },
    '安卓直装': { desc: '安卓直装游戏，下载后直接安装即可游玩', bgImg: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20girl%20phone%20mobile%20game%20android&image_size=landscape_16_9' },
    'kr资源': { desc: 'KR资源专区，包含各类稀有游戏资源', bgImg: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20fantasy%20kingdom%20castle%20pink%20sky&image_size=landscape_16_9' },
    '柚子社': { desc: '柚子社官方游戏合集', bgImg: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yuzusoft%20anime%20girl%20purple%20hair%20music%20notes&image_size=landscape_16_9' },
  }
  return infoMap[categoryType.value] || { desc: '游戏资源专区', bgImg: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20game%20collection%20colorful%20background&image_size=landscape_16_9' }
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

let dataRefreshTimer: number | null = null

onMounted(() => {
  loadGames()
  dataRefreshTimer = window.setInterval(() => {
    loadGamesForCategory(categoryType.value)
  }, 30000)
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
        <h1 class="flex-1 text-lg font-bold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent text-center">{{ categoryType }}</h1>
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
    
    <div v-else class="pt-16">
      <div class="relative mx-4 mt-2 rounded-3xl overflow-hidden shadow-xl border border-pink-100">
        <img 
          :src="categoryInfo.bgImg" 
          :alt="categoryType"
          class="w-full h-48 sm:h-64 object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-6">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
              <span class="text-white font-bold text-lg">📁</span>
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-white mb-1">{{ categoryType }}</h2>
              <span class="text-sm text-white/80">共 {{ displayGames.length }} 篇</span>
            </div>
          </div>
          <p class="text-white/80 text-sm">{{ categoryInfo.desc }}</p>
        </div>
      </div>
      
      <div class="px-4 mt-6">
        <div class="flex items-center gap-1 text-sm border-b border-pink-100 pb-2">
          <span class="text-pink-400 mr-2">排序</span>
          <button 
            v-for="sort in [{key: 'update', label: '更新'}, {key: 'view', label: '浏览'}, {key: 'like', label: '点赞'}, {key: 'comment', label: '评论'}]"
            :key="sort.key"
            @click="activeSort = sort.key"
            class="px-4 py-1 rounded-full font-medium transition-all"
            :class="activeSort === sort.key ? 'bg-pink-100 text-pink-600' : 'text-gray-400 hover:text-pink-500'"
          >
            {{ sort.label }}
          </button>
        </div>
      </div>
      
      <div v-if="showSubCategory" class="px-4 mt-4">
        <div class="flex gap-2">
          <button 
            @click="setSubCategory('all')"
            class="px-4 py-2 rounded-xl font-medium transition-all text-sm"
            :class="activeSubCategory === 'all' 
              ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg' 
              : 'bg-white text-gray-600 hover:bg-pink-50 border border-pink-100'"
          >
            全部
          </button>
          <button 
            @click="setSubCategory('raw')"
            class="px-4 py-2 rounded-xl font-medium transition-all text-sm"
            :class="activeSubCategory === 'raw' 
              ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg' 
              : 'bg-white text-gray-600 hover:bg-pink-50 border border-pink-100'"
          >
            🍖 生肉
          </button>
          <button 
            @click="setSubCategory('cooked')"
            class="px-4 py-2 rounded-xl font-medium transition-all text-sm"
            :class="activeSubCategory === 'cooked' 
              ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg' 
              : 'bg-white text-gray-600 hover:bg-pink-50 border border-pink-100'"
          >
            🍳 熟肉
          </button>
        </div>
      </div>
      
      <div v-if="displayGames.length > 0" class="px-4 mt-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div 
            v-for="game in displayGames" 
            :key="game.id" 
            class="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-pink-100"
            @click="router.push(`/game/${game.id}`)"
          >
            <div class="flex">
              <div class="w-32 sm:w-40 flex-shrink-0">
                <img 
                  :src="game.cover" 
                  :alt="game.name"
                  class="w-full h-full object-cover aspect-[3/4]"
                />
              </div>
              <div class="flex-1 p-4">
                <h3 class="font-bold text-gray-800 text-base sm:text-lg mb-2 line-clamp-1">{{ game.name }}</h3>
                <p class="text-gray-500 text-sm line-clamp-2 mb-3">{{ game.description }}</p>
                <div class="flex flex-wrap gap-1 mb-3">
                  <span 
                    v-for="tag in game.tags.slice(0, 3)" 
                    :key="tag"
                    class="px-2 py-0.5 bg-pink-50 text-pink-600 text-xs rounded-full border border-pink-100"
                  >
                    {{ tag }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3 text-xs text-pink-400">
                    <span class="flex items-center gap-1">
                      <MessageSquare class="w-3 h-3" />
                      {{ Math.floor(Math.random() * 50) }}
                    </span>
                    <span class="flex items-center gap-1">
                      <Eye class="w-3 h-3" />
                      {{ Math.floor(Math.random() * 2000) }}
                    </span>
                    <span class="flex items-center gap-1">
                      <Heart class="w-3 h-3" />
                      {{ Math.floor(Math.random() * 100) }}
                    </span>
                  </div>
                  <span class="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar class="w-3 h-3" />
                    {{ game.releaseDate }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-20">
        <div class="text-6xl mb-4">🎮</div>
        <p class="text-pink-400">暂无该分类的游戏</p>
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
