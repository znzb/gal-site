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
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&h=400&fit=crop',
    title: '夏日物语',
    subtitle: '全新上线'
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1537815749002-de6a533c64db?w=1200&h=400&fit=crop',
    title: '星空幻想',
    subtitle: '热门推荐'
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&h=400&fit=crop',
    title: '樱花飘落时',
    subtitle: '限时免费'
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=1200&h=400&fit=crop',
    title: '幻想世界',
    subtitle: '即将发布'
  }
]

const currentBanner = ref(0)
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
    
    <div class="relative h-40 overflow-hidden mx-4 mt-4 rounded-xl shadow-lg">
      <transition-group name="fade">
        <img 
          v-for="(banner, index) in banners" 
          :key="banner.id"
          v-show="currentBanner === index"
          :src="banner.image" 
          :alt="banner.title"
          class="absolute inset-0 w-full h-full object-cover"
        />
      </transition-group>
      
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      
      <div class="absolute bottom-4 left-4 right-4">
        <transition-group name="fade">
          <div v-for="(banner, index) in banners" :key="banner.id" v-show="currentBanner === index">
            <span class="inline-block px-2 py-0.5 bg-primary/80 text-white text-xs rounded-full mb-1">
              {{ banner.subtitle }}
            </span>
            <h3 class="text-white font-bold text-lg">{{ banner.title }}</h3>
          </div>
        </transition-group>
      </div>
      
      <button 
        @click="prevBanner" 
        class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      
      <button 
        @click="nextBanner" 
        class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
      
      <div class="absolute bottom-14 right-4 flex gap-1.5">
        <button 
          v-for="(banner, index) in banners" 
          :key="banner.id"
          @click="goToBanner(index)"
          class="w-2 h-2 rounded-full transition-all duration-300"
          :class="currentBanner === index ? 'bg-primary w-4' : 'bg-white/50'"
        ></button>
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