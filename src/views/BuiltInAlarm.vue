<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <div class="title-container">
      <h2>预制闹铃</h2>
    </div>
    <div class="top-controls-wrapper">
      <div class="left-aligned-section">
        <!-- Left side content can be added here if needed -->
      </div>
      <!-- icon area -->
      <div class="right-aligned-icons">
          <!-- search area  -->
          <a-input
            v-model:value="searchInputValue"
            placeholder="输入关键字搜索"
            style="width: 200px"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
          <a-button type="primary" @click="showCreateModal = true">新建闹铃</a-button>
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
                <!-- <div class="form-group">
                  <label>更新人</label>
                  <input 
                    type="text" 
                    :value="userName"
                    class="form-input" 
                    readonly
                    style="background-color: #f5f5f5;"
                  >
                </div> -->
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
                  <!-- File display after upload -->
                  <div v-if="createForm.alarmFile" class="file-info">
                    <span class="file-icon">📎</span>
                    <span class="file-name">{{ createForm.alarmFile.name }}</span>
                    <span class="delete-icon" @click="removeUploadedFile">🗑️</span>
                  </div>
                  <!-- Upload progress bar -->
                  <div v-if="uploadProgress > 0 && uploadProgress < 100" class="file-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
                    </div>
                    <span class="progress-text">{{ uploadProgress }}%</span>
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
          <a-dropdown>
            <ColumnHeightOutlined @click.prevent />
            <template #overlay>
              <a-menu @click="handleMenuClick">
                <a-menu-item key="large">宽松</a-menu-item>
                <a-menu-item key="middle">中等</a-menu-item>
                <a-menu-item key="small">紧凑</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          <a-popover trigger="click" placement="bottomRight">
            <template #content>
              <div class="column-setting-panel" style="max-height: 300px; overflow-y: auto;">
                <div class="setting-section">
                  <div class="section-header" style="display: flex; justify-content: space-between;">
                    <span>列展示</span>
                    <a-button type="link" @click="resetColumns">重置</a-button>
                  </div>

                  <draggable
                    v-model="columnOrder"
                    item-key="key"
                    @end="onColumnOrderChange"
                    class="column-checkbox-group"
                  >
                    <template #item="{ element: colKey }">
                      <div class="column-checkbox-item" style="padding: 4px 0;">
                        <a-checkbox
                          :checked="selectedColumnKeys.includes(colKey)"
                          @change="(event: Event) => handleColumnVisibilityChange(colKey, (event.target as HTMLInputElement).checked)"
                        >
                          {{ columnConfigs.find(config => config.key === colKey)?.title }}
                        </a-checkbox>
                      </div>
                    </template>
                  </draggable>
                </div>
              </div>
            </template>
            <SettingOutlined @click="onSettingClick" />
          </a-popover>
      </div>
    </div>
    <div class="table-container">
      <!-- Debug info -->
      <div v-if="loading" style="text-align: center; padding: 20px; color: #666;">
        正在加载数据...
      </div>
      <div v-else-if="rawData.length === 0" style="text-align: center; padding: 20px; color: #666;">
        <div>暂无数据</div>
        <div style="margin-top: 10px; font-size: 12px; color: #999;">
          可能的原因：1) API端点不存在 2) 数据库中没有数据 3) 权限问题
        </div>
        <button @click="fetchData" style="margin-top: 10px; padding: 5px 10px; border: 1px solid #d9d9d9; border-radius: 4px; background: white; cursor: pointer;">
          重新加载
        </button>
      </div>
      
      <a-table
        v-if="rawData.length > 0"
        :columns="columns"
        :data-source="filteredData"
        :pagination="pagination"
        :loading="loading"
        :size="tableSize"
        :scroll="{ x: 1200 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'audition'">
            <a-button type="link" size="small" @click="handleAudition(record)">
              <PlayCircleOutlined v-if="!record.isPlaying" />
              <PauseCircleOutlined v-else />
            </a-button>
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
      <!-- <div class="form-group">
        <label>更新人</label>
        <input 
          type="text" 
          :value="userName"
          class="form-input" 
          readonly
          style="background-color: #f5f5f5;"
        >
      </div> -->
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
        <div v-if="editForm.existingFile" style="font-size: 12px; color: #666; margin-top: 4px;">
          提示：如果不选择新文件，将保留现有文件
        </div>
        <!-- Show existing file info if available -->
        <div v-if="editForm.existingFile" class="file-info">
          <span class="file-icon">📎</span>
          <span class="file-name">{{ editForm.existingFile }}</span>
          <!-- <span class="file-note">(当前文件)</span> -->
        </div>
        <!-- Show new file info if uploading -->
        <div v-if="editForm.fileList.length > 0" class="file-info">
          <span class="file-icon">📎</span>
          <span class="file-name">{{ editForm.fileList[0].name }}</span>
          <span class="delete-icon" @click="removeEditUploadFile">🗑️</span>
        </div>
        <!-- Upload progress bar for new file -->
        <div v-if="editForm.uploadProgress > 0 && editForm.uploadProgress < 100" class="file-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: editForm.uploadProgress + '%' }"></div>
          </div>
          <span class="progress-text">{{ editForm.uploadProgress }}%</span>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" @click="closeEditModal" :disabled="isEditing">取消</button>
      <button class="btn btn-primary" @click="handleEditConfirm" :disabled="isEditing">
        {{ isEditing ? '更新中...' : '确定' }}
      </button>
    </div>
  </div>
