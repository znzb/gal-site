<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Menu } from 'lucide-vue-next'
import GameCard from '@/components/GameCard.vue'
import { gameApi, type Game } from '@/api/api'
import { appState } from '@/store/appStore'

const router = useRouter()
const games = ref<Game[]>([])
const isLoading = ref(true)

const mockGames: Game[] = [
  {
    id: '1',
    name: '夏日物语',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20summer%20visual%20novel%20game%20cover%20beautiful%20girl%20beach&image_size=portrait_4_3',
    description: '一款温馨浪漫的夏日恋爱冒险游戏，讲述主角在海边小镇度过的难忘夏天。',
    category: '安卓直装',
    size: '2.5GB',
    releaseDate: '2024-06-15',
    downloads: 12500,
    tags: ['恋爱', '校园', '治愈', '柚子']
  },
  {
    id: '2',
    name: '星空幻想',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20fantasy%20game%20cover%20starry%20night%20magic%20girl%20sword&image_size=portrait_4_3',
    description: '穿越星空的奇幻冒险，与神秘少女一同探索未知的世界。',
    category: '安卓直装',
    size: '3.2GB',
    releaseDate: '2024-03-20',
    downloads: 8900,
    tags: ['奇幻', '冒险', '魔法']
  }
]

const filteredGames = computed(() => {
  return games.value.filter(game => {
    const name = (game.name || '').toLowerCase()
    const tags = (game.tags || []).map(t => t.toLowerCase())
    return name.includes('柚子') || tags.some(tag => tag.includes('柚子'))
  })
})

const loadGames = async () => {
  try {
    const data = await gameApi.getGames()
    games.value = data.games || data || mockGames
  } catch (error) {
    console.error('Failed to load games:', error)
    games.value = mockGames
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadGames()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
    <header class="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-lg shadow-sm z-30">
      <div class="flex items-center px-4 py-3">
        <button 
          @click="router.back()"
          class="p-2 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 mr-2 shadow-sm"
        >
          <ArrowLeft class="w-5 h-5 text-gray-700" />
        </button>
        <h1 class="flex-1 text-lg font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent text-center">🎵 柚子社</h1>
        <button 
          @click="appState.toggleSideMenu()"
          class="p-2 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 ml-2 shadow-sm"
        >
          <Menu class="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </header>
    
    <div v-if="isLoading" class="pt-16 flex items-center justify-center h-40">
      <div class="w-12 h-12 border-4 border-gradient-to-r from-primary via-secondary to-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
    
    <div v-else class="pt-16 px-4 mt-4">
      <div v-if="filteredGames.length > 0" class="grid grid-cols-2 gap-4">
        <div 
          v-for="game in filteredGames" 
          :key="game.id || game._id" 
          class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          @click="router.push(`/game/${game.id || game._id}`)"
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
        <div class="text-6xl mb-4">🎵</div>
        <p class="text-gray-400">暂无柚子社相关游戏</p>
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
