<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft, Download, Monitor, HardDrive, Calendar } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import type { Game } from '@/api/api'

const router = useRouter()

const pcGames = ref<Game[]>([
  {
    id: 'pc1',
    name: '恋爱物语~夏日回忆',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20visual%20novel%20game%20cover%20summer%20beach%20romance&image_size=portrait_4_3',
    description: '一款精美的恋爱冒险游戏，在夏日的海边小镇展开一段浪漫的爱情故事。',
    category: 'PC资源',
    size: '8.5GB',
    releaseDate: '2024-06-15',
    downloads: 12500,
    tags: ['恋爱', '校园', '治愈']
  },
  {
    id: 'pc2',
    name: '永恒幻想',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20fantasy%20game%20cover%20magic%20sword%20heroes&image_size=portrait_4_3',
    description: '史诗级奇幻冒险游戏，探索神秘的魔法世界，成为传奇英雄。',
    category: 'PC资源',
    size: '12.3GB',
    releaseDate: '2024-03-20',
    downloads: 8900,
    tags: ['奇幻', '冒险', '战斗']
  },
  {
    id: 'pc3',
    name: '樱花树下的约定',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20sakura%20cherry%20blossom%20school%20romance&image_size=portrait_4_3',
    description: '在樱花纷飞的季节，邂逅一段纯真的校园爱情故事。',
    category: 'PC资源',
    size: '6.8GB',
    releaseDate: '2024-04-10',
    downloads: 15600,
    tags: ['恋爱', '校园', '青春']
  },
  {
    id: 'pc4',
    name: '星际旅者',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20space%20adventure%20game%20cover%20spaceship%20stars&image_size=portrait_4_3',
    description: '穿越浩瀚宇宙，探索未知星球，展开一段惊心动魄的星际冒险。',
    category: 'PC资源',
    size: '15.2GB',
    releaseDate: '2024-01-15',
    downloads: 9800,
    tags: ['科幻', '冒险', '探索']
  }
])

const goToGame = (gameId: string) => {
  router.push(`/game/${gameId}`)
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 pb-24">
    <header class="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-30 shadow-sm">
      <div class="flex items-center justify-between px-4 py-3">
        <button 
          @click="router.back()"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft class="w-6 h-6 text-gray-600" />
        </button>
        <h1 class="text-lg font-bold text-gray-800">PC资源</h1>
        <div class="w-10"></div>
      </div>
    </header>
    
    <div class="pt-14 px-4">
      <div class="bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl p-4 mt-4 text-white">
        <div class="flex items-center gap-3">
          <Monitor class="w-8 h-8" />
          <div>
            <h2 class="text-lg font-bold">PC游戏资源</h2>
            <p class="text-sm opacity-90">精选高品质PC游戏，享受极致游戏体验</p>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mt-6">
        <div 
          v-for="game in pcGames" 
          :key="game.id"
          @click="goToGame(game.id)"
          class="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer"
        >
          <div class="aspect-[3/4] relative">
            <img 
              :src="game.cover" 
              :alt="game.name"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div class="absolute bottom-2 left-2 right-2">
              <p class="text-white text-sm font-medium truncate">{{ game.name }}</p>
            </div>
          </div>
          <div class="p-3">
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>{{ game.size }}</span>
              <span>{{ game.downloads.toLocaleString() }} 下载</span>
            </div>
            <div class="flex flex-wrap gap-1 mt-2">
              <span 
                v-for="tag in game.tags.slice(0, 2)" 
                :key="tag"
                class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm p-4 mt-6">
        <h3 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <HardDrive class="w-5 h-5 text-primary" />
          下载须知
        </h3>
        <ul class="text-sm text-gray-600 space-y-2">
          <li class="flex items-start gap-2">
            <span class="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">*</span>
            <span>PC游戏需要较高配置，请确保您的电脑满足游戏要求</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">*</span>
            <span>部分游戏需要安装虚拟光驱或解压缩工具</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">*</span>
            <span>建议使用下载工具进行多线程下载以提高速度</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>