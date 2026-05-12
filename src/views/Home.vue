<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Gamepad2, Monitor, Image, BookOpen, Download, FileText, Music } from 'lucide-vue-next'
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
  <div class="min-h-screen bg-gray-100 pb-20 md:pb-8">
    <Header />
    
    <!-- Loading状态 -->
    <div v-if="isLoading" class="flex items-center justify-center h-40 pt-10">
      <div class="w-10 h-10 border-3 border-gray-300 border-t-primary rounded-full animate-spin"></div>
    </div>
    
    <div v-else>
      <!-- 移动端布局 -->
      <div class="md:hidden">
        <div class="mx-4 mt-4">
          <div class="relative rounded-2xl shadow-xl overflow-hidden bg-white border border-gray-100">
            <div class="relative h-40">
              <div class="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
                <div v-if="banners.length > 0 && !bannersLoaded[currentBanner]" class="absolute inset-0 flex items-center justify-center">
                  <div class="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
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
                  <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                    <h3 class="text-white text-lg font-bold drop-shadow-lg">{{ banner.title }}</h3>
                    <p class="text-white/90 text-xs mt-0.5 drop-shadow-md">{{ banner.subtitle }}</p>
                  </div>
                </div>
              </transition-group>
              
              <button 
                v-if="banners.length > 1"
                @click="prevBanner" 
                class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 active:bg-white/40 transition-all duration-300 transform hover:scale-110 active:scale-95 z-10"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              
              <button 
                v-if="banners.length > 1"
                @click="nextBanner" 
                class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 active:bg-white/40 transition-all duration-300 transform hover:scale-110 active:scale-95 z-10"
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
                  :class="currentBanner === index ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/70'"
                ></button>
              </div>
            </div>
          </div>
        </div>
        
        <FeatureGrid />
        
        <div id="announcements" v-if="announcements.length > 0" class="px-4 mt-6">
          <div class="bg-white rounded-xl shadow-md p-4">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xl">📢</span>
              <h3 class="font-bold text-gray-800">公告</h3>
            </div>
            <div class="space-y-3">
              <div 
                v-for="announcement in announcements" 
                :key="announcement.id"
                class="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-l-4 border-indigo-500"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-800 flex items-center gap-2">
                      <span v-if="announcement.isPinned" class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">置顶</span>
                      {{ announcement.title }}
                    </h4>
                    <p class="text-sm text-gray-600 mt-1">{{ announcement.content }}</p>
                  </div>
                  <span class="text-xs text-gray-400 whitespace-nowrap">{{ new Date(announcement.createdAt).toLocaleDateString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="px-4 mt-6">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-bold text-gray-800">热门游戏</h2>
            <span class="text-xs text-primary">查看更多 →</span>
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
          <div class="relative rounded-2xl shadow-xl overflow-hidden bg-white border border-gray-100 mb-8">
            <div class="relative h-72 lg:h-96">
              <div class="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
                <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                  <div class="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-4">
                    三菜鱼小站
                  </div>
                  <p class="text-xl lg:text-2xl text-gray-700 font-medium mb-6">
                    分享、传递 Galgame
                  </p>
                  <div class="flex gap-8">
                    <div class="flex flex-col items-center">
                      <div class="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center mb-2">
                        <Gamepad2 class="w-8 h-8 text-primary" />
                      </div>
                      <span class="text-sm text-gray-600">游戏资源</span>
                    </div>
                    <div class="flex flex-col items-center">
                      <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-2">
                        <Monitor class="w-8 h-8 text-blue-500" />
                      </div>
                      <span class="text-sm text-gray-600">分类齐全</span>
                    </div>
                    <div class="flex flex-col items-center">
                      <div class="w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center mb-2">
                        <Download class="w-8 h-8 text-pink-500" />
                      </div>
                      <span class="text-sm text-gray-600">高速下载</span>
                    </div>
                    <div class="flex flex-col items-center">
                      <div class="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center mb-2">
                        <FileText class="w-8 h-8 text-yellow-600" />
                      </div>
                      <span class="text-sm text-gray-600">交流分享</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 快捷导航区域 -->
          <div class="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span class="text-pink-500 text-2xl">🔗</span>
              快速导航
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <button 
                @click="router.push('/pc-resources')"
                class="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105"
              >
                <Monitor class="w-10 h-10 text-blue-500 mb-2" />
                <span class="text-sm font-medium text-gray-700">PC资源</span>
              </button>
              <button 
                @click="router.push('/category/PC资源')"
                class="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-105"
              >
                <Gamepad2 class="w-10 h-10 text-purple-500 mb-2" />
                <span class="text-sm font-medium text-gray-700">Gal游戏</span>
              </button>
              <button 
                @click="router.push('/yuzusoft')"
                class="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 transition-all duration-300 transform hover:scale-105"
              >
                <Music class="w-10 h-10 text-yellow-600 mb-2" />
                <span class="text-sm font-medium text-gray-700">柚子社</span>
              </button>
              <button 
                @click="router.push('/tools')"
                class="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 transition-all duration-300 transform hover:scale-105"
              >
                <Download class="w-10 h-10 text-pink-500 mb-2" />
                <span class="text-sm font-medium text-gray-700">工具下载</span>
              </button>
              <button 
                @click="router.push('/category/游戏CG')"
                class="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300 transform hover:scale-105"
              >
                <Image class="w-10 h-10 text-green-500 mb-2" />
                <span class="text-sm font-medium text-gray-700">游戏CG</span>
              </button>
              <button 
                @click="router.push('/help')"
                class="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 transition-all duration-300 transform hover:scale-105"
              >
                <BookOpen class="w-10 h-10 text-indigo-500 mb-2" />
                <span class="text-sm font-medium text-gray-700">帮助中心</span>
              </button>
            </div>
          </div>

          <!-- 两栏布局 -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- 左侧：游戏列表 -->
            <div class="lg:col-span-2">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span class="text-pink-500">🎮</span>
                  热门游戏
                </h2>
                <span class="text-sm text-primary cursor-pointer hover:underline">查看更多 →</span>
              </div>
              
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <GameCard 
                  v-for="game in games" 
                  :key="game.id" 
                  :game="game"
                  @click="handleGameClick"
                />
              </div>
            </div>

            <!-- 右侧：公告和分类 -->
            <div class="space-y-6">
              
              <!-- 公告区域 -->
              <div v-if="announcements.length > 0" class="bg-white rounded-xl shadow-md p-6">
                <div class="flex items-center gap-3 mb-4">
                  <span class="text-2xl">📢</span>
                  <h3 class="font-bold text-gray-800 text-lg">公告</h3>
                </div>
                <div class="space-y-4">
                  <div 
                    v-for="announcement in announcements.slice(0, 3)" 
                    :key="announcement.id"
                    class="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-l-4 border-indigo-500"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex-1">
                        <h4 class="font-semibold text-gray-800 flex items-center gap-2">
                          <span v-if="announcement.isPinned" class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">置顶</span>
                          {{ announcement.title }}
                        </h4>
                        <p class="text-sm text-gray-600 mt-2">{{ announcement.content }}</p>
                      </div>
                      <span class="text-xs text-gray-400 whitespace-nowrap">{{ new Date(announcement.createdAt).toLocaleDateString() }}</span>
                    </div>
                  </div>
                </div>
                <button 
                  v-if="announcements.length > 3"
                  @click="router.push('/announcements')"
                  class="w-full mt-4 text-center text-sm text-primary hover:underline"
                >
                  查看全部公告 →
                </button>
              </div>

              <!-- 分类列表 -->
              <div class="bg-white rounded-xl shadow-md p-6">
                <div class="flex items-center gap-3 mb-4">
                  <span class="text-2xl">📁</span>
                  <h3 class="font-bold text-gray-800 text-lg">分类列表</h3>
                </div>
                <div class="space-y-2">
                  <button 
                    v-for="category in categories" 
                    :key="category.id"
                    @click="router.push(`/category/${category.name}`)"
                    class="w-full text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r from-primary/5 to-secondary/5 transition-all duration-200 flex items-center gap-3"
                  >
                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-lg">
                      {{ category.icon === 'gamepad-2' ? '🎮' : category.icon === 'image' ? '🖼️' : category.icon === 'images' ? '📷' : category.icon === 'book-open' ? '📖' : '📁' }}
                    </div>
                    <span class="text-gray-700 font-medium">{{ category.name }}</span>
                  </button>
                </div>
              </div>
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
</style>
