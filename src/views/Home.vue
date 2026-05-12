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
  <div class="min-h-screen bg-gray-50 pb-20 md:pb-8">
    <Header />
    
    <!-- Loading状态 -->
    <div v-if="isLoading" class="flex items-center justify-center h-40 pt-10">
      <div class="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
    
    <div v-else>
      <!-- 移动端布局 -->
      <div class="md:hidden">
        <div class="px-4 py-4">
          <!-- 大幅横幅区域 -->
          <div class="relative rounded-2xl shadow-xl overflow-hidden bg-gradient-to-br from-white to-gray-50 border border-gray-200 mb-6">
            <div class="relative h-52">
              <div class="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/50 to-blue-50/50">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(99,102,241,0.1)_0%,transparent_50%)]"></div>
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.1)_0%,transparent_50%)]"></div>
                
                <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <div class="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                    三菜鱼小站
                  </div>
                  <p class="text-base text-gray-700 font-medium mb-6">
                    分享、传递 Galgame
                  </p>
                  <div class="flex gap-6">
                    <div class="flex flex-col items-center">
                      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 border border-indigo-200 flex items-center justify-center mb-1">
                        <Zap class="w-6 h-6 text-indigo-600" />
                      </div>
                      <span class="text-xs text-gray-600">极速下载</span>
                    </div>
                    <div class="flex flex-col items-center">
                      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 border border-purple-200 flex items-center justify-center mb-1">
                        <Cpu class="w-6 h-6 text-purple-600" />
                      </div>
                      <span class="text-xs text-gray-600">海量资源</span>
                    </div>
                    <div class="flex flex-col items-center">
                      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center mb-1">
                        <HardDrive class="w-6 h-6 text-blue-600" />
                      </div>
                      <span class="text-xs text-gray-600">安全可靠</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 快捷导航区域 -->
          <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <h3 class="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span class="text-indigo-600 text-xl">⚡</span>
              快速导航
            </h3>
            <div class="grid grid-cols-3 gap-3">
              <button 
                @click="router.push('/pc-resources')"
                class="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100"
              >
                <Monitor class="w-8 h-8 text-indigo-600 mb-1" />
                <span class="text-xs font-medium text-gray-700">PC资源</span>
              </button>
              <button 
                @click="router.push('/category/PC资源')"
                class="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-100"
              >
                <Gamepad2 class="w-8 h-8 text-purple-600 mb-1" />
                <span class="text-xs font-medium text-gray-700">Gal游戏</span>
              </button>
              <button 
                @click="router.push('/yuzusoft')"
                class="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100"
              >
                <Music class="w-8 h-8 text-blue-600 mb-1" />
                <span class="text-xs font-medium text-gray-700">柚子社</span>
              </button>
              <button 
                @click="router.push('/tools')"
                class="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-pink-50 to-white border border-pink-100"
              >
                <Download class="w-8 h-8 text-pink-600 mb-1" />
                <span class="text-xs font-medium text-gray-700">工具下载</span>
              </button>
              <button 
                @click="router.push('/category/游戏CG')"
                class="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-cyan-50 to-white border border-cyan-100"
              >
                <Image class="w-8 h-8 text-cyan-600 mb-1" />
                <span class="text-xs font-medium text-gray-700">游戏CG</span>
              </button>
              <button 
                @click="router.push('/help')"
                class="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-green-50 to-white border border-green-100"
              >
                <BookOpen class="w-8 h-8 text-green-600 mb-1" />
                <span class="text-xs font-medium text-gray-700">帮助中心</span>
              </button>
            </div>
          </div>

          <!-- 公告区域 -->
          <div v-if="announcements.length > 0" class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="text-xl">📢</span>
                <h3 class="font-bold text-gray-800 text-base">最新公告</h3>
              </div>
              <button 
                v-if="announcements.length > 2"
                @click="router.push('/announcements')"
                class="text-xs text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                查看全部 →
              </button>
            </div>
            <div class="space-y-3">
              <div 
                v-for="announcement in announcements.slice(0, 2)" 
                :key="announcement.id"
                class="p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg border-l-4 border-indigo-500"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                      <span v-if="announcement.isPinned" class="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">置顶</span>
                      {{ announcement.title }}
                    </h4>
                    <p class="text-xs text-gray-600 mt-1 line-clamp-2">{{ announcement.content }}</p>
                  </div>
                  <span class="text-[10px] text-gray-500 whitespace-nowrap">{{ new Date(announcement.createdAt).toLocaleDateString() }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 游戏列表 -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span class="text-indigo-600">🎮</span>
                热门游戏
              </h2>
              <span class="text-xs text-indigo-600 cursor-pointer hover:text-indigo-500 transition-colors">查看更多 →</span>
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
      </div>

      <!-- 电脑端布局 -->
      <div class="hidden md:block">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          <!-- 大幅横幅区域 -->
          <div class="relative rounded-2xl shadow-xl overflow-hidden bg-gradient-to-br from-white to-gray-50 border border-gray-200 mb-8">
            <div class="relative h-72 lg:h-96">
              <div class="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/50 to-blue-50/50">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(99,102,241,0.1)_0%,transparent_50%)]"></div>
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.1)_0%,transparent_50%)]"></div>
                
                <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                  <div class="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    三菜鱼小站
                  </div>
                  <p class="text-xl lg:text-2xl text-gray-700 font-medium mb-8">
                    分享、传递 Galgame
                  </p>
                  <div class="flex gap-10">
                    <div class="flex flex-col items-center group">
                      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 border border-indigo-200 flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-indigo-200">
                        <Zap class="w-8 h-8 text-indigo-600" />
                      </div>
                      <span class="text-sm text-gray-600">极速下载</span>
                    </div>
                    <div class="flex flex-col items-center group">
                      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 border border-purple-200 flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-purple-200">
                        <Cpu class="w-8 h-8 text-purple-600" />
                      </div>
                      <span class="text-sm text-gray-600">海量资源</span>
                    </div>
                    <div class="flex flex-col items-center group">
                      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-200">
                        <HardDrive class="w-8 h-8 text-blue-600" />
                      </div>
                      <span class="text-sm text-gray-600">安全可靠</span>
                    </div>
                    <div class="flex flex-col items-center group">
                      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-pink-50 border border-pink-200 flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-pink-200">
                        <Globe class="w-8 h-8 text-pink-600" />
                      </div>
                      <span class="text-sm text-gray-600">持续更新</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 快捷导航区域 -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span class="text-indigo-600 text-2xl">⚡</span>
              快速导航
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <button 
                @click="router.push('/pc-resources')"
                class="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 hover:from-indigo-100 hover:to-indigo-50 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100 transition-all duration-300 transform hover:scale-105"
              >
                <Monitor class="w-10 h-10 text-indigo-600 mb-2" />
                <span class="text-sm font-medium text-gray-700">PC资源</span>
              </button>
              <button 
                @click="router.push('/category/PC资源')"
                class="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 hover:from-purple-100 hover:to-purple-50 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100 transition-all duration-300 transform hover:scale-105"
              >
                <Gamepad2 class="w-10 h-10 text-purple-600 mb-2" />
                <span class="text-sm font-medium text-gray-700">Gal游戏</span>
              </button>
              <button 
                @click="router.push('/yuzusoft')"
                class="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 hover:from-blue-100 hover:to-blue-50 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 transition-all duration-300 transform hover:scale-105"
              >
                <Music class="w-10 h-10 text-blue-600 mb-2" />
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
                @click="router.push('/category/游戏CG')"
                class="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-white border border-cyan-100 hover:from-cyan-100 hover:to-cyan-50 hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-100 transition-all duration-300 transform hover:scale-105"
              >
                <Image class="w-10 h-10 text-cyan-600 mb-2" />
                <span class="text-sm font-medium text-gray-700">游戏CG</span>
              </button>
              <button 
                @click="router.push('/help')"
                class="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-white border border-green-100 hover:from-green-100 hover:to-green-50 hover:border-green-300 hover:shadow-lg hover:shadow-green-100 transition-all duration-300 transform hover:scale-105"
              >
                <BookOpen class="w-10 h-10 text-green-600 mb-2" />
                <span class="text-sm font-medium text-gray-700">帮助中心</span>
              </button>
            </div>
          </div>

          <!-- 公告区域 -->
          <div v-if="announcements.length > 0" class="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <span class="text-2xl">📢</span>
                <h3 class="font-bold text-gray-800 text-lg">最新公告</h3>
              </div>
              <button 
                v-if="announcements.length > 3"
                @click="router.push('/announcements')"
                class="text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                查看全部 →
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                v-for="announcement in announcements.slice(0, 3)" 
                :key="announcement.id"
                class="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border-l-4 border-indigo-500 hover:shadow-lg hover:shadow-indigo-100 transition-all duration-300"
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
                <span class="text-indigo-600">🎮</span>
                热门游戏
              </h2>
              <span class="text-sm text-indigo-600 cursor-pointer hover:text-indigo-500 transition-colors">查看更多 →</span>
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