</div>
  </a-config-provider>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme } from 'ant-design-vue';
import { ReloadOutlined, ColumnHeightOutlined, SettingOutlined, SearchOutlined, InfoCircleOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons-vue';
import draggable from 'vuedraggable';
import { createColumnConfigs, useTableColumns, createColumn, type ColumnDefinition } from '../utils/tableConfig';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: { ...zh_CN.Pagination, page: '' },
}));

// Initialize auth store
const authStore = useAuthStore();
const userName = computed(() => authStore.user?.name || authStore.user?.username || '管理员');

interface AlarmItem {
  key: number;
  alarmId: string;
  alarmName: string;
  alarmFileAddress: string;
  updater: string;
  createTime: string;
  updateTime: string;
  isPlaying: boolean; // Add isPlaying property
}

const columnDefinitions: ColumnDefinition[] = [
  createColumn('rowIndex', '序号', 'rowIndex', 60, { fixed: 'left', sortable: true, sortType: 'number' }),
  createColumn('alarmId', '闹铃 ID', 'alarmId', 150, { sortable: true, sortType: 'string' }),
  createColumn('alarmName', '闹铃名称', 'alarmName', 120, { sortable: true, sortType: 'string' }),
  createColumn('alarmFileAddress', '闹铃文件地址', 'alarmFileAddress', 200, { sortable: true, sortType: 'string' }),
  createColumn('audition', '试听', 'audition', 80),
  createColumn('updater', '更新人', 'updater', 120, { sortable: true, sortType: 'string' }),
  createColumn('createTime', '创建时间', 'createTime', 150, { sortable: true, sortType: 'date' }),
  createColumn('updateTime', '更新时间', 'updateTime', 150, { sortable: true, sortType: 'date' }),
  createColumn('operation', '操作', 'operation', 150, { fixed: 'right' }),
];

const columnConfigs = createColumnConfigs(columnDefinitions);

// Add custom render for rowIndex column
const updatedColumnConfigs = columnConfigs.map(config => {
  if (config.key === 'rowIndex') {
    return {
      ...config,
      customRender: ({ index }: { index: number }) => (currentPage.value - 1) * pageSize.value + index + 1
    };
  }
  return config;
});

// Use the table columns composable
const {
  columns,
  columnOrder,
  selectedColumnKeys,
  sorterInfo,
  resetColumns,
  onColumnOrderChange,
  handleColumnVisibilityChange,
  handleTableChange,
} = useTableColumns(updatedColumnConfigs);

// Data fetching
const rawData = ref<AlarmItem[]>([]);
const loading = ref(false);

