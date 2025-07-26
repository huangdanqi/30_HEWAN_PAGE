<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <div class="title-container">
      <h2>音乐素材</h2>
    </div>

    <div class="top-controls-wrapper">
      <div class="left-aligned-section">
        <div class="select-container" style="margin-right: 16px;">
          <span class="select-always-placeholder">IP类型:</span>
          <a-select v-model:value="ipTypeValue" style="width: 120px;" placeholder="全部">
            <a-select-option value="all">全部</a-select-option>
          </a-select>
        </div>
        
        <div class="select-container" style="margin-right: 16px;">
          <span class="select-always-placeholder">出库:</span>
          <a-select v-model:value="outboundValue" style="width: 120px;" placeholder="全部">
            <a-select-option value="all">全部</a-select-option>
          </a-select>
        </div>
        
        <div class="select-container" style="margin-right: 16px;">
          <span class="select-always-placeholder">天气:</span>
          <a-select v-model:value="weatherValue" style="width: 120px;" placeholder="全部">
            <a-select-option value="all">全部</a-select-option>
          </a-select>
        </div>
        
        <div class="select-container" style="margin-right: 16px;">
          <span class="select-always-placeholder">情景:</span>
          <a-select v-model:value="sceneValue" style="width: 120px;" placeholder="全部">
            <a-select-option value="all">全部</a-select-option>
          </a-select>
        </div>
        
        <div class="select-container" style="margin-right: 16px;">
          <span class="select-always-placeholder">相机:</span>
          <a-select v-model:value="cameraValue" style="width: 120px;" placeholder="全部">
            <a-select-option value="all">全部</a-select-option>
          </a-select>
        </div>
      </div>
      
      <div class="right-aligned-icons">
        <a-input v-model:value="searchInputValue" placeholder="请输入关键词" style="width: 200px; margin-right: 16px;">
          <template #prefix><SearchOutlined /></template>
        </a-input>
        <a-button type="primary" style="margin-right: 16px;" @click="handleCreateMusic">新建音乐</a-button>
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
        :scroll="{ x: 1500 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'language'">
            <EyeOutlined style="color: #1890ff; cursor: pointer;" @click="handlePreview(record)" />
          </template>
          <template v-if="column.key === 'updater'">
            <a-space><a-avatar size="small">33</a-avatar><span>33</span></a-space>
          </template>
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

    <!-- 新建音乐 Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content music-modal" @click.stop>
        <div class="modal-header">
          <h3>新建音乐</h3>
          <button class="close-btn" @click="closeCreateModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 音乐名称</label>
            <input type="text" v-model="createForm.musicName" class="form-input" placeholder="请输入" />
          </div>
          <div class="form-group">
            <label>演唱者</label>
            <input type="text" v-model="createForm.singer" class="form-input" placeholder="请输入" />
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 音乐类型 <span class="multi-tip">（多选）</span></label>
            <a-select
              v-model:value="createForm.musicTypes"
              mode="multiple"
              placeholder="请选择"
              style="width: 100%;"
              :max-tag-count="3"
            >
              <a-select-option v-for="type in musicTypeOptions" :key="type" :value="type">{{ type }}</a-select-option>
            </a-select>
          </div>
          <div class="form-group">
            <label>标签</label>
            <input type="text" v-model="createForm.tags" class="form-input" placeholder="请输入" />
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 上传音乐</label>
            <div class="upload-area" @click="triggerFileUpload" @drop="handleFileDrop" @dragover.prevent @dragenter.prevent>
              <input 
                ref="fileInput" 
                type="file" 
                accept=".mp3,.wav,.opus" 
                @change="handleFileChange" 
                style="display: none;"
              >
              <div class="upload-content">
                <div class="upload-icon">↑</div>
                <div class="upload-text">支持文件格式: mp3, wav, opus</div>
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

    <!-- 编辑音乐 Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content music-modal" @click.stop>
        <div class="modal-header">
          <h3>编辑音乐</h3>
          <button class="close-btn" @click="closeEditModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 音乐名称</label>
            <a-input v-model:value="editForm.musicName" placeholder="请输入" />
          </div>
          <div class="form-group">
            <label>演唱者</label>
            <a-input v-model:value="editForm.singer" placeholder="请输入" />
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 音乐类型</label>
            <a-select
              v-model:value="editForm.musicTypes"
              mode="multiple"
              placeholder="请选择"
              style="width: 100%;"
              :max-tag-count="3"
            >
              <a-select-option v-for="type in musicTypeOptions" :key="type" :value="type">{{ type }}</a-select-option>
            </a-select>
          </div>
          <div class="form-group">
            <label>标签</label>
            <a-select
              v-model:value="editForm.tags"
              mode="multiple"
              placeholder="请输入"
              style="width: 100%;"
              :max-tag-count="3"
            >
              <a-select-option v-for="tag in tagOptions" :key="tag" :value="tag">{{ tag }}</a-select-option>
            </a-select>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 上传音乐</label>
            <a-upload
              v-model:file-list="editForm.fileList"
              :before-upload="beforeUpload"
              :custom-request="customUpload"
              accept=".mp3,.wav,.opus"
              :show-upload-list="false"
            >
              <div class="upload-area">
                <div class="upload-content">
                  <div class="upload-icon">↑</div>
                  <div class="upload-text">支持文件格式: mp3、wav、opus</div>
                </div>
              </div>
            </a-upload>
            <div v-if="editForm.uploadProgress > 0" class="file-progress">
              <div class="progress-info">
                <span class="file-name">📎 文件名.xls</span>
                <span class="progress-text">{{ editForm.uploadProgress }}%</span>
                <span class="delete-icon" @click="removeUploadFile">🗑️</span>
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
import { ReloadOutlined, SettingOutlined, SearchOutlined, InfoCircleOutlined, EyeOutlined } from '@ant-design/icons-vue';
import { createColumnConfigs, useTableColumns, createColumn, type ColumnDefinition } from '../utils/tableConfig';

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: { ...zh_CN.Pagination, page: '' },
}));

