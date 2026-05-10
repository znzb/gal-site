<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Megaphone, MessageCircle, Music, FileText } from 'lucide-vue-next'
import { featureApi, type Feature } from '@/api/api'

const router = useRouter()

const features = ref<Feature[]>([])
const isLoading = ref(true)

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
      router.push('/announcements')
      break
    case '2':
      router.push('/join-group')
      break
    case '3':
      router.push('/yuzusoft')
      break
    case '4':
      router.push('/patch-records')
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
</template>
