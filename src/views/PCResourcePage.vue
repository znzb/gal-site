<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ArrowLeft, Menu, Monitor, HardDrive, MessageSquare, Eye, Heart, Calendar } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { gameApi, type Game } from '@/api/api'

const router = useRouter()
const activeCategory = ref<'all' | 'raw' | 'cooked'>('all')
const pcGames = ref<Game[]>([])
const isLoading = ref(true)
const activeSort = ref('update')

const filteredGames = computed(() => {
  if (activeCategory.value === 'all') {
    return pcGames.value
  }
  return pcGames.value.filter(game => game.subCategory === activeCategory.value)
})

const loadGames = async () => {
  try {
    const data = await gameApi.getGamesByCategory('PC资源')
    if (data) {
      pcGames.value = data
    }
  } catch (error) {
    console.error('Failed to load games:', error)
  } finally {
    isLoading.value = false
  }
}

const goToGame = (gameId: string) => {
  router.push(`/game/${gameId}`)
}

const setCategory = (category: 'all' | 'raw' | 'cooked') => {
  activeCategory.value = category
}

let dataRefreshTimer: number | null = null

onMounted(() => {
  loadGames()
  dataRefreshTimer = window.setInterval(() => {
    loadGames()
  }, 30000)
})

onUnmounted(() => {
  if (dataRefreshTimer) {
    clearInterval(dataRefreshTimer)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50/50 to-white pb-24">
    <header class="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-30 shadow-sm border-b border-pink-100">
      <div class="flex items-center justify-between px-4 py-3">
        <button 
          @click="router.back()"
          class="p-2 rounded-lg hover:bg-pink-50 transition-colors"
        >
          <Menu class="w-6 h-6 text-pink-600" />
        </button>
        <h1 class="text-lg font-bold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">PC资源</h1>
        <button 
          @click="router.back()"
          class="p-2 rounded-lg hover:bg-pink-50 transition-colors"
        >
          <ArrowLeft class="w-6 h-6 text-pink-600" />
        </button>
      </div>
    </header>
    
    <div v-if="isLoading" class="pt-16 flex items-center justify-center h-40">
      <div class="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
    </div>
    
    <div v-else>
      <!-- 手机端显示：与Gal游戏界面一致 -->
      <div class="pt-14 px-4 sm:hidden">
        <div class="flex gap-2 mt-4">
          <button 
            @click="setCategory('all')"
            class="flex-1 py-3 rounded-xl font-medium transition-all border border-pink-100"
            :class="activeCategory === 'all' 
              ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-200' 
              : 'bg-white text-gray-600 hover:bg-pink-50'"
          >
            全部
          </button>
          <button 
            @click="setCategory('raw')"
            class="flex-1 py-3 rounded-xl font-medium transition-all border border-pink-100"
            :class="activeCategory === 'raw' 
              ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-200' 
              : 'bg-white text-gray-600 hover:bg-pink-50'"
          >
            🍖 生肉
          </button>
          <button 
            @click="setCategory('cooked')"
            class="flex-1 py-3 rounded-xl font-medium transition-all border border-pink-100"
            :class="activeCategory === 'cooked' 
              ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-200' 
              : 'bg-white text-gray-600 hover:bg-pink-50'"
          >
            🍳 熟肉
          </button>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mt-4">
          <div 
            v-for="game in filteredGames" 
            :key="game.id"
            @click="goToGame(game.id)"
            class="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer border border-pink-100"
          >
            <div class="aspect-[3/4] relative">
              <img 
                :src="game.cover" 
                :alt="game.name"
                class="w-full h-full object-cover"
              />
              <div class="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs px-3 py-1 rounded-full shadow-lg shadow-pink-200 font-medium">
                {{ game.size }}
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div class="absolute bottom-2 left-2 right-2">
                <p class="text-white text-sm font-medium truncate">{{ game.name }}</p>
              </div>
            </div>
            <div class="p-3">
              <p class="text-gray-600 text-xs line-clamp-2 mb-2 leading-relaxed">{{ game.description }}</p>
              <div class="flex flex-wrap gap-1 mb-2">
                <span 
                  v-for="tag in game.tags.slice(0, 3)" 
                  :key="tag"
                  class="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full border border-pink-200"
                >
                  {{ tag }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500">{{ game.downloads.toLocaleString() }} 下载</span>
                <button 
                  @click.stop="goToGame(game.id)"
                  class="bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs px-4 py-1 rounded-full hover:opacity-90 transition-opacity"
                >
                  下载
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-4 mt-6 border border-pink-100">
          <h3 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <HardDrive class="w-5 h-5 text-pink-600" />
            下载须知
          </h3>
          <ul class="text-sm text-gray-600 space-y-2">
            <li class="flex items-start gap-2">
              <span class="w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">*</span>
              <span>PC游戏需要较高配置，请确保您的电脑满足游戏要求</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">*</span>
              <span>部分游戏需要安装虚拟光驱或解压缩工具</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">*</span>
              <span>建议使用下载工具进行多线程下载以提高速度</span>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- 电脑端显示：使用新设计，与Gal游戏页面一致 -->
      <div class="pt-16 hidden sm:block">
        <div class="relative mx-4 mt-2 rounded-3xl overflow-hidden shadow-xl border border-pink-100">
          <img 
            src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20girl%20beach%20summer%20visual%20novel%20background&image_size=landscape_16_9" 
            alt="PC资源"
            class="w-full h-48 sm:h-64 object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-6">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                <span class="text-white font-bold text-lg">🖥️</span>
              </div>
              <div>
                <h2 class="text-xl sm:text-2xl font-bold text-white mb-1">PC资源</h2>
                <span class="text-sm text-white/80">共 {{ filteredGames.length }} 篇</span>
              </div>
            </div>
            <p class="text-white/80 text-sm">这里是PC资源，资源请使用Bandizip等工具解压后打开</p>
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
        
        <div class="px-4 mt-4">
          <div class="flex gap-2">
            <button 
              @click="setCategory('all')"
              class="px-4 py-2 rounded-xl font-medium transition-all text-sm"
              :class="activeCategory === 'all' 
                ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-pink-50 border border-pink-100'"
            >
              全部
            </button>
            <button 
              @click="setCategory('raw')"
              class="px-4 py-2 rounded-xl font-medium transition-all text-sm"
              :class="activeCategory === 'raw' 
                ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-pink-50 border border-pink-100'"
            >
              🍖 生肉
            </button>
            <button 
              @click="setCategory('cooked')"
              class="px-4 py-2 rounded-xl font-medium transition-all text-sm"
              :class="activeCategory === 'cooked' 
                ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-pink-50 border border-pink-100'"
            >
              🍳 熟肉
            </button>
          </div>
        </div>
        
        <div v-if="filteredGames.length > 0" class="px-4 mt-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              v-for="game in filteredGames" 
              :key="game.id" 
              class="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-pink-100"
              @click="goToGame(game.id)"
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
            class="mt-4 px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-pink-200">
            返回首页
          </button>
        </div>
        
        <div class="px-4 mt-6">
          <div class="bg-white rounded-xl shadow-sm p-4 border border-pink-100">
            <h3 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <HardDrive class="w-5 h-5 text-pink-600" />
              下载须知
            </h3>
            <ul class="text-sm text-gray-600 space-y-2">
              <li class="flex items-start gap-2">
                <span class="w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">*</span>
                <span>PC游戏需要较高配置，请确保您的电脑满足游戏要求</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">*</span>
                <span>部分游戏需要安装虚拟光驱或解压缩工具</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">*</span>
                <span>建议使用下载工具进行多线程下载以提高速度</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>