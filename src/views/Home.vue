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

const preloadBannerImages = async () => {
  if (!Array.isArray(banners.value) || banners.value.length === 0) {
    return
  }
  
  for (let index = 0; index < banners.value.length; index++) {
    const banner = banners.value[index]
    if (!bannersLoaded.value[index] && banner && banner.image) {
      try {
        await fetch(banner.image, { method: 'HEAD' })
        handleBannerLoad(index)
      } catch (error) {
        console.error('Failed to preload banner image:', error)
        handleBannerError(index)
      }
    }
  }
}

const loadData = async () => {
  try {
    const [gamesData, bannersData, announcementsData, categoriesData] = await Promise.all([
      gameApi.getAllGames(),
      bannerApi.getAllBanners(),
      announcementApi.getAllAnnouncements(),
      categoryApi.getAllCategories()
    ])
    games.value = Array.isArray(gamesData) ? gamesData : []
    banners.value = Array.isArray(bannersData) ? bannersData : []
    bannersLoaded.value = new Array(banners.value.length).fill(false)
    preloadBannerImages()
    announcements.value = (Array.isArray(announcementsData) ? announcementsData : []).filter(a => a && a.isVisible)
    categories.value = Array.isArray(categoriesData) ? categoriesData : []
  } catch (error) {
    console.error('Failed to load from API:', error)
    games.value = []
    banners.value = []
    announcements.value = []
    categories.value = []
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
  <div class="min-h-screen bg-gradient-to-br from-pink-50/30 via-white to-pink-50/30 pb-20 md:pb-8">
    <Header />
    
    <!-- Loading状态 -->
    <div v-if="isLoading" class="flex items-center justify-center h-40 pt-10">
      <div class="w-10 h-10 border-3 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
    
    <div v-else>
      <!-- 移动端布局 -->
      <div class="md:hidden">
        <div class="mx-4 mt-4">
          <div class="relative rounded-2xl shadow-xl overflow-hidden bg-white border border-pink-100">
            <div class="relative h-40">
              <div class="absolute inset-0 bg-gradient-to-br from-pink-50 to-pink-100/50">
                <div v-if="banners.length > 0 && !bannersLoaded[currentBanner]" class="absolute inset-0 flex items-center justify-center">
                  <div class="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
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
                    :class="[
                      bannersLoaded[index] ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                    ]"
                    :style="{
                      objectPosition: banner.title === '千恋*万花' ? '50% 0%' : '50% 25%'
                    }"
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
                  :class="currentBanner === index ? 'bg-pink-500 w-4' : 'bg-pink-200 hover:bg-pink-300'"
                ></button>
              </div>
            </div>
          </div>
        </div>
        
        <FeatureGrid />
        
        <div id="announcements" v-if="announcements.length > 0" class="px-4 mt-6">
          <div class="bg-white rounded-xl border border-pink-100 p-4 shadow-lg shadow-pink-50/50">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xl">📢</span>
              <h3 class="font-bold text-gray-800">公告</h3>
            </div>
            <div class="space-y-3">
              <div 
                v-for="announcement in announcements" 
                :key="announcement.id"
                class="p-3 bg-gradient-to-br from-pink-50 to-white rounded-lg border-l-4 border-pink-500 hover:shadow-md transition-all duration-300"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                      <span v-if="announcement.isPinned" class="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">置顶</span>
                      {{ announcement.title }}
                    </h4>
                    <p class="text-xs text-gray-600 mt-1">{{ announcement.content }}</p>
                  </div>
                  <span class="text-[10px] text-gray-500 whitespace-nowrap">{{ new Date(announcement.createdAt).toLocaleDateString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="px-4 mt-6">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-bold text-gray-800">热门游戏</h2>
            <span class="text-xs text-pink-600">查看更多 →</span>
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
          
          <!-- 轮播图区域 -->
          <div class="relative rounded-2xl shadow-xl overflow-hidden bg-white border border-pink-100 mb-8 shadow-lg shadow-pink-50/50">
            <div class="relative h-96 lg:h-[350px]">
              <div class="absolute inset-0 bg-gradient-to-br from-pink-50 to-pink-100/50">
                <div v-if="banners.length > 0 && !bannersLoaded[currentBanner]" class="absolute inset-0 flex items-center justify-center">
                  <div class="w-10 h-10 border-3 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
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
                    :class="[
                      bannersLoaded[index] ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                    ]"
                    :style="{
                      objectPosition: banner.title === '千恋*万花' ? '50% 0%' : '50% 25%'
                    }"
                    @load="handleBannerLoad(index)"
                    @error="handleBannerError(index)"
                  />
                  <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 class="text-white text-2xl lg:text-3xl font-bold drop-shadow-lg">{{ banner.title }}</h3>
                    <p class="text-white/90 text-sm lg:text-base mt-1 drop-shadow-md">{{ banner.subtitle }}</p>
                  </div>
                </div>
              </transition-group>
              
              <button 
                v-if="banners.length > 1"
                @click="prevBanner" 
                class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 active:bg-white/40 transition-all duration-300 transform hover:scale-110 active:scale-95 z-10"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              
              <button 
                v-if="banners.length > 1"
                @click="nextBanner" 
                class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 active:bg-white/40 transition-all duration-300 transform hover:scale-110 active:scale-95 z-10"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
              
              <div v-if="banners.length > 1" class="absolute bottom-6 left-0 right-0 z-10 flex items-center justify-center gap-2">
                <button 
                  v-for="(banner, index) in banners" 
                  :key="banner.id"
                  @click="goToBanner(index)"
                  class="w-3 h-3 rounded-full transition-all duration-300 transform hover:scale-125"
                  :class="currentBanner === index ? 'bg-pink-500 w-8' : 'bg-pink-200 hover:bg-pink-300'"
                ></button>
              </div>
            </div>
          </div>

          <!-- 快捷导航区域 -->
          <div class="bg-white rounded-xl border border-pink-100 p-6 mb-8 shadow-lg shadow-pink-50/50">
            <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span class="text-pink-600 text-2xl">⚡</span>
              快速导航
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <button 
                @click="router.push('/announcements')"
                class="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-pink-50 to-white border border-pink-100 hover:from-pink-100 hover:to-pink-50 hover:border-pink-300 hover:shadow-lg hover:shadow-pink-100 transition-all duration-300 transform hover:scale-105"
              >
                <FileText class="w-10 h-10 text-pink-600 mb-2" />
                <span class="text-sm font-medium text-gray-700">网页公告</span>
              </button>
              <button 
                @click="router.push('/pc-resources')"
                class="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-pink-50 to-white border border-pink-100 hover:from-pink-100 hover:to-pink-50 hover:border-pink-300 hover:shadow-lg hover:shadow-pink-100 transition-all duration-300 transform hover:scale-105"
              >
                <Monitor class="w-10 h-10 text-pink-600 mb-2" />
                <span class="text-sm font-medium text-gray-700">PC资源</span>
              </button>
              <button 
                @click="router.push('/category/安卓直装')"
                class="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-pink-50 to-white border border-pink-100 hover:from-pink-100 hover:to-pink-50 hover:border-pink-300 hover:shadow-lg hover:shadow-pink-100 transition-all duration-300 transform hover:scale-105"
              >
                <Gamepad2 class="w-10 h-10 text-pink-600 mb-2" />
                <span class="text-sm font-medium text-gray-700">Gal游戏</span>
              </button>
              <button 
                @click="router.push('/yuzusoft')"
                class="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-pink-50 to-white border border-pink-100 hover:from-pink-100 hover:to-pink-50 hover:border-pink-300 hover:shadow-lg hover:shadow-pink-100 transition-all duration-300 transform hover:scale-105"
              >
                <Music class="w-10 h-10 text-pink-600 mb-2" />
                <span class="text-sm font-medium text-gray-700">柚子社</span>
              </button>
              <button 
                @click="router.push('/tools')"
                class="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-pink-50 to-white border border-pink-100 hover:from-pink-100 hover:to-pink-50 hover:border-pink-300 hover:shadow-lg hover:shadow-pink-100 transition-all duration-300 transform hover:scale-105"
              >
                <Download class="w-10 h-10 text-pink-600 mb-2" />
                <span class="text-sm font-medium text-gray-700">工具下载</span>
              </button>
              <button 
                @click="router.push('/help')"
                class="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-pink-50 to-white border border-pink-100 hover:from-pink-100 hover:to-pink-50 hover:border-pink-300 hover:shadow-lg hover:shadow-pink-100 transition-all duration-300 transform hover:scale-105"
              >
                <BookOpen class="w-10 h-10 text-pink-600 mb-2" />
                <span class="text-sm font-medium text-gray-700">帮助中心</span>
              </button>
            </div>
          </div>

          <!-- 公告区域 -->
          <div v-if="announcements.length > 0" class="bg-white rounded-xl border border-pink-100 p-6 mb-8 shadow-lg shadow-pink-50/50">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <span class="text-2xl">📢</span>
                <h3 class="font-bold text-gray-800 text-lg">最新公告</h3>
              </div>
              <button 
                v-if="announcements.length > 3"
                @click="router.push('/announcements')"
                class="text-sm text-pink-600 hover:text-pink-500 transition-colors"
              >
                查看全部 →
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                v-for="announcement in announcements.slice(0, 3)" 
                :key="announcement.id"
                class="p-4 bg-gradient-to-br from-pink-50 to-white rounded-xl border-l-4 border-pink-500 hover:shadow-lg hover:shadow-pink-100 transition-all duration-300"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-800 flex items-center gap-2">
                      <span v-if="announcement.isPinned" class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">置顶</span>
                      {{ announcement.title }}
                    </h4>
                    <p class="text-sm text-gray-600 mt-2 line-clamp-2">{{ announcement.content }}</p>
                  </div>
                  <span class="text-xs text-gray-500 whitespace-nowrap">{{ new Date(announcement.createdAt).toLocaleDateString() }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 游戏列表 -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span class="text-pink-600">🎮</span>
                热门游戏
              </h2>
              <span class="text-sm text-pink-600 cursor-pointer hover:text-pink-500 transition-colors">查看更多 →</span>
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