const fetchData = async () => {
  console.log('fetchData called');
  console.log('Current rawData value:', rawData.value);
  loading.value = true;
  try {
    console.log('Calling built-in alarm endpoint');
    // Use the correct endpoint
    console.log('Trying endpoint: /api/alarm');
    const response = await axios.get('http://121.43.196.106:2829/api/alarm?page=1&pageSize=1000');
    console.log('✅ /api/alarm succeeded');
    
    console.log('Alarm response:', response.data);
    console.log('Response data length:', response.data.data?.length);
    console.log('Response structure keys:', Object.keys(response.data));
    
    if (response.data.data && Array.isArray(response.data.data)) {
      rawData.value = response.data.data.map((item: any) => ({
        ...item,
        key: item.id || item.alarmId || item.key,
        isPlaying: false
      }));
      console.log('Processed data length:', rawData.value.length);
      console.log('First processed item:', rawData.value[0]);
    } else if (response.data && Array.isArray(response.data)) {
      // If the response is directly an array
      rawData.value = response.data.map((item: any) => ({
        ...item,
        key: item.id || item.alarmId || item.key,
        isPlaying: false
      }));
      console.log('Processed data length (direct array):', rawData.value.length);
      console.log('First processed item:', rawData.value[0]);
    } else {
      console.error('Unexpected response structure:', response.data);
      console.log('Response type:', typeof response.data);
      console.log('Response is array:', Array.isArray(response.data));
      rawData.value = [];
    }
  } catch (error: any) {
    console.error('Error fetching data:', error);
    console.error('Error details:', error.response?.data);
    console.error('Error status:', error.response?.status);
    rawData.value = [];
  } finally {
    loading.value = false;
    console.log('Final rawData value:', rawData.value);
    console.log('Final rawData length:', rawData.value.length);
  }
};

// Audio elements management
const audioElements = ref<Map<number, HTMLAudioElement>>(new Map()); // Store audio elements

const handleAudition = (record: AlarmItem) => {
  console.log('Audition clicked:', record);
  
  // Get or create the audio element for this record
  let audioElement = audioElements.value.get(record.key);

  if (!audioElement) {
    // Construct the correct URL for the audio file
    // Backend serves audio files from /audio endpoint (not /api/audio)
    let audioUrl;
    if (record.alarmFileAddress.startsWith('http://') || record.alarmFileAddress.startsWith('https://')) {
      audioUrl = record.alarmFileAddress;
    } else {
      // Check if the path already contains /audio/ and handle accordingly
      let fileName = record.alarmFileAddress;
      
      // Remove leading slashes
      fileName = fileName.replace(/^\/+/, '');
      
      // If it already contains 'audio/' at the beginning, use it as is
      if (fileName.startsWith('audio/')) {
        audioUrl = `http://121.43.196.106:2829/${fileName}`;
      } else {
        // Otherwise, add the /audio/ prefix
        audioUrl = `http://121.43.196.106:2829/audio/${fileName}`;
      }
    }
    
    console.log('Audio URL:', audioUrl);
    console.log('Original alarmFileAddress:', record.alarmFileAddress);
    
    try {
      audioElement = new Audio(audioUrl);
      audioElements.value.set(record.key, audioElement);
      
      // Add event listener for when audio ends
      audioElement.addEventListener('ended', () => {
        record.isPlaying = false;
      });
      
      // Add event listener for when audio is paused
      audioElement.addEventListener('pause', () => {
        record.isPlaying = false;
      });
      
      // Add error handling
      audioElement.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        if (audioElement) {
          console.error('Audio error details:', audioElement.error);
        }
        alert('闹铃文件播放失败，请检查文件是否存在');
        record.isPlaying = false;
      });
    } catch (error) {
      console.error('Error creating audio element:', error);
      alert('创建音频元素失败');
      return;
    }
  }

  if (!audioElement) {
    console.error('Failed to create audio element');
    alert('无法创建音频元素');
    return;
  }

  if (record.isPlaying) {
    // Currently playing, so stop it
    audioElement.pause();
    record.isPlaying = false;
  } else {
    // Currently stopped, so play it
    // Stop any other currently playing audio
    audioElements.value.forEach((el, id) => {
      if (id !== record.key && el.readyState > 0) {
        el.pause();
        // Find and update the corresponding record
        const otherRecord = rawData.value.find(item => item.key === id);
        if (otherRecord) {
          otherRecord.isPlaying = false;
        }
      }
    });
    
    // Play the audio
    audioElement.play().catch(error => {
      console.error('Error playing audio:', error);
      // If the file doesn't exist, show a message
      alert('闹铃文件不存在或无法播放');
      record.isPlaying = false; // Revert to false on error
    });
  }
};

const searchInputValue = ref('');
const tableSize = ref('middle');
const currentPage = ref(1);
const pageSize = ref(10);

