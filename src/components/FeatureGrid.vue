<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Megaphone, MessageCircle, Music, FileText } from 'lucide-vue-next'
import { featureApi, type Feature } from '@/api/api'

const router = useRouter()

const features = ref<Feature[]>([])
const isLoading = ref(true)
const showQrCode = ref(false)

const mockFeatures: Feature[] = [
  { id: '1', name: '网站公告', icon: 'megaphone' },
  { id: '2', name: '加入Q群', icon: 'message-circle' },
  { id: '3', name: '柚子社', icon: 'music' },
  { id: '4', name: '补档记录', icon: 'file-text' }
]

const iconMap: Record<string, typeof Megaphone> = {
  megaphone: Megaphone,
  'message-circle': MessageCircle,
  music: Music,
  'file-text': FileText
}

const loadFeatures = async () => {
  try {
    features.value = await featureApi.getAllFeatures()
  } catch (error) {
    console.error('Failed to load features, using mock data:', error)
    features.value = mockFeatures
  } finally {
    isLoading.value = false
  }
}

const handleFeatureClick = (featureId: string) => {
  switch (featureId) {
    case '1':
      document.getElementById('announcements')?.scrollIntoView({ behavior: 'smooth' })
      break
    case '2':
      showQrCode.value = true
      break
    case '3':
      router.push('/category/柚子社')
      break
    case '4':
      document.getElementById('patch-records')?.scrollIntoView({ behavior: 'smooth' })
      break
  }
}

onMounted(() => {
  loadFeatures()
})
</script>

<template>
  <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-4 mx-4 mt-4 shadow-lg border border-gray-100/50">
    <div v-if="isLoading" class="flex items-center justify-center h-20">
      <div class="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
    </div>
    <div v-else class="grid grid-cols-4 gap-2">
      <button 
        v-for="feature in features" 
        :key="feature.id"
        @click="handleFeatureClick(feature.id)"
        class="flex flex-col items-center py-3 rounded-xl hover:bg-gradient-to-br hover:from-primary/5 hover:to-secondary/5 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
      >
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-md transition-shadow hover:shadow-lg"
             :class="{
               'bg-gradient-to-br from-primary/10 to-primary/20': feature.id === '1',
               'bg-gradient-to-br from-blue-100 to-blue-200': feature.id === '2',
               'bg-gradient-to-br from-accent/20 to-accent/30': feature.id === '3',
               'bg-gradient-to-br from-pink-100 to-pink-200': feature.id === '4'
             }">
          <component :is="iconMap[feature.icon]" 
                     class="w-6 h-6 transition-transform group-hover:scale-110"
                     :class="{
                       'text-primary': feature.id === '1',
                       'text-blue-500': feature.id === '2',
                       'text-yellow-600': feature.id === '3',
                       'text-pink-500': feature.id === '4'
                     }" />
        </div>
        <span class="text-xs text-gray-700 font-medium">{{ feature.name }}</span>
      </button>
    </div>
  </div>

  <div v-if="showQrCode" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="showQrCode = false">
    <div class="bg-white rounded-2xl p-6 text-center max-w-sm mx-4" @click.stop>
      <h3 class="text-xl font-bold mb-4">加入Q群</h3>
      <div class="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
        <span class="text-6xl">🐧</span>
      </div>
      <p class="text-gray-600 mb-2">群号：123456789</p>
      <p class="text-gray-400 text-sm mb-4">扫码或搜索群号加入</p>
      <button @click="showQrCode = false" class="px-6 py-2 bg-primary text-white rounded-lg">关闭</button>
    </div>
  </div>
</template>
