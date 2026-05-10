<script setup lang="ts">
import { Home, FileText, CalendarCheck, Plus, Search, Menu, User } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { appState } from '@/store/appStore'

const router = useRouter()

const handleNavClick = (id: string) => {
  if (id === 'home') {
    router.push('/')
  } else if (id === 'menu') {
    appState.toggleSideMenu()
  } else if (id === 'budang') {
    router.push('/patch-records')
  }
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100/50 z-50 h-16 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
    <div class="flex items-center justify-around h-full max-w-lg mx-auto">
      <button 
        v-for="item in [
          { id: 'home', name: '首页', icon: Home },
          { id: 'budang', name: '补档', icon: FileText },
          { id: 'qiandao', name: '签到', icon: CalendarCheck },
          { id: 'add', name: '', icon: Plus },
          { id: 'search', name: '搜索', icon: Search },
          { id: 'menu', name: '菜单', icon: Menu },
          { id: 'mine', name: '我的', icon: User }
        ]" 
        :key="item.id"
        @click="handleNavClick(item.id)"
        class="flex flex-col items-center justify-center py-1 px-2 flex-1 h-full transition-all duration-300"
        :class="item.id === 'home' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'"
      >
        <div 
          class="w-9 h-9 rounded-xl flex items-center justify-center mb-0.5 transition-all duration-300"
          :class="item.id === 'home' 
            ? 'bg-gradient-to-br from-primary to-pink-500 text-white shadow-lg scale-110' 
            : item.id === 'add' 
              ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-md' 
              : 'hover:bg-gray-100'"
        >
          <component :is="item.icon" class="w-5 h-5" />
        </div>
        <span class="text-[10px] font-medium">{{ item.name }}</span>
      </button>
    </div>
  </nav>
</template>