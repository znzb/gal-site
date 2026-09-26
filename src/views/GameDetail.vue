<script setup lang="ts">
import { ref, onMounted, onUnmounted, onActivated, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Download, Star, Share2, Heart, Clock, HardDrive, Calendar, MessageSquare, Link2, User, Home, BookOpen, Eye } from 'lucide-vue-next'
import { gameApi, type Game, type ResourceLink, type Comment } from '@/api/api'
import { useGameStore } from '@/store/gameStore'

const route = useRoute()
const router = useRouter()
const { getResources, getComments } = useGameStore()

const gameId = ref(route.params.id as string)
const game = ref<Game | null>(null)
const isLoading = ref(true)
const activeTab = ref('info')
const stats = ref({ comments: 24, views: 6088, likes: 28 })

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

// 检测是否为桌面端
const windowWidth = ref(window.innerWidth)
const isDesktop = computed(() => windowWidth.value >= 640)

// 游戏大小：优先显示游戏自身大小，若为 0MB/空 则兜底取第一个资源的大小
const displaySize = computed(() => {
  const s = game.value?.size
  if (s && s !== '0MB' && s !== '0' && s.trim() !== '') return s
  return resources.value[0]?.size || s || '0MB'
})

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

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
    const gameData = await gameApi.getGameById(gameId.value)
    
    if (gameData) {
      game.value = gameData
      gameCache.value.set(gameId.value, gameData)
      
      await preloadImage(gameData.cover)
      
      // 用分类接口获取相关游戏，只取一页避免加载过多
      try {
        const data = await gameApi.getGamesByCategoryPage(gameData.category, 1, 10)
        const categoryGames = Array.isArray(data) ? data : (data.games || [])
        if (categoryGames.length > 0) {
          const filtered = categoryGames.filter(g => (g.id || g._id) !== gameId.value).slice(0, 3)
          relatedGames.value = filtered
          relatedCache.value.set(gameId.value, filtered)
          filtered.forEach(g => preloadImage(g.cover))
        }
      } catch (catErr) {
        console.error('加载相关游戏失败:', catErr)
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

const initData = () => {
  loadData()
  const tab = route.query.tab as string
  if (tab === 'resources') {
    activeTab.value = 'resources'
  }
}

// 图片预览
const previewImage = (src: string) => {
  const overlay = document.createElement('div')
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;cursor:zoom-out;'
  overlay.innerHTML = `<img src="${src}" alt="preview" style="max-width:95%;max-height:90%;object-fit:contain;border-radius:12px;" /><span style="position:absolute;top:20px;right:30px;color:white;font-size:40px;cursor:pointer;line-height:1;">×</span>`
  overlay.addEventListener('click', () => document.body.removeChild(overlay))
  document.body.appendChild(overlay)
}

const avatarFallbackColors = [
  ['#ff6b9d', '#c44fff'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
  ['#a18cd1', '#fbc2eb'],
]

const handleAvatarError = (e: Event, name: string) => {
  const img = e.target as HTMLImageElement
  if (img.dataset.fallback === '1') return
  img.dataset.fallback = '1'
  const char = (name || '?').trim().charAt(0).toUpperCase()
  const colorIdx = char.charCodeAt(0) % avatarFallbackColors.length
  const [c1, c2] = avatarFallbackColors[colorIdx]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="80" height="80" rx="40" fill="url(#g)"/><text x="40" y="40" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#fff" text-anchor="middle" dominant-baseline="central">${char}</text></svg>`
  img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}

onMounted(() => {
  initData()
  window.addEventListener('resize', handleResize)
})

onActivated(() => {
  initData()
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

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div v-if="isLoading" class="min-h-screen bg-gradient-to-br from-pink-50/50 to-white flex items-center justify-center">
    <div class="w-10 h-10 border-3 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
  </div>
  
  <div v-else-if="!game" class="min-h-screen bg-gradient-to-br from-pink-50/50 to-white flex items-center justify-center">
    <div class="text-center">
      <div class="text-6xl mb-4">🎮</div>
      <h2 class="text-xl font-bold text-gray-800 mb-2">游戏不存在</h2>
      <p class="text-gray-500 mb-4">找不到该游戏，请检查是否正确</p>
      <button @click="router.push('/')" class="px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl hover:opacity-90">返回首页</button>
    </div>
  </div>
  
  <!-- 手机端显示 - 保持旧版本 -->
  <div v-else-if="!isDesktop" :key="gameId" class="min-h-screen bg-gradient-to-b from-pink-50/50 to-white pb-24 sm:hidden">
    <header class="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 shadow-sm border-b border-pink-100">
      <div class="flex items-center justify-between px-4 py-3">
        <button 
          @click="router.back()"
          class="p-2 rounded-xl bg-pink-50 hover:bg-pink-100 transition-colors"
        >
          <ArrowLeft class="w-6 h-6 text-pink-600" />
        </button>
        <h1 class="text-lg font-bold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">游戏详情</h1>
        <button class="p-2 rounded-xl bg-pink-50 hover:bg-pink-100 transition-colors">
          <Share2 class="w-6 h-6 text-pink-600" />
        </button>
      </div>
    </header>
    
    <div class="pt-14">
      <div class="relative aspect-[3/4] sm:aspect-[4/3] mx-4 mt-2 rounded-2xl overflow-hidden shadow-xl border border-pink-100">
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
                :class="isFavorite ? 'text-pink-500' : 'text-white'"
              >
                <Heart class="w-7 h-7" :class="{ 'fill-current': isFavorite }" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white mx-4 mt-4 rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-pink-100">
        <div class="p-5 border-b border-pink-100">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="flex">
                <Star v-for="i in 5" :key="i" class="w-5 h-5" :class="i <= 4.9 ? 'text-yellow-400 fill-yellow-400' : 'text-pink-200'" />
              </div>
              <span class="text-sm font-bold text-gray-800 ml-2">4.9</span>
              <span class="text-xs text-pink-400 ml-2">({{ game.downloads.toLocaleString() }} 下载)</span>
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-3">
            <div class="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl py-3 px-2 text-center border border-pink-100">
              <HardDrive class="w-6 h-6 mx-auto text-pink-600 mb-1" />
              <span class="text-xs text-pink-600">大小</span>
              <p class="text-sm font-bold text-pink-900">{{ displaySize }}</p>
            </div>
            <div class="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl py-3 px-2 text-center border border-pink-100">
              <Calendar class="w-6 h-6 mx-auto text-pink-600 mb-1" />
              <span class="text-xs text-pink-600">发布</span>
              <p class="text-sm font-bold text-pink-900">{{ game.releaseDate }}</p>
            </div>
            <div class="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl py-3 px-2 text-center border border-pink-100">
              <Clock class="w-6 h-6 mx-auto text-pink-600 mb-1" />
              <span class="text-xs text-pink-600">类型</span>
              <p class="text-sm font-bold text-pink-900">{{ game.category }}</p>
            </div>
          </div>
        </div>
        
        <div class="px-1 py-2 bg-pink-50">
          <div class="flex p-1 bg-gradient-to-r from-pink-100 to-pink-100 rounded-2xl">
            <button 
              @click="activeTab = 'info'"
              class="flex-1 py-3 px-4 rounded-xl text-lg font-bold transition-all"
              :class="activeTab === 'info' ? 'bg-white text-pink-600 shadow-lg scale-105' : 'text-gray-400'"
            >
              游戏信息
            </button>
            <button 
              @click="activeTab = 'resources'"
              class="flex-1 py-3 px-4 rounded-xl text-lg font-bold transition-all"
              :class="activeTab === 'resources' ? 'bg-white text-pink-600 shadow-lg scale-105' : 'text-gray-400'"
            >
              资源链接
            </button>
            <button 
              @click="activeTab = 'comments'"
              class="flex-1 py-3 px-4 rounded-xl text-lg font-bold transition-all"
              :class="activeTab === 'comments' ? 'bg-white text-pink-600 shadow-lg scale-105' : 'text-gray-400'"
            >
              游戏评论
            </button>
          </div>
        </div>
        
        <div class="p-5">
          <div v-if="activeTab === 'info'" class="space-y-6">
            <div>
              <h3 class="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span class="w-1 h-6 bg-gradient-to-b from-pink-500 to-pink-400 rounded-full"></span>
                游戏介绍
              </h3>
              <p class="text-gray-600 leading-relaxed text-base">{{ game.description }}</p>
            </div>
            
            <div>
              <h3 class="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span class="w-1 h-6 bg-gradient-to-b from-pink-500 to-pink-400 rounded-full"></span>
                游戏截图
              </h3>
              <div v-if="(game.images && game.images.length > 0)" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <img 
                  v-for="(img, idx) in game.images" 
                  :key="idx"
                  :src="img" 
                  :alt="`${game.name} 截图${idx + 1}`"
                  class="w-full h-24 sm:h-32 object-cover rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-pink-100 cursor-pointer"
                  @click="previewImage(img)"
                />
              </div>
              <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <img 
                  :src="game.cover" 
                  :alt="game.name"
                  class="w-full h-24 sm:h-32 object-cover rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-pink-100"
                />
              </div>
            </div>
            
            <div class="bg-gradient-to-br from-pink-50 to-white rounded-2xl p-5 border border-pink-100">
              <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span class="w-1 h-6 bg-gradient-to-b from-pink-500 to-pink-400 rounded-full"></span>
                详细信息
              </h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between py-2 border-b border-pink-100">
                  <span class="text-pink-500">开发商</span>
                  <span class="text-gray-800 font-medium">{{ gameInfo.developer }}</span>
                </div>
                <div class="flex items-center justify-between py-2 border-b border-pink-100">
                  <span class="text-pink-500">发行商</span>
                  <span class="text-gray-800 font-medium">{{ gameInfo.publisher }}</span>
                </div>
                <div class="flex items-center justify-between py-2 border-b border-pink-100">
                  <span class="text-pink-500">支持平台</span>
                  <div class="flex gap-2">
                    <span v-for="platform in gameInfo.platforms" :key="platform" class="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded-full font-medium border border-pink-200">
                      {{ platform }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center justify-between py-2 border-b border-pink-100">
                  <span class="text-pink-500">支持语言</span>
                  <div class="flex gap-2 flex-wrap justify-end">
                    <span v-for="lang in gameInfo.languages" :key="lang" class="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded-full font-medium border border-pink-200">
                      {{ lang }}
                    </span>
                  </div>
                </div>
                <div class="flex items-start justify-between py-2">
                  <span class="text-pink-500">系统要求</span>
                  <span class="text-gray-800 font-medium text-right text-sm max-w-[60%]">{{ gameInfo.requirements }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="activeTab === 'resources'" id="resources-section" class="space-y-4">
            <div v-if="resources.length === 0" class="text-center py-10">
              <div class="text-4xl mb-3">📦</div>
              <p class="text-pink-400">暂无资源链接</p>
            </div>
            <div v-if="resources.length > 0" class="resource-count-badge">
              共 <span class="count-num">{{ resources.length }}</span> 个下载资源
            </div>
            <div v-for="(resource, idx) in resources" :key="resource.id || idx" class="bg-white rounded-2xl shadow-sm overflow-hidden border border-pink-100">
              <div class="p-4">
                <div class="flex flex-wrap gap-2 mb-4">
                  <span class="px-3 py-1 bg-gradient-to-r from-pink-500 to-pink-400 text-white rounded-full text-xs font-medium">
                    {{ resource.type === 'main' ? '🎮 游戏本体' : resource.type === 'patch' ? '📦 汉化补丁' : '🔄 更新包' }}
                  </span>
                  <span class="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-medium border border-pink-200">
                    {{ resource.language || '简体中文' }}
                  </span>
                  <span class="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-medium border border-pink-200">
                    {{ resource.platform || 'Android' }}
                  </span>
                  <span v-if="resource.size" class="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs font-medium border border-gray-100">
                    {{ resource.size }}
                  </span>
                </div>
                
                <h4 class="text-base font-bold text-gray-800 mb-3">{{ resource.name }}</h4>
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <img 
                      :src="resource.authorAvatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar%20boy%20white%20hair&image_size=square'" 
                      alt="用户头像"
                      class="w-10 h-10 rounded-full object-cover border-2 border-pink-200"
                      @error="handleAvatarError($event, resource.authorName || '愚者')"
                    />
                    <div>
                      <p class="font-medium text-gray-800 text-sm">{{ resource.authorName || '愚者' }}</p>
                      <p class="text-xs text-pink-400">{{ resource.dateDisplay || '3天前' }} · 已发布 {{ resource.authorResources || 198 }} 个资源</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-3">
                    <button class="flex items-center gap-1 text-pink-400 hover:text-pink-500 transition-colors">
                      <Heart class="w-5 h-5" />
                      <span class="text-sm">0</span>
                    </button>
                    <a 
                      :href="resource.url" 
                      target="_blank"
                      rel="noopener noreferrer"
                      class="w-11 h-11 bg-gradient-to-br from-pink-400 to-pink-500 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all"
                    >
                      <Download class="w-5 h-5" />
                    </a>
                  </div>
                </div>
                
                <div class="mt-3 flex items-center gap-2 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-2.5 border border-pink-100">
                  <Link2 class="w-4 h-4 text-pink-500 flex-shrink-0" />
                  <a 
                    :href="resource.url" 
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex-1 text-pink-500 text-xs font-medium truncate hover:text-pink-600 transition-colors"
                  >
                    {{ resource.url }}
                  </a>
                  <button 
                    @click="copyLink(resource.url)"
                    class="p-1.5 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-pink-100 flex-shrink-0"
                  >
                    <Share2 class="w-3.5 h-3.5 text-pink-500" />
                  </button>
                </div>
              </div>
            </div>
            
            <div class="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
              <div class="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-xl">⚠️</span>
              </div>
              <div>
                <p class="text-yellow-800 font-medium text-sm">使用资源前请认真阅读资源的备注（如果有），以免产生问题</p>
              </div>
            </div>
          </div>
          
          <div v-if="activeTab === 'comments'" class="space-y-4">
            <div v-for="comment in comments" :key="comment.id" class="bg-gradient-to-br from-pink-50 to-white rounded-2xl p-4 border border-pink-100">
              <div class="flex items-start gap-3">
                <img 
                  :src="comment.avatar" 
                  :alt="comment.user"
                  class="w-12 h-12 rounded-full object-cover border-2 border-pink-200"
                />
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <User class="w-4 h-4 text-pink-400" />
                      <span class="font-bold text-gray-800">{{ comment.user }}</span>
                    </div>
                    <span class="text-xs text-pink-400">{{ comment.date }}</span>
                  </div>
                  <div class="flex mb-2">
                    <Star v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= comment.rating ? 'text-yellow-400 fill-yellow-400' : 'text-pink-200'" />
                  </div>
                  <p class="text-gray-600 text-sm leading-relaxed mb-3">{{ comment.content }}</p>
                  <div class="flex items-center gap-4">
                    <button 
                      @click="toggleLike(comment)"
                      class="flex items-center gap-1 text-sm transition-colors"
                      :class="comment.liked ? 'text-pink-500' : 'text-pink-400 hover:text-pink-500'"
                    >
                      <Heart class="w-4 h-4" :class="{ 'fill-current': comment.liked }" />
                      <span>{{ comment.likes }}</span>
                    </button>
                    <button class="flex items-center gap-1 text-sm text-pink-400 hover:text-pink-500 transition-colors">
                      <MessageSquare class="w-4 h-4" />
                      <span>回复</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="activeTab !== 'resources'" class="px-5 py-4 bg-gradient-to-r from-pink-500 to-pink-600">
          <button 
            @click="scrollToResources"
            class="w-full py-2 bg-white text-pink-600 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:scale-[1.02]"
          >
            <Download class="w-4 h-4" />
            <span>立即下载</span>
          </button>
        </div>
      </div>
      
      <div v-if="relatedGames.length > 0" class="px-4 mt-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span class="w-1 h-6 bg-gradient-to-b from-pink-500 to-pink-400 rounded-full"></span>
          相关推荐
        </h3>
        <div class="flex gap-4 overflow-x-auto pb-2">
          <div 
            v-for="related in relatedGames" 
            :key="related.id || related._id"
            @click="(e) => { e.preventDefault(); goToGame(related.id || related._id) }"
            class="flex-shrink-0 w-32 cursor-pointer"
          >
            <div class="aspect-[3/4] rounded-2xl overflow-hidden mb-2 shadow-lg border border-pink-100">
              <img :src="related.cover" :alt="related.name" class="w-full h-full object-cover" />
            </div>
            <p class="text-sm text-gray-700 truncate font-medium">{{ related.name }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 电脑端显示 - 新设计 -->
  <div v-else-if="isDesktop" :key="gameId" class="min-h-screen bg-gradient-to-br from-pink-50/50 to-white hidden sm:block">
    <header class="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 shadow-sm border-b border-pink-100">
      <div class="flex items-center justify-between px-4 py-3">
        <div class="flex items-center gap-2">
          <button 
            @click="router.back()"
            class="p-2 rounded-xl bg-pink-50 hover:bg-pink-100 transition-colors"
          >
            <ArrowLeft class="w-6 h-6 text-pink-600" />
          </button>
          <button 
            @click="router.push('/')"
            class="p-2 rounded-xl bg-pink-50 hover:bg-pink-100 transition-colors"
          >
            <Home class="w-6 h-6 text-pink-600" />
          </button>
        </div>
        <h1 class="text-lg font-bold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">游戏详情</h1>
        <button class="p-2 rounded-xl bg-pink-50 hover:bg-pink-100 transition-colors">
          <Share2 class="w-6 h-6 text-pink-600" />
        </button>
      </div>
    </header>
    
    <div class="pt-14">
      <div class="relative mx-4 mt-2 rounded-3xl overflow-hidden shadow-xl">
        <img 
          :src="game.cover" 
          :alt="game.name"
          class="w-full h-64 sm:h-96 object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        <div class="absolute top-4 right-4 flex gap-2">
          <div class="flex items-center gap-1 bg-gray-800/60 backdrop-blur-sm rounded-full px-3 py-1.5">
            <MessageSquare class="w-4 h-4 text-white" />
            <span class="text-white text-sm font-medium">{{ stats.comments }}</span>
          </div>
          <div class="flex items-center gap-1 bg-gray-800/60 backdrop-blur-sm rounded-full px-3 py-1.5">
            <Eye class="w-4 h-4 text-white" />
            <span class="text-white text-sm font-medium">{{ stats.views }}</span>
          </div>
          <div class="flex items-center gap-1 bg-gray-800/60 backdrop-blur-sm rounded-full px-3 py-1.5">
            <Heart class="w-4 h-4 text-white" />
            <span class="text-white text-sm font-medium">{{ stats.likes }}</span>
          </div>
        </div>
        
        <div class="absolute bottom-0 left-0 right-0 p-6">
          <h2 class="text-2xl sm:text-3xl font-bold text-white mb-3 drop-shadow-lg">{{ game.name }}</h2>
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
      </div>
      
      <div class="bg-white mx-4 mt-4 rounded-3xl shadow-xl overflow-hidden border border-pink-100">
        <div class="p-5 border-b border-pink-100">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <img 
                :src="resources[0]?.authorAvatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar%20male%20purple%20hair&image_size=square'" 
                alt="作者头像"
                class="w-14 h-14 rounded-full object-cover border-2 border-pink-200"
                @error="handleAvatarError($event, resources[0]?.authorName || '愚者')"
              />
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-gray-800 text-lg">{{ resources[0]?.authorName || '愚者' }}</span>
                  <span class="px-2 py-0.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs rounded-full">LV.11</span>
                </div>
                <p class="text-sm text-pink-400">{{ resources[0]?.dateDisplay || '前天更新' }}</p>
              </div>
            </div>
            <div class="flex gap-2">
              <button class="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-sm font-medium rounded-full flex items-center gap-1 hover:opacity-90 transition-opacity shadow-md">
                <Heart class="w-4 h-4" />
                关注
              </button>
              <button class="px-4 py-2 bg-white text-pink-600 text-sm font-medium rounded-full border border-pink-200 hover:bg-pink-50 transition-colors">
                私信
              </button>
            </div>
          </div>
        </div>
        
        <div class="p-5">
          <div>
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 pb-3 border-b border-pink-100">
              <span class="w-1 h-6 bg-gradient-to-b from-pink-500 to-pink-400 rounded-full"></span>
              游戏简介
            </h3>
            <div class="text-gray-600 leading-relaxed space-y-4">
              <p>{{ game.description }}</p>
              <p>自"黑列车"将怪物散布到世界各地，人类濒临灭绝以来，已经过去了200年。</p>
              <p>日本在一个名为"学院"的反现实组织的庇护下得以恢复。</p>
              <p>然而，和平的世界之下总是潜藏着黑暗。</p>
              <p>一群被称为"魔法师"的无法无天之人，为了追求真理而漠视人类的安危。</p>
            </div>
          </div>
          
          <div class="mt-8">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 pb-3 border-b border-pink-100">
              <span class="w-1 h-6 bg-gradient-to-b from-pink-500 to-pink-400 rounded-full"></span>
              游戏截图
            </h3>
            <div v-if="game.images && game.images.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <img 
                v-for="(img, idx) in game.images" 
                :key="idx"
                :src="img" 
                :alt="`${game.name} 截图${idx + 1}`"
                class="w-full h-44 sm:h-60 object-cover rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-pink-100 cursor-pointer"
                @click="previewImage(img)"
              />
            </div>
            <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <img 
                :src="game.cover" 
                :alt="game.name"
                class="w-full h-44 sm:h-60 object-cover rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-pink-100"
              />
            </div>
          </div>
          
          <div class="mt-8 bg-gradient-to-br from-pink-50 to-white rounded-2xl p-5 border border-pink-100">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span class="w-1 h-6 bg-gradient-to-b from-pink-500 to-pink-400 rounded-full"></span>
              详细信息
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center justify-between py-3 border-b border-pink-100">
                <span class="text-pink-500">开发商</span>
                <span class="text-gray-800 font-medium">{{ gameInfo.developer || '未知' }}</span>
              </div>
              <div class="flex items-center justify-between py-3 border-b border-pink-100">
                <span class="text-pink-500">发行商</span>
                <span class="text-gray-800 font-medium">{{ gameInfo.publisher || '未知' }}</span>
              </div>
              <div class="flex items-center justify-between py-3 border-b border-pink-100">
                <span class="text-pink-500">游戏类型</span>
                <span class="text-gray-800 font-medium">{{ game.category }}</span>
              </div>
              <div class="flex items-center justify-between py-3 border-b border-pink-100">
                <span class="text-pink-500">资源大小</span>
                <span class="text-gray-800 font-medium">{{ displaySize }}</span>
              </div>
              <div class="flex items-center justify-between py-3 border-b border-pink-100">
                <span class="text-pink-500">发布日期</span>
                <span class="text-gray-800 font-medium">{{ game.releaseDate }}</span>
              </div>
              <div class="flex items-center justify-between py-3 border-b border-pink-100">
                <span class="text-pink-500">支持平台</span>
                <div class="flex gap-2 flex-wrap justify-end">
                  <span v-for="platform in gameInfo.platforms" :key="platform" class="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded-full font-medium border border-pink-200">
                    {{ platform }}
                  </span>
                </div>
              </div>
              <div class="flex items-center justify-between py-3">
                <span class="text-pink-500">支持语言</span>
                <div class="flex gap-2 flex-wrap justify-end">
                  <span v-for="lang in gameInfo.languages" :key="lang" class="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded-full font-medium border border-pink-200">
                    {{ lang }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-8">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 pb-3 border-b border-pink-100">
              <span class="w-1 h-6 bg-gradient-to-b from-pink-500 to-pink-400 rounded-full"></span>
              资源链接
              <span v-if="resources.length > 0" class="resource-count-badge-desktop">
                共 {{ resources.length }} 个
              </span>
            </h3>
            <div v-if="resources.length === 0" class="text-center py-10">
              <div class="text-4xl mb-3">📦</div>
              <p class="text-pink-400">暂无资源链接</p>
            </div>
            <div v-if="resources.length > 0" class="space-y-4">
              <div v-for="(resource, idx) in resources" :key="resource.id || idx" class="bg-gradient-to-br from-pink-50 to-white rounded-2xl p-4 border border-pink-100">
                <div class="flex flex-wrap gap-2 mb-4">
                  <span class="px-4 py-1.5 bg-gradient-to-r from-pink-500 to-pink-400 text-white rounded-full text-sm font-medium">
                    {{ resource.type === 'main' ? '🎮 游戏本体' : resource.type === 'patch' ? '📦 汉化补丁' : '🔄 更新包' }}
                  </span>
                  <span class="px-4 py-1.5 bg-pink-50 text-pink-600 rounded-full text-sm font-medium border border-pink-200">
                    {{ resource.language || '简体中文' }}
                  </span>
                  <span class="px-4 py-1.5 bg-pink-50 text-pink-600 rounded-full text-sm font-medium border border-pink-200">
                    {{ resource.platform || 'PC' }}
                  </span>
                  <span v-if="resource.size" class="px-4 py-1.5 bg-gray-50 text-gray-500 rounded-full text-sm font-medium border border-gray-100">
                    {{ resource.size }}
                  </span>
                </div>
                
                <h4 class="text-lg font-bold text-gray-800 mb-3">{{ resource.name }}</h4>
                
                <div class="flex items-center gap-2 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-3 border border-pink-100">
                  <Link2 class="w-4 h-4 text-pink-500 flex-shrink-0" />
                  <a 
                    :href="resource.url" 
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex-1 text-pink-500 text-sm font-medium truncate hover:text-pink-600 transition-colors"
                  >
                    {{ resource.url }}
                  </a>
                  <button 
                    @click="copyLink(resource.url)"
                    class="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-pink-100"
                  >
                    <Share2 class="w-4 h-4 text-pink-500" />
                  </button>
                  <a 
                    :href="resource.url" 
                    target="_blank"
                    rel="noopener noreferrer"
                    class="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-sm font-medium rounded-lg hover:shadow-md transition-all flex items-center gap-1"
                  >
                    <Download class="w-4 h-4" />
                    下载
                  </a>
                </div>
              </div>
            </div>
            
            <div class="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3 mt-4">
              <div class="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-xl">⚠️</span>
              </div>
              <div>
                <p class="text-yellow-800 font-medium">使用资源前请认真阅读资源的备注（如果有），以免产生问题</p>
              </div>
            </div>
          </div>
          
          <div class="mt-8">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 pb-3 border-b border-pink-100">
              <span class="w-1 h-6 bg-gradient-to-b from-pink-500 to-pink-400 rounded-full"></span>
              用户评论 ({{ comments.length || 0 }})
            </h3>
            <div v-if="comments.length > 0" class="space-y-4">
              <div v-for="comment in comments" :key="comment.id" class="bg-gradient-to-br from-pink-50 to-white rounded-2xl p-4 border border-pink-100">
                <div class="flex items-start gap-3">
                  <img 
                    :src="comment.avatar" 
                    :alt="comment.user"
                    class="w-12 h-12 rounded-full object-cover border-2 border-pink-200"
                  />
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <User class="w-4 h-4 text-pink-400" />
                        <span class="font-bold text-gray-800">{{ comment.user }}</span>
                      </div>
                      <span class="text-xs text-pink-400">{{ comment.date }}</span>
                    </div>
                    <div class="flex mb-2">
                      <Star v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= comment.rating ? 'text-yellow-400 fill-yellow-400' : 'text-pink-200'" />
                    </div>
                    <p class="text-gray-600 text-sm leading-relaxed mb-3">{{ comment.content }}</p>
                    <div class="flex items-center gap-4">
                      <button 
                        @click="toggleLike(comment)"
                        class="flex items-center gap-1 text-sm transition-colors"
                        :class="comment.liked ? 'text-pink-500' : 'text-pink-400 hover:text-pink-500'"
                      >
                        <Heart class="w-4 h-4" :class="{ 'fill-current': comment.liked }" />
                        <span>{{ comment.likes }}</span>
                      </button>
                      <button class="flex items-center gap-1 text-sm text-pink-400 hover:text-pink-500 transition-colors">
                        <MessageSquare class="w-4 h-4" />
                        <span>回复</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-10">
              <div class="text-4xl mb-3">💬</div>
              <p class="text-pink-400">暂无评论，快来发表第一条评论吧！</p>
            </div>
          </div>
        </div>
        
        <div class="px-5 py-4 bg-gradient-to-r from-pink-500 to-pink-600">
          <button 
            @click="scrollToResources"
            class="w-full py-3 bg-white text-pink-600 text-base font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:scale-[1.02]"
          >
            <Download class="w-5 h-5" />
            <span>立即下载</span>
          </button>
        </div>
      </div>
      
      <div v-if="relatedGames.length > 0" class="px-4 mt-6 pb-8">
        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span class="w-1 h-6 bg-gradient-to-b from-pink-500 to-pink-400 rounded-full"></span>
          相关推荐
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div 
            v-for="related in relatedGames" 
            :key="related.id || related._id"
            @click="(e) => { e.preventDefault(); goToGame(related.id || related._id) }"
            class="cursor-pointer"
          >
            <div class="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-pink-100">
              <img :src="related.cover" :alt="related.name" class="w-full h-full object-cover" />
            </div>
            <p class="text-sm text-gray-700 truncate font-medium mt-2">{{ related.name }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="min-h-screen bg-gradient-to-br from-pink-50/50 to-white flex items-center justify-center">
    <p class="text-pink-500">游戏不存在</p>
  </div>
</template>

<style scoped>
/* 资源数量提示 */
.resource-count-badge {
  padding: 8px 14px;
  background: linear-gradient(135deg, #fff0f7 0%, #f5eaff 100%);
  border-radius: 12px;
  font-size: 13px;
  color: #6b6680;
  border: 1px solid #f0e0f0;
}

.resource-count-badge .count-num {
  font-weight: 700;
  font-size: 16px;
  color: #c44fff;
  margin: 0 2px;
}

.resource-count-badge-desktop {
  font-size: 13px;
  font-weight: 500;
  color: #c44fff;
  background: linear-gradient(135deg, #fff0f7 0%, #f5eaff 100%);
  padding: 2px 10px;
  border-radius: 12px;
  margin-left: auto;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #ec4899, #f472b6);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #db2777, #ec4899);
}
</style>
