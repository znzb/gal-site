<template>
  <div class="games-manage">
    <div class="header">
      <div>
        <h1>🎮 游戏管理</h1>
        <p class="page-subtitle">管理站点游戏资源，支持添加、编辑、删除</p>
      </div>
      <button @click="showAddModal = true" class="add-btn">+ 添加游戏</button>
      <button v-if="selectedIds.length > 0" @click="batchDelete" class="batch-delete-btn">
        🗑️ 批量删除 ({{ selectedIds.length }})
      </button>
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

    <div class="games-table desktop-only">
      <table>
        <thead>
          <tr>
            <th class="check-col"><input type="checkbox" :checked="allSelected" @change="toggleSelectAll" /></th>
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
            <td class="check-col"><input type="checkbox" :checked="selectedIds.includes(game.id)" @change="toggleSelect(game.id)" /></td>
            <td><img :src="game.cover" class="game-cover-small" /></td>
            <td>{{ game.name }}</td>
            <td><span class="category-tag">{{ game.category }}</span></td>
            <td>
              <span v-if="game.subCategory === 'raw'" class="subcategory-tag raw">🍖 生肉</span>
              <span v-else-if="game.subCategory === 'cooked'" class="subcategory-tag cooked">🍳 熟肉</span>
              <span v-else class="subcategory-tag none">-</span>
            </td>
            <td>{{ getDisplaySize(game) }}</td>
            <td>{{ game.downloads }}</td>
            <td class="actions">
              <button @click="editGame(game)" class="edit-btn">编辑</button>
              <button @click="deleteGame(game)" class="delete-btn">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="games-cards mobile-only">
      <div v-for="game in filteredGames" :key="game._id" class="game-card">
        <div class="game-card-main">
          <input type="checkbox" class="card-check" :checked="selectedIds.includes(game.id)" @change="toggleSelect(game.id)" />
          <img :src="game.cover" class="game-card-cover" />
          <div class="game-card-info">
            <h3 class="game-card-name">{{ game.name }}</h3>
            <div class="game-card-tags">
              <span class="category-tag">{{ game.category }}</span>
              <span v-if="game.subCategory === 'raw'" class="subcategory-tag raw">🍖 生肉</span>
              <span v-else-if="game.subCategory === 'cooked'" class="subcategory-tag cooked">🍳 熟肉</span>
            </div>
            <div class="game-card-meta">
              <span>📦 {{ getDisplaySize(game) }}</span>
              <span>⬇️ {{ game.downloads }}</span>
            </div>
          </div>
        </div>
        <div class="game-card-actions">
          <button @click="editGame(game)" class="edit-btn">编辑</button>
          <button @click="deleteGame(game)" class="delete-btn">删除</button>
        </div>
      </div>
      <div v-if="filteredGames.length === 0" class="empty-state">
        <span class="empty-emoji">🎮</span>
        <p>暂无游戏数据</p>
      </div>
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
              <label>游戏截图URL（每行一个，或用逗号/竖线分隔）</label>
              <textarea 
                v-model="gameForm.imagesInput" 
                rows="3" 
                placeholder="https://example.com/screen1.jpg&#10;https://example.com/screen2.jpg"
              ></textarea>
              <p class="field-hint">将在游戏详情页的"游戏截图"区域展示</p>
              <div v-if="gameForm.images.length > 0" class="image-preview-grid">
                <div v-for="(img, idx) in gameForm.images" :key="idx" class="image-preview-item">
                  <img :src="img" :alt="`截图${idx+1}`" />
                  <button type="button" @click="removeImage(idx)" class="remove-image-btn">×</button>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>描述</label>
              <textarea v-model="gameForm.description" rows="4" required></textarea>
            </div>
            <div class="form-group">
              <label>大小</label>
              <input v-model="gameForm.size" readonly placeholder="将自动同步为资源1的大小" />
              <p class="field-hint">自动同步资源链接中第一个资源的大小</p>
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
            <div v-if="gameForm.resources.length > 0" class="resource-count-info">
              已添加 <span class="count-num">{{ gameForm.resources.length }}</span> 个资源
            </div>
            <div v-for="(resource, index) in gameForm.resources" :key="resource.id || index" class="resource-item">
              <div class="resource-header">
                <span>资源 {{ index + 1 }}<span v-if="resource.name" class="resource-name-inline"> · {{ resource.name }}</span></span>
                <button v-if="gameForm.resources.length > 1" @click="removeResource(index)" class="remove-btn">×</button>
              </div>
              <div class="resource-fields">
                <div class="form-group">
                  <label>资源名称 <span class="required">*</span></label>
                  <input v-model="resource.name" placeholder="例如: 完整版游戏本体" />
                  <p v-if="!resource.name && resource._touched" class="field-error">请输入资源名称</p>
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
                  <label>下载链接 <span class="required">*</span></label>
                  <input v-model="resource.url" placeholder="请输入下载链接" />
                  <p v-if="!resource.url && resource._touched" class="field-error">请输入下载链接</p>
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
            <p v-if="invalidResources.length > 0" class="validation-hint">
              ⚠️ 有 {{ invalidResources.length }} 个资源缺少名称或链接，保存时会被跳过
            </p>
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
import { ref, computed, onMounted, watch } from 'vue';
import { request } from '../api';
import { useGameStore } from '@/store/gameStore';

