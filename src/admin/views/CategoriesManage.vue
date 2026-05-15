<template>
  <div class="categories-manage">
    <div class="header">
      <h1>📁 分类管理</h1>
      <button @click="showAddModal = true" class="add-btn">+ 添加分类</button>
    </div>

    <div v-if="selectedCategory" class="category-detail">
      <div class="detail-header">
        <button @click="selectedCategory = null" class="back-btn">← 返回</button>
        <h2>{{ selectedCategory.name }} - {{ selectedCategory.name === '新人必读' ? '帮助中心内容' : '游戏列表' }}</h2>
        <button 
          v-if="selectedCategory.name !== '新人必读'" 
          @click="showAddGameModal = true" 
          class="add-game-btn"
        >+ 添加游戏</button>
        <button 
          v-else 
          @click="showAddFaqModal = true" 
          class="add-game-btn"
        >+ 添加常见问题</button>
      </div>

      <div v-if="selectedCategory.name !== '新人必读'" class="games-table">
        <table>
          <thead>
            <tr>
              <th>封面</th>
              <th>游戏名称</th>
              <th>大小</th>
              <th>下载量</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="game in categoryGames" :key="game._id">
              <td><img :src="game.cover" class="game-cover-small" /></td>
              <td>{{ game.name }}</td>
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

      <div v-else class="faq-table">
        <table>
          <thead>
            <tr>
              <th>问题</th>
              <th>答案</th>
              <th>排序</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="faq in faqs" :key="faq._id">
              <td>{{ faq.question }}</td>
              <td class="answer-cell">{{ faq.answer }}</td>
              <td>{{ faq.order }}</td>
              <td class="actions">
                <button @click="editFaq(faq)" class="edit-btn">编辑</button>
                <button @click="deleteFaq(faq)" class="delete-btn">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="categories-grid">
      <div 
        v-for="(cat, index) in categories" 
        :key="cat._id" 
        class="category-card" 
        @click="viewCategory(cat)"
        draggable="true"
        @dragstart="onDragStart($event, index)"
        @dragover.prevent="onDragOver($event)"
        @drop="onDrop($event, index)"
      >
        <div class="drag-handle">⇅</div>
        <div class="category-icon">{{ cat.icon || '📁' }}</div>
        <h3>{{ cat.name }}</h3>
        <p class="game-count">{{ getGameCount(cat.name) }} 个游戏</p>
        <div class="category-actions">
          <button @click.stop="editCategory(cat)" class="edit-btn">编辑</button>
          <button @click.stop="deleteCategory(cat)" class="delete-btn">删除</button>
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal" @click.stop>
        <h2>{{ editingCategory ? '编辑分类' : '添加分类' }}</h2>
        <form @submit.prevent="saveCategory">
          <div class="form-group">
            <label>分类名称</label>
            <input v-model="categoryForm.name" required />
          </div>
          <div class="form-group">
            <label>图标 (emoji)</label>
            <input v-model="categoryForm.icon" placeholder="例如: 🎮" />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddModal = false">取消</button>
            <button type="submit">保存</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showAddGameModal" class="modal-overlay" @click.self="showAddGameModal = false">
      <div class="modal" @click.stop>
        <h2>{{ editingGameItem ? '编辑游戏' : '添加游戏' }}</h2>
        
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
                <option v-for="cat in categories" :key="cat._id" :value="cat.name">
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
                  :checked="gameForm.platforms.includes('柚子社')"
                  @change="togglePlatform('柚子社')"
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
                  <input v-model="resource.author" placeholder="例如: 愚者" />
                </div>
                <div class="form-group">
                  <label>发布者头像URL</label>
                  <input v-model="resource.authorAvatar" placeholder="请输入头像URL" />
                </div>
                <div class="form-group">
                  <label>已发布资源数量</label>
                  <input v-model.number="resource.authorCount" type="number" placeholder="例如: 198" />
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
            <button type="button" @click="showAddGameModal = false">取消</button>
            <button type="submit" :disabled="isSaving">{{ isSaving ? '保存中...' : '保存' }}</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showAddFaqModal" class="modal-overlay" @click.self="showAddFaqModal = false">
      <div class="modal" @click.stop>
        <h2>{{ editingFaq ? '编辑常见问题' : '添加常见问题' }}</h2>
        <form @submit.prevent="saveFaq">
          <div class="form-group">
            <label>问题</label>
            <input v-model="faqForm.question" required placeholder="请输入问题" />
          </div>
          <div class="form-group">
            <label>答案</label>
            <textarea v-model="faqForm.answer" rows="4" required placeholder="请输入答案"></textarea>
          </div>
          <div class="form-group">
            <label>排序</label>
            <input v-model.number="faqForm.order" type="number" min="0" placeholder="排序数字" />
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeFaqModal">取消</button>
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

