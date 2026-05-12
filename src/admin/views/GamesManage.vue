<template>
  <div class="games-manage">
    <div class="header">
      <h1>🎮 游戏管理</h1>
      <button @click="showAddModal = true" class="add-btn">+ 添加游戏</button>
    </div>

    <div class="filters">
      <input v-model="searchQuery" placeholder="搜索游戏..." class="search-input" />
      <select v-model="filterCategory">
        <option value="">所有分类</option>
        <option v-for="cat in categories" :key="cat._id" :value="cat.name">
          {{ cat.name }}
        </option>
      </select>
      <select v-model="filterSubCategory">
        <option value="">全部类型</option>
        <option value="raw">🍖 生肉</option>
        <option value="cooked">🍳 熟肉</option>
      </select>
    </div>

    <div class="games-table">
      <table>
        <thead>
          <tr>
            <th>封面</th>
            <th>游戏名称</th>
            <th>分类</th>
            <th>类型</th>
            <th>大小</th>
            <th>下载量</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="game in filteredGames" :key="game._id">
            <td><img :src="game.cover" class="game-cover-small" /></td>
            <td>{{ game.name }}</td>
            <td><span class="category-tag">{{ game.category }}</span></td>
            <td>
              <span v-if="game.subCategory === 'raw'" class="subcategory-tag raw">🍖 生肉</span>
              <span v-else-if="game.subCategory === 'cooked'" class="subcategory-tag cooked">🍳 熟肉</span>
              <span v-else class="subcategory-tag none">-</span>
            </td>
            <td>{{ game.size }}</td>
            <td>{{ game.downloads }}</td>
            <td class="actions">
              <button @click="editGame(game)" class="edit-btn">编辑</button>
              <button @click="deleteGame(game)" class="delete-btn">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal" @click.stop>
        <h2>{{ editingGame ? '编辑游戏' : '添加游戏' }}</h2>
        
        <div class="tabs">
          <button 
            @click="activeTab = 'info'" 
            :class="['tab-btn', activeTab === 'info' ? 'active' : '']"
          >
            📝 游戏信息
          </button>
          <button 
            @click="activeTab = 'resources'" 
            :class="['tab-btn', activeTab === 'resources' ? 'active' : '']"
          >
            🔗 资源链接
          </button>
          <button 
            @click="activeTab = 'comments'" 
            :class="['tab-btn', activeTab === 'comments' ? 'active' : '']"
          >
            💬 游戏评论
          </button>
        </div>

        <form @submit.prevent="saveGame">
          <div v-show="activeTab === 'info'">
            <div class="form-group">
              <label>游戏名称</label>
              <input v-model="gameForm.name" required />
            </div>
            <div class="form-group">
              <label>分类</label>
              <select v-model="gameForm.category">
                <option value="">请选择分类</option>
                <option v-for="cat in filteredCategories" :key="cat._id" :value="cat.name">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>类型 (生肉/熟肉)</label>
              <select v-model="gameForm.subCategory">
                <option value="">无</option>
                <option value="raw">🍖 生肉 (未汉化)</option>
                <option value="cooked">🍳 熟肉 (已汉化)</option>
              </select>
            </div>
            <div class="form-group">
              <label>支持平台 (可多选)</label>
              <div class="platform-checkboxes">
                <label class="platform-checkbox">
                  <input 
                    type="checkbox" 
                    :checked="gameForm.platforms.includes('Android')" 
                    @change="togglePlatform('Android')"
                  />
                  <span>📱 安卓</span>
                </label>
                <label class="platform-checkbox">
                  <input 
                    type="checkbox" 
                    :checked="gameForm.platforms.includes('PC')" 
                    @change="togglePlatform('PC')"
                  />
                  <span>🖥️ PC</span>
                </label>
                <label class="platform-checkbox">
                  <input 
                    type="checkbox" 
                    :checked="gameForm.platforms.includes('KR')" 
                    @change="togglePlatform('KR')"
                  />
                  <span>🇰🇷 KR</span>
                </label>
              </div>
            </div>
            <div class="form-group">
              <label>
                <input 
                  type="checkbox" 
                  v-model="gameForm.isYuzusoft"
                />
                <span>🎵 柚子社</span>
              </label>
            </div>
            <div class="form-group">
              <label>封面图片URL</label>
              <input v-model="gameForm.cover" required />
            </div>
            <div class="form-group">
              <label>描述</label>
              <textarea v-model="gameForm.description" rows="4" required></textarea>
            </div>
            <div class="form-group">
              <label>大小</label>
              <input v-model="gameForm.size" required />
            </div>
            <div class="form-group">
              <label>发布日期</label>
              <input v-model="gameForm.releaseDate" type="date" required />
            </div>
            <div class="form-group">
              <label>标签 (逗号分隔)</label>
              <input v-model="gameForm.tagsInput" placeholder="例如: 恋爱,校园,治愈" />
            </div>
          </div>

          <div v-show="activeTab === 'resources'">
            <div v-for="(resource, index) in gameForm.resources" :key="index" class="resource-item">
              <div class="resource-header">
                <span>资源 {{ index + 1 }}</span>
                <button v-if="gameForm.resources.length > 1" @click="removeResource(index)" class="remove-btn">×</button>
              </div>
              <div class="resource-fields">
                <div class="form-group">
                  <label>资源名称</label>
                  <input v-model="resource.name" placeholder="例如: 完整版游戏本体" />
                </div>
                <div class="form-group">
                  <label>资源类型</label>
                  <select v-model="resource.type">
                    <option value="main">🎮 游戏本体</option>
                    <option value="patch">📦 汉化补丁</option>
                    <option value="update">🔄 更新包</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>支持语言</label>
                  <select v-model="resource.language">
                    <option value="简体中文">简体中文</option>
                    <option value="繁体中文">繁体中文</option>
                    <option value="日文">日文</option>
                    <option value="英文">英文</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>下载链接</label>
                  <input v-model="resource.url" placeholder="请输入下载链接" />
                </div>
                <div class="form-group">
                  <label>大小</label>
                  <input v-model="resource.size" placeholder="例如: 2.5GB" />
                </div>
                <div class="form-group">
                  <label>发布日期（显示格式）</label>
                  <input v-model="resource.dateDisplay" placeholder="例如: 3天前" />
                </div>
                <div class="form-group">
                  <label>发布者用户名</label>
                  <input v-model="resource.authorName" placeholder="例如: 愚者" />
                </div>
                <div class="form-group">
                  <label>发布者头像URL</label>
                  <input v-model="resource.authorAvatar" placeholder="请输入头像URL" />
                </div>
                <div class="form-group">
                  <label>已发布资源数量</label>
                  <input v-model.number="resource.authorResources" type="number" placeholder="例如: 198" />
                </div>
              </div>
            </div>
            <button type="button" @click="addResource" class="add-resource-btn">+ 添加资源</button>
          </div>

          <div v-show="activeTab === 'comments'">
            <div v-for="(comment, index) in gameForm.comments" :key="index" class="comment-item">
              <div class="comment-header">
                <span>评论 {{ index + 1 }}</span>
                <button v-if="gameForm.comments.length > 1" @click="removeComment(index)" class="remove-btn">×</button>
              </div>
              <div class="comment-fields">
                <div class="form-group">
                  <label>用户名</label>
                  <input v-model="comment.user" placeholder="请输入用户名" />
                </div>
                <div class="form-group">
                  <label>头像URL</label>
                  <input v-model="comment.avatar" placeholder="请输入头像URL" />
                </div>
                <div class="form-group">
                  <label>评论内容</label>
                  <textarea v-model="comment.content" rows="3" placeholder="请输入评论内容"></textarea>
                </div>
                <div class="form-group">
                  <label>评分 (1-5)</label>
                  <input v-model.number="comment.rating" type="number" min="1" max="5" />
                </div>
                <div class="form-group">
                  <label>发布日期</label>
                  <input v-model="comment.date" placeholder="例如: 2天前" />
                </div>
                <div class="form-group">
                  <label>点赞数</label>
                  <input v-model.number="comment.likes" type="number" min="0" />
                </div>
              </div>
            </div>
            <button type="button" @click="addComment" class="add-comment-btn">+ 添加评论</button>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showAddModal = false">取消</button>
            <button type="submit">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { request } from '../api';
