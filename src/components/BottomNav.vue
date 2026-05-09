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
  }
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 h-16">
    <div class="flex items-center justify-around h-full">
      <button 
        v-for="item in [
          { id: 'home', name: '首页', icon: Home },
          { id: 'budang', name: '补档', icon: FileText },
          { id: 'qiandao', name: '签到', icon: CalendarCheck },
          { id: 'add', name: '+', icon: Plus },
          { id: 'search', name: '搜索', icon: Search },
          { id: 'menu', name: '菜单', icon: Menu },
          { id: 'mine', name: '我的', icon: User }
        ]" 
        :key="item.id"
        @click="handleNavClick(item.id)"
        class="flex flex-col items-center justify-center py-1 px-2 flex-1 h-full"
        :class="{ 'text-primary': item.id === 'home' }"
      >
        <div 
          class="w-8 h-8 rounded-full flex items-center justify-center mb-0.5 transition-colors"
          :class="item.id === 'add' ? 'bg-gray-500 text-white' : 'hover:bg-gray-100'"
        >
          <component :is="item.icon" class="w-5 h-5" />
        </div>
        <span class="text-xs" :class="item.name ? 'text-gray-600' : 'text-gray-500 font-bold'">{{ item.name }}</span>
      </button>
    </div>
  </nav>
</template>