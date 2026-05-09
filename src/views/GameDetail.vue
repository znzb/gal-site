<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Download, Star, Share2, Heart, Clock, HardDrive, Calendar } from 'lucide-vue-next'
import { games } from '@/data/mockData'

const route = useRoute()
const router = useRouter()

const gameId = route.params.id as string
const game = computed(() => games.find(g => g.id === gameId))

const isFavorite = ref(false)
const isDownloading = ref(false)
const downloadProgress = ref(0)

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
}

const handleDownload = () => {
  if (isDownloading.value) return
  isDownloading.value = true
  downloadProgress.value = 0
  
  const interval = setInterval(() => {
    downloadProgress.value += Math.random() * 15
    if (downloadProgress.value >= 100) {
      downloadProgress.value = 100
      clearInterval(interval)
      setTimeout(() => {
        isDownloading.value = false
        downloadProgress.value = 0
      }, 1000)
    }
  }, 300)
}

const relatedGames = computed(() => 
  games.filter(g => g.id !== gameId && g.category === game.value?.category).slice(0, 3)
)
</script>

<template>
  <div v-if="game" class="min-h-screen bg-gray-100 pb-24">
    <header class="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-30 shadow-sm">
      <div class="flex items-center justify-between px-4 py-3">
        <button 
          @click="router.back()"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft class="w-6 h-6 text-gray-600" />
        </button>
        <h1 class="text-lg font-bold text-gray-800">游戏详情</h1>
        <button class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Share2 class="w-6 h-6 text-gray-600" />
        </button>
      </div>
    </header>
    
    <div class="pt-14">
      <div class="relative aspect-[3/4]">
        <img 
          :src="game.cover" 
          :alt="game.name"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        <div class="absolute bottom-4 left-4 right-4">
          <h2 class="text-2xl font-bold text-white mb-2">{{ game.name }}</h2>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="tag in game.tags" 
              :key="tag"
              class="bg-white/20 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="bg-white mx-4 mt-4 rounded-2xl shadow-xl relative z-10 overflow-hidden">
        <div class="p-4 border-b border-gray-100">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center">
              <Star class="w-5 h-5 text-yellow-500 fill-yellow-500 mr-1" />
              <span class="text-sm font-medium text-gray-700">4.9</span>
              <span class="text-xs text-gray-400 ml-2">{{ game.downloads.toLocaleString() }} 下载</span>
            </div>
            <button 
              @click="toggleFavorite"
              class="p-2 rounded-full"
              :class="isFavorite ? 'text-red-500' : 'text-gray-400'"
            >
              <Heart class="w-6 h-6" :class="{ 'fill-current': isFavorite }" />
            </button>
          </div>
          
          <div class="grid grid-cols-3 gap-4 text-center">
            <div class="bg-gray-50 rounded-lg py-2">
              <HardDrive class="w-5 h-5 mx-auto text-gray-500 mb-1" />
              <span class="text-xs text-gray-500">大小</span>
              <p class="text-sm font-medium text-gray-800">{{ game.size }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg py-2">
              <Calendar class="w-5 h-5 mx-auto text-gray-500 mb-1" />
              <span class="text-xs text-gray-500">发布</span>
              <p class="text-sm font-medium text-gray-800">{{ game.releaseDate }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg py-2">
              <Clock class="w-5 h-5 mx-auto text-gray-500 mb-1" />
              <span class="text-xs text-gray-500">类型</span>
              <p class="text-sm font-medium text-gray-800">{{ game.category }}</p>
            </div>
          </div>
        </div>
        
        <div class="p-4">
          <h3 class="font-bold text-gray-800 mb-2">游戏介绍</h3>
          <p class="text-sm text-gray-600 leading-relaxed">{{ game.description }}</p>
        </div>
        
        <div class="p-4 bg-gradient-to-r from-primary/5 to-secondary/5">
          <button 
            @click="handleDownload"
            class="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg"
            :disabled="isDownloading"
          >
            <template v-if="isDownloading">
              <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>{{ Math.round(downloadProgress) }}%</span>
            </template>
            <template v-else>
              <Download class="w-5 h-5" />
              <span>立即下载</span>
            </template>
          </button>
        </div>
      </div>
      
      <div v-if="relatedGames.length > 0" class="px-4 mt-6">
        <h3 class="text-lg font-bold text-gray-800 mb-3">相关推荐</h3>
        <div class="flex gap-3 overflow-x-auto pb-2">
          <div 
            v-for="related in relatedGames" 
            :key="related.id"
            @click="router.push(`/game/${related.id}`)"
            class="flex-shrink-0 w-28 cursor-pointer"
          >
            <div class="aspect-[3/4] rounded-lg overflow-hidden mb-2">
              <img :src="related.cover" :alt="related.name" class="w-full h-full object-cover" />
            </div>
            <p class="text-xs text-gray-700 truncate">{{ related.name }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>