const filteredData = computed(() => {
  let data = rawData.value;
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
  resetColumns();
  fetchData(); // Actually fetch fresh data
};

const onInfoClick = () => console.log('Info clicked');
const onSettingClick = () => console.log('Setting clicked');

const handleMenuClick = ({ key }: { key: string }) => {
  tableSize.value = key;
};
const handleView = (record: AlarmItem) => console.log('View:', record);
const handleDelete = (record: AlarmItem) => console.log('Delete:', record);

// Create Modal Logic
const showCreateModal = ref(false);
const createForm = ref({
  alarmName: '',
  alarmFile: null as File | null
});
const fileInput = ref<HTMLInputElement>();
const uploadProgress = ref(0);

const resetCreateForm = () => {
  createForm.value = {
    alarmName: '',
    alarmFile: null
  };
  uploadProgress.value = 0;
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  resetCreateForm();
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

const removeUploadedFile = () => {
  createForm.value.alarmFile = null;
  uploadProgress.value = 0;
};

const handleCreateConfirm = async () => {
  // Validate required fields
  if (!createForm.value.alarmName || createForm.value.alarmName.trim() === '') {
    alert('请输入闹铃名称');
    return;
  }
  
  if (!createForm.value.alarmFile) {
    alert('请上传铃声文件');
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('alarmName', createForm.value.alarmName);
    formData.append('alarmFile', createForm.value.alarmFile);
    formData.append('updater', userName.value);
    
    console.log('Sending form data:', {
      alarmName: createForm.value.alarmName,
      updater: userName.value
    });
    
    const response = await axios.post('http://121.43.196.106:2829/api/alarm', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        }
      },
    });
    
    console.log('Create response:', response.data);
    
    if (response.data.success) {
      alert('闹铃创建成功');
      showCreateModal.value = false;
      resetCreateForm();
      // Refresh the data or add the new record to the table
      onRefresh();
    } else {
      alert('创建失败: ' + (response.data.error || '未知错误'));
    }
  } catch (error: any) {
    console.error('Error creating alarm:', error);
    alert('创建失败: ' + (error.response?.data?.error || error.message || '未知错误'));
  } finally {
    uploadProgress.value = 0;
  }
};

// Edit Modal Logic
const showEditModal = ref(false);
const editForm = ref({
  recordId: null as number | null, // Add record ID to track which record is being edited
  alarmName: '',
  fileList: [] as File[], // Changed to File[] instead of any[]
  uploadProgress: 0,
  existingFile: '' as string | null
});
const editFileInput = ref<HTMLInputElement>();
const isEditing = ref(false); // Add loading state for edit operation

const closeEditModal = () => {
  showEditModal.value = false;
  editForm.value = {
    recordId: null,
    alarmName: '',
    fileList: [],
    uploadProgress: 0,
    existingFile: null
  };
};

const handleEdit = (record: AlarmItem) => {
  // Populate form with record data
  editForm.value = {
    recordId: record.key, // Store the record ID for update
    alarmName: record.alarmName,
    fileList: [], // Start with empty file list
    uploadProgress: 0, // Start with 0 progress
    existingFile: record.alarmFileAddress // Show the existing file
  };
  showEditModal.value = true;
};

