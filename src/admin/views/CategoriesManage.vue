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
            <tr v-for="game in filteredGames" :key="game._id">
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

    <div v-if="showAddGameModal" class="game-edit-modal-overlay" @click.self="showAddGameModal = false">
      <div class="game-edit-modal" @click.stop>
        <div class="modal-header">
          <button class="close-btn" @click="showAddGameModal = false">✕</button>
          <h1 class="modal-title">{{ editingGameItem ? '编辑游戏' : '添加游戏' }}</h1>
          <button class="save-btn" @click="saveGame" :disabled="isSaving">
            {{ isSaving ? '保存中...' : '保存' }}
          </button>
        </div>

        <div class="tabs-container">
          <div class="tabs">
            <button 
              @click="activeTab = 'info'"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors"
              :class="activeTab === 'info' ? 'text-white bg-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
            >
              📝 游戏信息
            </button>
            <button 
              @click="activeTab = 'resources'"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors"
              :class="activeTab === 'resources' ? 'text-white bg-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
            >
              🔗 资源链接
            </button>
            <button 
              @click="activeTab = 'comments'"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors"
              :class="activeTab === 'comments' ? 'text-white bg-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
            >
              💬 游戏评论
            </button>
          </div>
        </div>

        <div class="tab-content">
          <div v-if="activeTab === 'info'" class="space-y-6">
            <div class="form-group">
              <label>游戏名称</label>
              <input v-model="gameForm.name" type="text" placeholder="请输入游戏名称" />
            </div>

            <div class="form-group">
              <label>封面图片URL</label>
              <input v-model="gameForm.cover" type="text" placeholder="请输入封面图片URL" />
              <div v-if="gameForm.cover" class="mt-2">
                <img :src="gameForm.cover" :alt="gameForm.name" class="preview-image" />
              </div>
            </div>

            <div class="form-group">
              <label>分类</label>
              <select v-model="gameForm.category" class="w-full px-4 py-3 border border-gray-200 rounded-lg">
                <option value="" disabled>请选择分类</option>
                <option v-for="cat in categories" :key="cat._id" :value="cat.name">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>类型 (生肉/熟肉)</label>
              <select v-model="gameForm.subCategory" class="w-full px-4 py-3 border border-gray-200 rounded-lg">
                <option value="" disabled>请选择类型</option>
                <option value="raw">🍖 生肉（未汉化）</option>
                <option value="cooked">🍳 熟肉（已汉化）</option>
              </select>
            </div>

            <div class="form-group">
              <label>游戏大小</label>
              <input v-model="gameForm.size" type="text" placeholder="例如: 2.5GB" />
            </div>

            <div class="form-group">
              <label>发布日期</label>
              <input v-model="gameForm.releaseDate" type="date" />
            </div>

            <div class="form-group">
              <label>下载量</label>
              <input v-model.number="gameForm.downloads" type="number" placeholder="请输入下载量" />
            </div>

            <div class="form-group">
              <label>标签（用逗号分隔）</label>
              <input v-model="gameForm.tagsInput" type="text" placeholder="例如: 恋爱, 校园, 治愈" />
            </div>

            <div class="form-group">
              <label>游戏介绍</label>
              <textarea v-model="gameForm.description" rows="4" placeholder="请输入游戏介绍"></textarea>
            </div>

            <div class="section-divider">
              <h3 class="section-title">详细信息</h3>
            </div>

            <div class="grid-cols-2">
              <div class="form-group">
                <label>开发商</label>
                <input v-model="gameInfo.developer" type="text" placeholder="请输入开发商" />
              </div>
              <div class="form-group">
                <label>发行商</label>
                <input v-model="gameInfo.publisher" type="text" placeholder="请输入发行商" />
              </div>
            </div>

            <div class="form-group">
              <label>支持平台 (可多选)</label>
              <div class="checkbox-group">
                <label 
                  v-for="(platform, index) in platformOptions" 
                  :key="platform"
                  class="checkbox-label"
                >
                  <input 
                    type="checkbox" 
                    :checked="gameInfo.platforms.includes(platform)"
                    @change="togglePlatform(platform)"
                  />
                  <span class="platform-icon">{{ platformIcons[index] }}</span>
                  {{ platform }}
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>支持语言</label>
              <div class="checkbox-group">
                <label 
                  v-for="lang in languageOptions" 
                  :key="lang"
                  class="checkbox-label"
                >
                  <input 
                    type="checkbox" 
                    :checked="gameInfo.languages.includes(lang)"
                    @change="toggleLanguage(lang)"
                  />
                  {{ lang }}
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>系统要求</label>
              <input v-model="gameInfo.requirements" type="text" placeholder="例如: Android 8.0+ / Windows 10+, 4GB RAM" />
            </div>
          </div>

          <div v-if="activeTab === 'resources'" class="space-y-6">
            <div 
              v-for="(resource, index) in gameForm.resources" 
              :key="resource.id"
              class="resource-item"
            >
              <div class="resource-header">
                <span class="resource-title">资源 {{ index + 1 }}</span>
                <button 
                  v-if="gameForm.resources.length > 1"
                  @click="removeResource(index)"
                  class="remove-btn"
                >
                  🗑️
                </button>
              </div>

              <div class="form-group">
                <label>下载链接</label>
                <input v-model="resource.url" class="w-full px-4 py-3 border border-gray-200 rounded-lg" />
              </div>

              <div class="form-group">
                <label>大小</label>
                <input v-model="resource.size" class="w-full px-4 py-3 border border-gray-200 rounded-lg" />
              </div>

              <div class="form-group">
                <label>发布日期 (显示格式)</label>
                <input v-model="resource.dateDisplay" class="w-full px-4 py-3 border border-gray-200 rounded-lg" placeholder="例如: 2025/5/1" />
              </div>

              <div class="form-group">
                <label>发布者用户名</label>
                <input v-model="resource.author" class="w-full px-4 py-3 border border-gray-200 rounded-lg" />
              </div>

              <div class="form-group">
                <label>发布者头像URL</label>
                <input v-model="resource.authorAvatar" class="w-full px-4 py-3 border border-gray-200 rounded-lg" placeholder="https://example.com/avatar.jpg" />
              </div>

              <div class="form-group">
                <label>已发布资源数量</label>
                <input v-model.number="resource.authorCount" type="number" class="w-full px-4 py-3 border border-gray-200 rounded-lg" />
              </div>
            </div>

            <button 
              @click="addResource"
              class="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors text-gray-500 hover:text-blue-600"
            >
              + 添加资源
            </button>
          </div>

          <div v-if="activeTab === 'comments'" class="space-y-6">
            <div 
              v-for="(comment, index) in gameForm.comments" 
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-header">
                <span class="comment-title">评论 {{ index + 1 }}</span>
                <button 
                  v-if="gameForm.comments.length > 1"
                  @click="removeComment(index)"
                  class="remove-btn"
                >
                  🗑️
                </button>
              </div>

              <div class="grid-cols-2">
                <div class="form-group">
                  <label>用户名</label>
                  <input v-model="comment.user" placeholder="请输入用户名" />
                </div>
                <div class="form-group">
                  <label>头像URL</label>
                  <input v-model="comment.avatar" placeholder="请输入头像URL" />
                </div>
              </div>

              <div class="form-group">
                <label>评论内容</label>
                <textarea v-model="comment.content" rows="3" placeholder="请输入评论内容"></textarea>
              </div>

              <div class="grid-cols-3">
                <div class="form-group">
                  <label>评分</label>
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

            <button 
              @click="addComment"
              class="add-btn"
            >
              + 添加评论
            </button>
          </div>
        </div>
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
  downloads: 0,
  tagsInput: '',
  resources: [{
    id: '1',
    url: '',
    size: '',
    dateDisplay: '',
    author: '',
    authorAvatar: '',
    authorCount: 0
  }],
  comments: [{
    id: '1',
    user: '',
    avatar: '',
    content: '',
    rating: 5,
    date: '',
    likes: 0,
    liked: false
  }]
});

