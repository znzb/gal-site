<script setup lang="ts">
import { X, Home, Gamepad2, Image, Images, BookOpen, ChevronDown } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { categories } from '@/data/mockData'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  navigate: []
}>()

const router = useRouter()

const menuItems = [
  { id: 'home', name: '主页', icon: Home },
  { id: 'android', name: '安卓直装', icon: Gamepad2 },
  { id: 'kr', name: 'kr资源', icon: Image },
  { id: 'gamecg', name: '游戏CG', icon: Image },
  { id: 'gallery', name: '图集资源', icon: Images },
  { id: 'guide', name: '新人必读', icon: BookOpen, highlight: true }
]

const handleMenuClick = (id: string) => {
  emit('close')
  emit('navigate')
  
  if (id === 'home') {
    router.push('/')
  } else if (id === 'android') {
    router.push('/category/安卓直装')
  } else if (id === 'kr') {
    router.push('/category/kr资源')
  } else if (id === 'gamecg') {
    router.push('/category/游戏CG')
  } else if (id === 'gallery') {
    router.push('/category/图集资源')
  } else if (id === 'guide') {
    router.push('/help')
  }
}
</script>

<template>
  <transition name="slide">
    <div 
      v-if="show" 
      class="fixed left-0 top-0 bottom-0 w-72 bg-gray-100 z-50 shadow-xl"
    >
      <div class="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-primary to-secondary">
        <h2 class="text-lg font-bold text-white">Gal小站</h2>
        <button 
          @click="emit('close')"
          class="p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <X class="w-5 h-5 text-white" />
        </button>
      </div>
      
      <div class="py-2">
        <button 
          v-for="item in menuItems" 
          :key="item.id"
          @click="handleMenuClick(item.id)"
          class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-200 transition-colors"
          :class="{ 'bg-white': item.id === 'home' }"
        >
          <div class="flex items-center">
            <component :is="item.icon" class="w-5 h-5 mr-3" :class="item.highlight ? 'text-primary' : 'text-gray-600'" />
            <span :class="item.highlight ? 'text-primary font-bold' : 'text-gray-700'">{{ item.name }}</span>
          </div>
          <ChevronDown v-if="item.hasChildren" class="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>