<template>
  <div class="banners-manage">
    <div class="header">
      <h1>🎠 轮播图管理</h1>
      <button @click="showAddModal = true" class="add-btn">+ 添加轮播图</button>
    </div>

    <div class="banners-grid">
      <div v-for="banner in banners" :key="banner._id" class="banner-card">
        <img :src="banner.image" class="banner-preview" />
        <div class="banner-info">
          <h4>{{ banner.title }}</h4>
          <p>{{ banner.subtitle }}</p>
        </div>
        <div class="banner-actions">
          <button @click="editBanner(banner)" class="edit-btn">编辑</button>
          <button @click="deleteBanner(banner._id)" class="delete-btn">删除</button>
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal" @click.stop>
        <h2>{{ editingBanner ? '编辑轮播图' : '添加轮播图' }}</h2>
        <form @submit.prevent="saveBanner">
          <div class="form-group">
            <label>标题</label>
            <input v-model="bannerForm.title" required />
          </div>
          <div class="form-group">
            <label>副标题</label>
            <input v-model="bannerForm.subtitle" />
          </div>
          <div class="form-group">
            <label>图片URL</label>
            <input v-model="bannerForm.image" required />
          </div>
          <div class="form-group">
            <label>排序</label>
            <input v-model.number="bannerForm.order" type="number" />
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

const banners = ref([]);
const showAddModal = ref(false);
const editingBanner = ref(null);
const bannerForm = ref({ title: '', subtitle: '', image: '', order: 0 });

onMounted(async () => {
  await loadBanners();
});

async function loadBanners() {
  banners.value = await request('/admin/banners');
}

function editBanner(banner) {
  editingBanner.value = banner;
  bannerForm.value = { 
    title: banner.title, 
    subtitle: banner.subtitle, 
    image: banner.image, 
    order: banner.order || 0 
  };
  showAddModal.value = true;
}

async function saveBanner() {
  if (editingBanner.value) {
    await request('/admin/banners/' + editingBanner.value._id, {
      method: 'PUT',
      body: JSON.stringify(bannerForm.value)
    });
  } else {
    await request('/admin/banners', {
      method: 'POST',
      body: JSON.stringify(bannerForm.value)
    });
  }
  showAddModal.value = false;
  editingBanner.value = null;
  resetForm();
  await loadBanners();
}

async function deleteBanner(id) {
  if (confirm('确定要删除这个轮播图吗?')) {
    await request('/admin/banners/' + id, { method: 'DELETE' });
    await loadBanners();
  }
}

function resetForm() {
  bannerForm.value = { title: '', subtitle: '', image: '', order: 0 };
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

.banners-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.banner-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.banner-preview {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.banner-info {
  padding: 16px;
}

.banner-info h4 {
  margin: 0 0 4px 0;
}

.banner-info p {
  margin: 0;
  color: #666;
}

.banner-actions {
  padding: 0 16px 16px 16px;
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
  
  .banners-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .banner-preview {
    height: 120px;
  }
  
  .banner-info {
    padding: 12px;
  }
  
  .banner-info h4 {
    font-size: 14px;
  }
  
  .banner-info p {
    font-size: 12px;
  }
  
  .banner-actions {
    padding: 0 12px 12px 12px;
    gap: 4px;
  }
  
  .edit-btn,
  .delete-btn {
    flex: 1;
    padding: 8px;
    font-size: 14px;
  }
  
  .modal {
    padding: 20px;
    margin: 10px;
    max-width: none;
    width: calc(100% - 20px);
  }
  
  .form-group input {
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