interface MusicItem {
  key: number;
  musicId: string;
  ipName: string;
  musicName: string;
  musicType: string;
  tags: string;
  emotion: string;
  language: string;
  updater: string;
  createTime: string;
  updateTime: string;
}

const columnDefinitions: ColumnDefinition[] = [
  createColumn('rowIndex', '序号', 'rowIndex', 60, { fixed: 'left' }),
  createColumn('musicId', '音乐ID', 'musicId', 150),
  createColumn('ipName', 'IP名称', 'ipName', 100),
  createColumn('musicName', '音乐名称', 'musicName', 100),
  createColumn('musicType', '音乐类型', 'musicType', 120),
  createColumn('tags', '标签', 'tags', 100),
  createColumn('emotion', '情绪', 'emotion', 200),
  createColumn('language', '语种', 'language', 80),
  createColumn('updater', '更新人', 'updater', 120),
  createColumn('createTime', '创建时间', 'createTime', 150),
  createColumn('updateTime', '更新时间', 'updateTime', 150),
  createColumn('operation', '操作', 'operation', 150, { fixed: 'right' }),
];

const columnConfigs = createColumnConfigs(columnDefinitions);
const { columns, selectedColumnKeys, handleTableChange } = useTableColumns(columnConfigs);

const rawData: MusicItem[] = [];
for (let i = 0; i < 94; i++) {
  rawData.push({
    key: i + 1,
    musicId: 'hjhwnt602q01',
    ipName: 'GBAD',
    musicName: 'pop',
    musicType: 'Jackson',
    tags: '-',
    emotion: 'https://example.com/firmware.bin',
    language: '',
    updater: '33',
    createTime: '2025-7-13 19:25:11',
    updateTime: '2025-7-13 19:25:11',
  });
}

const searchInputValue = ref('');
const ipTypeValue = ref('all');
const outboundValue = ref('all');
const weatherValue = ref('all');
const sceneValue = ref('all');
const cameraValue = ref('all');
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
  return data;
});

