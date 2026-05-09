<script setup lang="ts">
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'
import type { Game } from '@/data/mockData'

defineProps<{
  game: Game
}>()

const emit = defineEmits<{
  click: [id: string]
}>()

const imageLoaded = ref(false)
const imageError = ref(false)
</script>

<template>
  <div 
    class="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden mb-4 transform hover:scale-[1.03] transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl border border-gray-100/50"
    @click="emit('click', game.id)"
  >
    <div class="relative aspect-[3/4] overflow-hidden bg-gray-100">
      <div 
        v-if="!imageLoaded && !imageError"
        class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"
      >
        <div class="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
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
        class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
      >
        <svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <span class="text-xs text-gray-500">图片加载失败</span>
      </div>
      
      <div class="absolute top-2 right-2 bg-gradient-to-r from-primary to-pink-500 text-white text-xs px-3 py-1 rounded-full shadow-lg font-medium">
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
          class="bg-gradient-to-r from-primary/10 to-secondary/10 text-primary text-xs px-2.5 py-0.5 rounded-full border border-primary/20"
        >
          {{ tag }}
        </span>
      </div>
      
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-500">{{ game.downloads.toLocaleString() }} 下载</span>
        <button class="flex items-center bg-gradient-to-r from-primary to-pink-500 text-white text-xs px-4 py-1.5 rounded-full hover:from-pink-500 hover:to-primary transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg font-medium whitespace-nowrap">
          <Download class="w-3 h-3 mr-1" />
          下载
        </button>
      </div>
    </div>
  </div>
</template>