<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Gamepad2, Monitor, Image, BookOpen, Download, FileText, Music, Zap, Cpu, HardDrive, Globe } from 'lucide-vue-next'
import Header from '@/components/Header.vue'
import FeatureGrid from '@/components/FeatureGrid.vue'
import GameCard from '@/components/GameCard.vue'
import { gameApi, bannerApi, announcementApi, categoryApi, type Game, type Banner, type Announcement, type CategoryItem } from '@/api/api'

const router = useRouter()

const games = ref<Game[]>([])
const banners = ref<Banner[]>([])
const announcements = ref<Announcement[]>([])
const categories = ref<CategoryItem[]>([])
const isLoading = ref(true)
const isDataLoaded = ref(false)

const handleGameClick = (id: string) => {
  router.push(`/game/${id}`)
}

const currentBanner = ref(0)
const bannersLoaded = ref<boolean[]>([])
let timer: number | null = null

const nextBanner = () => {
  currentBanner.value = (currentBanner.value + 1) % banners.value.length
}

const prevBanner = () => {
  currentBanner.value = (currentBanner.value - 1 + banners.value.length) % banners.value.length
}

const goToBanner = (index: number) => {
  currentBanner.value = index
}

const handleBannerLoad = (index: number) => {
  bannersLoaded.value[index] = true
}

const handleBannerError = (index: number) => {
  console.warn(`Banner ${index + 1} failed to load`)
  bannersLoaded.value[index] = true
}

const preloadBannerImages = () => {
  banners.value.forEach((banner, index) => {
    if (!bannersLoaded.value[index]) {
      const img = new Image()
      img.onload = () => handleBannerLoad(index)
      img.onerror = () => handleBannerError(index)
      img.src = banner.image
    }
  })
}

const loadData = async () => {
  try {
    const [gamesData, bannersData, announcementsData, categoriesData] = await Promise.all([
      gameApi.getAllGames(),
      bannerApi.getAllBanners(),
      announcementApi.getAllAnnouncements(),
      categoryApi.getAllCategories()
    ])
    games.value = gamesData || []
    banners.value = bannersData || []
    bannersLoaded.value = new Array(banners.value.length).fill(false)
    preloadBannerImages()
    announcements.value = (announcementsData || []).filter(a => a.isVisible)
    categories.value = categoriesData || []
  } catch (error) {
    console.error('Failed to load from API:', error)
  } finally {
    isLoading.value = false
    isDataLoaded.value = true
  }
}

let dataRefreshTimer: number | null = null