const games = ref([]);
const categories = ref([]);
const searchQuery = ref('');
const selectedIds = ref([]);
const { setResources, setComments } = useGameStore();
const filterCategory = ref('');
const filterSubCategory = ref('');

const filteredCategories = computed(() => {
  return categories.value.filter(cat => 
    cat.name !== 'PC资源' && cat.name !== 'Gal游戏' && 
    cat.name !== 'pc资源' && cat.name !== 'gal游戏' &&
    cat.name !== '新人必读'
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
  imagesInput: '',
  images: [],
  description: '',
  size: '',
  releaseDate: '',
  tagsInput: '',
  platforms: ['Android'],
  resources: [{
    id: genResourceId(),
    _touched: false,
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

// 游戏大小兜底：优先 game.size，无效则取第一个资源的大小
function getDisplaySize(game) {
  const s = game?.size;
  if (s && s !== '0MB' && s !== '0' && s.trim() !== '') return s;
  return game?.resources?.[0]?.size || s || '0MB';
}

const allSelected = computed(() => {
  return filteredGames.value.length > 0 &&
    filteredGames.value.every(g => selectedIds.value.includes(g.id));
});

// 统计无效资源（缺少名称或链接）
const invalidResources = computed(() => {
  return gameForm.value.resources.filter(r => !r.name || !r.url);
});

// 为每个资源生成唯一 id
function genResourceId() {
  return 'res_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

// 解析截图URL
function parseImages(input) {
  if (!input) return [];
  return input.split(/[\n,，|;；]/).map(s => s.trim()).filter(s => s);
}

// 监听截图输入变化，实时更新预览
watch(() => gameForm.value.imagesInput, (val) => {
  gameForm.value.images = parseImages(val);
});

// 游戏大小自动同步为第一个资源的大小
const firstResourceSize = computed(() => gameForm.value.resources[0]?.size || '');
watch(firstResourceSize, (val) => {
  gameForm.value.size = val;
}, { immediate: true });

// 移除单个截图
function removeImage(index) {
  gameForm.value.images.splice(index, 1);
  gameForm.value.imagesInput = gameForm.value.images.join('\n');
}

onMounted(async () => {
  await loadGames();
  await loadCategories();
});

async function loadGames() {
  games.value = await request('/admin/games');
  selectedIds.value = [];
}

function toggleSelect(id) {
  const idx = selectedIds.value.indexOf(id);
  if (idx >= 0) selectedIds.value.splice(idx, 1);
  else selectedIds.value.push(id);
}

function toggleSelectAll(e) {
  if (e.target.checked) {
    selectedIds.value = filteredGames.value.map(g => g.id);
  } else {
    selectedIds.value = [];
  }
}

async function batchDelete() {
  if (!confirm(`确定要删除选中的 ${selectedIds.value.length} 个游戏吗？此操作不可恢复！`)) return;
  await request('/admin/games/batch', {
    method: 'DELETE',
    body: JSON.stringify({ ids: selectedIds.value })
  });
  selectedIds.value = [];
  await loadGames();
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
    imagesInput: (game.images || []).join('\n'),
    images: game.images || [],
    description: game.description,
    size: game.size,
    releaseDate: game.releaseDate,
    tagsInput: game.tags?.join(', ') || '',
    platforms: game.platforms || ['Android'],
    resources: game.resources && game.resources.length > 0 ? game.resources.map(r => ({
      id: r.id || genResourceId(),
      _touched: true,
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
      id: genResourceId(),
      _touched: false,
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
    name: gameForm.value.name,
    category: primaryCategory,
    categories,
    platforms,
    isYuzusoft: gameForm.value.isYuzusoft,
    subCategory: gameForm.value.subCategory,
    cover: gameForm.value.cover,
    images: parseImages(gameForm.value.imagesInput),
    description: gameForm.value.description,
    size: gameForm.value.size,
    releaseDate: gameForm.value.releaseDate,
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
    id: genResourceId(),
    _touched: false,
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
    isYuzusoft: false,
    cover: '',
    imagesInput: '',
    images: [],
    description: '',
    size: '',
    releaseDate: '',
    tagsInput: '',
    platforms: ['Android'],
    resources: [{
      id: genResourceId(),
      _touched: false,
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
  align-items: flex-end;
  margin-bottom: 22px;
}

.header h1 {
  margin: 0 0 4px 0;
  font-size: 22px;
  font-weight: 700;
  color: #1f1f36;
}

.page-subtitle {
  margin: 0;
  color: #8a86a0;
  font-size: 13px;
}

.add-btn {
  padding: 10px 22px;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44fff 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 14px rgba(196, 79, 255, 0.35);
  transition: all 0.25s;
}

.batch-delete-btn {
  padding: 10px 22px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.25s;
}
.batch-delete-btn:hover { opacity: 0.9; }

.check-col { width: 40px; text-align: center; }
.check-col input[type="checkbox"],
.card-check {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #c44fff;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(196, 79, 255, 0.45);
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
}

.search-input {
  flex: 1;
  padding: 11px 14px;
  border: 1.5px solid #f0ecf4;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #c44fff;
  box-shadow: 0 0 0 4px rgba(196, 79, 255, 0.08);
}

.filters select {
  padding: 11px 14px;
  border: 1.5px solid #f0ecf4;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  transition: all 0.2s;
}

.filters select:focus {
  outline: none;
  border-color: #c44fff;
}

.games-table {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.03);
}

.desktop-only { display: block !important; }
.mobile-only { display: none !important; }

.games-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.game-card {
  background: white;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.03);
}

.game-card-main {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.game-card-cover {
  width: 60px;
  height: 84px;
  object-fit: cover;
  border-radius: 10px;
  flex-shrink: 0;
}

.game-card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.game-card-name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #1f1f36;
  line-height: 1.3;
}

.game-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.game-card-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #8a86a0;
}

.game-card-actions {
  display: flex;
  gap: 8px;
}

.game-card-actions .edit-btn,
.game-card-actions .delete-btn {
  flex: 1;
  padding: 9px;
  font-size: 14px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #faf7fc;
}

th {
  padding: 14px 14px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  color: #6b6680;
  border-bottom: 1px solid #f0ecf4;
}

td {
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid #f5f3f8;
  vertical-align: middle;
  height: auto;
  display: table-cell;
  font-size: 14px;
  color: #1f1f36;
}

tbody tr {
  transition: background 0.2s;
}

tbody tr:hover {
  background: #faf7fc;
}

.game-cover-small {
  width: 46px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
}

.category-tag {
  background: linear-gradient(135deg, #ff6b9d 0%, #c44fff 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.subcategory-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.subcategory-tag.raw {
  background: #fff0f0;
  color: #e74c3c;
  border: 1px solid #ffd4d4;
}

.subcategory-tag.cooked {
  background: #f0fff7;
  color: #27ae60;
  border: 1px solid #c8f0d8;
}

.subcategory-tag.none {
  background: #f5f3f8;
  color: #8a86a0;
  border: 1px solid #e0dff0;
}

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
}

.edit-btn {
  padding: 6px 14px;
  background: linear-gradient(135deg, #5b7cfa 0%, #8a5bfa 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.edit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(91, 124, 250, 0.3);
}

.delete-btn {
  padding: 6px 14px;
  background: #ff5a6b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.delete-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 90, 107, 0.3);
}

.tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 22px;
  border-bottom: 2px solid #f0ecf4;
  padding-bottom: 0;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 10px 10px 0 0;
  transition: all 0.2s;
  font-weight: 500;
  font-size: 14px;
  color: #8a86a0;
  position: relative;
}

.tab-btn:hover {
  color: #c44fff;
  background: #faf7fc;
}

.tab-btn.active {
  color: #c44fff;
  font-weight: 600;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 20%;
  right: 20%;
  height: 2px;
  background: linear-gradient(90deg, #ff6b9d, #c44fff);
  border-radius: 2px;
}

.resource-item, .comment-item {
  margin-bottom: 16px;
  padding: 14px;
  background: #faf7fc;
  border-radius: 12px;
  border: 1px solid #f0ecf4;
}

.resource-count-info {
  padding: 10px 14px;
  background: linear-gradient(135deg, #fff0f7 0%, #f5eaff 100%);
  border-radius: 10px;
  font-size: 13px;
  color: #6b6680;
  margin-bottom: 14px;
  border: 1px solid #f0e0f0;
}

.count-num {
  font-weight: 700;
  font-size: 16px;
  color: #c44fff;
  margin: 0 2px;
}

.resource-name-inline {
  color: #c44fff;
  font-weight: 500;
  margin-left: 4px;
}

.required {
  color: #ff5a6b;
  font-weight: 700;
}

.field-error {
  color: #ff5a6b;
  font-size: 12px;
  margin: 4px 0 0 0;
}

.field-hint {
  color: #8a86a0;
  font-size: 12px;
  margin: 4px 0 0 0;
}

.image-preview-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.image-preview-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #f0ecf4;
}

.image-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 22px;
  height: 22px;
  border: none;
  background: rgba(0,0,0,0.6);
  color: white;
  border-radius: 50%;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-image-btn:hover {
  background: #ff5a6b;
  transform: scale(1.1);
}

.validation-hint {
  margin: 12px 0 0 0;
  padding: 10px 14px;
  background: #fff8e1;
  border: 1px solid #ffe082;
  border-radius: 10px;
  color: #f57f17;
  font-size: 13px;
}

.resource-header, .comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
  font-size: 14px;
  color: #1f1f36;
}

.remove-btn {
  width: 26px;
  height: 26px;
  border: none;
  background: #ff5a6b;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  transition: all 0.2s;
}

.remove-btn:hover {
  transform: scale(1.1);
}

.add-resource-btn, .add-comment-btn {
  width: 100%;
  padding: 14px;
  border: 2px dashed #c44fff;
  background: linear-gradient(135deg, rgba(255,107,157,0.04) 0%, rgba(196,79,255,0.04) 100%);
  border-radius: 12px;
  cursor: pointer;
  color: #c44fff;
  margin-top: 12px;
  transition: all 0.25s;
  font-weight: 600;
  font-size: 14px;
}

.add-resource-btn:hover, .add-comment-btn:hover {
  border-color: #c44fff;
  background: linear-gradient(135deg, rgba(255,107,157,0.08) 0%, rgba(196,79,255,0.08) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(196, 79, 255, 0.15);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(30, 20, 50, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: white;
  padding: 28px;
  border-radius: 20px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 80px rgba(30, 20, 50, 0.25);
}

.modal h2 {
  margin: 0 0 22px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f1f36;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 13px;
  color: #6b6680;
}

.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #f0ecf4;
  border-radius: 10px;
  font-size: 14px;
  background: #faf7fc;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  outline: none;
  border-color: #c44fff;
  background: white;
  box-shadow: 0 0 0 4px rgba(196, 79, 255, 0.08);
}

.form-group input[readonly] {
  background: #f5f0fa;
  cursor: default;
  color: #6b6680;
}

.platform-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.platform-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
}

.platform-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #c44fff;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid #f0ecf4;
}

.modal-actions button {
  padding: 10px 22px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
}

.modal-actions button:first-child {
  background: #f5f3f8;
  color: #6b6680;
}

.modal-actions button:first-child:hover {
  background: #e8e5f0;
}

.modal-actions button[type="submit"] {
  background: linear-gradient(135deg, #ff6b9d 0%, #c44fff 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(196, 79, 255, 0.35);
}

.modal-actions button[type="submit"]:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(196, 79, 255, 0.45);
}

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: flex !important; }
  
  .header {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }
  
  .header h1 {
    font-size: 20px;
  }
  
  .page-subtitle {
    font-size: 12px;
  }
  
  .add-btn {
    width: 100%;
  }
  
  .filters {
    flex-direction: column;
    gap: 10px;
  }
  
  .filters select {
    width: 100%;
  }
  
  .modal {
    padding: 20px;
    border-radius: 16px;
  }
  
  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 12px;
  }
  
  .modal-actions {
    flex-direction: column-reverse;
  }
  
  .modal-actions button {
    width: 100%;
    padding: 12px;
  }
}
</style>