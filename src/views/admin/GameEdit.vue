<script setup lang="ts">import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Save, Plus, Trash2, Image, FileText, MessageSquare } from 'lucide-vue-next';
import { gameApi, type Game } from '@/api/api';
const route = useRoute();
const router = useRouter();
const isNew = route.params.id === 'new';
const gameId = ref(route.params.id as string);
const activeTab = ref<'info' | 'resources' | 'comments'>('info');
const isLoading = ref(true);
const isSaving = ref(false);
const formData = ref({
 id: '',
 name: '',
 cover: '',
 description: '',
 category: '',
 subCategory: 'raw' as 'raw' | 'cooked',
 size: '',
 releaseDate: '',
 downloads: 0,
 tags: ''
});
interface ResourceLink {
 id: string;
 name: string;
 url: string;
 type: 'main' | 'patch' | 'update';
 size: string;
 date: string;
}
interface Comment {
 id: string;
 user: string;
 avatar: string;
 content: string;
 rating: number;
 date: string;
 likes: number;
 liked: boolean;
}
interface GameInfo {
 developer: string;
 publisher: string;
 platforms: string[];
 languages: string[];
 requirements: string;
}
const resources = ref<ResourceLink[]>([
 { id: '1', name: '', url: '', type: 'main', size: '', date: '' }
]);
const comments = ref<Comment[]>([
 { id: '1', user: '', avatar: '', content: '', rating: 5, date: '', likes: 0, liked: false }
]);
const gameInfo = ref<GameInfo>({
 developer: '',
 publisher: '',
 platforms: ['Android', 'Windows'],
 languages: ['简体中文'],
 requirements: ''
});
const categories = [
 { value: '安卓直装', label: '安卓直装' },
 { value: 'kr资源', label: 'kr资源' },
 { value: '游戏CG', label: '游戏CG' },
 { value: '图集资源', label: '图集资源' },
 { value: 'PC资源', label: 'PC资源' }
];
const platformOptions = ['Android', 'PC', 'KR'];
const languageOptions = ['简体中文', '繁体中文', '日文', '英文'];
const loadGameData = async () => {
 if (isNew) {
 isLoading.value = false;
 return;
 }
 try {
 const game = await gameApi.getGameById(gameId.value);
 formData.value = {
 id: game.id,
 name: game.name,
 cover: game.cover,
 description: game.description,
 category: game.category,
 subCategory: game.subCategory || 'raw',
 size: game.size,
 releaseDate: game.releaseDate,
 downloads: game.downloads,
 tags: game.tags.join(', ')
 };
 }
 catch (error) {
 console.error('Failed to load game:', error);
 }
 finally {
 isLoading.value = false;
 }
};
const addResource = () => {
 resources.value.push({
 id: Date.now().toString(),
 name: '',
 url: '',
 type: 'main',
 size: '',
 date: ''
 });
};
const removeResource = (index: number) => {
 if (resources.value.length > 1) {
 resources.value.splice(index, 1);
 }
};
const addComment = () => {
 comments.value.push({
 id: Date.now().toString(),
 user: '',
 avatar: '',
 content: '',
 rating: 5,
 date: '',
 likes: 0,
 liked: false
 });
};
const removeComment = (index: number) => {
 if (comments.value.length > 1) {
 comments.value.splice(index, 1);
 }
};
const saveGame = async () => {
 isSaving.value = true;
 try {
 const game: any = {
 id: isNew ? Date.now().toString() : gameId.value,
 name: formData.value.name,
 cover: formData.value.cover,
 description: formData.value.description,
 category: formData.value.category,
 subCategory: formData.value.subCategory,
 size: formData.value.size,
 releaseDate: formData.value.releaseDate,
 downloads: formData.value.downloads,
 tags: formData.value.tags.split(',').map(t => t.trim()).filter(t => t),
 resources: resources.value.filter(r => r.name && r.url).map(r => ({
 name: r.name,
 url: r.url,
 type: r.type,
 size: r.size,
 date: r.date,
 platform: gameInfo.value.platforms[0] || 'Android',
 language: gameInfo.value.languages[0] || '简体中文'
 })),
 comments: comments.value.filter(c => c.user && c.content).map(c => ({
 user: c.user,
 avatar: c.avatar,
 content: c.content,
 rating: c.rating,
 date: c.date,
 likes: c.likes
 }))
 };
 if (isNew) {
 await gameApi.createGame(game);
 }
 else {
 await gameApi.updateGame(gameId.value, game);
 }
 alert('保存成功！');
 router.push('/admin');
 }
 catch (error) {
 console.error('Failed to save game:', error);
 alert('保存失败，请重试');
 }
 finally {
 isSaving.value = false;
 }
};
onMounted(() => {
 loadGameData();
});
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <header class="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div class="flex items-center justify-between px-6 py-4">
        <div class="flex items-center gap-4">
          <button 
            @click="router.back()"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft class="w-5 h-5 text-gray-600" />
          </button>
          <h1 class="text-lg font-bold text-gray-800">
            {{ isNew ? '添加游戏' : '编辑游戏' }}
          </h1>
        </div>
        <button 
          @click="saveGame"
          :disabled="isSaving"
          class="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save class="w-5 h-5" />
          {{ isSaving ? '保存中...' : '保存' }}
        </button>
      </div>
    </header>
    
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center pt-16">
      <div class="w-10 h-10 border-3 border-gray-300 border-t-purple-500 rounded-full animate-spin"></div>
    </div>
    
    <div v-else class="pt-28 px-6 pb-8">
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden sticky top-16 z-40">
          <div class="flex border-b border-gray-200">
            <button 
              @click="activeTab = 'info'"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors"
              :class="activeTab === 'info' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
            >
              <FileText class="w-5 h-5" />
              游戏信息
            </button>
            <button 
              @click="activeTab = 'resources'"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors"
              :class="activeTab === 'resources' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
            >
              <Image class="w-5 h-5" />
              资源链接
            </button>
            <button 
              @click="activeTab = 'comments'"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors"
              :class="activeTab === 'comments' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
            >
              <MessageSquare class="w-5 h-5" />
              游戏评论
            </button>
          </div>
          
          <div class="p-6">
            <div v-if="activeTab === 'info'" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">游戏名称</label>
                <input 
                  v-model="formData.name"
                  type="text"
                  placeholder="请输入游戏名称"
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">封面图片URL</label>
                <input 
                  v-model="formData.cover"
                  type="text"
                  placeholder="请输入封面图片URL"
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div v-if="formData.cover" class="mt-2">
                  <img :src="formData.cover" :alt="formData.name" class="max-w-xs rounded-lg" />
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">游戏分类</label>
                <select 
                  v-model="formData.category"
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">请选择分类</option>
                  <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                    {{ cat.label }}
                  </option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">子分类</label>
                <div class="flex gap-4">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="formData.subCategory" value="raw" class="text-purple-600" />
                    <span>生肉（未汉化）</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="formData.subCategory" value="cooked" class="text-purple-600" />
                    <span>熟肉（已汉化）</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">游戏大小</label>
                <input 
                  v-model="formData.size"
                  type="text"
                  placeholder="例如：2.5GB"
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">发布日期</label>
                <input 
                  v-model="formData.releaseDate"
                  type="date"
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">下载量</label>
                <input 
                  v-model.number="formData.downloads"
                  type="number"
                  placeholder="请输入下载量"
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">标签（用逗号分隔）</label>
                <input 
                  v-model="formData.tags"
                  type="text"
                  placeholder="例如：恋爱, 校园, 治愈"
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">游戏介绍</label>
                <textarea 
                  v-model="formData.description"
                  rows="4"
                  placeholder="请输入游戏介绍"
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                ></textarea>
              </div>
              
              <div class="border-t border-gray-200 pt-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">详细信息</h3>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">开发商</label>
                    <input 
                      v-model="gameInfo.developer"
                      type="text"
                      placeholder="请输入开发商"
                      class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">发行商</label>
                    <input 
                      v-model="gameInfo.publisher"
                      type="text"
                      placeholder="请输入发行商"
                      class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div class="mt-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">支持平台</label>
                  <div class="flex flex-wrap gap-2">
                    <label 
                      v-for="platform in platformOptions" 
                      :key="platform"
                      class="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer"
                      :class="gameInfo.platforms.includes(platform) ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-gray-200 hover:border-gray-300'"
                    >
                      <input 
                        type="checkbox" 
                        :checked="gameInfo.platforms.includes(platform)"
                        @change="(e: any) => {
                          const checked = e.target.checked;
                          if (checked) gameInfo.platforms.push(platform);
                          else gameInfo.platforms = gameInfo.platforms.filter(p => p !== platform);
                        }"
                        class="sr-only"
                      />
                      {{ platform }}
                    </label>
                  </div>
                </div>
                
                <div class="mt-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">支持语言</label>
                  <div class="flex flex-wrap gap-2">
                    <label 
                      v-for="lang in languageOptions" 
                      :key="lang"
                      class="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer"
                      :class="gameInfo.languages.includes(lang) ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-gray-200 hover:border-gray-300'"
                    >
                      <input 
                        type="checkbox" 
                        :checked="gameInfo.languages.includes(lang)"
                        @change="(e: any) => {
                          const checked = e.target.checked;
                          if (checked) gameInfo.languages.push(lang);
                          else gameInfo.languages = gameInfo.languages.filter(l => l !== lang);
                        }"
                        class="sr-only"
                      />
                      {{ lang }}
                    </label>
                  </div>
                </div>
                
                <div class="mt-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">系统要求</label>
                  <input 
                    v-model="gameInfo.requirements"
                    type="text"
                    placeholder="例如：Android 8.0+ / Windows 10+, 4GB RAM"
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
            
            <div v-if="activeTab === 'resources'" class="space-y-6">
              <div 
                v-for="(resource, index) in resources" 
                :key="resource.id"
                class="border border-gray-200 rounded-xl p-4 space-y-4"
              >
                <div class="flex items-center justify-between">
                  <span class="font-medium text-gray-700">资源 {{ index + 1 }}</span>
                  <button 
                    v-if="resources.length > 1"
                    @click="removeResource(index)"
                    class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 class="w-5 h-5" />
                  </button>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">资源名称</label>
                    <input 
                      v-model="resource.name"
                      type="text"
                      placeholder="例如：完整版游戏本体"
                      class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">资源类型</label>
                    <select 
                      v-model="resource.type"
                      class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="main">游戏本体</option>
                      <option value="patch">汉化补丁</option>
                      <option value="update">更新包</option>
                    </select>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">下载链接</label>
                    <input 
                      v-model="resource.url"
                      type="text"
                      placeholder="请输入下载链接"
                      class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">大小</label>
                    <input 
                      v-model="resource.size"
                      type="text"
                      placeholder="例如：2.5GB"
                      class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">发布日期</label>
                  <input 
                    v-model="resource.date"
                    type="date"
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <button 
                @click="addResource"
                class="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 transition-colors text-gray-500 hover:text-purple-600"
              >
                <Plus class="w-5 h-5" />
                添加资源链接
              </button>
            </div>
            
            <div v-if="activeTab === 'comments'" class="space-y-6">
              <div 
                v-for="(comment, index) in comments" 
                :key="comment.id"
                class="border border-gray-200 rounded-xl p-4 space-y-4"
              >
                <div class="flex items-center justify-between">
                  <span class="font-medium text-gray-700">评论 {{ index + 1 }}</span>
                  <button 
                    v-if="comments.length > 1"
                    @click="removeComment(index)"
                    class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 class="w-5 h-5" />
                  </button>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
                    <input 
                      v-model="comment.user"
                      type="text"
                      placeholder="请输入用户名"
                      class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">头像URL</label>
                    <input 
                      v-model="comment.avatar"
                      type="text"
                      placeholder="请输入头像URL"
                      class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">评论内容</label>
                  <textarea 
                    v-model="comment.content"
                    rows="3"
                    placeholder="请输入评论内容"
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  ></textarea>
                </div>
                
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">评分</label>
                    <input 
                      v-model.number="comment.rating"
                      type="number"
                      min="1"
                      max="5"
                      class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">发布日期</label>
                    <input 
                      v-model="comment.date"
                      type="text"
                      placeholder="例如：2天前"
                      class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">点赞数</label>
                    <input 
                      v-model.number="comment.likes"
                      type="number"
                      min="0"
                      class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
              
              <button 
                @click="addComment"
                class="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 transition-colors text-gray-500 hover:text-purple-600"
              >
                <Plus class="w-5 h-5" />
                添加评论
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>