const handleEditConfirm = async () => {
  // Validate required fields
  if (!editForm.value.alarmName || editForm.value.alarmName.trim() === '') {
    alert('请输入闹铃名称');
    return;
  }
  
  // Check if user wants to update the file or keep existing one
  if (editForm.value.fileList.length === 0 && !editForm.value.existingFile) {
    alert('请上传铃声文件或保留现有文件');
    return;
  }
  
  if (!editForm.value.recordId) {
    alert('无法识别要编辑的记录');
    return;
  }
  
  isEditing.value = true; // Start loading
  try {
    const formData = new FormData();
    formData.append('alarmName', editForm.value.alarmName);
    formData.append('updater', userName.value);
    
    // If new file is selected, append it
    if (editForm.value.fileList.length > 0) {
      formData.append('alarmFile', editForm.value.fileList[0]);
    } else {
      // Keep existing file - append the existing file address
      formData.append('keepExistingFile', 'true');
      formData.append('existingFileAddress', editForm.value.existingFile || '');
    }
    
    console.log('Sending edit form data:', {
      recordId: editForm.value.recordId,
      alarmName: editForm.value.alarmName,
      updater: userName.value,
      hasNewFile: editForm.value.fileList.length > 0,
      existingFile: editForm.value.existingFile
    });
    
    // Send PUT request to update the alarm
    const response = await axios.put(`http://121.43.196.106:2829/api/alarm/${editForm.value.recordId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          editForm.value.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        }
      },
    });
    
    console.log('Update response:', response.data);
    
    if (response.data.success) {
      alert('闹铃更新成功');
      closeEditModal();
      onRefresh(); // Refresh the data
    } else {
      alert('更新失败: ' + (response.data.error || '未知错误'));
    }
  } catch (error: any) {
    console.error('Error updating alarm:', error);
    alert('更新失败: ' + (error.response?.data?.error || error.message || '未知错误'));
  } finally {
    editForm.value.uploadProgress = 0;
    isEditing.value = false; // End loading
  }
};

const triggerEditFileUpload = () => editFileInput.value?.click();

const handleEditFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    editForm.value.fileList = [file]; // Store the actual File object
    // Reset upload progress
    editForm.value.uploadProgress = 0;
  }
};

const handleEditFileDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const file = event.dataTransfer.files[0];
    editForm.value.fileList = [file]; // Store the actual File object
    // Reset upload progress
    editForm.value.uploadProgress = 0;
  }
};

const removeEditUploadFile = () => {
  editForm.value.fileList = [];
  editForm.value.uploadProgress = 0;
};

onMounted(() => {
  selectedColumnKeys.value = columnConfigs.map(config => config.key);
  fetchData(); // Fetch data on mount
  
  // Add global debug function for testing API endpoints
  (window as any).testAlarmAPI = async () => {
    console.log('Testing alarm API endpoint...');
    
    try {
      console.log('Testing endpoint: /api/alarm');
      const response = await axios.get('http://121.43.196.106:2829/api/alarm?page=1&pageSize=10');
      console.log(`✅ /api/alarm - Status: ${response.status}`);
      console.log(`Response structure:`, response.data);
      if (response.data.data) {
        console.log(`Data array length: ${response.data.data.length}`);
        if (response.data.data.length > 0) {
          console.log(`Sample item:`, response.data.data[0]);
        }
      }
    } catch (error: any) {
      console.log(`❌ /api/alarm - Error: ${error.message}`);
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log(`Response:`, error.response.data);
      }
    }
  };
  
  console.log('Debug function added: testAlarmAPI() - use this in console to test the /api/alarm endpoint');
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
  padding-right: 60px;
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

/* File info styles for create form */
.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 12px;
  background-color: #fafafa;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
}

.file-icon {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.65);
}

.delete-icon {
  cursor: pointer;
  font-size: 16px;
  color: #ff4d4f;
  transition: color 0.3s;
}

.delete-icon:hover {
  color: #ff7875;
}

.file-note {
  font-size: 12px;
  color: #666;
  font-style: italic;
}

/* Existing file info styling */
.file-info:has(.file-note) {
  background-color: #f0f8ff;
  border: 1px solid #d6e4ff;
}

/* Column management panel styling */
.column-setting-panel {
  min-width: 250px;
}

.setting-section {
  margin-bottom: 16px;
}

.section-header {
  margin-bottom: 12px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.column-checkbox-group {
  max-height: 200px;
  overflow-y: auto;
}

.column-checkbox-item {
  margin-bottom: 8px;
}

/* Sorting icon styling - ensure default state is grey */
:deep(.ant-table-column-sorter-up),
:deep(.ant-table-column-sorter-down) {
  color: #bfbfbf !important; /* grey by default */
}

/* Only show blue for the active sorting direction */
:deep(.ant-table-column-sorter-up.ant-table-column-sorter-active) {
  color: #1677ff !important; /* blue when ascending is active */
}

:deep(.ant-table-column-sorter-down.ant-table-column-sorter-active) {
  color: #1677ff !important; /* blue when descending is active */
}

/* Hover effects */
:deep(th .ant-table-column-sorter-up:hover),
:deep(th .ant-table-column-sorter-down:hover) {
  color: #1677ff !important; /* blue on hover */
}

/* Ensure the default sort column shows the correct icon state */
:deep(.ant-table-column-sorter) {
  color: #bfbfbf !important; /* Default grey color */
}

:deep(.ant-table-column-sorter.ant-table-column-sorter-active) {
  color: #1677ff !important; /* Blue when column is actively sorted */
}
</style> 