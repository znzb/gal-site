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
    </div>

    <div class="games-table">
      <table>
        <thead>
          <tr>
            <th>封面</th>
            <th>游戏名称</th>
            <th>分类</th>
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

    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal" @click.stop>
        <h2>{{ editingGame ? '编辑游戏' : '添加游戏'}</h2>
        <form @submit.prevent="saveGame">
          <div class="form-group">
            <label>游戏名称</label>
            <input v-model="gameForm.name" required />
          </div>
          <div class="form-group">
            <label>分类</label>
            <select v-model="gameForm.category" required>
              <option v-for="cat in categories" :key="cat._id" :value="cat.name">
                {{ cat.name }}
              </option>
            </select>
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

const games = ref([]);
const categories = ref([]);
const searchQuery = ref('');
const filterCategory = ref('');
const showAddModal = ref(false);
const editingGame = ref(null);

const gameForm = ref({
  name: '',
  category: '',
  cover: '',
  description: '',
  size: '',
  releaseDate: '',
  tagsInput: ''
});

const filteredGames = computed(() => {
  return games.value.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = !filterCategory.value || game.category === filterCategory.value;
    return matchesSearch && matchesCategory;
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
    cover: game.cover,
    description: game.description,
    size: game.size,
    releaseDate: game.releaseDate,
    tagsInput: game.tags?.join(', ') || ''
  };
  showAddModal.value = true;
}

async function saveGame() {
  const gameData = {
    ...gameForm.value,
    tags: gameForm.value.tagsInput.split(',').map(t => t.trim()).filter(t => t),
    downloads: editingGame.value ? editingGame.value.downloads : 0
  };

  if (editingGame.value) {
    await request(`/admin/games/${editingGame.value._id}`, {
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

async function deleteGame(id) {
  if (confirm('确定要删除这个游戏吗?')) {
    await request(`/admin/games/${id}`, { method: 'DELETE' });
    await loadGames();
  }
}

function resetForm() {
  gameForm.value = {
    name: '',
    category: '',
    cover: '',
    description: '',
    size: '',
    releaseDate: '',
    tagsInput: ''
  };
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
</style>