<script setup lang="ts">
import { ref } from 'vue'
import { Upload, FileText, CheckCircle, XCircle, Download, Trash2 } from 'lucide-vue-next'

const isLoading = ref(false)
const importResults = ref<{
  success: number
  failed: number
  errors: Array<{ row: number; name: string; error: string }>
} | null>(null)
const uploadedFileName = ref('')

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0]) return

  const file = input.files[0]
  if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
    alert('请上传 Excel 格式文件 (.xlsx 或 .xls)')
    return
  }

  uploadedFileName.value = file.name
  isLoading.value = true
  importResults.value = null

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('https://game-api-p1zc.onrender.com/api/admin/batch-import/upload', {
      method: 'POST',
      body: formData
    })

    const result = await response.json()
    
    if (response.ok) {
      importResults.value = result.results
      alert(result.message)
    } else {
      throw new Error(result.error || '导入失败')
    }
  } catch (error: any) {
    alert('导入失败: ' + error.message)
    console.error(error)
  } finally {
    isLoading.value = false
    input.value = ''
  }
}

const downloadTemplate = async () => {
  try {
    const response = await fetch('https://game-api-p1zc.onrender.com/api/admin/batch-import/template')
    
    if (!response.ok) {
      throw new Error('下载模板失败')
    }
    
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'games-template.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    alert('下载模板失败')
  }
}

const clearResults = () => {
  importResults.value = null
  uploadedFileName.value = ''
}
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">批量导入游戏</h1>
      <p class="text-gray-600 mt-1">上传Excel格式的游戏数据文件进行批量导入</p>
    </div>

    <!-- 操作区 -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex items-center gap-4 mb-4">
        <label class="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg cursor-pointer hover:bg-pink-600 transition-colors">
          <Upload class="w-5 h-5" />
          <span>选择Excel文件</span>
          <input 
            type="file" 
            accept=".xlsx,.xls" 
            @change="handleFileUpload" 
            class="hidden"
            :disabled="isLoading"
          />
        </label>
        
        <button 
          @click="downloadTemplate"
          class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Download class="w-5 h-5" />
          <span>下载模板</span>
        </button>
      </div>

      <div v-if="isLoading" class="flex items-center gap-2 text-pink-500">
        <div class="animate-spin w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full"></div>
        <span>正在导入...</span>
      </div>

      <div v-if="uploadedFileName && !isLoading" class="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
        <div class="flex items-center gap-2">
          <FileText class="w-5 h-5 text-gray-500" />
          <span class="text-gray-700">{{ uploadedFileName }}</span>
        </div>
        <button @click="clearResults" class="text-gray-500 hover:text-red-500">
          <Trash2 class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- 结果显示 -->
    <div v-if="importResults" class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-lg font-semibold mb-4">导入结果</h2>
      
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle class="w-8 h-8 text-green-500" />
          <div>
            <p class="text-green-700 font-semibold">成功</p>
            <p class="text-2xl font-bold text-green-600">{{ importResults.success }}</p>
          </div>
        </div>
        
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <XCircle class="w-8 h-8 text-red-500" />
          <div>
            <p class="text-red-700 font-semibold">失败</p>
            <p class="text-2xl font-bold text-red-600">{{ importResults.failed }}</p>
          </div>
        </div>
      </div>

      <div v-if="importResults.errors && importResults.errors.length > 0">
        <h3 class="font-semibold text-gray-700 mb-3">失败详情：</h3>
        <div class="space-y-2">
          <div 
            v-for="(error, index) in importResults.errors" 
            :key="index"
            class="p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p class="font-medium text-red-700">{{ error.name }}</p>
            <p class="text-sm text-red-600">{{ error.error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
      <h3 class="font-semibold text-blue-800 mb-3">使用说明：</h3>
      <ol class="list-decimal list-inside space-y-2 text-blue-700">
        <li>点击「下载模板」获取Excel格式示例文件</li>
        <li>按照模板格式编辑游戏数据（每行一个游戏）</li>
        <li>确保每个游戏的 <code class="bg-blue-100 px-1 rounded">ID</code> 唯一</li>
        <li>上传编辑好的Excel文件进行导入</li>
        <li>查看导入结果，如有失败可查看失败详情</li>
      </ol>
      
      <div class="mt-4 p-3 bg-blue-100 rounded-lg">
        <p class="text-sm text-blue-800">
          <strong>提示：</strong>已存在的游戏（ID相同）不会被导入，可以使用此功能进行增量更新。
        </p>
      </div>
    </div>
  </div>
</template>
