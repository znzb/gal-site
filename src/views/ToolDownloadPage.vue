<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ArrowLeft, Download, FileText, Shield, Zap, Settings } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { toolApi, toolGuideApi, type Tool, type ToolGuide } from '@/api/api'

const router = useRouter()
const tools = ref<Tool[]>([])
const guide = ref<ToolGuide | null>(null)
const isLoading = ref(true)

const iconMap: Record<string, any> = {
  Zap,
  Shield,
  FileText,
  Download,
  Settings
}

const getIcon = (iconName: string) => {
  return iconMap[iconName] || FileText
}

const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

const handleDownload = async (tool: Tool) => {
  try {
    await toolApi.downloadTool(tool._id!)
    if (tool.downloadUrl) {
      window.open(tool.downloadUrl, '_blank')
    }
  } catch (error) {
    console.error('下载失败:', error)
  }
}

let dataRefreshTimer: number | null = null

onMounted(async () => {
  try {
    const [toolsData, guideData] = await Promise.all([
      toolApi.getAllTools(),
      toolGuideApi.getGuide()
    ])
    tools.value = toolsData
    guide.value = guideData
  } catch (error) {
    console.error('加载失败:', error)
    tools.value = []
    guide.value = null
  } finally {
    isLoading.value = false
  }
  dataRefreshTimer = window.setInterval(async () => {
    try {
      const [toolsData, guideData] = await Promise.all([
        toolApi.getAllTools(),
        toolGuideApi.getGuide()
      ])
      tools.value = toolsData
      guide.value = guideData
    } catch (error) {
      console.error('刷新失败:', error)
    }
  }, 30000)
})

onUnmounted(() => {
  if (dataRefreshTimer) {
    clearInterval(dataRefreshTimer)
  }
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
        <h1 class="text-lg font-bold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">工具下载</h1>
        <div class="w-10"></div>
      </div>
    </header>
    
    <div class="pt-14 px-4">
      <div class="bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl p-4 mt-4 text-white">
        <h2 class="text-lg font-bold mb-2">常用工具</h2>
        <p class="text-sm opacity-90">下载必备工具，让游戏体验更流畅</p>
      </div>
      
      <div class="space-y-3 mt-6">
        <div 
          v-for="tool in tools" 
          :key="tool._id"
          class="bg-white rounded-xl shadow-sm p-3 border border-pink-100"
        >
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center overflow-hidden">
              <img v-if="isValidUrl(tool.icon)" :src="tool.icon" alt="图标" class="w-full h-full object-cover" />
              <component v-else :is="getIcon(tool.icon)" class="w-5 h-5 text-pink-600" />
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-gray-800">{{ tool.name }}</h3>
                <span class="text-xs text-pink-400">{{ tool.downloads.toLocaleString() }} 下载</span>
              </div>
              <p class="text-sm text-gray-600 mt-1">{{ tool.description }}</p>
              <div class="flex items-center justify-between mt-2">
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="tag in tool.tags" 
                    :key="tag"
                    class="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full border border-pink-200"
                  >
                    {{ tag }}
                  </span>
                </div>
                <button 
                  @click="handleDownload(tool)"
                  class="flex items-center gap-1 text-sm text-pink-600 font-medium"
                >
                  <Download class="w-4 h-4" />
                  <span>{{ tool.size }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="tools.length === 0 && !isLoading" class="text-center py-20">
        <div class="text-6xl mb-4">🛠️</div>
        <p class="text-pink-400">暂无工具</p>
      </div>
      
      <div v-if="guide" class="mt-6">
        <div class="bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl p-4 text-white">
          <h2 class="text-lg font-bold mb-2">工具说明</h2>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 border border-pink-100">
          <h3 class="font-bold text-gray-800 mb-3">{{ guide.title }}</h3>
          <ul class="text-sm text-gray-600 space-y-2">
            <li 
              v-for="(item, index) in guide.items" 
              :key="item.order"
              class="flex items-start gap-2"
            >
              <span class="w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 border border-pink-200">{{ index + 1 }}</span>
              <span>{{ item.content }}</span>
            </li>
          </ul>
        </div>
        
        <!-- 教程卡片 -->
        <div v-if="guide.tutorials && guide.tutorials.length > 0" class="mt-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">教程</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              v-for="tutorial in guide.tutorials" 
              :key="tutorial.id || tutorial.order"
              :href="tutorial.url"
              target="_blank"
              rel="noopener noreferrer"
              class="bg-white rounded-xl shadow-sm p-4 border border-pink-100 hover:border-pink-300 hover:shadow-md transition-all cursor-pointer block"
            >
              <h4 class="font-bold text-gray-800 mb-2">{{ tutorial.title }}</h4>
              <p class="text-sm text-gray-500">{{ tutorial.description }}</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>