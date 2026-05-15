<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { toolGuideApi, type TutorialCard } from '@/api/api'

const router = useRouter()
const route = useRoute()
const guide = ref<any>(null)
const tutorial = ref<TutorialCard | null>(null)
const isLoading = ref(true)
const activeSection = ref(0)

const scrollToSection = (index: number) => {
  activeSection.value = index
  const element = document.getElementById(`section-${index}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const handleScroll = () => {
  const sections = tutorial.value?.content?.sections || []
  if (!sections.length) return
  
  for (let i = sections.length - 1; i >= 0; i--) {
    const element = document.getElementById(`section-${i}`)
    if (element) {
      const rect = element.getBoundingClientRect()
      if (rect.top <= 100) {
        activeSection.value = i
        break
      }
    }
  }
}

onMounted(async () => {
  try {
    const guideData = await toolGuideApi.getGuide()
    guide.value = guideData
    const tutorialId = route.params.id
    tutorial.value = guideData.tutorials?.find((t: any) => 
      (t.id && t.id === tutorialId) || (t.order !== undefined && t.order === Number(tutorialId))
    ) || null
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    isLoading.value = false
  }
  
  window.addEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50/50 to-white pb-24">
    <header class="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-30 shadow-sm border-b border-pink-100">
      <div class="flex items-center justify-between px-4 py-3">
        <button 
          @click="router.back()"
          class="p-2 rounded-lg hover:bg-pink-100 transition-colors"
        >
          <ArrowLeft class="w-6 h-6 text-pink-600" />
        </button>
        <h1 class="text-lg font-bold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent" v-if="tutorial">{{ tutorial.title }}</h1>
        <div class="w-10"></div>
      </div>
    </header>
    
    <div class="pt-14 px-4">
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <div class="text-pink-400">加载中...</div>
      </div>
      
      <div v-else-if="!tutorial" class="text-center py-20">
        <div class="text-6xl mb-4">📄</div>
        <p class="text-pink-400">教程不存在</p>
      </div>
      
      <div v-else class="mt-6 max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row gap-6">
          <!-- 主内容区域 -->
          <div class="flex-1">
            <div class="bg-white rounded-xl shadow-sm p-6 border border-pink-100">
              <h1 class="text-2xl font-bold text-gray-900 mb-8">{{ tutorial.title }}</h1>
              
              <div v-if="tutorial.content?.sections && tutorial.content.sections.length > 0" class="space-y-8">
                <div 
                  v-for="(section, index) in tutorial.content.sections" 
                  :key="index"
                  :id="`section-${index}`"
                  class="section-item"
                >
                  <h2 class="text-xl font-bold text-gray-900 mb-4">{{ section.title }}</h2>
                  <div 
                    class="text-gray-700 space-y-4"
                    v-html="section.content"
                  ></div>
                  <div v-if="index < tutorial.content.sections.length - 1" class="mt-8 border-t border-gray-200"></div>
                </div>
              </div>
              
              <div v-else class="text-center py-12 text-gray-500">
                暂无内容
              </div>
            </div>
          </div>
          
          <!-- 侧边栏索引 -->
          <div v-if="tutorial.content?.sections && tutorial.content.sections.length > 0" class="w-full md:w-80 md:sticky md:top-20 md:self-start">
            <div class="bg-white rounded-xl shadow-sm p-4 border border-pink-100">
              <h3 class="font-bold text-gray-900 mb-4 text-lg">本页面索引</h3>
              <nav class="space-y-1">
                <template v-for="(section, index) in tutorial.content.sections" :key="index">
                  <button
                    @click="scrollToSection(index)"
                    :class="[
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      activeSection === index 
                        ? 'text-pink-600 font-medium' 
                        : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                    ]"
                  >
                    {{ section.title }}
                  </button>
                  
                  <template v-if="section.subsections && section.subsections.length > 0">
                    <div class="pl-4 space-y-1">
                      <button
                        v-for="(sub, subIndex) in section.subsections"
                        :key="`sub-${index}-${subIndex}`"
                        class="w-full text-left px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                      >
                        {{ sub.title }}
                      </button>
                    </div>
                  </template>
                </template>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
