<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Download, Star, Share2, Heart, Clock, HardDrive, Calendar } from 'lucide-vue-next'
import { gameApi, type Game } from '@/api/api'

const route = useRoute()
const router = useRouter()

const gameId = ref(route.params.id as string)
const game = ref<Game | null>(null)
const isLoading = ref(true)

const mockGames: Game[] = [
  {
    id: '1',
    name: '夏日物语',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20summer%20visual%20novel%20game%20cover%20beautiful%20girl%20beach&image_size=portrait_4_3',
    description: '一款温馨浪漫的夏日恋爱冒险游戏，讲述主角在海边小镇度过的难忘夏天。游戏以精美的画面和动人的剧情著称，让玩家沉浸在夏日的美好回忆中。',
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
    description: '穿越星空的奇幻冒险，与神秘少女一同探索未知的世界。在浩瀚的宇宙中展开一段惊心动魄的旅程。',
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
    description: '樱花纷飞的季节，一段青春恋爱故事正在上演。在樱花树下，邂逅命中注定的那个人。',
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
    description: '跨越时空的永恒约定，一段超越生死的爱情故事。无论时间如何流转，真爱永远不变。',
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
    description: '记录校园生活的点点滴滴，重温青春的美好时光。与朋友们一起度过难忘的校园生活。',
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
    description: '在充满魔法的幻想世界中展开冒险，成为传奇英雄。与恶龙战斗，拯救公主，书写属于你的传奇故事。',
    category: '安卓直装',
    size: '5.5GB',
    releaseDate: '2024-02-28',
    downloads: 11200,
    tags: ['奇幻', '冒险', '战斗']
  },
  {
    id: '7',
    name: '游戏CG精选',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20game%20CG%20collection%20beautiful%20artwork%20gallery&image_size=portrait_4_3',
    description: '精选游戏CG合集，包含各种精美游戏插画。收集了来自知名游戏的精美CG图片。',
    category: '游戏CG',
    size: '1.2GB',
    releaseDate: '2024-06-01',
    downloads: 5600,
    tags: ['CG', '插画', '合集']
  },
  {
    id: '8',
    name: '高清图集',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20high%20quality%20image%20collection%20beautiful%20girls&image_size=portrait_4_3',
    description: '高清精美图集，包含各种主题的精美图片。适合作为壁纸或收藏使用。',
    category: '图集资源',
    size: '3.8GB',
    releaseDate: '2024-05-15',
    downloads: 8200,
    tags: ['图集', '高清', '壁纸']
  }
]

const isFavorite = ref(false)
const isDownloading = ref(false)
const downloadProgress = ref(0)
const relatedGames = ref<Game[]>([])

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
}

const goToGame = (gameId: string) => {
  console.log('goToGame called with id:', gameId)
  router.push(`/game/${gameId}`)
}

const handleDownload = async () => {
  if (isDownloading.value || !game.value) return
  
  isDownloading.value = true
  downloadProgress.value = 0
  
  const interval = setInterval(() => {
    downloadProgress.value += Math.random() * 15
    if (downloadProgress.value >= 100) {
      downloadProgress.value = 100
      clearInterval(interval)
    }
  }, 300)
  
  try {
    const result = await gameApi.downloadGame(game.value!.id)
    if (game.value) {
      game.value.downloads = result.downloads
    }
  } catch (error) {
    console.error('Download failed:', error)
    if (game.value) {
      game.value.downloads += 1
    }
  } finally {
    setTimeout(() => {
      isDownloading.value = false
      downloadProgress.value = 0
    }, 500)
  }
}

const gameCache = ref<Map<string, Game>>(new Map())
const relatedCache = ref<Map<string, Game[]>>(new Map())

const preloadImage = (url: string) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(url)
    img.onerror = () => resolve(url)
    img.src = url
  })
}

const loadData = async () => {
  const cachedGame = gameCache.value.get(gameId)
  
  if (cachedGame) {
    game.value = cachedGame
    const cachedRelated = relatedCache.value.get(gameId)
    if (cachedRelated) {
      relatedGames.value = cachedRelated
      isLoading.value = false
      return
    }
  }
  
  const mockGame = mockGames.find(g => g.id === gameId) || mockGames[0]
  game.value = mockGame
  
  await preloadImage(mockGame.cover)
  
  const [gameData, allGames] = await Promise.all([
    gameApi.getGameById(gameId).catch(() => null),
    gameApi.getAllGames().catch(() => [])
  ])
  
  if (gameData) {
    game.value = gameData
    gameCache.value.set(gameId, gameData)
    
    await preloadImage(gameData.cover)
    
    if (allGames.length > 0) {
      const filtered = allGames.filter(g => g.id !== gameId && g.category === gameData.category).slice(0, 3)
      relatedGames.value = filtered
      relatedCache.value.set(gameId, filtered)
      
      filtered.forEach(g => preloadImage(g.cover))
    }
  } else if (mockGame) {
    const filtered = mockGames.filter(g => g.id !== gameId && g.category === mockGame.category).slice(0, 3)
    relatedGames.value = filtered
    relatedCache.value.set(gameId, filtered)
  }
  
  isLoading.value = false
}

