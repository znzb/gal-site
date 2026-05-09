<script setup lang="ts">
import { Download } from 'lucide-vue-next'
import type { Game } from '@/data/mockData'

defineProps<{
  game: Game
}>()

const emit = defineEmits<{
  click: [id: string]
}>()
</script>

<template>
  <div 
    class="bg-white rounded-xl shadow-sm overflow-hidden mb-4 transform hover:scale-[1.02] transition-all duration-300 cursor-pointer"
    @click="emit('click', game.id)"
  >
    <div class="relative aspect-[3/4] overflow-hidden">
      <img 
        :src="game.cover" 
        :alt="game.name"
        class="w-full h-full object-cover"
      />
      <div class="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
        {{ game.size }}
      </div>
      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
        <h3 class="text-white font-bold text-sm">{{ game.name }}</h3>
      </div>
    </div>
    
    <div class="p-3">
      <p class="text-gray-600 text-xs line-clamp-2 mb-2">{{ game.description }}</p>
      
      <div class="flex flex-wrap gap-1 mb-3">
        <span 
          v-for="tag in game.tags.slice(0, 3)" 
          :key="tag"
          class="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full"
        >
          {{ tag }}
        </span>
      </div>
      
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-400">{{ game.downloads.toLocaleString() }} 下载</span>
        <button class="flex items-center bg-primary text-white text-xs px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors">
          <Download class="w-3 h-3 mr-1" />
          下载
        </button>
      </div>
    </div>
  </div>
</template>