const gameInfo = ref({
  developer: '',
  publisher: '',
  platforms: ['Android', 'Windows'],
  languages: ['简体中文'],
  requirements: ''
});

const platformOptions = ['Android', 'PC', 'KR', '柚子社'];
const platformIcons = ['📱', '💻', '🇰🇷', '🎵'];
const languageOptions = ['简体中文', '繁体中文', '日文', '英文'];

onMounted(async () => {
  await loadCategories();
  await loadGames();
});

async function loadCategories() {
  categories.value = await request('/admin/categories');
}

async function loadGames() {
  games.value = await request('/admin/games');
}

const filteredGames = computed(() => {
  if (!selectedCategory.value) return [];
  return games.value.filter(g => g.category === selectedCategory.value.name);
});

function getGameCount(categoryName) {
  return games.value.filter(g => g.category === categoryName).length;
}

function viewCategory(cat) {
  selectedCategory.value = cat;
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
    category: game.category || '',
    subCategory: game.subCategory || '',
    cover: game.cover,
    description: game.description,
    size: game.size,
    releaseDate: game.releaseDate,
    downloads: game.downloads || 0,
    tagsInput: game.tags?.join(', ') || '',
    resources: game.resources?.map((r, i) => ({
      id: String(i + 1),
      url: r.url || '',
      size: r.size || '',
      dateDisplay: r.dateDisplay || r.date || '',
      author: r.author || '',
      authorAvatar: r.authorAvatar || '',
      authorCount: r.authorCount || 0
    })) || [{
      id: '1',
      url: '',
      size: '',
      dateDisplay: '',
      author: '',
      authorAvatar: '',
      authorCount: 0
    }],
    comments: game.comments?.map((c, i) => ({
      id: String(i + 1),
      user: c.user || '',
      avatar: c.avatar || '',
      content: c.content || '',
      rating: c.rating || 5,
      date: c.date || '',
      likes: c.likes || 0,
      liked: false
    })) || [{
      id: '1',
      user: '',
      avatar: '',
      content: '',
      rating: 5,
      date: '',
      likes: 0,
      liked: false
    }]
  };
  gameInfo.value = {
    developer: '',
    publisher: '',
    platforms: ['Android', 'Windows'],
    languages: ['简体中文'],
    requirements: ''
  };
  activeTab.value = 'info';
  showAddGameModal.value = true;
}