const pagination = computed(() => ({
  total: filteredData.value.length,
  current: currentPage.value,
  pageSize: pageSize.value,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
  showTotal: (total: number, range: [number, number]) => `共 ${range[0]}-${range[1]} 条 / ${total} 条`,
  showQuickJumper: { goButton: '前往' },
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
const handleView = (record: MusicItem) => console.log('View:', record);
const handleDelete = (record: MusicItem) => console.log('Delete:', record);
const handlePreview = (record: MusicItem) => console.log('Preview:', record);

const showCreateModal = ref(false);
const createForm = ref({
  musicName: '',
  singer: '',
  musicTypes: [] as string[],
  tags: '',
  musicFile: null as File | null
});
const musicTypeOptions = [
  '流行乐', '摇滚', 'R&B', '爵士', '古典', '钢琴曲', '纯音乐', '买卖音乐', '轻音乐',
  '解压', '流行', '舒缓', '欢快', '伤感', '自然音乐', '白噪音'
];
const fileInput = ref<HTMLInputElement>();
const closeCreateModal = () => {
  showCreateModal.value = false;
  createForm.value = {
    musicName: '',
    singer: '',
    musicTypes: [],
    tags: '',
    musicFile: null
  };
};
const triggerFileUpload = () => fileInput.value?.click();
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    createForm.value.musicFile = target.files[0];
  }
};
const handleFileDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    createForm.value.musicFile = event.dataTransfer.files[0];
  }
};
const handleCreateConfirm = () => {
  // Validate required fields if needed
  closeCreateModal();
};

const handleCreateMusic = () => {
  console.log('Create music button clicked');
  showCreateModal.value = true;
};

// Edit Modal state and form
const showEditModal = ref(false);
const editForm = ref({
  musicName: '',
  singer: '',
  musicTypes: [] as string[],
  tags: [] as string[],
  fileList: [] as any[],
  uploadProgress: 0
});

const tagOptions = [
  '愉悦', '解压', '轻松', '欢快', '伤感', '激情', '舒缓', '自然', '冥想'
];

const closeEditModal = () => {
  showEditModal.value = false;
  // Reset form
  editForm.value = {
    musicName: '',
    singer: '',
    musicTypes: [],
    tags: [],
    fileList: [],
    uploadProgress: 0
  };
};

const handleEdit = (record: MusicItem) => {
  console.log('Edit:', record);
  // Populate form with record data
  editForm.value = {
    musicName: record.musicName,
    singer: record.musicType, // Using musicType as singer
    musicTypes: ['流行乐', '激情'], // Pre-selected values from image
    tags: ['愉悦', '解压'], // Pre-selected values from image
    fileList: [],
    uploadProgress: 45 // Progress from image
  };
  showEditModal.value = true;
};

const handleEditConfirm = () => {
  console.log('Edit music form submitted:', editForm.value);
  // Here you would typically send the data to your API
  closeEditModal();
};

const beforeUpload = (file: File) => {
  const isValidFormat = ['.mp3', '.wav', '.opus'].some(format => 
    file.name.toLowerCase().endsWith(format)
  );
  if (!isValidFormat) {
    console.error('Invalid file format');
    return false;
  }
  return true;
};

const customUpload = (options: any) => {
  const { file, onProgress } = options;
  
  // Simulate upload progress
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    editForm.value.uploadProgress = progress;
    onProgress({ percent: progress });
    
    if (progress >= 100) {
      clearInterval(interval);
      editForm.value.fileList = [file];
    }
  }, 200);
};

const removeUploadFile = () => {
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

.music-modal {
  width: 480px;
  max-width: 95vw;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px 0 24px;
}
.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}
.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.45);
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:hover {
  color: rgba(0, 0, 0, 0.85);
}
.modal-body {
  padding: 24px 24px 0 24px;
}
.form-group {
  margin-bottom: 18px;
}
.required-field {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
}
.asterisk {
  color: #ff4d4f;
  font-size: 14px;
  font-weight: bold;
}
.multi-tip {
  color: #bfbfbf;
  font-size: 12px;
  margin-left: 4px;
}
.form-input {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  background-color: white;
  transition: border-color 0.3s;
}
.form-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}
.upload-area {
  width: 100%;
  height: 120px;
  border: 2px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fafafa;
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
  margin-bottom: 8px;
}
.upload-text {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
}
.btn {
  padding: 4px 15px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.3s;
}
.btn-secondary {
  background-color: white;
  border-color: #d9d9d9;
  color: rgba(0, 0, 0, 0.85);
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
  margin-top: 8px;
}

.progress-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
}

.file-name {
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
}

.progress-text {
  color: #1890ff;
  font-weight: 500;
}

.delete-icon {
  cursor: pointer;
  font-size: 14px;
  color: #ff4d4f;
}

.delete-icon:hover {
  color: #ff7875;
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