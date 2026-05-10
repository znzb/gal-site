<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Download, Star, Share2, Heart, Clock, HardDrive, Calendar, MessageSquare, Link2, User, ChevronDown, ChevronUp } from 'lucide-vue-next'
import { gameApi, type Game } from '@/api/api'

const route = useRoute()
const router = useRouter()

const gameId = ref(route.params.id as string)
const game = ref<Game | null>(null)
const isLoading = ref(true)
const activeTab = ref('info')

interface ResourceLink {
  id: string
  name: string
  url: string
  type: 'main' | 'patch' | 'update'
  size: string
  date: string
}

interface Comment {
  id: string
  user: string
  avatar: string
  content: string
  rating: number
  date: string
  likes: number
  liked: boolean
}

interface GameInfo {
  developer: string
  publisher: string
  platforms: string[]
  languages: string[]
  requirements: string
}

const mockGames: Game[] = [
  {
    id: '1',
    name: '夏日物语',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20summer%20visual%20novel%20game%20cover%20beautiful%20girl%20beach&image_size=portrait_4_3',
    description: '一款温馨浪漫的夏日恋爱冒险游戏，讲述主角在海边小镇度过的难忘夏天。游戏以精美的画面和动人的剧情著称，让玩家沉浸在夏日的美好回忆中。',
    category: '安卓直装',
    subCategory: 'cooked',
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
    subCategory: 'raw',
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
    subCategory: 'cooked',
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
    subCategory: 'cooked',
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
    subCategory: 'raw',
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
    subCategory: 'raw',
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
    subCategory: 'cooked',
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
    subCategory: 'cooked',
    size: '3.8GB',
    releaseDate: '2024-05-15',
    downloads: 8200,
    tags: ['图集', '高清', '壁纸']
  }
]

const mockResources: ResourceLink[] = [
  {
    id: '1',
    name: '完整版游戏本体',
    url: '#',
    type: 'main',
    size: '2.5GB',
    date: '2024-06-15'
  },
  {
    id: '2',
    name: '简体中文补丁',
    url: '#',
    type: 'patch',
    size: '150MB',
    date: '2024-06-20'
  },
  {
    id: '3',
    name: '1.1更新包',
    url: '#',
    type: 'update',
    size: '320MB',
    date: '2024-07-01'
  }
]

const mockComments: Comment[] = [
  {
    id: '1',
    user: '玩家小明',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20anime%20avatar%20girl%20portrait&image_size=square',
    content: '非常棒的游戏！剧情很感人，画面也很漂亮，强烈推荐！',
    rating: 5,
    date: '2天前',
    likes: 128,
    liked: false
  },
  {
    id: '2',
    user: '樱花控',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar%20girl%20pink%20hair&image_size=square',
    content: '夏日的氛围营造得很好，音乐也很治愈，很享受游戏过程。',
    rating: 4,
    date: '5天前',
    likes: 76,
    liked: true
  },
  {
    id: '3',
    user: 'GAL爱好者',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar%20boy%20portrait&image_size=square',
    content: '经典的作品，值得一玩！角色塑造很成功，每个人物都有自己的故事。',
    rating: 5,
    date: '1周前',
    likes: 234,
    liked: false
  }
]

const mockGameInfo: GameInfo = {
  developer: 'Studio Summer',
  publisher: 'Gal Games Co.',
  platforms: ['Android', 'Windows'],
  languages: ['简体中文', '繁体中文', '日文'],
  requirements: 'Android 8.0+ / Windows 10+, 4GB RAM'
}

const resources = ref<ResourceLink[]>(mockResources)
const comments = ref<Comment[]>(mockComments)
const gameInfo = ref<GameInfo>(mockGameInfo)
const isFavorite = ref(false)
const isDownloading = ref(false)
const downloadProgress = ref(0)
const relatedGames = ref<Game[]>([])
const expandedComments = ref<string[]>([])

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
}

