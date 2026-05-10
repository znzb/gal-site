<script setup lang="ts">import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Gamepad2, LayoutDashboard, Settings, LogOut, Plus, Search, Edit2, Trash2 } from 'lucide-vue-next';
import { gameApi, type Game } from '@/api/api';
const router = useRouter();
const games = ref<Game[]>([]);
const searchQuery = ref('');
const isLoading = ref(true);
const loadGames = async () => {
 isLoading.value = true;
 try {
 const data = await gameApi.getAllGames();
 games.value = data;
 }
 catch (error) {
 console.error('Failed to load games:', error);
 }
 finally {
 isLoading.value = false;
 }
};
const filteredGames = () => {
 if (!searchQuery.value)
 return games.value;
 return games.value.filter(game => game.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
 game.category.toLowerCase().includes(searchQuery.value.toLowerCase()));
};
const goToEdit = (gameId: string) => {
 router.push(`/admin/game/${gameId}`);
};
const deleteGame = async (gameId: string) => {
 if (confirm('确定要删除这个游戏吗？')) {
 await gameApi.deleteGame(gameId);
 loadGames();
 }
};
const addGame = () => {
 router.push('/admin/game/new');
};
loadGames();
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <aside class="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg z-50">
      <div class="p-6 border-b border-gray-200">
        <h1 class="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Gamepad2 class="w-6 h-6 text-purple-600" />
          游戏管理系统
        </h1>
      </div>
      
      <nav class="p-4 space-y-2">
        <button 
          class="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 text-purple-600 rounded-lg font-medium"
        >
          <LayoutDashboard class="w-5 h-5" />
          控制台
        </button>
        <button 
          @click="addGame"
          class="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Plus class="w-5 h-5" />
          添加游戏
        </button>
        <button 
          class="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Settings class="w-5 h-5" />
          系统设置
        </button>
        <button 
          class="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <LogOut class="w-5 h-5" />
          退出登录
        </button>
      </nav>
    </aside>
    
    <main class="ml-64 p-8">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-gray-800">游戏列表</h2>
        <button 
          @click="addGame"
          class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus class="w-5 h-5" />
          添加新游戏
        </button>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="relative mb-6">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="搜索游戏名称或分类..."
            class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div v-if="isLoading" class="text-center py-12">
          <div class="w-10 h-10 border-3 border-gray-300 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
          <p class="mt-4 text-gray-500">加载中...</p>
        </div>
        
        <table v-else class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 font-medium text-gray-600">游戏封面</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">游戏名称</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">分类</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">大小</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">下载量</th>
              <th class="text-left py-3 px-4 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="game in filteredGames()" 
              :key="game.id" 
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="py-4 px-4">
                <img :src="game.cover" :alt="game.name" class="w-12 h-16 object-cover rounded-lg" />
              </td>
              <td class="py-4 px-4">
                <span class="font-medium text-gray-800">{{ game.name }}</span>
              </td>
              <td class="py-4 px-4">
                <span class="text-sm text-gray-600">{{ game.category }}</span>
              </td>
              <td class="py-4 px-4">
                <span class="text-sm text-gray-600">{{ game.size }}</span>
              </td>
              <td class="py-4 px-4">
                <span class="text-sm text-gray-600">{{ game.downloads.toLocaleString() }}</span>
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center gap-2">
                  <button 
                    @click="goToEdit(game.id)"
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <Edit2 class="w-5 h-5" />
                  </button>
                  <button 
                    @click="deleteGame(game.id)"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="!isLoading && filteredGames().length === 0" class="text-center py-12">
          <p class="text-gray-500">没有找到游戏</p>
        </div>
      </div>
    </main>
  </div>
</template>