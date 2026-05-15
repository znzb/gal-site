<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { X, Home, Monitor, BookOpen, ChevronDown } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { categoryApi, type CategoryItem } from '@/api/api'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  navigate: []
}>()

const router = useRouter()
const categories = ref<CategoryItem[]>([])

let refreshInterval: number | null = null

const iconMap: Record<string, any> = {
  'gamepad-2': Monitor,
  'monitor': Monitor,
  'image': Monitor,
  'images': Monitor,
  'book-open': BookOpen
}

const getIcon = (iconName: string) => {
  return iconMap[iconName] || Monitor
}

const handleMenuClick = (item: { id: string; name: string }) => {
  emit('close')
  emit('navigate')
  
  if (item.id === 'home') {
    router.push('/')
  } else if (item.name === 'PC资源' || item.name === 'pc资源') {
    router.push('/pc-resources')
  } else if (item.name === '新人必读') {
    router.push('/help')
  } else {
    router.push(`/category/${encodeURIComponent(item.name)}`)
  }
}

const loadCategories = async () => {
  try {
    const data = await categoryApi.getAllCategories()
    if (data && data.length > 0) {
      categories.value = data.sort((a, b) => (a.order || 0) - (b.order || 0))
    }
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

onMounted(() => {
  loadCategories()
  refreshInterval = window.setInterval(loadCategories, 60000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<template>
  <transition name="slide">
    <div 
      v-if="show" 
      class="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-xl border-r border-pink-100"
    >
      <div class="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-pink-500 to-pink-600">
        <h2 class="text-lg font-bold text-white">三菜鱼小站</h2>
        <button 
          @click="emit('close')"
          class="p-2 rounded-lg hover:bg-white/20 transition-colors"
        >
          <X class="w-5 h-5 text-white" />
        </button>
      </div>
      
      <div class="py-2">
        <button 
          @click="handleMenuClick({ id: 'home', name: '主页' })"
          class="w-full flex items-center justify-between px-4 py-3 hover:bg-pink-50 transition-colors"
        >
          <div class="flex items-center">
            <Home class="w-5 h-5 mr-3 text-pink-600" />
            <span class="text-gray-700">主页</span>
          </div>
        </button>
        
        <button 
          v-for="category in categories" 
          :key="category.id"
          @click="handleMenuClick({ id: category.id, name: category.name })"
          class="w-full flex items-center justify-between px-4 py-3 hover:bg-pink-50 transition-colors"
        >
          <div class="flex items-center">
            <component :is="getIcon(category.icon)" class="w-5 h-5 mr-3 text-pink-600" />
            <span class="text-gray-700">{{ category.name }}</span>
          </div>
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