<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <div class="title-container">
      <h2>视频管理</h2>
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
        <a-button type="primary" @click="handleCreateVideo" style="margin-right: 16px;">新建视频</a-button>
        <ReloadOutlined @click="onRefresh" />
        <InfoCircleOutlined @click="onInfoClick" />
        <SettingOutlined @click="onSettingClick" />
        <a-avatar style="margin-left: 8px;">U</a-avatar>
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
          <template v-if="column.key === 'preview'">
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

    <!-- Create Video Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新建视频</h3>
          <button class="close-btn" @click="closeCreateModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> IP名称</label>
            <select v-model="createForm.ipName" class="form-select">
              <option value="">请选择</option>
              <option value="啵啵">啵啵</option>
              <option value="蝴蝶">蝴蝶</option>
              <option value="小熊">小熊</option>
            </select>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 视频名称</label>
            <input type="text" v-model="createForm.videoName" class="form-input" placeholder="请输入">
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 标签</label>
            <input type="text" v-model="createForm.tags" class="form-input" placeholder="请输入">
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 天气</label>
            <select v-model="createForm.weather" class="form-select">
              <option value="">请选择</option>
              <option value="晴天">晴天</option>
              <option value="阴天">阴天</option>
              <option value="多云">多云</option>
              <option value="小雨">小雨</option>
              <option value="大雨">大雨</option>
              <option value="雷阵雨">雷阵雨</option>
              <option value="大风">大风</option>
              <option value="台风">台风</option>
            </select>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 情景</label>
            <select v-model="createForm.scene" class="form-select">
              <option value="">请选择</option>
              <option value="居家">居家</option>
              <option value="办公">办公</option>
              <option value="户外">户外</option>
              <option value="旅行">旅行</option>
              <option value="运动">运动</option>
            </select>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 时间段</label>
            <select v-model="createForm.timePeriod" class="form-select">
              <option value="">请选择</option>
              <option value="上午 (8:00-11:59)">上午 (8:00-11:59)</option>
              <option value="下午 (13:00-17:59)">下午 (13:00-17:59)</option>
              <option value="中午 (12:00-12:59)">中午 (12:00-12:59)</option>
              <option value="傍晚 (18:00-19:59)">傍晚 (18:00-19:59)</option>
              <option value="晚上 (20:00-23:59)">晚上 (20:00-23:59)</option>
              <option value="凌晨 (00:00-7:59)">凌晨 (00:00-7:59)</option>
            </select>
          </div>
          <div class="form-group">
            <label>备注</label>
            <textarea v-model="createForm.remarks" class="form-textarea" placeholder="请输入"></textarea>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 上传视频</label>
            <div class="upload-area" @click="triggerFileUpload" @drop="handleFileDrop" @dragover.prevent @dragenter.prevent>
              <input 
                ref="fileInput" 
                type="file" 
                accept=".gif,.mp4,.pdd,.mov" 
                @change="handleFileChange" 
                style="display: none;"
              >
              <div class="upload-content">
                <div class="upload-icon">↑</div>
                <div class="upload-text">支持文件格式: gif, mp4, pdd, mov</div>
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

    <!-- Edit Video Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑视频</h3>
          <button class="close-btn" @click="closeEditModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> IP名称</label>
            <a-select v-model:value="editForm.ipName" placeholder="请选择" style="width: 100%;">
              <a-select-option value="啵啵">啵啵</a-select-option>
              <a-select-option value="蝴蝶">蝴蝶</a-select-option>
              <a-select-option value="小熊">小熊</a-select-option>
            </a-select>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 视频名称</label>
            <a-input v-model:value="editForm.videoName" placeholder="视频名称" />
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 标签</label>
            <a-input v-model:value="editForm.tags" placeholder="标签" />
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 天气</label>
            <a-select v-model:value="editForm.weather" placeholder="请选择" style="width: 100%;">
              <a-select-option value="晴天">晴天</a-select-option>
              <a-select-option value="阴天">阴天</a-select-option>
              <a-select-option value="多云">多云</a-select-option>
              <a-select-option value="小雨">小雨</a-select-option>
              <a-select-option value="大雨">大雨</a-select-option>
              <a-select-option value="雷阵雨">雷阵雨</a-select-option>
              <a-select-option value="大风">大风</a-select-option>
              <a-select-option value="台风">台风</a-select-option>
            </a-select>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 情景</label>
            <a-select v-model:value="editForm.scene" placeholder="请选择" style="width: 100%;">
              <a-select-option value="开心">开心</a-select-option>
              <a-select-option value="居家">居家</a-select-option>
              <a-select-option value="办公">办公</a-select-option>
              <a-select-option value="户外">户外</a-select-option>
              <a-select-option value="旅行">旅行</a-select-option>
              <a-select-option value="运动">运动</a-select-option>
            </a-select>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 时间段</label>
            <a-select v-model:value="editForm.timePeriod" placeholder="请选择" style="width: 100%;">
              <a-select-option value="白天">白天</a-select-option>
              <a-select-option value="上午 (8:00-11:59)">上午 (8:00-11:59)</a-select-option>
              <a-select-option value="下午 (13:00-17:59)">下午 (13:00-17:59)</a-select-option>
              <a-select-option value="中午 (12:00-12:59)">中午 (12:00-12:59)</a-select-option>
              <a-select-option value="傍晚 (18:00-19:59)">傍晚 (18:00-19:59)</a-select-option>
              <a-select-option value="晚上 (20:00-23:59)">晚上 (20:00-23:59)</a-select-option>
              <a-select-option value="凌晨 (00:00-7:59)">凌晨 (00:00-7:59)</a-select-option>
            </a-select>
          </div>
          <div class="form-group">
            <label>备注</label>
            <a-textarea v-model:value="editForm.remarks" placeholder="请输入" :rows="3" />
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 上传视频</label>
            <a-upload
              v-model:file-list="editForm.fileList"
              :before-upload="beforeUpload"
              :custom-request="customUpload"
              accept=".gif,.mp4,.avi,.mov"
              :show-upload-list="false"
            >
              <div class="upload-area">
                <div class="upload-content">
                  <div class="upload-icon">↑</div>
                  <div class="upload-text">点击或拖拽文件到此区域上传</div>
                  <div class="upload-hint">支持文件格式: .gif, .mp4, .avi, .mov</div>
                </div>
              </div>
            </a-upload>
            <div v-if="editForm.uploadProgress > 0" class="file-progress">
              <div class="progress-info">
                <span>文件上传</span>
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

