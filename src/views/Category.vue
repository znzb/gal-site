<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import GameCard from '@/components/GameCard.vue'
import { gameApi, type Game } from '@/api/api'

const route = useRoute()
const router = useRouter()

const categoryType = route.params.type as string
const filteredGames = ref<Game[]>([])
const isLoading = ref(true)

const loadGames = async () => {
  try {
    filteredGames.value = await gameApi.getGamesByCategory(categoryType)
  } catch (error) {
    console.error('Failed to load games:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadGames()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 pb-20">
    <header class="fixed top-0 left-0 right-0 bg-white shadow-sm z-30">
      <div class="flex items-center px-4 py-3">
        <button 
          @click="router.back()"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors mr-3"
        >
          <ArrowLeft class="w-6 h-6 text-gray-600" />
        </button>
        <h1 class="text-lg font-bold text-gray-800">{{ categoryType }}</h1>
      </div>
    </header>
    
    <div v-if="isLoading" class="pt-14 flex items-center justify-center h-40">
      <div class="w-10 h-10 border-3 border-gray-300 border-t-primary rounded-full animate-spin"></div>
    </div>
    
    <div v-else class="pt-14 px-4 mt-4">
      <div v-if="filteredGames.length > 0" class="grid grid-cols-2 gap-3">
        <GameCard 
          v-for="game in filteredGames" 
          :key="game.id" 
          :game="game"
          @click="(id) => router.push(`/game/${id}`)"
        />
      </div>
      
      <div v-else class="text-center py-20">
        <p class="text-gray-400">暂无该分类的游戏</p>
        <button 
          @click="router.push('/')"
          class="mt-4 text-primary text-sm"
        >
          返回首页
        </button>
      </div>
    </div>
  </div>
</template>