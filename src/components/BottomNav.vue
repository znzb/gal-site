<script setup lang="ts">
import { computed } from 'vue'
import { Home, FileText, CalendarCheck, Plus, Search, Menu, User } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { appState } from '@/store/appStore'

const router = useRouter()
const route = useRoute()

const navItems = [
  { id: 'home', name: '首页', icon: Home, path: '/' },
  { id: 'budang', name: '补档', icon: FileText, path: '/patch-records' },
  { id: 'qiandao', name: '签到', icon: CalendarCheck, path: '/checkin' },
  { id: 'add', name: '发布', icon: Plus, path: '' },
  { id: 'search', name: '搜索', icon: Search, path: '/search' },
  { id: 'menu', name: '菜单', icon: Menu, path: '' },
  { id: 'mine', name: '我的', icon: User, path: '/mine' }
]

const activeNav = computed(() => {
  const currentPath = route.path
  for (const item of navItems) {
    if (item.path && currentPath.startsWith(item.path)) {
      return item.id
    }
  }
  return 'home'
})

const handleNavClick = (id: string) => {
  if (id === 'home') {
    router.push('/')
  } else if (id === 'menu') {
    appState.toggleSideMenu()
  } else if (id === 'budang') {
    router.push('/patch-records')
  } else if (id === 'search') {
    router.push('/search')
  } else if (id === 'qiandao') {
    router.push('/checkin')
  } else if (id === 'mine') {
    router.push('/mine')
  }
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-pink-100/50 z-50 h-16 shadow-[0_-4px_20px_rgba(236,72,153,0.1)]">
    <div class="flex items-center justify-around h-full max-w-lg mx-auto">
      <button 
        v-for="item in navItems" 
        :key="item.id"
        @click="handleNavClick(item.id)"
        class="flex flex-col items-center justify-center py-1 px-2 flex-1 h-full transition-all duration-300"
        :class="activeNav === item.id ? 'text-pink-600' : 'text-gray-400'"
      >
        <div 
          class="w-9 h-9 rounded-xl flex items-center justify-center mb-0.5 transition-all duration-300 bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-md shadow-pink-200"
          :style="activeNav === item.id ? 'transform: scale(1.1)' : ''"
        >
          <component :is="item.icon" class="w-5 h-5" />
        </div>
        <span class="text-[10px] font-medium">{{ item.name }}</span>
      </button>
    </div>
  </nav>
</template>