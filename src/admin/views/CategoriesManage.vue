<template>
  <div class="categories-manage">
    <div class="header">
      <h1>📁 分类管理</h1>
      <button @click="showAddModal = true" class="add-btn">+ 添加分类</button>
    </div>

    <div v-if="selectedCategory" class="category-detail">
      <div class="detail-header">
        <button @click="selectedCategory = null" class="back-btn">← 返回</button>
        <h2>{{ selectedCategory.name }} - 游戏列表</h2>
        <button @click="showAddGameModal = true" class="add-game-btn">+ 添加游戏</button>
      </div>

      <div class="games-table">
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
                <button @click="deleteGame(game._id)" class="delete-btn">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="categories-grid">
      <div v-for="cat in categories" :key="cat._id" class="category-card" @click="viewCategory(cat)">
        <div class="category-icon">{{ cat.icon || '📁' }}</div>
        <h3>{{ cat.name }}</h3>
        <p class="game-count">{{ getGameCount(cat.name) }} 个游戏</p>
        <div class="category-actions">
          <button @click.stop="editCategory(cat)" class="edit-btn">编辑</button>
          <button @click.stop="deleteCategory(cat._id)" class="delete-btn">删除</button>
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
          <div class="form-group">
            <label>排序</label>
            <input v-model.number="categoryForm.order" type="number" />
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
        <form @submit.prevent="saveGame">
          <div class="form-group">
            <label>游戏名称</label>
            <input v-model="gameForm.name" required />
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
          <div class="modal-actions">
            <button type="button" @click="showAddGameModal = false">取消</button>
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

const categories = ref([]);
const games = ref([]);
const showAddModal = ref(false);
const showAddGameModal = ref(false);
const editingCategory = ref(null);
const editingGameItem = ref(null);
const selectedCategory = ref(null);

const categoryForm = ref({ name: '', icon: '', order: 0 });
const gameForm = ref({ name: '', cover: '', description: '', size: '', releaseDate: '', tagsInput: '' });

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

function editCategory(cat) {
  editingCategory.value = cat;
  categoryForm.value = { name: cat.name, icon: cat.icon, order: cat.order || 0 };
  showAddModal.value = true;
}

async function saveCategory() {
  if (editingCategory.value) {
    await request('/admin/categories/' + editingCategory.value._id, {
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

async function deleteCategory(id) {
  if (confirm('确定要删除这个分类吗?')) {
    await request('/admin/categories/' + id, { method: 'DELETE' });
    await loadCategories();
  }
}

function resetCategoryForm() {
  categoryForm.value = { name: '', icon: '', order: 0 };
}

function editGame(game) {
  editingGameItem.value = game;
  gameForm.value = {
    name: game.name,
    cover: game.cover,
    description: game.description,
    size: game.size,
    releaseDate: game.releaseDate,
    tagsInput: game.tags?.join(', ') || ''
  };
  showAddGameModal.value = true;
}

async function saveGame() {
  const gameData = {
    ...gameForm.value,
    category: selectedCategory.value.name,
    tags: gameForm.value.tagsInput.split(',').map(t => t.trim()).filter(t => t),
    downloads: editingGameItem.value ? editingGameItem.value.downloads : 0
  };

  if (editingGameItem.value) {
    await request('/admin/games/' + editingGameItem.value._id, {
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
}

async function deleteGame(id) {
  if (confirm('确定要删除这个游戏吗?')) {
    await request('/admin/games/' + id, { method: 'DELETE' });
    await loadGames();
  }
}

function resetGameForm() {
  gameForm.value = { name: '', cover: '', description: '', size: '', releaseDate: '', tagsInput: '' };
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.form-group input, .form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
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
