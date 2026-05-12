<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Download } from 'lucide-vue-next'
import { type Game } from '@/api/api'

defineProps<{
  game: Game
}>()

const emit = defineEmits<{
  click: [id: string]
}>()

const router = useRouter()

const imageLoaded = ref(false)
const imageError = ref(false)

const handleDownload = (gameId: string) => {
  router.push(`/game/${gameId}?tab=resources`)
}
</script>

<template>
  <div 
    class="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden mb-4 transform hover:scale-[1.03] transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl border border-pink-100/50 hover:border-pink-200"
    @click="emit('click', game.id)"
  >
    <div class="relative aspect-[3/4] overflow-hidden bg-pink-50">
      <div 
        v-if="!imageLoaded && !imageError"
        class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100 animate-pulse"
      >
        <div class="w-8 h-8 border-2 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
      
      <img 
        v-show="!imageError"
        :src="game.cover" 
        :alt="game.name"
        class="w-full h-full object-cover transition-all duration-500 transform"
        :class="imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'"
        @load="imageLoaded = true"
        @error="imageError = true"
      />
      
      <div 
        v-if="imageError"
        class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100"
      >
        <svg class="w-12 h-12 text-pink-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 20012.828 0L16 16m-2-2l1.586-1.586a2 20012.828 0L20 14m-6-6h.01M6 20h12a2 20002-2V6a2 2000-2-2H6a2 2000-2 2v12a2 20002 2z"></path>
        </svg>
        <span class="text-xs text-gray-500">图片加载失败</span>
      </div>
      
      <div class="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs px-3 py-1 rounded-full shadow-lg shadow-pink-200 font-medium">
        {{ game.size }}
      </div>
      
      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
        <h3 class="text-white font-bold text-sm drop-shadow-md">{{ game.name }}</h3>
      </div>
    </div>
    
    <div class="p-3">
      <p class="text-gray-600 text-xs line-clamp-2 mb-2 leading-relaxed">{{ game.description }}</p>
      
      <div class="flex flex-wrap gap-1 mb-3">
        <span 
          v-for="tag in game.tags.slice(0, 3)" 
          :key="tag"
          class="bg-gradient-to-r from-pink-50 to-pink-100 text-pink-600 text-xs px-2.5 py-0.5 rounded-full border border-pink-200"
        >
          {{ tag }}
        </span>
      </div>
      
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-500">{{ game.downloads.toLocaleString() }} 下载</span>
        <button 
          @click.stop="handleDownload(game.id)"
          class="flex items-center bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs px-4 py-1.5 rounded-full hover:from-pink-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg shadow-pink-200 font-medium whitespace-nowrap"
        >
          <Download class="w-3 h-3 mr-1" />
          下载
        </button>
      </div>
    </div>
  </div>
</template>