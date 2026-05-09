<script setup lang="ts">
import { Search, User, Menu } from 'lucide-vue-next'
import { appState } from '@/store/appStore'
</script>

<template>
  <header class="bg-white shadow-sm sticky top-0 z-30">
    <div class="flex items-center justify-between px-4 py-3">
      <button 
        @click="appState.toggleSideMenu()"
        class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Menu class="w-6 h-6 text-gray-600" />
      </button>
      
      <div class="flex-1 mx-3">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="搜索游戏..." 
            class="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>
      
      <button class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <User class="w-6 h-6 text-gray-600" />
      </button>
    </div>
    
    <div class="flex items-center justify-around py-2 bg-gray-800 text-gray-300 text-sm">
      <span>历史公告</span>
      <span>Gal专区</span>
      <span>帮助中心</span>
    </div>
  </header>
</template>