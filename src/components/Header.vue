<script setup lang="ts">
import { Search, User, Menu } from 'lucide-vue-next'
import { appState } from '@/store/appStore'
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
            type="text" 
            placeholder="搜索游戏..." 
            class="w-full pl-11 pr-4 py-2.5 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all duration-300"
          />
        </div>
      </div>
      
      <button class="p-2 rounded-xl hover:bg-primary/10 transition-colors group">
        <User class="w-6 h-6 text-gray-700 group-hover:text-primary transition-colors" />
      </button>
    </div>
    
    <div class="flex items-center justify-around py-2.5 bg-gradient-to-r from-primary via-secondary to-accent text-white text-sm font-medium">
      <span class="relative hover:after:content-[''] hover:after:absolute hover:after:-bottom-1 hover:after:left-1/2 hover:after:-translate-x-1/2 hover:after:w-4 hover:after:h-0.5 hover:after:bg-white hover:after:rounded-full transition-all">历史公告</span>
      <span class="relative hover:after:content-[''] hover:after:absolute hover:after:-bottom-1 hover:after:left-1/2 hover:after:-translate-x-1/2 hover:after:w-4 hover:after:h-0.5 hover:after:bg-white hover:after:rounded-full transition-all">Gal专区</span>
      <span class="relative hover:after:content-[''] hover:after:absolute hover:after:-bottom-1 hover:after:left-1/2 hover:after:-translate-x-1/2 hover:after:w-4 hover:after:h-0.5 hover:after:bg-white hover:after:rounded-full transition-all">帮助中心</span>
    </div>
  </header>
</template>