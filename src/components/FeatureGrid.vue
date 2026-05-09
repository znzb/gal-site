<script setup lang="ts">
import { Megaphone, Rocket, Music, FileText } from 'lucide-vue-next'
import { features } from '@/data/mockData'

const iconMap: Record<string, typeof Megaphone> = {
  megaphone: Megaphone,
  rocket: Rocket,
  music: Music,
  'file-text': FileText
}
</script>

<template>
  <div class="bg-white rounded-xl p-4 mx-4 mt-4 shadow-sm">
    <div class="grid grid-cols-4 gap-2">
      <button 
        v-for="feature in features" 
        :key="feature.id"
        class="flex flex-col items-center py-3 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mb-2">
          <component :is="iconMap[feature.icon]" class="w-6 h-6 text-orange-600" />
        </div>
        <span class="text-xs text-gray-600">{{ feature.name }}</span>
      </button>
    </div>
  </div>
</template>