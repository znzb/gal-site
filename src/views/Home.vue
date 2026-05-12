<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import FeatureGrid from '@/components/FeatureGrid.vue'
import GameCard from '@/components/GameCard.vue'
import { gameApi, bannerApi, announcementApi, type Game, type Banner, type Announcement } from '@/api/api'

const router = useRouter()

const games = ref<Game[]>([])
const banners = ref<Banner[]>([])
const announcements = ref<Announcement[]>([])
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
    const [gamesData, bannersData, announcementsData] = await Promise.all([
      gameApi.getAllGames(),
      bannerApi.getAllBanners(),
      announcementApi.getAllAnnouncements()
    ])
    games.value = gamesData || []
    banners.value = bannersData || []
    bannersLoaded.value = new Array(banners.value.length).fill(false)
    preloadBannerImages()
    announcements.value = (announcementsData || []).filter(a => a.isVisible)
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
  <div class="min-h-screen bg-gray-100 pb-20">
    <Header />
    
    <template v-if="isLoading">
      <div class="flex items-center justify-center h-40 pt-10">
        <div class="w-10 h-10 border-3 border-gray-300 border-t-primary rounded-full animate-spin"></div>
      </div>
    </template>
    
    <template v-else>
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
    </template>
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
