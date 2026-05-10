<template>
  <div class="announcements-manage">
    <div class="header">
      <h1>📢 公告管理</h1>
      <button @click="showAddModal = true" class="add-btn">+ 添加公告</button>
    </div>

    <div class="announcements-list">
      <div v-for="ann in announcements" :key="ann._id" class="announcement-card">
        <div class="announcement-header">
          <h3>{{ ann.title }}</h3>
          <div class="announcement-tags">
            <span v-if="ann.isPinned" class="tag pinned">置顶</span>
            <span :class="['tag', ann.isVisible ? 'visible' : 'hidden'">
              {{ ann.isVisible ? '显示' : '隐藏' }}
            </span>
          </div>
        </div>
        <p>{{ ann.content }}</p>
        <div class="announcement-meta">
          <span>{{ new Date(ann.createdAt).toLocaleDateString() }}</span>
          <div class="announcement-actions">
            <button @click="editAnnouncement(ann)" class="edit-btn">编辑</button>
            <button @click="deleteAnnouncement(ann._id)" class="delete-btn">删除</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal" @click.stop>
        <h2>{{ editingAnnouncement ? '编辑公告' : '添加公告'}</h2>
        <form @submit.prevent="saveAnnouncement">
          <div class="form-group">
            <label>标题</label>
            <input v-model="annForm.title" required />
          </div>
          <div class="form-group">
            <label>内容</label>
            <textarea v-model="annForm.content" rows="5" required></textarea>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="annForm.isPinned" /> 置顶
            </label>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="annForm.isVisible" /> 显示
            </label>
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

const announcements = ref([]);
const showAddModal = ref(false);
const editingAnnouncement = ref(null);
const annForm = ref({ title: '', content: '', isPinned: false, isVisible: true });

onMounted(async () => {
  await loadAnnouncements();
});

async function loadAnnouncements() {
  announcements.value = await request('/admin/announcements');
}

function editAnnouncement(ann) {
  editingAnnouncement.value = ann;
  annForm.value = { 
    title: ann.title, 
    content: ann.content, 
    isPinned: ann.isPinned, 
    isVisible: ann.isVisible 
  };
  showAddModal.value = true;
}

async function saveAnnouncement() {
  if (editingAnnouncement.value) {
    await request(`/admin/announcements/${editingAnnouncement.value._id}`, {
      method: 'PUT',
      body: JSON.stringify(annForm.value)
    });
  } else {
    await request('/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(annForm.value)
    });
  }
  showAddModal.value = false;
  editingAnnouncement.value = null;
  resetForm();
  await loadAnnouncements();
}

async function deleteAnnouncement(id) {
  if (confirm('确定要删除这个公告吗?')) {
    await request(`/admin/announcements/${id}`, { method: 'DELETE' });
    await loadAnnouncements();
  }
}

function resetForm() {
  annForm.value = { title: '', content: '', isPinned: false, isVisible: true };
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

.announcements-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.announcement-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.announcement-header h3 {
  margin: 0;
}

.announcement-tags {
  display: flex;
  gap: 8px;
}

.tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.tag.pinned {
  background: #f39c12;
  color: white;
}

.tag.visible {
  background: #27ae60;
  color: white;
}

.tag.hidden {
  background: #e74c3c;
  color: white;
}

.announcement-card p {
  margin: 0 0 12px 0;
  color: #555;
  line-height: 1.6;
}

.announcement-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #888;
  font-size: 14px;
}

.announcement-actions {
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
</style>