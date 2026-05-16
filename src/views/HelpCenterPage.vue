<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowLeft, HelpCircle, MessageCircle, FileQuestion, ChevronDown, ChevronUp } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { faqApi, FAQ } from '../api/api'

const router = useRouter()

const faqs = ref<FAQ[]>([])
const groupInfo = ref({
  groupNumber: '123456789',
  groupName: ''
})

onMounted(async () => {
  try {
    const data = await faqApi.getAllFAQs()
    faqs.value = data.length > 0 ? data : [
      {
        _id: '1',
        question: '如何下载游戏？',
        answer: '在游戏详情页面点击"立即下载"按钮即可开始下载。部分游戏可能需要登录后才能下载，请确保您已登录账号。',
        order: 1
      },
      {
        _id: '2',
        question: '下载的游戏如何安装？',
        answer: '安卓游戏下载后直接点击APK文件安装即可。部分大型游戏可能需要额外的数据包，请按照游戏详情页的说明进行操作。',
        order: 2
      },
      {
        _id: '3',
        question: '游戏无法运行怎么办？',
        answer: '请先确认您的设备是否满足游戏要求。安卓游戏需要安卓7.0以上版本，部分游戏需要特定的模拟器支持。建议下载页面上推荐的模拟器。',
        order: 3
      },
      {
        _id: '4',
        question: '如何获取更多游戏资源？',
        answer: '您可以关注我们的公告页面获取最新游戏更新信息。同时也欢迎加入我们的QQ群，与其他玩家交流分享资源。',
        order: 4
      },
      {
        _id: '5',
        question: '遇到问题如何反馈？',
        answer: '您可以通过帮助中心的反馈功能提交问题，我们会尽快处理。也可以加入QQ群联系管理员反馈问题。',
        order: 5
      }
    ]
  } catch (error) {
    console.error('加载FAQ失败:', error)
  }

  try {
    const response = await fetch('https://game-api-p1zc.onrender.com/api/group-info')
    const data = await response.json()
    if (data) {
      groupInfo.value = {
        groupNumber: data.groupNumber || '123456789',
        groupName: data.groupName || ''
      }
    }
  } catch (error) {
    console.error('加载Q群信息失败:', error)
  }
})

const expandedIds = ref<string[]>([])

const toggleFaq = (id: string) => {
  const index = expandedIds.value.indexOf(id)
  if (index > -1) {
    expandedIds.value.splice(index, 1)
  } else {
    expandedIds.value.push(id)
  }
}

const isExpanded = (id: string) => {
  return expandedIds.value.includes(id)
}
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
        <h1 class="text-lg font-bold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">帮助中心</h1>
        <div class="w-10"></div>
      </div>
    </header>
    
    <div class="pt-14 px-4">
      <div class="bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl p-4 mt-4 text-white">
        <div class="flex items-center gap-3">
          <HelpCircle class="w-8 h-8" />
          <div>
            <h2 class="text-lg font-bold">帮助中心</h2>
            <p class="text-sm opacity-90">有问题？我们来帮您解答</p>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mt-6">
        <div class="bg-white rounded-xl shadow-sm p-4 text-center cursor-pointer hover:shadow-md transition-shadow border border-pink-100">
          <div class="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileQuestion class="w-6 h-6 text-pink-600" />
          </div>
          <h3 class="font-medium text-gray-800 text-sm">常见问题</h3>
          <p class="text-xs text-pink-400 mt-1">查看常见问题解答</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 text-center cursor-pointer hover:shadow-md transition-shadow border border-pink-100">
          <div class="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageCircle class="w-6 h-6 text-pink-600" />
          </div>
          <h3 class="font-medium text-gray-800 text-sm">联系客服</h3>
          <p class="text-xs text-pink-400 mt-1">获取人工帮助</p>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm p-4 mt-6 border border-pink-100">
        <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileQuestion class="w-5 h-5 text-pink-600" />
          常见问题
        </h3>
        
        <div class="space-y-3">
          <div 
            v-for="faq in faqs" 
            :key="faq._id"
            class="border-b border-pink-100 last:border-b-0"
          >
            <button 
              @click="toggleFaq(faq._id)"
              class="w-full flex items-center justify-between py-3 text-left"
            >
              <span class="text-sm font-medium text-gray-800">{{ faq.question }}</span>
              <component 
                :is="isExpanded(faq._id) ? ChevronUp : ChevronDown" 
                class="w-5 h-5 text-pink-400" 
              />
            </button>
            <div 
              v-if="isExpanded(faq._id)"
              class="pb-3 text-sm text-gray-600"
            >
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm p-4 mt-6 border border-pink-100">
        <h3 class="font-bold text-gray-800 mb-3">联系我们</h3>
        <div class="space-y-3 text-sm">
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
              <MessageCircle class="w-4 h-4 text-pink-600" />
            </span>
            <div>
              <p class="font-medium text-gray-800">QQ群</p>
              <p class="text-pink-400">{{ groupInfo.groupNumber }}（点击加入）</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>