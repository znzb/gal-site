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

const mockGames: Game[] = [
  {
    id: '1',
    name: '夏日物语',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20summer%20visual%20novel%20game%20cover%20beautiful%20girl%20beach&image_size=portrait_4_3',
    description: '一款温馨浪漫的夏日恋爱冒险游戏，讲述主角在海边小镇度过的难忘夏天。',
    category: '安卓直装',
    size: '2.5GB',
    releaseDate: '2024-06-15',
    downloads: 12500,
    tags: ['恋爱', '校园', '治愈']
  },
  {
    id: '2',
    name: '星空幻想',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20fantasy%20game%20cover%20starry%20night%20magic%20girl%20sword&image_size=portrait_4_3',
    description: '穿越星空的奇幻冒险，与神秘少女一同探索未知的世界。',
    category: '安卓直装',
    size: '3.2GB',
    releaseDate: '2024-03-20',
    downloads: 8900,
    tags: ['奇幻', '冒险', '魔法']
  },
  {
    id: '3',
    name: '樱花飘落时',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20sakura%20cherry%20blossom%20game%20cover%20school%20romance&image_size=portrait_4_3',
    description: '樱花纷飞的季节，一段青春恋爱故事正在上演。',
    category: '安卓直装',
    size: '1.8GB',
    releaseDate: '2024-04-10',
    downloads: 15600,
    tags: ['恋爱', '校园', '青春']
  },
  {
    id: '4',
    name: '永恒之约',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20eternal%20love%20game%20cover%20fantasy%20castle%20romance&image_size=portrait_4_3',
    description: '跨越时空的永恒约定，一段超越生死的爱情故事。',
    category: 'kr资源',
    size: '4.1GB',
    releaseDate: '2024-01-15',
    downloads: 9800,
    tags: ['奇幻', '爱情', '冒险']
  },
  {
    id: '5',
    name: '校园日记',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20school%20life%20game%20cover%20classroom%20students%20friends&image_size=portrait_4_3',
    description: '记录校园生活的点点滴滴，重温青春的美好时光。',
    category: 'kr资源',
    size: '2.0GB',
    releaseDate: '2024-05-28',
    downloads: 7200,
    tags: ['校园', '日常', '友情']
  },
  {
    id: '6',
    name: '幻想世界',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20fantasy%20world%20game%20cover%20dragons%20magic%20heroes&image_size=portrait_4_3',
    description: '在充满魔法的幻想世界中展开冒险，成为传奇英雄。',
    category: '安卓直装',
    size: '5.5GB',
    releaseDate: '2024-02-28',
    downloads: 11200,
    tags: ['奇幻', '冒险', '战斗']
  },
  {
    id: '7',
    name: '游戏CG精选',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20game%20CG%20collection%20beautiful%20artwork%20gallery&image_size=portrait_4_3',
    description: '精选游戏CG合集，包含各种精美游戏插画。',
    category: '游戏CG',
    size: '1.2GB',
    releaseDate: '2024-06-01',
    downloads: 5600,
    tags: ['CG', '插画', '合集']
  },
  {
    id: '8',
    name: '高清图集',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20high%20quality%20image%20collection%20beautiful%20girls&image_size=portrait_4_3',
    description: '高清精美图集，包含各种主题的精美图片。',
    category: '图集资源',
    size: '3.8GB',
    releaseDate: '2024-05-15',
    downloads: 8200,
    tags: ['图集', '高清', '壁纸']
  }
]

const loadGames = async () => {
  try {
    filteredGames.value = await gameApi.getGamesByCategory(categoryType)
  } catch (error) {
    console.error('Failed to load games from API, using mock data:', error)
    filteredGames.value = mockGames.filter(g => g.category === categoryType)
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