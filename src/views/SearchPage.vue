<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Search, X } from 'lucide-vue-next'
import GameCard from '@/components/GameCard.vue'
import { gameApi, type Game } from '@/api/api'

const router = useRouter()
const route = useRoute()
const searchQuery = ref('')
const games = ref<Game[]>([])
const isLoading = ref(false)
const hasSearched = ref(false)

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
    tags: ['恋爱', '校园', '治愈']
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
  },
  {
    id: '3',
    name: '樱花飘落时',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20sakura%20cherry%20blossom%20game%20cover%20school%20romance&image_size=portrait_4_3',
    description: '樱花纷飞的季节，一段青春恋爱故事正在上演。',
    category: '安卓直装',
    size: '1.8GB',
    releaseDate: '2024-04-10',
    downloads: 15600,
    tags: ['恋爱', '校园', '青春']
  },
  {
    id: '4',
    name: '永恒之约',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20eternal%20love%20game%20cover%20fantasy%20castle%20romance&image_size=portrait_4_3',
    description: '跨越时空的永恒约定，一段超越生死的爱情故事。',
    category: 'kr资源',
    size: '4.1GB',
    releaseDate: '2024-01-15',
    downloads: 9800,
    tags: ['奇幻', '爱情', '冒险']
  },
  {
    id: '5',
    name: '校园日记',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20school%20life%20game%20cover%20classroom%20students%20friends&image_size=portrait_4_3',
    description: '记录校园生活的点点滴滴，重温青春的美好时光。',
    category: 'kr资源',
    size: '2.0GB',
    releaseDate: '2024-05-28',
    downloads: 7200,
    tags: ['校园', '日常', '友情']
  },
  {
    id: '6',
    name: '幻想世界',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20fantasy%20world%20game%20cover%20dragons%20magic%20heroes&image_size=portrait_4_3',
    description: '在充满魔法的幻想世界中展开冒险，成为传奇英雄。',
    category: '安卓直装',
    size: '5.5GB',
    releaseDate: '2024-02-28',
    downloads: 11200,
    tags: ['奇幻', '冒险', '战斗']
  }
]

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
  <div class="min-h-screen bg-gray-100 pb-20">
    <header class="fixed top-0 left-0 right-0 bg-white shadow-sm z-30">
      <div class="flex items-center px-4 py-3">
        <button 
          @click="router.back()"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors mr-3"
        >
          <ArrowLeft class="w-6 h-6 text-gray-600" />
        </button>
        <div class="flex-1 relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="搜索游戏名称、分类、标签..."
            class="w-full pl-10 pr-10 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all"
            @keyup.enter="handleSearch"
            ref="searchInput"
          />
          <button 
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
        <button 
          @click="handleSearch"
          class="ml-3 px-4 py-2 bg-gradient-to-r from-primary to-pink-500 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          搜索
        </button>
      </div>
    </header>
    
    <div class="pt-14 px-4 mt-4">
      <div v-if="isLoading" class="flex items-center justify-center h-40">
        <div class="w-10 h-10 border-3 border-gray-300 border-t-primary rounded-full animate-spin"></div>
      </div>
      
      <div v-else-if="!hasSearched" class="text-center py-20">
        <div class="text-6xl mb-4">🔍</div>
        <p class="text-gray-400 mb-4">输入关键词开始搜索</p>
        <div class="flex flex-wrap justify-center gap-2">
          <span 
            v-for="tag in ['恋爱', '校园', '奇幻', '冒险', '治愈']" 
            :key="tag"
            class="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
            @click="searchQuery = tag; handleSearch()"
          >
            {{ tag }}
          </span>
        </div>
      </div>
      
      <div v-else-if="filteredGames.length === 0" class="text-center py-20">
        <div class="text-6xl mb-4">😕</div>
        <p class="text-gray-400">未找到相关游戏</p>
        <button 
          @click="clearSearch"
          class="mt-4 text-primary text-sm"
        >
          重新搜索
        </button>
      </div>
      
      <div v-else class="grid grid-cols-2 gap-3">
        <GameCard 
          v-for="game in filteredGames" 
          :key="game.id" 
          :game="game"
          @click="handleGameClick"
        />
      </div>
    </div>
  </div>
</template>
