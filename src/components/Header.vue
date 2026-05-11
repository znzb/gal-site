<script setup lang="ts">
import { Search, User, Menu } from 'lucide-vue-next'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { appState } from '@/store/appStore'

const router = useRouter()
const searchQuery = ref('')

const goToSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`)
    searchQuery.value = ''
  }
}
</script>

<template>
  <header class="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30">
    <div class="flex items-center justify-between px-4 py-3">
      <button 
        @click="appState.toggleSideMenu()"
        class="p-2 rounded-xl hover:bg-primary/10 transition-colors group"
      >
        <Menu class="w-6 h-6 text-gray-700 group-hover:text-primary transition-colors" />
      </button>
      
      <div class="flex-1 mx-3">
        <div class="relative group">
          <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="搜索游戏..." 
            class="w-full pl-11 pr-12 py-2.5 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all duration-300"
            @keyup.enter="goToSearch"
          />
          <button 
            @click="goToSearch"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
          >
            <Search class="w-4 h-4 text-gray-400 hover:text-primary transition-colors" />
          </button>
        </div>
      </div>
      
      <button class="p-2 rounded-xl hover:bg-primary/10 transition-colors group">
        <User class="w-6 h-6 text-gray-700 group-hover:text-primary transition-colors" />
      </button>
    </div>
    
    <div class="flex items-center justify-around py-2.5 bg-gradient-to-r from-primary via-secondary to-accent text-white text-sm font-medium">
      <button 
        @click="router.push('/tools')"
        class="relative hover:after:content-[''] hover:after:absolute hover:after:-bottom-1 hover:after:left-1/2 hover:after:-translate-x-1/2 hover:after:w-4 hover:after:h-0.5 hover:after:bg-white hover:after:rounded-full transition-all"
      >工具下载</button>
      <button 
        @click="router.push('/help')"
        class="relative hover:after:content-[''] hover:after:absolute hover:after:-bottom-1 hover:after:left-1/2 hover:after:-translate-x-1/2 hover:after:w-4 hover:after:h-0.5 hover:after:bg-white hover:after:rounded-full transition-all"
      >帮助中心</button>
    </div>
  </header>
</template>
