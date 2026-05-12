<script setup lang="ts">
import { Search, User, Menu, Gamepad2 } from 'lucide-vue-next'
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
  <header class="bg-white backdrop-blur-xl shadow-lg shadow-pink-100/50 sticky top-0 z-30 border-b border-pink-100">
    <div class="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
      <button 
        @click="appState.toggleSideMenu()"
        class="p-2 rounded-xl hover:bg-pink-50 transition-all duration-300 group md:hidden"
      >
        <Menu class="w-6 h-6 text-gray-700 group-hover:text-pink-500 transition-colors" />
      </button>
      
      <div class="hidden md:flex items-center gap-3 cursor-pointer" @click="router.push('/')">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-200">
          <Gamepad2 class="w-5 h-5 text-white" />
        </div>
        <span class="text-xl font-bold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">三菜鱼小站</span>
      </div>
      
      <div class="flex-1 mx-3 max-w-2xl md:max-w-xl">
        <div class="relative group">
          <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="搜索游戏..." 
            class="w-full pl-11 pr-12 py-2.5 bg-pink-50 border border-pink-100 rounded-xl text-sm md:text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all duration-300"
            @keyup.enter="goToSearch"
          />
          <button 
            @click="goToSearch"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-pink-100 transition-all duration-300"
          >
            <Search class="w-4 h-4 text-gray-400 hover:text-pink-500 transition-colors" />
          </button>
        </div>
      </div>
      
      <button class="p-2 rounded-xl hover:bg-pink-50 transition-all duration-300 group">
        <User class="w-6 h-6 text-gray-600 group-hover:text-pink-500 transition-colors" />
      </button>
    </div>
    
    <div class="hidden md:flex items-center justify-center gap-8 py-3">
      <button 
        @click="router.push('/')"
        class="relative px-6 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 text-white text-sm font-medium hover:from-pink-600 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg shadow-pink-200"
      >
        <span class="relative z-10">🏠 首页</span>
      </button>
      <button 
        @click="router.push('/pc-resources')"
        class="relative px-6 py-2 rounded-lg text-gray-700 text-sm font-medium hover:text-pink-500 hover:bg-pink-50 transition-all duration-300"
      >
        💻 PC资源
      </button>
      <button 
        @click="router.push('/category/PC资源')"
        class="relative px-6 py-2 rounded-lg text-gray-700 text-sm font-medium hover:text-pink-500 hover:bg-pink-50 transition-all duration-300"
      >
        🎮 Gal游戏
      </button>
      <button 
        @click="router.push('/tools')"
        class="relative px-6 py-2 rounded-lg text-gray-700 text-sm font-medium hover:text-pink-500 hover:bg-pink-50 transition-all duration-300"
      >
        🛠️ 工具下载
      </button>
      <button 
        @click="router.push('/help')"
        class="relative px-6 py-2 rounded-lg text-gray-700 text-sm font-medium hover:text-pink-500 hover:bg-pink-50 transition-all duration-300"
      >
        📖 帮助中心
      </button>
      <button 
        @click="router.push('/patch-records')"
        class="relative px-6 py-2 rounded-lg text-gray-700 text-sm font-medium hover:text-pink-500 hover:bg-pink-50 transition-all duration-300"
      >
        📋 补档记录
      </button>
    </div>
    
    <div class="flex items-center justify-around py-2.5 bg-gradient-to-r from-pink-50 via-pink-100/50 to-pink-50 md:hidden">
      <button 
        @click="router.push('/tools')"
        class="text-gray-700 text-sm font-medium"
      >🛠️ 工具</button>
      <button 
        @click="router.push('/help')"
        class="text-gray-700 text-sm font-medium"
      >📖 帮助</button>
    </div>
  </header>
</template>
