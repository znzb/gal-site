<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowLeft, Download, FileText, Shield, Zap, Settings } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { toolApi, type Tool } from '@/api/api'

const router = useRouter()
const tools = ref<Tool[]>([])
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

onMounted(async () => {
  try {
    tools.value = await toolApi.getAllTools()
  } catch (error) {
    console.error('加载工具失败:', error)
    tools.value = []
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 pb-24">
    <header class="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-30 shadow-sm">
      <div class="flex items-center justify-between px-4 py-3">
        <button 
          @click="router.back()"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft class="w-6 h-6 text-gray-600" />
        </button>
        <h1 class="text-lg font-bold text-gray-800">工具下载</h1>
        <div class="w-10"></div>
      </div>
    </header>
    
    <div class="pt-14 px-4">
      <div class="bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl p-4 mt-4 text-white">
        <h2 class="text-lg font-bold mb-2">常用工具</h2>
        <p class="text-sm opacity-90">下载必备工具，让游戏体验更流畅</p>
      </div>
      
      <div class="space-y-4 mt-6">
        <div 
          v-for="tool in tools" 
          :key="tool._id"
          class="bg-white rounded-xl shadow-sm p-4"
        >
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center">
              <component :is="getIcon(tool.icon)" class="w-6 h-6 text-primary" />
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-gray-800">{{ tool.name }}</h3>
                <span class="text-xs text-gray-400">{{ tool.downloads.toLocaleString() }} 下载</span>
              </div>
              <p class="text-sm text-gray-600 mt-1">{{ tool.description }}</p>
              <div class="flex items-center justify-between mt-3">
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="tag in tool.tags" 
                    :key="tag"
                    class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                  >
                    {{ tag }}
                  </span>
                </div>
                <button 
                  @click="handleDownload(tool)"
                  class="flex items-center gap-1 text-sm text-primary font-medium"
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
        <p class="text-gray-400">暂无工具</p>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm p-4 mt-6">
        <h3 class="font-bold text-gray-800 mb-3">使用说明</h3>
        <ul class="text-sm text-gray-600 space-y-2">
          <li class="flex items-start gap-2">
            <span class="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
            <span>下载并安装所需的工具</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
            <span>根据游戏格式选择对应的模拟器</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
            <span>将游戏文件导入模拟器即可开始游玩</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>