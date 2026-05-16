<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Megaphone, MessageCircle, Music, Download } from 'lucide-vue-next'
import { featureApi, type Feature } from '@/api/api'

const router = useRouter()

const features = ref<Feature[]>([])
const isLoading = ref(true)
const showAnnouncementModal = ref(false)
const showJoinGroupModal = ref(false)
const announcements = ref([])
const groupInfo = ref({
  groupNumber: '123456789',
  groupName: '',
  qrCode: '',
  description: ''
})

const fixedFeatures: Feature[] = [
  { id: '1', name: '网站公告', icon: 'megaphone' },
  { id: '2', name: '柚子社', icon: 'music' },
  { id: '3', name: '工具下载', icon: 'download' },
  { id: '4', name: '加入Q群', icon: 'message-circle' }
]

const iconMap: Record<string, typeof Megaphone> = {
  megaphone: Megaphone,
  'message-circle': MessageCircle,
  music: Music,
  download: Download
}

const loadFeatures = async () => {
  features.value = fixedFeatures
  isLoading.value = false
}

const loadAnnouncements = async () => {
  try {
    const response = await fetch('https://game-api-p1zc.onrender.com/api/announcements')
    const data = await response.json()
    announcements.value = data.announcements || data || []
  } catch (error) {
    console.error('Failed to load announcements:', error)
    announcements.value = []
  }
}

const loadGroupInfo = async () => {
  try {
    const response = await fetch('https://game-api-p1zc.onrender.com/api/group-info')
    const data = await response.json()
    if (data) {
      groupInfo.value = {
        groupNumber: data.groupNumber || '123456789',
        groupName: data.groupName || '',
        qrCode: data.qrCode || '',
        description: data.description || ''
      }
    }
  } catch (error) {
    console.error('Failed to load group info:', error)
  }
}

const handleFeatureClick = (featureId: string) => {
  switch (featureId) {
    case '1':
      loadAnnouncements()
      showAnnouncementModal.value = true
      break
    case '2':
      router.push('/yuzusoft')
      break
    case '3':
      router.push('/tools')
      break
    case '4':
      loadGroupInfo()
      showJoinGroupModal.value = true
      break
  }
}

const copyGroupNumber = async () => {
  try {
    await navigator.clipboard.writeText(groupInfo.value.groupNumber)
    alert('群号已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    alert('复制失败，请手动复制群号：' + groupInfo.value.groupNumber)
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  loadFeatures()
})
</script>

<template>
  <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-4 mx-4 mt-4 shadow-lg border border-pink-100/50">
    <div v-if="isLoading" class="flex items-center justify-center h-20">
      <div class="w-6 h-6 border-2 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
    </div>
    <div v-else class="grid grid-cols-4 gap-2">
      <button 
        v-for="feature in features" 
        :key="feature.id"
        @click="handleFeatureClick(feature.id)"
        class="flex flex-col items-center py-3 rounded-xl hover:bg-gradient-to-br hover:from-pink-50 hover:to-pink-100 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
      >
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-md transition-shadow hover:shadow-lg bg-gradient-to-br from-pink-100 to-pink-200">
          <component :is="iconMap[feature.icon]" 
                     class="w-6 h-6 transition-transform group-hover:scale-110 text-pink-600" />
        </div>
        <span class="text-xs text-gray-700 font-medium">{{ feature.name }}</span>
      </button>
    </div>
  </div>

  <!-- 公告弹窗 -->
  <div v-if="showAnnouncementModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showAnnouncementModal = false">
    <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-xl" @click.stop>
      <div class="bg-gradient-to-r from-pink-500 to-pink-600 p-6 text-white">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">📢 网站公告</h2>
          <button @click="showAnnouncementModal = false" class="text-3xl hover:opacity-80">×</button>
        </div>
      </div>
      
      <div class="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
        <div v-if="announcements.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">📭</div>
          <p class="text-gray-500">暂无公告</p>
        </div>
        <div v-else class="space-y-4">
          <div v-for="ann in announcements" :key="ann.id || ann._id" class="bg-pink-50 rounded-xl p-4 border border-pink-100">
            <div class="flex items-center gap-2 mb-2">
              <span v-if="ann.isPinned" class="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">置顶</span>
              <h3 class="font-bold text-gray-800">{{ ann.title }}</h3>
            </div>
            <p class="text-gray-600 text-sm">{{ ann.content }}</p>
            <span class="text-xs text-gray-400 mt-2 block">{{ formatDate(ann.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 加群弹窗 -->
  <div v-if="showJoinGroupModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showJoinGroupModal = false">
    <div class="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl" @click.stop>
      <div class="bg-gradient-to-r from-pink-500 to-pink-600 p-6 text-white text-center">
        <h2 class="text-2xl font-bold">💬 加入Q群</h2>
      </div>
      
      <div class="p-6 text-center">
        <div class="w-40 h-40 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-pink-100">
          <img v-if="groupInfo.qrCode" :src="groupInfo.qrCode" alt="群二维码" class="w-full h-full object-cover rounded-2xl" onerror="this.style.display='none'" />
          <span v-else class="text-6xl">🐧</span>
        </div>
        
        <div class="bg-pink-50 rounded-xl p-4 mb-4 border border-pink-100">
          <p v-if="groupInfo.groupName" class="text-gray-600 text-sm mb-2">{{ groupInfo.groupName }}</p>
          <p class="text-2xl font-bold text-gray-800 mb-3">{{ groupInfo.groupNumber }}</p>
          <button @click="copyGroupNumber" class="px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:opacity-90 shadow-md">
            复制群号
          </button>
        </div>
        
        <p v-if="groupInfo.description" class="text-sm text-gray-500 mb-4">{{ groupInfo.description }}</p>
        <p v-else class="text-sm text-gray-500 mb-4">
          方法一：扫描上方二维码<br/>
          方法二：复制群号搜索添加
        </p>
        
        <button @click="showJoinGroupModal = false" class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
          关闭
        </button>
      </div>
    </div>
  </div>
</template>
