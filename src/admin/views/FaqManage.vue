<template>
  <div class="faq-manage">
    <div class="header">
      <h1>❓ 帮助中心管理</h1>
      <button @click="showAddModal = true" class="add-btn">+ 添加常见问题</button>
    </div>

    <div v-if="faqs.length === 0" class="empty-state">
      <span class="empty-emoji">📢</span>
      <p>暂无常见问题</p>
    </div>

    <template v-else>
    <div class="faq-list desktop-only">
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
            <td class="q-cell">{{ faq.question }}</td>
            <td class="a-cell">{{ faq.answer }}</td>
            <td>{{ faq.order }}</td>
            <td class="actions">
              <button @click="editFaq(faq)" class="edit-btn">编辑</button>
              <button @click="deleteFaq(faq)" class="delete-btn">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="faq-cards mobile-only">
      <div v-for="faq in faqs" :key="faq._id" class="faq-card">
        <div class="faq-card-q">
          <span class="faq-q-label">Q</span>
          <span>{{ faq.question }}</span>
        </div>
        <div class="faq-card-a">
          <span class="faq-a-label">A</span>
          <span>{{ faq.answer }}</span>
        </div>
        <div class="faq-card-footer">
          <span class="faq-order">排序: {{ faq.order }}</span>
          <div class="faq-card-actions">
            <button @click="editFaq(faq)" class="edit-btn">编辑</button>
            <button @click="deleteFaq(faq)" class="delete-btn">删除</button>
          </div>
        </div>
      </div>
    </div>
    </template>

    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal" @click.stop>
        <h2>{{ editingFaq ? '编辑常见问题' : '添加常见问题' }}</h2>
        <form @submit.prevent="saveFaq">
          <div class="form-group">
            <label>问题</label>
            <input v-model="faqForm.question" required placeholder="例如: 如何下载游戏？" />
          </div>
          <div class="form-group">
            <label>答案</label>
            <textarea v-model="faqForm.answer" rows="5" required placeholder="请输入详细解答"></textarea>
          </div>
          <div class="form-group">
            <label>排序</label>
            <input v-model.number="faqForm.order" type="number" placeholder="数字越小越靠前" />
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

const faqs = ref([]);
const showAddModal = ref(false);
const editingFaq = ref(null);
const faqForm = ref({ question: '', answer: '', order: 0 });

onMounted(async () => {
  await loadFaqs();
});

async function loadFaqs() {
  faqs.value = await request('/faq');
}

function editFaq(faq) {
  editingFaq.value = faq;
  faqForm.value = {
    question: faq.question,
    answer: faq.answer,
    order: faq.order || 0
  };
  showAddModal.value = true;
}

async function saveFaq() {
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
  showAddModal.value = false;
  editingFaq.value = null;
  resetForm();
  await loadFaqs();
}

async function deleteFaq(faq) {
  if (confirm(`确定要删除"${faq.question}"吗？`)) {
    await request('/faq/' + faq._id, { method: 'DELETE' });
    await loadFaqs();
  }
}

function resetForm() {
  faqForm.value = { question: '', answer: '', order: 0 };
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

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #8a86a0;
  background: white;
  border-radius: 12px;
}

.empty-emoji {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.faq-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.desktop-only { display: block !important; }
.mobile-only { display: none !important; }

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #faf7fc;
  padding: 12px;
  text-align: left;
  font-size: 13px;
  color: #6b6680;
  border-bottom: 1px solid #f0ecf4;
}

td {
  padding: 14px 12px;
  border-bottom: 1px solid #f0ecf4;
  vertical-align: top;
  font-size: 14px;
}

.q-cell {
  font-weight: 600;
  color: #1f1f36;
  max-width: 200px;
}

.a-cell {
  color: #6b6680;
  max-width: 400px;
  white-space: pre-wrap;
  word-break: break-word;
}

.actions {
  display: flex;
  gap: 8px;
}

.edit-btn {
  padding: 6px 14px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.delete-btn {
  padding: 6px 14px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.faq-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-card {
  background: white;
  border-radius: 12px;
  padding: 14px;
}

.faq-card-q, .faq-card-a {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.5;
}

.faq-card-a {
  color: #6b6680;
  margin-bottom: 12px;
}

.faq-q-label, .faq-a-label {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: white;
}

.faq-q-label { background: #ff6b9d; }
.faq-a-label { background: #27ae60; }

.faq-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f0ecf4;
}

.faq-order {
  font-size: 12px;
  color: #8a86a0;
}

.faq-card-actions {
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
  box-sizing: border-box;
  font-family: inherit;
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
  .desktop-only { display: none !important; }
  .mobile-only { display: flex !important; }

  .header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .add-btn {
    width: 100%;
    padding: 14px;
  }

  .modal {
    padding: 20px;
    margin: 10px;
    max-width: none;
    width: calc(100% - 20px);
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
