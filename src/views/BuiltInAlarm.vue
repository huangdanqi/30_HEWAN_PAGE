<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <div class="title-container">
      <h2>预制闹铃</h2>
    </div>
    <div class="top-controls-wrapper">
      <div class="left-aligned-section">
        <div class="select-container" style="margin-right: 16px;">
          <span class="select-always-placeholder">闹铃类型:</span>
          <a-select v-model:value="alarmTypeValue" style="width: 120px;" placeholder="全部">
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="定时">定时</a-select-option>
            <a-select-option value="事件">事件</a-select-option>
          </a-select>
        </div>
        <div class="select-container" style="margin-right: 16px;">
          <span class="select-always-placeholder">状态:</span>
          <a-select v-model:value="statusValue" style="width: 120px;" placeholder="全部">
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="启用">启用</a-select-option>
            <a-select-option value="禁用">禁用</a-select-option>
          </a-select>
        </div>
      </div>
      <div class="right-aligned-icons">
        <a-input v-model:value="searchInputValue" placeholder="请输入关键词" style="width: 200px; margin-right: 16px;">
          <template #prefix><SearchOutlined /></template>
        </a-input>
        <a-button type="primary" style="margin-right: 16px;" @click="showCreateModal = true">新建闹铃</a-button>
        <!-- 新建闹铃 Modal -->
        <div v-if="showCreateModal" class="modal-overlay" @click.self="closeCreateModal">
          <div class="modal-content alarm-modal" @click.stop>
            <div class="modal-header">
              <h3>新建闹铃</h3>
              <button class="close-btn" @click="closeCreateModal">×</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="required-field"><span class="asterisk">*</span> 闹铃名称</label>
                <input type="text" v-model="createForm.alarmName" class="form-input" placeholder="请输入" />
              </div>
              <div class="form-group">
                <label class="required-field"><span class="asterisk">*</span> 上传铃声</label>
                <div class="upload-area" @click="triggerFileUpload" @drop="handleFileDrop" @dragover.prevent @dragenter.prevent>
                  <input 
                    ref="fileInput" 
                    type="file" 
                    accept=".mp3,.wav,.aac" 
                    @change="handleFileChange" 
                    style="display: none;"
                  >
                  <div class="upload-content">
                    <div class="upload-icon">↑</div>
                    <div class="upload-text">支持文件格式: mp3, wav, aac</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeCreateModal">取消</button>
              <button class="btn btn-primary" @click="handleCreateConfirm">确定</button>
            </div>
          </div>
        </div>
        <ReloadOutlined @click="onRefresh" />
        <InfoCircleOutlined @click="onInfoClick" />
        <SettingOutlined @click="onSettingClick" />
        <a-avatar style="margin-left: 8px;">33</a-avatar>
      </div>
    </div>
    <div class="table-container">
      <a-table
        :columns="columns"
        :data-source="filteredData"
        :pagination="pagination"
        :loading="loading"
        :size="tableSize"
        :scroll="{ x: 1200 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'operation'">
            <a-space class="action-cell">
              <a class="view-link" @click="handleView(record)">查看</a>
              <a-divider type="vertical" />
              <a class="edit-link" @click="handleEdit(record)">编辑</a>
              <a-divider type="vertical" />
              <a class="danger-link" @click="handleDelete(record)">删除</a>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

<!-- 编辑闹铃 Modal -->
<div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
  <div class="modal-content alarm-modal" @click.stop>
    <div class="modal-header">
      <h3>编辑闹铃</h3>
      <button class="close-btn" @click="closeEditModal">×</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="required-field"><span class="asterisk">*</span> 闹铃名称</label>
        <input type="text" v-model="editForm.alarmName" class="form-input" placeholder="请输入" />
      </div>
      <div class="form-group">
        <label class="required-field"><span class="asterisk">*</span> 上传铃声</label>
        <div class="upload-area" @click="triggerEditFileUpload" @drop="handleEditFileDrop" @dragover.prevent @dragenter.prevent>
          <input 
            ref="editFileInput" 
            type="file" 
            accept=".mp3,.wav,.opus" 
            @change="handleEditFileChange" 
            style="display: none;"
          >
          <div class="upload-content">
            <div class="upload-icon">↑</div>
            <div class="upload-text">支持文件格式: mp3、wav、opus</div>
          </div>
        </div>
        <!-- File Progress Display -->
        <div v-if="editForm.fileList.length > 0" class="file-progress">
          <div class="file-info">
            <span class="file-name">{{ editForm.fileList[0].name }}</span>
            <span class="progress-text">{{ editForm.uploadProgress }}%</span>
            <button class="delete-btn" @click="removeEditUploadFile">🗑️</button>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: editForm.uploadProgress + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" @click="closeEditModal">取消</button>
      <button class="btn btn-primary" @click="handleEditConfirm">确定</button>
    </div>
  </div>
</div>
  </a-config-provider>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme } from 'ant-design-vue';
import { ReloadOutlined, SettingOutlined, SearchOutlined, InfoCircleOutlined } from '@ant-design/icons-vue';
import { createColumnConfigs, useTableColumns, createColumn, type ColumnDefinition } from '../utils/tableConfig';

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: { ...zh_CN.Pagination, page: '' },
}));