import { useGameStore } from '@/store/gameStore';

const games = ref([]);
const categories = ref([]);
const searchQuery = ref('');
const { setResources, setComments } = useGameStore();
const filterCategory = ref('');
const filterSubCategory = ref('');

const filteredCategories = computed(() => {
  return categories.value.filter(cat => 
    cat.name !== 'PC资源' && cat.name !== 'Gal游戏' && cat.name !== 'pc资源' && cat.name !== 'gal游戏'
  );
});
const showAddModal = ref(false);
const editingGame = ref(null);

const activeTab = ref('info');

const gameForm = ref({
  name: '',
  category: '',
  subCategory: '',
  isYuzusoft: false,
  cover: '',
  description: '',
  size: '',
  releaseDate: '',
  tagsInput: '',
  platforms: ['Android'],
  resources: [{
    name: '',
    type: 'main',
    language: '简体中文',
    url: '',
    size: '',
    date: '',
    dateDisplay: '3天前',
    authorName: '愚者',
    authorAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar%20boy%20white%20hair&image_size=square',
    authorResources: 198
  }],
  comments: [{
    user: '',
    avatar: '',
    content: '',
    rating: 5,
    date: '',
    likes: 0
  }]
});

const filteredGames = computed(() => {
  return games.value.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = !filterCategory.value || game.category === filterCategory.value;
    const matchesSubCategory = !filterSubCategory.value || game.subCategory === filterSubCategory.value;
    return matchesSearch && matchesCategory && matchesSubCategory;
  });
});

