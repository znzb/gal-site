<script setup lang="ts">
import SideMenu from '@/components/SideMenu.vue'
import BottomNav from '@/components/BottomNav.vue'
import { RouterView, useRoute } from 'vue-router'
import { appState } from '@/store/appStore'
import { KeepAlive } from 'vue'

const route = useRoute()
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50/30">
    <KeepAlive include="Home">
      <RouterView v-slot="{ Component }">
        <component :is="Component" />
      </RouterView>
    </KeepAlive>
    
    <BottomNav class="md:hidden" />
    
    <SideMenu 
      :show="appState.showSideMenu" 
      @close="appState.closeSideMenu"
      @navigate="appState.closeSideMenu"
    />
    
    <div 
      v-if="appState.showSideMenu" 
      class="fixed inset-0 bg-black/50 z-40"
      @click="appState.closeSideMenu"
    ></div>
  </div>
</template>