interface AlarmItem {
  key: number;
  alarmId: string;
  alarmName: string;
  alarmType: string;
  status: string;
  time: string;
  repeat: string;
  sound: string;
  updater: string;
  createTime: string;
  updateTime: string;
}

const columnDefinitions: ColumnDefinition[] = [
  createColumn('rowIndex', '序号', 'rowIndex', 60, { fixed: 'left' }),
  createColumn('alarmId', '闹铃ID', 'alarmId', 150),
  createColumn('alarmName', '闹铃名称', 'alarmName', 120),
  createColumn('alarmType', '闹铃类型', 'alarmType', 100),
  createColumn('status', '状态', 'status', 80),
  createColumn('time', '时间', 'time', 120),
  createColumn('repeat', '重复', 'repeat', 100),
  createColumn('sound', '铃声文件', 'sound', 200),
  createColumn('updater', '更新人', 'updater', 120),
  createColumn('createTime', '创建时间', 'createTime', 150),
  createColumn('updateTime', '更新时间', 'updateTime', 150),
  createColumn('operation', '操作', 'operation', 150, { fixed: 'right' }),
];

const columnConfigs = createColumnConfigs(columnDefinitions);
const { columns, selectedColumnKeys, handleTableChange } = useTableColumns(columnConfigs);

const rawData: AlarmItem[] = [];
for (let i = 0; i < 20; i++) {
  rawData.push({
    key: i + 1,
    alarmId: 'hywhz832y2f',
    alarmName: '起床闹铃',
    alarmType: '定时',
    status: '启用',
    time: '07:00',
    repeat: '每天',
    sound: 'https://example.com/ring.mp3',
    updater: '33',
    createTime: '2025-7-19 19:25:11',
    updateTime: '2025-7-19 19:25:11',
  });
}

const searchInputValue = ref('');
const alarmTypeValue = ref('all');
const statusValue = ref('all');
const loading = ref(false);
const tableSize = ref('middle');
const currentPage = ref(1);
const pageSize = ref(10);

const filteredData = computed(() => {
  let data = rawData;
  if (searchInputValue.value) {
    const term = searchInputValue.value.toLowerCase();
    data = data.filter(item => 
      Object.values(item).some(val => typeof val === 'string' && val.toLowerCase().includes(term))
    );
  }
  if (alarmTypeValue.value !== 'all') {
    data = data.filter(item => item.alarmType === alarmTypeValue.value);
  }
  if (statusValue.value !== 'all') {
    data = data.filter(item => item.status === statusValue.value);
  }
  return data;
});

const pagination = computed(() => ({
  total: filteredData.value.length,
  current: currentPage.value,
  pageSize: pageSize.value,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
  showTotal: (total: number, range: [number, number]) => `第${range[0]}-${range[1]}条/共${total}条`,
  showQuickJumper: { goButton: '跳转' },
  onChange: (page: number, size: number) => {
    currentPage.value = page;
    pageSize.value = size;
  },
}));

const onRefresh = () => {
  loading.value = true;
  searchInputValue.value = '';
  currentPage.value = 1;
  setTimeout(() => { loading.value = false; }, 500);
};

const onInfoClick = () => console.log('Info clicked');
const onSettingClick = () => console.log('Setting clicked');
const handleView = (record: AlarmItem) => console.log('View:', record);
const handleDelete = (record: AlarmItem) => console.log('Delete:', record);

// Create Modal Logic
const showCreateModal = ref(false);
const createForm = ref({
  alarmName: '',
  alarmFile: null as File | null
});
const fileInput = ref<HTMLInputElement>();

const closeCreateModal = () => {
  showCreateModal.value = false;
  createForm.value = {
    alarmName: '',
    alarmFile: null
  };
};

const triggerFileUpload = () => fileInput.value?.click();

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    createForm.value.alarmFile = target.files[0];
  }
};

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    createForm.value.alarmFile = event.dataTransfer.files[0];
  }
};

const handleCreateConfirm = () => {
  // Validate and submit
  closeCreateModal();
};

// Edit Modal Logic
const showEditModal = ref(false);
const editForm = ref({
  alarmName: '',
  fileList: [] as any[],
  uploadProgress: 0
});
const editFileInput = ref<HTMLInputElement>();

const closeEditModal = () => {
  showEditModal.value = false;
  editForm.value = {
    alarmName: '',
    fileList: [],
    uploadProgress: 0
  };
};

const handleEdit = (record: AlarmItem) => {
  // Populate form with record data
  editForm.value = {
    alarmName: record.alarmName,
    fileList: [{
      name: '文件名.xls',
      uid: '1'
    }],
    uploadProgress: 45 // Progress from image
  };
  showEditModal.value = true;
};

const handleEditConfirm = () => {
  // Validate and submit
  closeEditModal();
};

const triggerEditFileUpload = () => editFileInput.value?.click();

const handleEditFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    editForm.value.fileList = [{
      name: file.name,
      uid: Date.now().toString()
    }];
    // Simulate upload progress
    editForm.value.uploadProgress = 0;
    const interval = setInterval(() => {
      editForm.value.uploadProgress += 10;
      if (editForm.value.uploadProgress >= 100) {
        clearInterval(interval);
      }
    }, 200);
  }
};

const handleEditFileDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const file = event.dataTransfer.files[0];
    editForm.value.fileList = [{
      name: file.name,
      uid: Date.now().toString()
    }];
    // Simulate upload progress
    editForm.value.uploadProgress = 0;
    const interval = setInterval(() => {
      editForm.value.uploadProgress += 10;
      if (editForm.value.uploadProgress >= 100) {
        clearInterval(interval);
      }
    }, 200);
  }
};

const removeEditUploadFile = () => {
  editForm.value.fileList = [];
  editForm.value.uploadProgress = 0;
};

onMounted(() => {
  selectedColumnKeys.value = columnConfigs.map(config => config.key);
});

defineExpose({ handleTableChange });
</script>

<style scoped>
.title-container {
  padding: 10px 14px;
  margin-bottom: 10px;
  background-color: #fff;
  border-radius: 4px;
}

.title-container h2 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.85);
  text-align: left;
}

.top-controls-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.left-aligned-section {
  display: flex;
  align-items: center;
}

.right-aligned-icons {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-right: 30px;
}

.right-aligned-icons > .anticon {
  padding: 6px 8px;
  border: 1px solid #d9d9d9;
  background-color: #f0f0f0;
  border-radius: 4px;
  transition: all 0.3s;
  cursor: pointer;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.65);
}

.right-aligned-icons > .anticon:hover {
  border-color: #4096ff;
  color: #4096ff;
  background-color: #e6f7ff;
}

.table-container {
  padding: 10px;
  padding-right: 50px;
}

.select-container {
  position: relative;
  display: inline-block;
}

.select-always-placeholder {
  position: absolute;
  top: 50%;
  left: 7px;
  transform: translateY(-50%);
  color: rgba(0, 0, 0, 0.45);
  pointer-events: none;
  z-index: 1;
  font-size: 13px;
}

:deep(.ant-select-selector) {
  padding-left: 60px !important;
}

:deep(.ant-select-selector),
:deep(.ant-select-dropdown),
:deep(.ant-select-item),
:deep(.ant-select-selection-item),
:deep(.ant-select-item-option-content) {
  font-size: 12px !important;
}

:deep(.ant-pagination) {
  font-size: 12px !important;
}

:deep(.ant-input),
:deep(.ant-btn-primary) {
  font-size: 13px !important;
}

:deep(.ant-input::placeholder) {
  font-size: 13px !important;
}

:deep(.ant-table-cell .action-cell) {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 150px;
}

:deep(.ant-table-cell .action-cell .view-link) {
  color: #1890ff !important;
  font-weight: bold;
}

:deep(.ant-table-cell .action-cell .edit-link) {
  color: #1890ff !important;
  font-weight: bold;
}

:deep(.ant-table-cell .action-cell .danger-link) {
  color: #ff4d4f !important;
  font-weight: bold;
}

:deep(.nowrap-header) {
  white-space: nowrap !important;
}

.alarm-modal {
  width: 400px;
  max-width: 95vw;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  border-radius: 8px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.10);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px 0 24px;
}
.modal-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #222;
}
.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #bfbfbf;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:hover {
  color: #222;
}
.modal-body {
  padding: 18px 32px 0 32px;
}
.form-group {
  margin-bottom: 22px;
}
.required-field {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #222;
  font-weight: 500;
}
.asterisk {
  color: #ff4d4f;
  font-size: 13px;
  font-weight: bold;
}
.form-input {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  font-size: 13px;
  color: #222;
  background-color: white;
  transition: border-color 0.3s;
}
.form-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.08);
}
.upload-area {
  width: 100%;
  height: 90px;
  border: 2px dashed #e5e6eb;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fafbfc;
}
.upload-area:hover {
  border-color: #1890ff;
  background-color: #f0f8ff;
}
.upload-content {
  text-align: center;
}
.upload-icon {
  font-size: 32px;
  color: #1890ff;
  margin-bottom: 4px;
}
.upload-text {
  font-size: 12px;
  color: #bfbfbf;
  margin-top: 2px;
}
.modal-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 18px 24px 18px 24px;
  border-top: none;
}
.btn {
  min-width: 60px;
  padding: 4px 0;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.3s;
}
.btn-secondary {
  background-color: white;
  border-color: #e5e6eb;
  color: #222;
}
.btn-secondary:hover {
  border-color: #1890ff;
  color: #1890ff;
}
.btn-primary {
  background-color: #1890ff;
  border-color: #1890ff;
  color: white;
}
.btn-primary:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.file-progress {
  margin-top: 12px;
  padding: 12px;
  background-color: #fafbfc;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
}

.file-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.file-name {
  font-size: 13px;
  color: #222;
  flex: 1;
}

.progress-text {
  font-size: 12px;
  color: #666;
  margin-right: 8px;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #999;
  padding: 2px;
}

.delete-btn:hover {
  color: #ff4d4f;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #1890ff;
  transition: width 0.3s ease;
}
</style> 