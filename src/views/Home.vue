<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import FeatureGrid from '@/components/FeatureGrid.vue'
import GameCard from '@/components/GameCard.vue'
import { games } from '@/data/mockData'

const router = useRouter()

const handleGameClick = (id: string) => {
  router.push(`/game/${id}`)
}

const banners = [
  {
    id: '1',
    image: '/banners/banner1.jpg',
    title: '夏空彼方',
    subtitle: 'Summer Pockets'
  },
  {
    id: '2',
    image: '/banners/banner2.jpg',
    title: '千恋*万花',
    subtitle: 'Senren Banka'
  },
  {
    id: '3',
    image: '/banners/banner3.jpg',
    title: '魔女的夜宴',
    subtitle: "Witch's Night"
  },
  {
    id: '4',
    image: '/banners/banner4.jpg',
    title: '天使☆嚣嚣 RE-BOOT',
    subtitle: 'Tenshi Hoshii'
  }
]

const currentBanner = ref(0)
const bannersLoaded = ref<boolean[]>([false, false, false, false])
let timer: number | null = null

const nextBanner = () => {
  currentBanner.value = (currentBanner.value + 1) % banners.length
}

const prevBanner = () => {
  currentBanner.value = (currentBanner.value - 1 + banners.length) % banners.length
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

onMounted(() => {
  timer = window.setInterval(nextBanner, 4000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 pb-20">
    <Header />
    
    <div class="mx-4 mt-4">
      <div class="relative rounded-xl shadow-lg overflow-hidden bg-white">
        <div class="relative h-40">
          <div class="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300">
            <div v-if="!bannersLoaded[currentBanner]" class="absolute inset-0 flex items-center justify-center">
              <div class="w-10 h-10 border-3 border-gray-300 border-t-primary rounded-full animate-spin"></div>
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
                class="absolute inset-0 w-full h-full object-cover transition-all duration-700 transform"
                :class="bannersLoaded[index] ? 'opacity-100 scale-100' : 'opacity-0 scale-105'"
                @load="handleBannerLoad(index)"
                @error="handleBannerError(index)"
              />
              <div class="absolute bottom-0 left-0 right-0 p-3">
                <h3 class="text-white text-lg font-bold drop-shadow-lg">{{ banner.title }}</h3>
                <p class="text-white/80 text-xs mt-0.5 drop-shadow-md">{{ banner.subtitle }}</p>
              </div>
            </div>
          </transition-group>
          
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          
          <button 
            @click="prevBanner" 
            class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 active:bg-white/40 transition-all duration-300 transform hover:scale-110 active:scale-95 z-10"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          
          <button 
            @click="nextBanner" 
            class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 active:bg-white/40 transition-all duration-300 transform hover:scale-110 active:scale-95 z-10"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
          
          <div class="absolute bottom-3 left-0 right-0 z-10 flex items-center justify-center gap-1.5">
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