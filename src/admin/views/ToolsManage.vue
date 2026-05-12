<template>
  <div class="tools-manage">
    <div class="header">
      <h1>🛠️ 工具下载管理</h1>
      <div class="header-actions">
        <button @click="openGuideModal" class="guide-btn">📝 编辑使用说明</button>
        <button @click="showAddModal = true" class="add-btn">+ 添加工具</button>
      </div>
    </div>

    <div class="tools-table">
      <table>
        <thead>
          <tr>
            <th>图标</th>
            <th>工具名称</th>
            <th>描述</th>
            <th>大小</th>
            <th>下载量</th>
            <th>标签</th>
            <th>排序</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tool in tools" :key="tool._id">
            <td><span class="icon-cell">{{ getIconEmoji(tool.icon) }}</span></td>
            <td>{{ tool.name }}</td>
            <td class="description-cell">{{ tool.description }}</td>
            <td>{{ tool.size }}</td>
            <td>{{ tool.downloads }}</td>
            <td>
              <span 
                v-for="tag in tool.tags" 
                :key="tag" 
                class="tag"
              >{{ tag }}</span>
            </td>
            <td>{{ tool.order }}</td>
            <td class="actions">
              <button @click="editTool(tool)" class="edit-btn">编辑</button>
              <button @click="deleteTool(tool)" class="delete-btn">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showGuideModal" class="modal-overlay" @click.self="showGuideModal = false">
      <div class="modal" @click.stop>
        <h2>编辑使用说明</h2>
        <form @submit.prevent="saveGuide">
          <div class="form-group">
            <label>标题</label>
            <input v-model="guideForm.title" placeholder="例如: 使用说明" />
          </div>
          <div class="form-group">
            <label>说明内容 (每行一条)</label>
            <textarea v-model="guideForm.itemsInput" rows="6" placeholder="每行输入一条说明&#10;例如:&#10;下载并安装所需的工具&#10;根据游戏格式选择对应的模拟器"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeGuideModal">取消</button>
            <button type="submit">保存</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal" @click.stop>
        <h2>{{ editingTool ? '编辑工具' : '添加工具' }}</h2>
        <form @submit.prevent="saveTool">
          <div class="form-group">
            <label>工具名称</label>
            <input v-model="toolForm.name" required placeholder="例如: Krkr模拟器" />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="toolForm.description" rows="3" required placeholder="请输入工具描述"></textarea>
          </div>
          <div class="form-group">
            <label>大小</label>
            <input v-model="toolForm.size" required placeholder="例如: 15MB" />
          </div>
          <div class="form-group">
            <label>下载链接</label>
            <input v-model="toolForm.downloadUrl" placeholder="请输入下载链接" />
          </div>
          <div class="form-group">
            <label>图标</label>
            <select v-model="toolForm.icon">
              <option value="Zap">⚡ Zap (闪电)</option>
              <option value="Shield">🛡️ Shield (盾牌)</option>
              <option value="FileText">📄 FileText (文件)</option>
              <option value="Download">📥 Download (下载)</option>
              <option value="Settings">⚙️ Settings (设置)</option>
            </select>
          </div>
          <div class="form-group">
            <label>标签 (逗号分隔)</label>
            <input v-model="toolForm.tagsInput" placeholder="例如: 模拟器,必备" />
          </div>
          <div class="form-group">
            <label>排序</label>
            <input v-model.number="toolForm.order" type="number" min="0" placeholder="排序数字" />
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeToolModal">取消</button>
            <button type="submit">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { toolApi, toolGuideApi } from '@/api/api';
import type { Tool, ToolGuide } from '@/api/api';

const tools = ref<Tool[]>([]);
const showAddModal = ref(false);
const showGuideModal = ref(false);
const editingTool = ref<Tool | null>(null);
const guide = ref<ToolGuide | null>(null);

const toolForm = ref({
  name: '',
  description: '',
  size: '',
  downloadUrl: '',
  icon: 'FileText',
  tagsInput: '',
  order: 0
});

const guideForm = ref({
  title: '',
  itemsInput: ''
});

const iconEmojis: Record<string, string> = {
  Zap: '⚡',
  Shield: '🛡️',
  FileText: '📄',
  Download: '📥',
  Settings: '⚙️'
};

function getIconEmoji(iconName: string): string {
  return iconEmojis[iconName] || '📄';
}

onMounted(async () => {
  await Promise.all([loadTools(), loadGuide()]);
});

async function loadTools() {
  try {
    tools.value = await toolApi.getAllTools();
  } catch (error) {
    console.error('加载工具失败:', error);
  }
}

async function loadGuide() {
  try {
    guide.value = await toolGuideApi.getGuide();
  } catch (error) {
    console.error('加载使用说明失败:', error);
  }
}

function editTool(tool: Tool) {
  editingTool.value = tool;
  toolForm.value = {
    name: tool.name,
    description: tool.description,
    size: tool.size,
    downloadUrl: tool.downloadUrl || '',
    icon: tool.icon,
    tagsInput: tool.tags.join(', '),
    order: tool.order
  };
  showAddModal.value = true;
}

async function saveTool() {
  try {
    const toolData: Partial<Tool> = {
      name: toolForm.value.name,
      description: toolForm.value.description,
      size: toolForm.value.size,
      downloadUrl: toolForm.value.downloadUrl,
      icon: toolForm.value.icon,
      tags: toolForm.value.tagsInput.split(',').map(t => t.trim()).filter(t => t),
      order: toolForm.value.order
    };

    if (editingTool.value) {
      await toolApi.updateTool(editingTool.value._id!, toolData);
    } else {
      await toolApi.createTool(toolData as Tool);
    }
    closeToolModal();
    await loadTools();
  } catch (error) {
    console.error('保存工具失败:', error);
    alert('保存失败');
  }
}

function closeToolModal() {
  showAddModal.value = false;
  editingTool.value = null;
  toolForm.value = {
    name: '',
    description: '',
    size: '',
    downloadUrl: '',
    icon: 'FileText',
    tagsInput: '',
    order: 0
  };
}

async function deleteTool(tool: Tool) {
  if (!confirm('确定要删除这个工具吗？')) return;
  try {
    await toolApi.deleteTool(tool._id!);
    await loadTools();
  } catch (error) {
    console.error('删除工具失败:', error);
    alert('删除失败');
  }
}

function openGuideModal() {
  if (guide.value) {
    guideForm.value = {
      title: guide.value.title,
      itemsInput: guide.value.items.map(item => item.content).join('\n')
    };
  }
  showGuideModal.value = true;
}

async function saveGuide() {
  try {
    const items = guideForm.value.itemsInput
      .split('\n')
      .map((content, index) => ({ order: index, content: content.trim() }))
      .filter(item => item.content);

    await toolGuideApi.updateGuide({
      title: guideForm.value.title,
      items
    });
    closeGuideModal();
    await loadGuide();
    alert('保存成功');
  } catch (error) {
    console.error('保存使用说明失败:', error);
    alert('保存失败');
  }
}

function closeGuideModal() {
  showGuideModal.value = false;
  guideForm.value = {
    title: '',
    itemsInput: ''
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

.tools-table {
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

.icon-cell {
  font-size: 24px;
}

.description-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag {
  display: inline-block;
  padding: 4px 8px;
  background: #667eea;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 4px;
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

.form-group input, 
.form-group textarea,
.form-group select {
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