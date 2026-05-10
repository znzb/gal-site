<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import FeatureGrid from '@/components/FeatureGrid.vue'
import GameCard from '@/components/GameCard.vue'
import { gameApi, bannerApi, announcementApi, type Game, type Banner, type Announcement } from '@/api/api'

const router = useRouter()

const games = ref<Game[]>([])
const banners = ref<Banner[]>([])
const announcements = ref<Announcement[]>([])
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
  }
]

const mockBanners: Banner[] = [
  { id: '1', image: '/banners/banner1.jpg', title: '夏空彼方', subtitle: 'Summer Pockets' },
  { id: '2', image: '/banners/banner2.jpg', title: '千恋*万花', subtitle: 'Senren Banka' },
  { id: '3', image: '/banners/banner3.jpg', title: '魔女的夜宴', subtitle: "Witch's Night" },
  { id: '4', image: '/banners/banner4.jpg', title: '天使☆嚣嚣 RE-BOOT', subtitle: 'Tenshi Hoshii' }
]

const handleGameClick = (id: string) => {
  router.push(`/game/${id}`)
}

const currentBanner = ref(0)
const bannersLoaded = ref<boolean[]>([])
let timer: number | null = null

const nextBanner = () => {
  currentBanner.value = (currentBanner.value + 1) % banners.value.length
}

const prevBanner = () => {
  currentBanner.value = (currentBanner.value - 1 + banners.value.length) % banners.value.length
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

const loadData = async () => {
  try {
    const [gamesData, bannersData, announcementsData] = await Promise.all([
      gameApi.getAllGames(),
      bannerApi.getAllBanners(),
      announcementApi.getAllAnnouncements()
    ])
    games.value = gamesData
    banners.value = bannersData
    announcements.value = announcementsData.filter(a => a.isVisible)
    bannersLoaded.value = new Array(bannersData.length).fill(false)
  } catch (error) {
    console.error('Failed to load from API, using mock data:', error)
    games.value = mockGames
    banners.value = mockBanners
    announcements.value = []
    bannersLoaded.value = new Array(mockBanners.length).fill(false)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
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
    
    <div v-if="isLoading" class="flex items-center justify-center h-40">
      <div class="w-10 h-10 border-3 border-gray-300 border-t-primary rounded-full animate-spin"></div>
    </div>
    
    <template v-else>
      <div class="mx-4 mt-4">
        <div class="relative rounded-2xl shadow-xl overflow-hidden bg-white border border-gray-100">
          <div class="relative h-40">
            <div class="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
              <div v-if="banners.length > 0 && !bannersLoaded[currentBanner]" class="absolute inset-0 flex items-center justify-center">
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
                <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <h3 class="text-white text-lg font-bold drop-shadow-lg">{{ banner.title }}</h3>
                  <p class="text-white/90 text-xs mt-0.5 drop-shadow-md">{{ banner.subtitle }}</p>
                </div>
              </div>
            </transition-group>
            
            <button 
              v-if="banners.length > 1"
              @click="prevBanner" 
              class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 active:bg-white/40 transition-all duration-300 transform hover:scale-110 active:scale-95 z-10"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            <button 
              v-if="banners.length > 1"
              @click="nextBanner" 
              class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 active:bg-white/40 transition-all duration-300 transform hover:scale-110 active:scale-95 z-10"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
            
            <div v-if="banners.length > 1" class="absolute bottom-3 left-0 right-0 z-10 flex items-center justify-center gap-1.5">
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
      
      <div v-if="announcements.length > 0" class="px-4 mt-6">
        <div class="bg-white rounded-xl shadow-md p-4">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xl">📢</span>
            <h3 class="font-bold text-gray-800">公告</h3>
          </div>
          <div class="space-y-3">
            <div 
              v-for="announcement in announcements" 
              :key="announcement.id"
              class="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-l-4 border-indigo-500"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-800 flex items-center gap-2">
                    <span v-if="announcement.isPinned" class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">置顶</span>
                    {{ announcement.title }}
                  </h4>
                  <p class="text-sm text-gray-600 mt-1">{{ announcement.content }}</p>
                </div>
                <span class="text-xs text-gray-400 whitespace-nowrap">{{ new Date(announcement.createdAt).toLocaleDateString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
    </template>
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