interface VideoItem {
  key: number;
  videoId: string;
  ipName: string;
  videoName: string;
  scene: string;
  weather: string;
  situation: string;
  remarks: string;
  videoUrl: string;
  updater: string;
  createTime: string;
  updateTime: string;
}

const columnDefinitions: ColumnDefinition[] = [
  createColumn('rowIndex', '序号', 'rowIndex', 60, { fixed: 'left' }),
  createColumn('videoId', '视频ID', 'videoId', 120),
  createColumn('ipName', 'IP名称', 'ipName', 100),
  createColumn('videoName', '视频名称', 'videoName', 100),
  createColumn('scene', '场景', 'scene', 100),
  createColumn('weather', '天气', 'weather', 100),
  createColumn('situation', '情景', 'situation', 100),
  createColumn('remarks', '备注', 'remarks', 100),
  createColumn('videoUrl', '视频文件地址', 'videoUrl', 200),
  createColumn('preview', '预览', 'preview', 80),
  createColumn('updater', '更新人', 'updater', 120),
  createColumn('createTime', '创建时间', 'createTime', 150),
  createColumn('updateTime', '更新时间', 'updateTime', 150),
  createColumn('operation', '操作', 'operation', 150, { fixed: 'right' }),
];

const columnConfigs = createColumnConfigs(columnDefinitions);
const { columns, selectedColumnKeys, handleTableChange } = useTableColumns(columnConfigs);

const rawData: VideoItem[] = [];
for (let i = 0; i < 43; i++) {
  rawData.push({
    key: i + 1,
    videoId: 'hjhwx832y2f',
    ipName: '编辑',
    videoName: '太阳',
    scene: '居家',
    weather: '晴天',
    situation: '加班',
    remarks: '白天',
    videoUrl: 'https://example.com/firmware.bin',
    updater: '33',
    createTime: '2025-7-10 19:25:11',
    updateTime: '2025-7-10 19:25:11',
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
const handleView = (record: VideoItem) => console.log('View:', record);
const handleDelete = (record: VideoItem) => console.log('Delete:', record);
const handlePreview = (record: VideoItem) => console.log('Preview:', record);

// Modal state and form
const showCreateModal = ref(false);
const createForm = ref({
  ipName: '',
  videoName: '',
  tags: '',
  weather: '',
  scene: '',
  timePeriod: '',
  remarks: '',
  videoFile: null as File | null
});

const fileInput = ref<HTMLInputElement>();

const handleCreateVideo = () => {
  console.log('Create video clicked');
  showCreateModal.value = true;
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  // Reset form
  createForm.value = {
    ipName: '',
    videoName: '',
    tags: '',
    weather: '',
    scene: '',
    timePeriod: '',
    remarks: '',
    videoFile: null
  };
};

const handleCreateConfirm = () => {
  console.log('Create video form submitted:', createForm.value);
  // Here you would typically send the data to your API
  closeCreateModal();
};

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    createForm.value.videoFile = target.files[0];
  }
};

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    createForm.value.videoFile = event.dataTransfer.files[0];
  }
};

// Edit Modal state and form
const showEditModal = ref(false);
const editForm = ref({
  ipName: '',
  videoName: '',
  tags: '',
  weather: '',
  scene: '',
  timePeriod: '',
  remarks: '',
  fileList: [] as any[],
  uploadProgress: 0
});

const closeEditModal = () => {
  showEditModal.value = false;
  // Reset form
  editForm.value = {
    ipName: '',
    videoName: '',
    tags: '',
    weather: '',
    scene: '',
    timePeriod: '',
    remarks: '',
    fileList: [],
    uploadProgress: 0
  };
};

const handleEdit = (record: VideoItem) => {
  console.log('Edit:', record);
  // Populate form with record data
  editForm.value = {
    ipName: record.ipName,
    videoName: record.videoName,
    tags: record.situation, // Using situation as tags
    weather: record.weather,
    scene: record.scene,
    timePeriod: record.remarks, // Using remarks as time period
    remarks: '',
    fileList: [],
    uploadProgress: 0
  };
  showEditModal.value = true;
};

const handleEditConfirm = () => {
  console.log('Edit video form submitted:', editForm.value);
  // Here you would typically send the data to your API
  closeEditModal();
};

const beforeUpload = (file: File) => {
  const isValidFormat = ['.gif', '.mp4', '.avi', '.mov'].some(format => 
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

/* Modal Styles */
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
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
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
  padding: 24px;
}

.form-group {
  margin-bottom: 16px;
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

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  background-color: white;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(0, 0, 0, 0.25);
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
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

.upload-hint {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.35);
  margin-top: 4px;
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
</style> 