onMounted(async () => {
  await loadGames();
  await loadCategories();
});

async function loadGames() {
  games.value = await request('/admin/games');
}

async function loadCategories() {
  categories.value = await request('/categories');
}

function editGame(game) {
  editingGame.value = game;
  
  gameForm.value = {
    name: game.name,
    category: game.category,
    subCategory: game.subCategory || '',
    isYuzusoft: game.isYuzusoft || false,
    cover: game.cover,
    description: game.description,
    size: game.size,
    releaseDate: game.releaseDate,
    tagsInput: game.tags?.join(', ') || '',
    platforms: game.platforms || ['Android'],
    resources: game.resources && game.resources.length > 0 ? game.resources.map(r => ({
      id: r.id,
      name: r.name || '',
      type: r.type || 'main',
      language: r.language || '简体中文',
      platform: r.platform || 'Android',
      url: r.url || '',
      size: r.size || '',
      date: r.date || '',
      dateDisplay: r.dateDisplay || '3天前',
      authorName: r.authorName || '愚者',
      authorAvatar: r.authorAvatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar%20boy%20white%20hair&image_size=square',
      authorResources: r.authorResources || 198
    })) : [{
      name: '',
      type: 'main',
      language: '简体中文',
      platform: 'Android',
      url: '',
      size: '',
      date: '',
      dateDisplay: '3天前',
      authorName: '愚者',
      authorAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar%20boy%20white%20hair&image_size=square',
      authorResources: 198
    }],
    comments: game.comments && game.comments.length > 0 ? game.comments.map(c => ({
      id: c.id,
      user: c.user || '',
      avatar: c.avatar || '',
      content: c.content || '',
      rating: c.rating || 5,
      date: c.date || '',
      likes: c.likes || 0
    })) : [{
      user: '',
      avatar: '',
      content: '',
      rating: 5,
      date: '',
      likes: 0
    }]
  };
  showAddModal.value = true;
}

async function saveGame() {
  const resources = gameForm.value.resources.filter(r => r.name && r.url);
  const comments = gameForm.value.comments.filter(c => c.user && c.content);
  
  const platforms = gameForm.value.platforms;
  let categories = [];
  let primaryCategory = 'Gal游戏';
  
  // 完全根据平台选择来设置分类
  if (platforms.includes('PC')) {
    categories.push('PC资源');
    primaryCategory = 'PC资源';
  }
  if (platforms.includes('Android') || platforms.includes('KR') || platforms.length > 1) {
    if (!categories.includes('Gal游戏')) {
      categories.push('Gal游戏');
    }
  }
  
  // 如果用户选择了其他分类，也加进去
  if (gameForm.value.category && !categories.includes(gameForm.value.category)) {
    categories.unshift(gameForm.value.category);
    primaryCategory = gameForm.value.category;
  }
  
  // 如果没有任何分类，默认 Gal游戏
  if (categories.length === 0) {
    categories = ['Gal游戏'];
  }
  
  // 确保分类名称统一为大写开头
  categories = categories.map(c => c.replace(/^pc资源$/, 'PC资源').replace(/^gal游戏$/, 'Gal游戏'));
  primaryCategory = primaryCategory.replace(/^pc资源$/, 'PC资源').replace(/^gal游戏$/, 'Gal游戏');
  
  const gameData = {
    ...gameForm.value,
    category: primaryCategory,
    categories,
    platforms,
    isYuzusoft: gameForm.value.isYuzusoft,
    tags: gameForm.value.tagsInput.split(',').map(t => t.trim()).filter(t => t),
    downloads: editingGame.value ? editingGame.value.downloads : 0,
    resources: resources.map(r => ({
      ...r,
      platform: platforms[0] || 'Android'
    })),
    comments
  };

  const gameId = editingGame.value?.id || editingGame.value?._id || Date.now().toString();
  
  setResources(gameId, resources);
  setComments(gameId, comments);

  if (editingGame.value) {
    await request('/admin/games/' + editingGame.value.id, {
      method: 'PUT',
      body: JSON.stringify(gameData)
    });
  } else {
    await request('/admin/games', {
      method: 'POST',
      body: JSON.stringify(gameData)
    });
  }

  showAddModal.value = false;
  editingGame.value = null;
  resetForm();
  await loadGames();
}

