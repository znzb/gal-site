<template>
  <div class="categories-manage">
    <div class="header">
      <h1>📁 分类管理</h1>
      <button @click="showAddModal = true" class="add-btn">+ 添加分类</button>
    </div>

    <div class="categories-grid">
      <div v-for="cat in categories" :key="cat._id" class="category-card">
        <div class="category-icon">{{ cat.icon || '📁' }}</div>
        <h3>{{ cat.name }}</h3>
        <div class="category-actions">
          <button @click="editCategory(cat)" class="edit-btn">编辑</button>
          <button @click="deleteCategory(cat._id)" class="delete-btn">删除</button>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { request } from '../api';

const categories = ref([]);
const showAddModal = ref(false);
const editingCategory = ref(null);
const categoryForm = ref({ name: '', icon: '', order: 0 });

onMounted(async () => {
  await loadCategories();
});

async function loadCategories() {
  categories.value = await request('/admin/categories');
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
  resetForm();
  await loadCategories();
}

async function deleteCategory(id) {
  if (confirm('确定要删除这个分类吗?')) {
    await request('/admin/categories/' + id, { method: 'DELETE' });
    await loadCategories();
  }
}

function resetForm() {
  categoryForm.value = { name: '', icon: '', order: 0 };
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
}

.category-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.category-card h3 {
  margin: 0 0 16px 0;
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
  max-width: 400px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-group input {
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