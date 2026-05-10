<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft, Download, FileText, Shield, Zap } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

interface Tool {
  id: string
  name: string
  description: string
  size: string
  downloads: number
  tags: string[]
  icon: string
}

const tools = ref<Tool[]>([
  {
    id: '1',
    name: 'Krkr模拟器',
    description: '用于运行KRKR格式游戏的安卓模拟器，支持大部分美少女游戏',
    size: '15MB',
    downloads: 12500,
    tags: ['模拟器', '必备'],
    icon: 'Zap'
  },
  {
    id: '2',
    name: 'JOI模拟器',
    description: '支持JOI格式游戏的模拟器，兼容性强，运行稳定',
    size: '22MB',
    downloads: 8900,
    tags: ['模拟器', '推荐'],
    icon: 'Shield'
  },
  {
    id: '3',
    name: '文本提取工具',
    description: '提取游戏中的文本内容，支持多种格式导出',
    size: '8MB',
    downloads: 5600,
    tags: ['工具', '实用'],
    icon: 'FileText'
  },
  {
    id: '4',
    name: '图片查看器',
    description: '专门用于查看游戏CG图片的工具，支持多种格式',
    size: '12MB',
    downloads: 7200,
    tags: ['工具', '图片'],
    icon: 'FileText'
  }
])

const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    Zap,
    Shield,
    FileText
  }
  return icons[iconName] || FileText
}
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
          :key="tool.id"
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
                <button class="flex items-center gap-1 text-sm text-primary font-medium">
                  <Download class="w-4 h-4" />
                  <span>{{ tool.size }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
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