const scrollToResources = () => {
  activeTab.value = 'resources'
  setTimeout(() => {
    const resourcesSection = document.getElementById('resources-section')
    if (resourcesSection) {
      resourcesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 100)
}

const goToGame = (targetGameId: string) => {
  router.push(`/game/${targetGameId}`)
}

const toggleComment = (commentId: string) => {
  const index = expandedComments.value.indexOf(commentId)
  if (index > -1) {
    expandedComments.value.splice(index, 1)
  } else {
    expandedComments.value.push(commentId)
  }
}

const toggleLike = (comment: Comment) => {
  comment.liked = !comment.liked
  comment.likes += comment.liked ? 1 : -1
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
  const cachedGame = gameCache.value.get(gameId.value)
  
  if (cachedGame) {
    game.value = cachedGame
    const cachedRelated = relatedCache.value.get(gameId.value)
    if (cachedRelated) {
      relatedGames.value = cachedRelated
      isLoading.value = false
      return
    }
  }
  
  const mockGame = mockGames.find(g => g.id === gameId.value) || mockGames[0]
  game.value = mockGame
  
  await preloadImage(mockGame.cover)
  
  const [gameData, allGames] = await Promise.all([
    gameApi.getGameById(gameId.value).catch(() => null),
    gameApi.getAllGames().catch(() => [])
  ])
  
  if (gameData) {
    game.value = gameData
    gameCache.value.set(gameId.value, gameData)
    
    await preloadImage(gameData.cover)
    
    if (allGames.length > 0) {
      const filtered = allGames.filter(g => g.id !== gameId.value && g.category === gameData.category).slice(0, 3)
      relatedGames.value = filtered
      relatedCache.value.set(gameId.value, filtered)
      
      filtered.forEach(g => preloadImage(g.cover))
    }
  } else if (mockGame) {
    const filtered = mockGames.filter(g => g.id !== gameId.value && g.category === mockGame.category).slice(0, 3)
    relatedGames.value = filtered
    relatedCache.value.set(gameId.value, filtered)
  }
  
  isLoading.value = false
}

onMounted(() => {
  loadData()
})

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      gameId.value = newId as string
      activeTab.value = 'info'
      loadData()
    }
  }
)
</script>