onMounted(() => {
  loadData()
  timer = window.setInterval(nextBanner, 4000)
  dataRefreshTimer = window.setInterval(() => {
    loadData()
  }, 30000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  if (dataRefreshTimer) {
    clearInterval(dataRefreshTimer)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20 md:pb-8">
    <Header />
    
    <!-- Loading状态 -->
    <div v-if="isLoading" class="flex items-center justify-center h-40 pt-10">
      <div class="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
    
    <div v-else>
      <!-- 移动端布局 -->
      <div class="md:hidden">
        <div class="mx-4 mt-4">
          <div class="relative rounded-2xl shadow-xl overflow-hidden bg-slate-800/50 border border-slate-700/50">
            <div class="relative h-40">
              <div class="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900">
                <div v-if="banners.length > 0 && !bannersLoaded[currentBanner]" class="absolute inset-0 flex items-center justify-center">
                  <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              
              <transition-group name="fade">
                <div 
                  v-for="(banner, index) in banners" 
                  :key="banner.id"
                  v-show="currentBanner === index"
                  class="absolute inset-0"
                >
                  <img 
                    :src="banner.image" 
                    :alt="banner.title"
                    loading="lazy"
                    class="absolute inset-0 w-full h-full object-cover transition-all duration-700 transform"
                    :class="bannersLoaded[index] ? 'opacity-100 scale-100' : 'opacity-0 scale-105'"
                    @load="handleBannerLoad(index)"
                    @error="handleBannerError(index)"
                  />
                  <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 class="text-white text-lg font-bold drop-shadow-lg">{{ banner.title }}</h3>
                    <p class="text-white/90 text-xs mt-0.5 drop-shadow-md">{{ banner.subtitle }}</p>
                  </div>
                </div>
              </transition-group>
              
              <button 
                v-if="banners.length > 1"
                @click="prevBanner" 
                class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 active:bg-white/30 transition-all duration-300 transform hover:scale-110 active:scale-95 z-10"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              
              <button 
                v-if="banners.length > 1"
                @click="nextBanner" 
                class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 active:bg-white/30 transition-all duration-300 transform hover:scale-110 active:scale-95 z-10"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
              
              <div v-if="banners.length > 1" class="absolute bottom-3 left-0 right-0 z-10 flex items-center justify-center gap-1.5">
                <button 
                  v-for="(banner, index) in banners" 
                  :key="banner.id"
                  @click="goToBanner(index)"
                  class="w-2 h-2 rounded-full transition-all duration-300 transform hover:scale-125"
                  :class="currentBanner === index ? 'bg-indigo-400 w-4' : 'bg-white/30 hover:bg-white/50'"
                ></button>
              </div>
            </div>
          </div>
        </div>
        
        <FeatureGrid />
        
        <div id="announcements" v-if="announcements.length > 0" class="px-4 mt-6">
          <div class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xl">📢</span>
              <h3 class="font-bold text-white">公告</h3>
            </div>
            <div class="space-y-3">
              <div 
                v-for="announcement in announcements" 
                :key="announcement.id"
                class="p-3 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg border-l-4 border-indigo-500"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1">
                    <h4 class="font-semibold text-white flex items-center gap-2">
                      <span v-if="announcement.isPinned" class="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">置顶</span>
                      {{ announcement.title }}
                    </h4>
                    <p class="text-sm text-gray-400 mt-1">{{ announcement.content }}</p>
                  </div>
                  <span class="text-xs text-gray-500 whitespace-nowrap">{{ new Date(announcement.createdAt).toLocaleDateString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="px-4 mt-6">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-bold text-white">热门游戏</h2>
            <span class="text-xs text-indigo-400">查看更多 →</span>
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <GameCard 
              v-for="game in games" 
              :key="game.id" 
              :game="game"
              @click="handleGameClick"
            />
          </div>
        </div>
      </div>

      <!-- 电脑端布局 -->
      <div class="hidden md:block">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          <!-- 大幅横幅区域 -->
          <div class="relative rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/30 mb-8">
            <div class="relative h-72 lg:h-96">
              <div class="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-blue-900/20">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(99,102,241,0.15)_0%,transparent_50%)]"></div>
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.15)_0%,transparent_50%)]"></div>
                
                <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                  <div class="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                    三菜鱼小站
                  </div>
                  <p class="text-xl lg:text-2xl text-gray-300 font-medium mb-8">
                    分享、传递 Galgame
                  </p>
                  <div class="flex gap-10">
                    <div class="flex flex-col items-center group">
                      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-indigo-500/30 border border-indigo-500/30 flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-indigo-500/30">
                        <Zap class="w-8 h-8 text-indigo-400" />
                      </div>
                      <span class="text-sm text-gray-400">极速下载</span>
                    </div>
                    <div class="flex flex-col items-center group">
                      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-500/30 border border-purple-500/30 flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-purple-500/30">
                        <Cpu class="w-8 h-8 text-purple-400" />
                      </div>
                      <span class="text-sm text-gray-400">海量资源</span>
                    </div>
                    <div class="flex flex-col items-center group">
                      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-500/30 border border-blue-500/30 flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/30">
                        <HardDrive class="w-8 h-8 text-blue-400" />
                      </div>
                      <span class="text-sm text-gray-400">安全可靠</span>
                    </div>
                    <div class="flex flex-col items-center group">
                      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-600/20 to-pink-500/30 border border-pink-500/30 flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-pink-500/30">
                        <Globe class="w-8 h-8 text-pink-400" />
                      </div>
                      <span class="text-sm text-gray-400">持续更新</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 快捷导航区域 -->
          <div class="bg-slate-800/30 rounded-xl border border-slate-700/30 p-6 mb-8">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span class="text-indigo-400 text-2xl">⚡</span>
              快速导航
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <button 
                @click="router.push('/pc-resources')"
                class="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-indigo-900/30 to-indigo-800/20 border border-indigo-700/30 hover:from-indigo-700/40 hover:to-indigo-600/30 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 transform hover:scale-105"
              >
                <Monitor class="w-10 h-10 text-indigo-400 mb-2" />
                <span class="text-sm font-medium text-gray-300">PC资源</span>
              </button>
              <button 
                @click="router.push('/category/PC资源')"
                class="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/30 hover:from-purple-700/40 hover:to-purple-600/30 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 transform hover:scale-105"
              >
                <Gamepad2 class="w-10 h-10 text-purple-400 mb-2" />
                <span class="text-sm font-medium text-gray-300">Gal游戏</span>
              </button>
              <button 
                @click="router.push('/yuzusoft')"
                class="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/30 hover:from-blue-700/40 hover:to-blue-600/30 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 transform hover:scale-105"
              >
                <Music class="w-10 h-10 text-blue-400 mb-2" />
                <span class="text-sm font-medium text-gray-300">柚子社</span>
              </button>
              <button 
                @click="router.push('/tools')"
                class="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-pink-900/30 to-pink-800/20 border border-pink-700/30 hover:from-pink-700/40 hover:to-pink-600/30 hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300 transform hover:scale-105"
              >
                <Download class="w-10 h-10 text-pink-400 mb-2" />
                <span class="text-sm font-medium text-gray-300">工具下载</span>
              </button>
              <button 
                @click="router.push('/category/游戏CG')"
                class="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 border border-cyan-700/30 hover:from-cyan-700/40 hover:to-cyan-600/30 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 transform hover:scale-105"
              >
                <Image class="w-10 h-10 text-cyan-400 mb-2" />
                <span class="text-sm font-medium text-gray-300">游戏CG</span>
              </button>
              <button 
                @click="router.push('/help')"
                class="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700/30 hover:from-green-700/40 hover:to-green-600/30 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:scale-105"
              >
                <BookOpen class="w-10 h-10 text-green-400 mb-2" />
                <span class="text-sm font-medium text-gray-300">帮助中心</span>
              </button>
            </div>
          </div>

          <!-- 公告区域 -->
          <div v-if="announcements.length > 0" class="bg-slate-800/30 rounded-xl border border-slate-700/30 p-6 mb-8">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <span class="text-2xl">📢</span>
                <h3 class="font-bold text-white text-lg">最新公告</h3>
              </div>
              <button 
                v-if="announcements.length > 3"
                @click="router.push('/announcements')"
                class="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                查看全部 →
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                v-for="announcement in announcements.slice(0, 3)" 
                :key="announcement.id"
                class="p-4 bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-xl border-l-4 border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1">
                    <h4 class="font-semibold text-white flex items-center gap-2">
                      <span v-if="announcement.isPinned" class="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">置顶</span>
                      {{ announcement.title }}
                    </h4>
                    <p class="text-sm text-gray-400 mt-2 line-clamp-2">{{ announcement.content }}</p>
                  </div>
                  <span class="text-xs text-gray-500 whitespace-nowrap">{{ new Date(announcement.createdAt).toLocaleDateString() }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 游戏列表 -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold text-white flex items-center gap-2">
                <span class="text-indigo-400">🎮</span>
                热门游戏
              </h2>
              <span class="text-sm text-indigo-400 cursor-pointer hover:text-indigo-300 transition-colors">查看更多 →</span>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <GameCard 
                v-for="game in games" 
                :key="game.id" 
                :game="game"
                @click="handleGameClick"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
