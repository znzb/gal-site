<script setup lang="ts">
import SideMenu from '@/components/SideMenu.vue'
import BottomNav from '@/components/BottomNav.vue'
import { RouterView } from 'vue-router'
import { appState } from '@/store/appStore'
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50/30">
    <RouterView v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </transition>
    </RouterView>
    
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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>