<template>
  <div v-if="isLoading" class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="w-10 h-10 border-3 border-gray-300 border-t-purple-500 rounded-full animate-spin"></div>
  </div>
  
  <div v-else-if="game" :key="gameId" class="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pb-24">
    <header class="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 shadow-sm">
      <div class="flex items-center justify-between px-4 py-3">
        <button 
          @click="router.back()"
          class="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft class="w-6 h-6 text-gray-700" />
        </button>
        <h1 class="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">游戏详情</h1>
        <button class="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
          <Share2 class="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </header>
    
    <div class="pt-14">
      <div class="relative">
        <div class="aspect-[3/4]">
          <img 
            :src="game.cover" 
            :alt="game.name"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        </div>
        
        <div class="absolute bottom-0 left-0 right-0 p-4">
          <div class="flex items-end gap-4">
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-white mb-2 drop-shadow-lg">{{ game.name }}</h2>
              <div class="flex flex-wrap gap-2 mb-2">
                <span 
                  v-for="tag in game.tags" 
                  :key="tag"
                  class="bg-white/25 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm font-medium"
                >
                  {{ tag }}
                </span>
              </div>
              <div class="flex flex-wrap gap-2">
                <span 
                  class="bg-white/25 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm font-medium"
                >
                  {{ game.category.includes('安卓') ? '安卓' : 'PC' }}
                </span>
                <span 
                  class="bg-white/25 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm font-medium"
                >
                  {{ game.subCategory === 'raw' ? '生肉' : '熟肉' }}
                </span>
              </div>
            </div>
            <div class="flex gap-2">
              <button 
                @click="scrollToResources"
                class="p-3 rounded-2xl bg-white/25 backdrop-blur-sm transition-all hover:bg-white/35 hover:scale-110"
              >
                <Download class="w-6 h-6 text-white" />
              </button>
              <button 
                @click="toggleFavorite"
                class="p-3 rounded-2xl bg-white/25 backdrop-blur-sm transition-all hover:scale-110"
                :class="isFavorite ? 'text-red-500' : 'text-white'"
              >
                <Heart class="w-7 h-7" :class="{ 'fill-current': isFavorite }" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white mx-4 mt-4 rounded-3xl shadow-2xl relative z-10 overflow-hidden">
        <div class="p-5 border-b border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="flex">
                <Star v-for="i in 5" :key="i" class="w-5 h-5" :class="i <= 4.9 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'" />
              </div>
              <span class="text-sm font-bold text-gray-800 ml-2">4.9</span>
              <span class="text-xs text-gray-400 ml-2">({{ game.downloads.toLocaleString() }} 下载)</span>
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-3">
            <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl py-3 px-2 text-center">
              <HardDrive class="w-6 h-6 mx-auto text-purple-600 mb-1" />
              <span class="text-xs text-purple-600">大小</span>
              <p class="text-sm font-bold text-purple-900">{{ game.size }}</p>
            </div>
            <div class="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl py-3 px-2 text-center">
              <Calendar class="w-6 h-6 mx-auto text-pink-600 mb-1" />
              <span class="text-xs text-pink-600">发布</span>
              <p class="text-sm font-bold text-pink-900">{{ game.releaseDate }}</p>
            </div>
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl py-3 px-2 text-center">
              <Clock class="w-6 h-6 mx-auto text-blue-600 mb-1" />
              <span class="text-xs text-blue-600">类型</span>
              <p class="text-sm font-bold text-blue-900">{{ game.category }}</p>
            </div>
          </div>
        </div>
        
        <div class="px-1 py-2 bg-gray-50">
          <div class="flex p-1 bg-gradient-to-r from-gray-100 to-gray-100 rounded-2xl">
            <button 
              @click="activeTab = 'info'"
              class="flex-1 py-3 px-4 rounded-xl text-lg font-bold transition-all"
              :class="activeTab === 'info' ? 'bg-white text-gray-900 shadow-lg scale-105' : 'text-gray-400'"
            >
              游戏信息
            </button>
            <button 
              @click="activeTab = 'resources'"
              class="flex-1 py-3 px-4 rounded-xl text-lg font-bold transition-all"
              :class="activeTab === 'resources' ? 'bg-white text-gray-900 shadow-lg scale-105' : 'text-gray-400'"
            >
              资源链接
            </button>
            <button 
              @click="activeTab = 'comments'"
              class="flex-1 py-3 px-4 rounded-xl text-lg font-bold transition-all"
              :class="activeTab === 'comments' ? 'bg-white text-gray-900 shadow-lg scale-105' : 'text-gray-400'"
            >
              游戏评论
            </button>
          </div>
        </div>
        
        <div class="p-5">
          <div v-if="activeTab === 'info'" class="space-y-6">
            <div>
              <h3 class="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span class="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
                游戏介绍
              </h3>
              <p class="text-gray-600 leading-relaxed text-base">{{ game.description }}</p>
            </div>
            
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5">
              <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span class="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
                详细信息
              </h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between py-2 border-b border-gray-200">
                  <span class="text-gray-500">开发商</span>
                  <span class="text-gray-800 font-medium">{{ gameInfo.developer }}</span>
                </div>
                <div class="flex items-center justify-between py-2 border-b border-gray-200">
                  <span class="text-gray-500">发行商</span>
                  <span class="text-gray-800 font-medium">{{ gameInfo.publisher }}</span>
                </div>
                <div class="flex items-center justify-between py-2 border-b border-gray-200">
                  <span class="text-gray-500">支持平台</span>
                  <div class="flex gap-2">
                    <span v-for="platform in gameInfo.platforms" :key="platform" class="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                      {{ platform }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center justify-between py-2 border-b border-gray-200">
                  <span class="text-gray-500">支持语言</span>
                  <div class="flex gap-2 flex-wrap justify-end">
                    <span v-for="lang in gameInfo.languages" :key="lang" class="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded-full font-medium">
                      {{ lang }}
                    </span>
                  </div>
                </div>
                <div class="flex items-start justify-between py-2">
                  <span class="text-gray-500">系统要求</span>
                  <span class="text-gray-800 font-medium text-right text-sm max-w-[60%]">{{ gameInfo.requirements }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="activeTab === 'resources'" id="resources-section" class="space-y-4">
            <div v-for="resource in resources" :key="resource.id" class="group">
              <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100 hover:shadow-xl transition-all hover:scale-[1.02]">
                <div class="flex items-start gap-4">
                  <div class="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                    <Link2 class="w-6 h-6 text-white" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between">
                      <div>
                        <h4 class="font-bold text-gray-800 mb-1">{{ resource.name }}</h4>
                        <div class="flex items-center gap-3 text-sm text-gray-500">
                          <span>{{ resource.size }}</span>
                          <span>•</span>
                          <span>{{ resource.date }}</span>
                        </div>
                      </div>
                      <span 
                        class="text-xs px-3 py-1 rounded-full font-medium"
                        :class="{
                          'bg-green-100 text-green-700': resource.type === 'main',
                          'bg-blue-100 text-blue-700': resource.type === 'patch',
                          'bg-orange-100 text-orange-700': resource.type === 'update'
                        }"
                      >
                        {{ resource.type === 'main' ? '本体' : resource.type === 'patch' ? '补丁' : '更新' }}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  @click="handleDownload"
                  class="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:scale-[1.02]"
                  :disabled="isDownloading"
                >
                  <Download class="w-5 h-5" />
                  <span>下载资源</span>
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="activeTab === 'comments'" class="space-y-4">
            <div v-for="comment in comments" :key="comment.id" class="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-100">
              <div class="flex items-start gap-3">
                <img 
                  :src="comment.avatar" 
                  :alt="comment.user"
                  class="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                />
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <User class="w-4 h-4 text-gray-400" />
                      <span class="font-bold text-gray-800">{{ comment.user }}</span>
                    </div>
                    <span class="text-xs text-gray-400">{{ comment.date }}</span>
                  </div>
                  <div class="flex mb-2">
                    <Star v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= comment.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'" />
                  </div>
                  <p class="text-gray-600 text-sm leading-relaxed mb-3">{{ comment.content }}</p>
                  <div class="flex items-center gap-4">
                    <button 
                      @click="toggleLike(comment)"
                      class="flex items-center gap-1 text-sm transition-colors"
                      :class="comment.liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'"
                    >
                      <Heart class="w-4 h-4" :class="{ 'fill-current': comment.liked }" />
                      <span>{{ comment.likes }}</span>
                    </button>
                    <button class="flex items-center gap-1 text-sm text-gray-400 hover:text-blue-500 transition-colors">
                      <MessageSquare class="w-4 h-4" />
                      <span>回复</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-5 bg-gradient-to-r from-purple-600 to-pink-600">
          <button 
            @click="handleDownload"
            class="w-full py-4 bg-white text-purple-600 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all hover:shadow-2xl hover:scale-[1.02]"
            :disabled="isDownloading"
          >
            <template v-if="isDownloading">
              <div class="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
              <span>{{ Math.round(downloadProgress) }}%</span>
            </template>
            <template v-else>
              <Download class="w-6 h-6" />
              <span>立即下载</span>
            </template>
          </button>
        </div>
      </div>
      
      <div v-if="relatedGames.length > 0" class="px-4 mt-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span class="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
          相关推荐
        </h3>
        <div class="flex gap-4 overflow-x-auto pb-2">
          <div 
            v-for="related in relatedGames" 
            :key="related.id || related._id"
            @click="(e) => { e.preventDefault(); goToGame(related.id || related._id) }"
            class="flex-shrink-0 w-32 cursor-pointer"
          >
            <div class="aspect-[3/4] rounded-2xl overflow-hidden mb-2 shadow-lg">
              <img :src="related.cover" :alt="related.name" class="w-full h-full object-cover" />
            </div>
            <p class="text-sm text-gray-700 truncate font-medium">{{ related.name }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="min-h-screen bg-gray-100 flex items-center justify-center">
    <p class="text-gray-500">游戏不存在</p>
  </div>
</template>

<style scoped>
/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #a855f7, #ec4899);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #9333ea, #db2777);
}
</style>
