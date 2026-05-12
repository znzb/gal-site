<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Download, Star, Share2, Heart, Clock, HardDrive, Calendar, MessageSquare, Link2, User, ChevronDown, ChevronUp } from 'lucide-vue-next'
import { gameApi, type Game, type ResourceLink, type Comment } from '@/api/api'
import { useGameStore } from '@/store/gameStore'

const route = useRoute()
const router = useRouter()
const { getResources, getComments } = useGameStore()

const gameId = ref(route.params.id as string)
const game = ref<Game | null>(null)
const isLoading = ref(true)
const activeTab = ref('info')

interface GameInfo {
  developer: string
  publisher: string
  platforms: string[]
  languages: string[]
  requirements: string
}

const resources = ref<ResourceLink[]>([])
const comments = ref<Comment[]>([])
const gameInfo = ref<GameInfo>({
  developer: '',
  publisher: '',
  platforms: [],
  languages: [],
  requirements: ''
})
const isFavorite = ref(false)
const isDownloading = ref(false)
const downloadProgress = ref(0)
const relatedGames = ref<Game[]>([])
const expandedComments = ref<string[]>([])
const expandedResources = ref<string[]>([])

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

const toggleResourceExpand = (resourceId: string) => {
  const index = expandedResources.value.indexOf(resourceId)
  if (index > -1) {
    expandedResources.value.splice(index, 1)
  } else {
    expandedResources.value.push(resourceId)
  }
}

const copyLink = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    alert('链接已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
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
  gameCache.value.clear()
  relatedCache.value.clear()
  
  try {
    const [gameData, allGames] = await Promise.all([
      gameApi.getGameById(gameId.value),
      gameApi.getAllGames()
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
      
      resources.value = gameData.resources || []
      comments.value = (gameData.comments || []).map(c => ({ ...c, liked: false }))
      
      gameInfo.value = {
        developer: gameData.developer || '',
        publisher: gameData.publisher || '',
        platforms: gameData.platforms || [],
        languages: gameData.languages || [],
        requirements: gameData.requirements || ''
      }
    }
  } catch (error) {
    console.error('Failed to load game data:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
  const tab = route.query.tab as string
  if (tab === 'resources') {
    activeTab.value = 'resources'
  }
})

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      gameId.value = newId as string
      const tab = route.query.tab as string
      activeTab.value = tab === 'resources' ? 'resources' : 'info'
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
      <div class="relative aspect-[3/4] sm:aspect-[4/3] mx-4 mt-2 rounded-2xl overflow-hidden shadow-xl">
        <img 
          :src="game.cover" 
          :alt="game.name"
          class="w-full h-full object-contain"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        
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
                  v-for="platform in (game.platforms || [])" 
                  :key="platform"
                  class="bg-white/25 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm font-medium"
                >
                  {{ platform }}
                </span>
                <span 
                  v-if="game.subCategory"
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
            
            <div>
              <h3 class="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span class="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
                游戏截图
              </h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <img 
                  :src="game.cover" 
                  :alt="game.name"
                  class="w-full h-24 sm:h-32 object-cover rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                />
                <img 
                  src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20visual%20novel%20game%20screenshot%20beach%20romance&image_size=landscape_16_9" 
                  alt="游戏截图2"
                  class="w-full h-24 sm:h-32 object-cover rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                />
                <img 
                  src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20visual%20novel%20game%20screenshot%20sunset%20scene&image_size=landscape_16_9" 
                  alt="游戏截图3"
                  class="w-full h-24 sm:h-32 object-cover rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                />
              </div>
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
            <div v-for="resource in resources" :key="resource.id" class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <div class="p-4">
                <div class="flex flex-wrap gap-2 mb-4">
                  <span class="px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full text-sm font-medium">
                    {{ resource.type === 'main' ? '游戏本体' : resource.type === 'patch' ? '汉化资源' : '更新资源' }}
                  </span>
                  <span class="px-4 py-1.5 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                    {{ resource.language || '简体中文' }}
                  </span>
                  <span class="px-4 py-1.5 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                    {{ resource.platform || 'Android' }}
                  </span>
                  <button class="ml-auto p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <ChevronDown class="w-5 h-5" />
                  </button>
                </div>
                
                <h4 class="text-lg font-bold text-gray-800 mb-4">{{ resource.name }}</h4>
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <img 
                      :src="resource.authorAvatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar%20boy%20white%20hair&image_size=square'" 
                      alt="用户头像"
                      class="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p class="font-medium text-gray-800">{{ resource.authorName || '愚者' }}</p>
                      <p class="text-sm text-gray-400">{{ resource.dateDisplay || '3天前' }} · 已发布资源 {{ resource.authorResources || 198 }} 个</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-3">
                    <button class="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors">
                      <Heart class="w-6 h-6" />
                      <span class="text-sm">0</span>
                    </button>
                    <button 
                      @click="toggleResourceExpand(resource.id)"
                      class="w-12 h-12 bg-blue-400 rounded-xl flex items-center justify-center text-white hover:bg-blue-500 transition-colors shadow-md"
                    >
                      <Download class="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div 
                  v-if="expandedResources.includes(resource.id)" 
                  class="mt-4 pt-4 border-t border-gray-100"
                >
                  <div class="flex flex-wrap gap-2 mb-4">
                    <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">kisuacg 资源盘</span>
                    <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium flex items-center gap-1">
                      <HardDrive class="w-3 h-3" />
                      {{ resource.size }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-500 mb-3">点击下面的链接以下载</p>
                  <div class="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3">
                    <Link2 class="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <a 
                      :href="resource.url" 
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex-1 text-blue-500 text-sm font-medium truncate hover:text-blue-600 transition-colors"
                    >
                      {{ resource.url }}
                    </a>
                    <button 
                      @click="copyLink(resource.url)"
                      class="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
                    >
                      <Share2 class="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
              <div class="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-xl">⚠️</span>
              </div>
              <div>
                <p class="text-yellow-800 font-medium">使用资源前请认真阅读资源的备注（如果有），以免产生问题</p>
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
        
        <div v-if="activeTab !== 'resources'" class="px-5 py-4 bg-gradient-to-r from-purple-500 to-pink-500">
          <button 
            @click="scrollToResources"
            class="w-full py-2 bg-white text-purple-600 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:scale-[1.02]"
          >
            <Download class="w-4 h-4" />
            <span>立即下载</span>
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
