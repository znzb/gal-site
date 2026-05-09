<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import FeatureGrid from '@/components/FeatureGrid.vue'
import GameCard from '@/components/GameCard.vue'
import { games } from '@/data/mockData'

const router = useRouter()

const handleGameClick = (id: string) => {
  router.push(`/game/${id}`)
}

const bannerImages = [
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20visual%20novel%20banner%20beautiful%20girl%20summer&image_size=landscape_16_9',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20game%20banner%20fantasy%20magic%20castle&image_size=landscape_16_9',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20romance%20game%20banner%20cherry%20blossom%20school&image_size=landscape_16_9'
]

const currentBanner = ref(0)
</script>

<template>
  <div class="min-h-screen bg-gray-100 pb-20">
    <Header />
    
    <div class="relative h-40 overflow-hidden mx-4 mt-4 rounded-xl">
      <transition-group name="fade">
        <img 
          v-for="(image, index) in bannerImages" 
          :key="index"
          v-show="currentBanner === index"
          :src="image" 
          alt="Banner"
          class="absolute inset-0 w-full h-full object-cover"
        />
      </transition-group>
      <div class="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5">
        <button 
          v-for="(_, index) in bannerImages" 
          :key="index"
          @click="currentBanner = index"
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