async function deleteGame(game) {
  if (confirm('确定要删除这个游戏吗?')) {
    await request('/admin/games/' + (game.id || game._id), { method: 'DELETE' });
    await loadGames();
  }
}

function addResource() {
  gameForm.value.resources.push({
    name: '',
    type: 'main',
    language: '简体中文',
    platform: 'Android',
    url: '',
    size: '',
    date: '',
    dateDisplay: '3天前',
    authorName: '愚者',
    authorAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar%20boy%20white%20hair&image_size=square',
    authorResources: 198
  });
}

function removeResource(index) {
  gameForm.value.resources.splice(index, 1);
}

function addComment() {
  gameForm.value.comments.push({
    user: '',
    avatar: '',
    content: '',
    rating: 5,
    date: '',
    likes: 0
  });
}

function removeComment(index) {
  gameForm.value.comments.splice(index, 1);
}

function togglePlatform(platform) {
  const index = gameForm.value.platforms.indexOf(platform);
  if (index > -1) {
    if (gameForm.value.platforms.length > 1) {
      gameForm.value.platforms.splice(index, 1);
    }
  } else {
    gameForm.value.platforms.push(platform);
  }
}

function resetForm() {
  gameForm.value = {
    name: '',
    category: '',
    subCategory: '',
    cover: '',
    description: '',
    size: '',
    releaseDate: '',
    tagsInput: '',
    platforms: ['Android'],
    resources: [{
      name: '',
      type: 'main',
      language: '简体中文',
      url: '',
      size: '',
      date: '',
      dateDisplay: '3天前',
      authorName: '愚者',
      authorAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar%20boy%20white%20hair&image_size=square',
      authorResources: 198
    }],
    comments: [{
      user: '',
      avatar: '',
      content: '',
      rating: 5,
      date: '',
      likes: 0
    }]
  };
  activeTab.value = 'info';
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.filters select {
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.games-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.game-cover-small {
  width: 50px;
  height: 70px;
  object-fit: cover;
  border-radius: 4px;
}

.category-tag {
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.subcategory-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.subcategory-tag.raw {
  background: #e74c3c;
  color: white;
}

.subcategory-tag.cooked {
  background: #27ae60;
  color: white;
}

.subcategory-tag.none {
  background: #e0e0e0;
  color: #666;
}

.actions {
  display: flex;
  gap: 8px;
}

.edit-btn {
  padding: 6px 12px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn {
  padding: 6px 12px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 6px 6px 0 0;
  transition: all 0.2s;
  font-weight: 500;
}

.tab-btn:hover {
  background: #f5f5f5;
}

.tab-btn.active {
  background: #667eea;
  color: white;
}

.resource-item, .comment-item {
  margin-bottom: 16px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.resource-header, .comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
}

.remove-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.add-resource-btn, .add-comment-btn {
  width: 100%;
  padding: 10px;
  border: 2px dashed #e0e0e0;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  color: #667eea;
  margin-top: 12px;
  transition: all 0.2s;
}

.add-resource-btn:hover, .add-comment-btn:hover {
  border-color: #667eea;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}

.platform-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.platform-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 16px;
}

.platform-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.modal-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.modal-actions button[type="submit"] {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    gap: 10px;
  }
  
  .search-bar input,
  .search-bar select,
  .add-btn {
    width: 100%;
  }
  
  .games-table {
    overflow-x: auto;
    display: block;
  }
  
  .games-table table {
    width: 100%;
    min-width: 600px;
  }
  
  .games-table th,
  .games-table td {
    padding: 10px 8px;
    font-size: 12px;
  }
  
  .subcategory-tag {
    padding: 2px 8px;
    font-size: 10px;
  }
  
  .actions {
    flex-direction: column;
    gap: 4px;
  }
  
  .edit-btn,
  .delete-btn {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  .modal {
    padding: 20px;
    margin: 10px;
    max-width: none;
    width: calc(100% - 20px);
    max-height: 95vh;
  }
  
  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 12px;
    font-size: 16px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-actions button {
    width: 100%;
    padding: 14px;
    font-size: 16px;
  }
}
</style>