onMounted(() => {
  loadData()
})

watch(
  () => route.params.id,
  (newId) => {
    console.log('Route changed to id:', newId)
    if (newId) {
      gameId.value = newId as string
      loadData()
    }
  }
)
</script>

<template>
  <div v-if="isLoading" class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="w-10 h-10 border-3 border-gray-300 border-t-primary rounded-full animate-spin"></div>
  </div>
  
  <div v-else-if="game" class="min-h-screen bg-gray-100 pb-24">
    <header class="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-30 shadow-sm">
      <div class="flex items-center justify-between px-4 py-3">
        <button 
          @click="router.back()"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft class="w-6 h-6 text-gray-600" />
        </button>
        <h1 class="text-lg font-bold text-gray-800">游戏详情</h1>
        <button class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Share2 class="w-6 h-6 text-gray-600" />
        </button>
      </div>
    </header>
    
    <div class="pt-14">
      <div class="relative aspect-[3/4]">
        <img 
          :src="game.cover" 
          :alt="game.name"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        <div class="absolute bottom-4 left-4 right-4">
          <h2 class="text-2xl font-bold text-white mb-2">{{ game.name }}</h2>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="tag in game.tags" 
              :key="tag"
              class="bg-white/20 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="bg-white mx-4 mt-4 rounded-2xl shadow-xl relative z-10 overflow-hidden">
        <div class="p-4 border-b border-gray-100">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center">
              <Star class="w-5 h-5 text-yellow-500 fill-yellow-500 mr-1" />
              <span class="text-sm font-medium text-gray-700">4.9</span>
              <span class="text-xs text-gray-400 ml-2">{{ game.downloads.toLocaleString() }} 下载</span>
            </div>
            <button 
              @click="toggleFavorite"
              class="p-2 rounded-full"
              :class="isFavorite ? 'text-red-500' : 'text-gray-400'"
            >
              <Heart class="w-6 h-6" :class="{ 'fill-current': isFavorite }" />
            </button>
          </div>
          
          <div class="grid grid-cols-3 gap-4 text-center">
            <div class="bg-gray-50 rounded-lg py-2">
              <HardDrive class="w-5 h-5 mx-auto text-gray-500 mb-1" />
              <span class="text-xs text-gray-500">大小</span>
              <p class="text-sm font-medium text-gray-800">{{ game.size }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg py-2">
              <Calendar class="w-5 h-5 mx-auto text-gray-500 mb-1" />
              <span class="text-xs text-gray-500">发布</span>
              <p class="text-sm font-medium text-gray-800">{{ game.releaseDate }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg py-2">
              <Clock class="w-5 h-5 mx-auto text-gray-500 mb-1" />
              <span class="text-xs text-gray-500">类型</span>
              <p class="text-sm font-medium text-gray-800">{{ game.category }}</p>
            </div>
          </div>
        </div>
        
        <div class="p-4">
          <h3 class="font-bold text-gray-800 mb-2">游戏介绍</h3>
          <p class="text-sm text-gray-600 leading-relaxed">{{ game.description }}</p>
        </div>
        
        <div class="p-4 bg-gradient-to-r from-primary/5 to-secondary/5">
          <button 
            @click="handleDownload"
            class="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg"
            :disabled="isDownloading"
          >
            <template v-if="isDownloading">
              <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>{{ Math.round(downloadProgress) }}%</span>
            </template>
            <template v-else>
              <Download class="w-5 h-5" />
              <span>立即下载</span>
            </template>
          </button>
        </div>
      </div>
      
      <div v-if="relatedGames.length > 0" class="px-4 mt-6">
        <h3 class="text-lg font-bold text-gray-800 mb-3">相关推荐</h3>
        <div class="flex gap-3 overflow-x-auto pb-2">
          <div 
            v-for="related in relatedGames" 
            :key="related.id || related._id"
            @click="goToGame(related.id || related._id)"
            class="flex-shrink-0 w-28 cursor-pointer"
          >
            <div class="aspect-[3/4] rounded-lg overflow-hidden mb-2">
              <img :src="related.cover" :alt="related.name" class="w-full h-full object-cover" />
            </div>
            <p class="text-xs text-gray-700 truncate">{{ related.name }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="min-h-screen bg-gray-100 flex items-center justify-center">
    <p class="text-gray-500">游戏不存在</p>
  </div>
</template>