const categories = ref([]);
const games = ref([]);
const faqs = ref([]);
const showAddModal = ref(false);
const showAddGameModal = ref(false);
const showAddFaqModal = ref(false);
const editingCategory = ref(null);
const editingGameItem = ref(null);
const editingFaq = ref(null);
const selectedCategory = ref(null);
const activeTab = ref('info');
const isSaving = ref(false);

const faqForm = ref({
  question: '',
  answer: '',
  order: 0
});

const categoryForm = ref({ name: '', icon: '', order: 0 });

const gameForm = ref({
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
    author: '愚者',
    authorAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar%20boy%20white%20hair&image_size=square',
    authorCount: 198
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

const platformOptions = ['Android', 'PC', 'KR'];

onMounted(async () => {
  await loadCategories();
  await loadGames();
});

async function loadCategories() {
  categories.value = await request('/admin/categories');
}

const categoryGames = ref<Game[]>([]);

async function loadGames() {
  games.value = await request('/admin/games');
}

async function loadCategoryGames(categoryName: string) {
  try {
    categoryGames.value = await request('/games/category/' + encodeURIComponent(categoryName));
  } catch (error) {
    console.error('加载分类游戏失败:', error);
    categoryGames.value = [];
  }
}

const hasPlatform = (gamePlatforms, platform) => {
  if (!gamePlatforms) return false;
  if (Array.isArray(gamePlatforms)) {
    return gamePlatforms.includes(platform);
  }
  return gamePlatforms === platform;
};

const filteredGames = computed(() => {
  if (!selectedCategory.value) return [];
  const categoryName = selectedCategory.value.name;
  const categoryNameLower = categoryName.toLowerCase();
  
  return games.value.filter(game => {
    // 柚子社分类：只要platforms包含柚子社或者isYuzusoft为true
    if (categoryNameLower === '柚子社') {
      return hasPlatform(game.platforms, '柚子社') || game.isYuzusoft;
    }
    
    // PC资源分类：platforms包含PC且不包含柚子社，或者platforms字段不存在且category匹配
    if (categoryNameLower === 'pc资源') {
      if (hasPlatform(game.platforms, '柚子社') || game.isYuzusoft) {
        return false;
      }
      const platformsExist = game.platforms !== undefined && game.platforms !== null;
      if (platformsExist) {
        return hasPlatform(game.platforms, 'PC');
      }
      const gameCategoryLower = (game.category || '').toLowerCase();
      return gameCategoryLower === 'pc资源';
    }
    
    // Gal游戏分类：platforms包含Android或KR，或者同时包含PC+Android/KR，或者平台数为3，且不包含柚子社
    if (categoryNameLower === 'gal游戏') {
      if (hasPlatform(game.platforms, '柚子社') || game.isYuzusoft) {
        return false;
      }
      const platformsExist = game.platforms !== undefined && game.platforms !== null;
      if (!platformsExist) {
        const gameCategoryLower = (game.category || '').toLowerCase();
        return gameCategoryLower === 'gal游戏';
      }
      const platforms = Array.isArray(game.platforms) ? game.platforms : [game.platforms];
      const hasAndroid = platforms.includes('Android');
      const hasKR = platforms.includes('KR');
      const hasPC = platforms.includes('PC');
      const platformCount = platforms.length;
      return hasAndroid || hasKR || (hasPC && (hasAndroid || hasKR)) || platformCount === 3;
    }
    
    // 其他分类：按旧的category字段匹配（不区分大小写）
    const gameCategoryLower = (game.category || '').toLowerCase();
    return gameCategoryLower === categoryNameLower;
  });
});

function getGameCount(categoryName) {
  const categoryNameLower = categoryName.toLowerCase();
  
  return games.value.filter(game => {
    // 柚子社分类
    if (categoryNameLower === '柚子社') {
      return hasPlatform(game.platforms, '柚子社') || game.isYuzusoft;
    }
    
    // PC资源分类
    if (categoryNameLower === 'pc资源') {
      if (hasPlatform(game.platforms, '柚子社') || game.isYuzusoft) {
        return false;
      }
      const platformsExist = game.platforms !== undefined && game.platforms !== null;
      if (platformsExist) {
        return hasPlatform(game.platforms, 'PC');
      }
      const gameCategoryLower = (game.category || '').toLowerCase();
      return gameCategoryLower === 'pc资源';
    }
    
    // Gal游戏分类
    if (categoryNameLower === 'gal游戏') {
      if (hasPlatform(game.platforms, '柚子社') || game.isYuzusoft) {
        return false;
      }
      const platformsExist = game.platforms !== undefined && game.platforms !== null;
      if (!platformsExist) {
        const gameCategoryLower = (game.category || '').toLowerCase();
        return gameCategoryLower === 'gal游戏';
      }
      const platforms = Array.isArray(game.platforms) ? game.platforms : [game.platforms];
      const hasAndroid = platforms.includes('Android');
      const hasKR = platforms.includes('KR');
      const hasPC = platforms.includes('PC');
      const platformCount = platforms.length;
      return hasAndroid || hasKR || (hasPC && (hasAndroid || hasKR)) || platformCount === 3;
    }
    
    // 其他分类（不区分大小写）
    const gameCategoryLower = (game.category || '').toLowerCase();
    return gameCategoryLower === categoryNameLower;
  }).length;
}

function viewCategory(cat) {
  selectedCategory.value = cat;
  if (cat.name !== '新人必读') {
    loadCategoryGames(cat.name);
  }
}

watch(selectedCategory, async (newVal) => {
  if (newVal && newVal.name === '新人必读') {
    await loadFAQs();
  }
});

async function loadFAQs() {
  try {
    faqs.value = await request('/faq');
  } catch (error) {
    console.error('加载FAQ失败:', error);
    faqs.value = [];
  }
}

function editFaq(faq) {
  editingFaq.value = faq;
  faqForm.value = {
    question: faq.question,
    answer: faq.answer,
    order: faq.order || 0
  };
  showAddFaqModal.value = true;
}

async function saveFaq() {
  try {
    if (editingFaq.value) {
      await request('/faq/' + editingFaq.value._id, {
        method: 'PUT',
        body: JSON.stringify(faqForm.value)
      });
    } else {
      await request('/faq', {
        method: 'POST',
        body: JSON.stringify(faqForm.value)
      });
    }
    closeFaqModal();
    await loadFAQs();
  } catch (error) {
    console.error('保存FAQ失败:', error);
    alert('保存失败');
  }
}

function closeFaqModal() {
  showAddFaqModal.value = false;
  editingFaq.value = null;
  faqForm.value = { question: '', answer: '', order: 0 };
}

async function deleteFaq(faq) {
  if (!confirm('确定要删除这个常见问题吗？')) return;
  try {
    await request('/faq/' + faq._id, {
      method: 'DELETE'
    });
    await loadFAQs();
  } catch (error) {
    console.error('删除FAQ失败:', error);
    alert('删除失败');
  }
}

function editCategory(cat) {
  editingCategory.value = cat;
  categoryForm.value = { name: cat.name, icon: cat.icon, order: cat.order || 0 };
  showAddModal.value = true;
}

async function saveCategory() {
  if (editingCategory.value) {
    const categoryId = editingCategory.value.id || editingCategory.value._id;
    await request('/admin/categories/' + categoryId, {
      method: 'PUT',
      body: JSON.stringify(categoryForm.value)
    });
  } else {
    await request('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryForm.value)
    });
  }
  showAddModal.value = false;
  editingCategory.value = null;
  resetCategoryForm();
  await loadCategories();
}

async function deleteCategory(category) {
  if (confirm('确定要删除这个分类吗?')) {
    await request('/admin/categories/' + (category.id || category._id), { method: 'DELETE' });
    await loadCategories();
  }
}

let draggedIndex = -1;

function onDragStart(event, index) {
  draggedIndex = index;
  event.dataTransfer.effectAllowed = 'move';
}

function onDragOver(event) {
  event.dataTransfer.dropEffect = 'move';
}

async function onDrop(event, targetIndex) {
  if (draggedIndex === -1 || draggedIndex === targetIndex) {
    draggedIndex = -1;
    return;
  }
  
  const categoriesList = [...categories.value];
  const [draggedItem] = categoriesList.splice(draggedIndex, 1);
  categoriesList.splice(targetIndex, 0, draggedItem);
  
  await updateOrder(categoriesList);
  draggedIndex = -1;
}

async function updateOrder(categoriesList) {
  for (let i = 0; i < categoriesList.length; i++) {
    if (categoriesList[i].order !== i) {
      const categoryId = String(categoriesList[i].id || categoriesList[i]._id);
      await request('/admin/categories/' + categoryId, {
        method: 'PUT',
        body: JSON.stringify({ ...categoriesList[i], order: i })
      });
    }
  }
  await loadCategories();
}

function resetCategoryForm() {
  categoryForm.value = { name: '', icon: '', order: 0 };
}

function editGame(game) {
  editingGameItem.value = game;
  
  gameForm.value = {
    name: game.name,
    category: game.category,
    subCategory: game.subCategory || '',
    cover: game.cover,
    description: game.description,
    size: game.size,
    releaseDate: game.releaseDate,
    tagsInput: game.tags?.join(', ') || '',
    platforms: game.platforms || ['Android'],
    resources: game.resources && game.resources.length > 0 ? game.resources.map(r => ({
      name: r.name || '',
      type: r.type || 'main',
      language: r.language || '简体中文',
      url: r.url || '',
      size: r.size || '',
      date: r.date || '',
      dateDisplay: r.dateDisplay || '3天前',
      author: r.author || r.authorName || '愚者',
      authorAvatar: r.authorAvatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar%20boy%20white%20hair&image_size=square',
      authorCount: r.authorCount || 198
    })) : [{
      name: '',
      type: 'main',
      language: '简体中文',
      url: '',
      size: '',
      date: '',
      dateDisplay: '3天前',
      author: '愚者',
      authorAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar%20boy%20white%20hair&image_size=square',
      authorCount: 198
    }],
    comments: game.comments && game.comments.length > 0 ? game.comments.map(c => ({
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
  activeTab.value = 'info';
  showAddGameModal.value = true;
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

async function saveGame() {
  isSaving.value = true;
  try {
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
      isYuzusoft: platforms.includes('柚子社'),
      tags: gameForm.value.tagsInput.split(',').map(t => t.trim()).filter(t => t),
      downloads: editingGameItem.value ? editingGameItem.value.downloads : 0,
      resources: resources.map(r => ({
        ...r,
        platform: platforms[0] || 'Android'
      })),
      comments
    };

    const gameId = editingGameItem.value?.id || editingGameItem.value?._id || Date.now().toString();

    if (editingGameItem.value) {
      await request('/admin/games/' + editingGameItem.value.id, {
        method: 'PUT',
        body: JSON.stringify(gameData)
      });
    } else {
      await request('/admin/games', {
        method: 'POST',
        body: JSON.stringify(gameData)
      });
    }

    showAddGameModal.value = false;
    editingGameItem.value = null;
    resetGameForm();
    await loadGames();
    if (selectedCategory.value && selectedCategory.value.name !== '新人必读') {
      await loadCategoryGames(selectedCategory.value.name);
    }
    alert('保存成功！');
  } catch (error) {
    console.error('保存游戏失败:', error);
    alert('保存失败，请重试');
  } finally {
    isSaving.value = false;
  }
}

async function deleteGame(game) {
  if (confirm('确定要删除这个游戏吗?')) {
    await request('/admin/games/' + (game.id || game._id), { method: 'DELETE' });
    await loadGames();
    if (selectedCategory.value && selectedCategory.value.name !== '新人必读') {
      await loadCategoryGames(selectedCategory.value.name);
    }
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
    author: '愚者',
    authorAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar%20boy%20white%20hair&image_size=square',
    authorCount: 198
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

function resetGameForm() {
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
      author: '愚者',
      authorAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20avatar%20boy%20white%20hair&image_size=square',
      authorCount: 198
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
  background: linear-gradient(135deg, #ff6b9d 0%, #c44fff 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 12px;
}

.back-btn {
  padding: 8px 16px;
  background: #f0f0f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.add-game-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44fff 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.category-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: box-shadow 0.2s;
  position: relative;
}

.category-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.category-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.category-card h3 {
  margin: 0 0 8px 0;
}

.game-count {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
}

.category-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
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

.drag-handle {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 16px;
  color: #999;
  cursor: grab;
}

.category-card.dragging {
  opacity: 0.5;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.category-card.drag-over {
  border: 2px dashed #ff6b9d;
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

.actions {
  display: flex;
  gap: 8px;
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

.form-group input, .form-group textarea, .form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-sizing: border-box;
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

.resource-fields, .comment-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .add-btn {
    width: 100%;
    padding: 14px;
  }
  
  .detail-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .back-btn,
  .add-game-btn {
    padding: 10px 16px;
    font-size: 14px;
  }
  
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .category-card {
    padding: 16px;
  }
  
  .category-icon {
    font-size: 36px;
    margin-bottom: 8px;
  }
  
  .category-card h3 {
    font-size: 14px;
  }
  
  .game-count {
    font-size: 12px;
  }
  
  .category-actions {
    gap: 4px;
  }
  
  .edit-btn,
  .delete-btn {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  .games-table {
    overflow-x: auto;
  }
  
  .games-table table {
    min-width: 500px;
  }
  
  .games-table th,
  .games-table td {
    padding: 8px 6px;
    font-size: 12px;
  }
  
  .game-cover-small {
    width: 40px;
    height: 55px;
  }
  
  .actions {
    flex-direction: column;
    gap: 4px;
  }
  
  .modal {
    padding: 20px;
    margin: 10px;
    max-width: none;
    width: calc(100% - 20px);
    max-height: 95vh;
  }
  
  .form-group input,
  .form-group textarea,
  .form-group select {
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

  /* 游戏编辑模态框响应式 */
  .modal-header {
    padding: 12px 16px;
  }

  .tabs {
    padding: 0 16px;
  }

  .tab-btn {
    padding: 10px 12px;
    font-size: 14px;
  }

  .tab-content {
    padding: 20px 16px;
  }

  .grid-cols-2,
  .grid-cols-3 {
    grid-template-columns: 1fr;
  }

  .checkbox-group {
    gap: 6px;
  }

  .checkbox-label {
    padding: 8px 12px;
    font-size: 14px;
  }
}
</style>