function togglePlatform(platform) {
  const index = gameInfo.value.platforms.indexOf(platform);
  if (index > -1) {
    gameInfo.value.platforms.splice(index, 1);
  } else {
    gameInfo.value.platforms.push(platform);
  }
}

function toggleLanguage(lang) {
  const index = gameInfo.value.languages.indexOf(lang);
  if (index > -1) {
    gameInfo.value.languages.splice(index, 1);
  } else {
    gameInfo.value.languages.push(lang);
  }
}

async function saveGame() {
  isSaving.value = true;
  try {
    const gameData = {
      ...gameForm.value,
      category: selectedCategory.value.name,
      tags: gameForm.value.tagsInput.split(',').map(t => t.trim()).filter(t => t),
      downloads: editingGameItem.value ? editingGameItem.value.downloads : gameForm.value.downloads,
      resources: gameForm.value.resources.filter(r => r.url).map(r => ({
        url: r.url,
        size: r.size,
        dateDisplay: r.dateDisplay,
        author: r.author,
        authorAvatar: r.authorAvatar,
        authorCount: r.authorCount
      })),
      comments: gameForm.value.comments.filter(c => c.user && c.content)
    };

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
  }
}

function addResource() {
  gameForm.value.resources.push({
    id: Date.now().toString(),
    url: '',
    size: '',
    dateDisplay: '',
    author: '',
    authorAvatar: '',
    authorCount: 0
  });
}

function removeResource(index) {
  gameForm.value.resources.splice(index, 1);
}

function addComment() {
  gameForm.value.comments.push({
    id: Date.now().toString(),
    user: '',
    avatar: '',
    content: '',
    rating: 5,
    date: '',
    likes: 0,
    liked: false
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
    downloads: 0,
    tagsInput: '',
    resources: [{
      id: '1',
      url: '',
      size: '',
      dateDisplay: '',
      author: '',
      authorAvatar: '',
      authorCount: 0
    }],
    comments: [{
      id: '1',
      user: '',
      avatar: '',
      content: '',
      rating: 5,
      date: '',
      likes: 0,
      liked: false
    }]
  };
  gameInfo.value = {
    developer: '',
    publisher: '',
    platforms: ['Android', 'Windows'],
    languages: ['简体中文'],
    requirements: ''
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
  background: linear-gradient(135deg, #ff6b9d 0%, #c44fff 100%);
  color: white;
}

/* 游戏编辑模态框样式 */
.game-edit-modal-overlay {
  position: fixed;
  inset: 0;
  background: #f3f4f6;
  z-index: 1000;
  overflow-y: auto;
}

.game-edit-modal {
  min-height: 100vh;
  background: white;
}

.modal-header {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}

.close-btn {
  padding: 8px;
  border: none;
  background: none;
  font-size: 20px;
  cursor: pointer;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44fff 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tabs-container {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 60px;
  z-index: 40;
}

.tabs {
  display: flex;
  border-bottom: none;
  max-width: 4xl;
  margin: 0 auto;
  padding: 0 20px;
}

.tab-content {
  max-width: 4xl;
  margin: 0 auto;
  padding: 24px 20px;
}

.space-y-6 {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.preview-image {
  max-width: 200px;
  border-radius: 8px;
  margin-top: 8px;
}

.radio-group {
  display: flex;
  gap: 16px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.section-divider {
  border-top: 1px solid #e5e7eb;
  padding-top: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.grid-cols-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.grid-cols-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.platform-icon {
  font-size: 18px;
}

.checkbox-label:has(input:checked) {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #1d4ed8;
}

.resource-item, .comment-item {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  background: #fafafa;
}

.resource-header, .comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.resource-title, .comment-title {
  font-weight: 500;
  color: #374151;
}

.remove-btn {
  padding: 6px;
  border: none;
  background: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 18px;
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
