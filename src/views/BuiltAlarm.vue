<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>预制闹铃</h2>
    </div>

    <!-- Control Bar -->
    <div class="top-controls-wrapper">
      <div class="left-aligned-section">
        <a-input
          v-model:value="searchInputValue"
          placeholder="Q 输入关键字搜索"
          style="width: 200px; margin-right: 16px;"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
      </div>
      
      <!-- icon area -->
      <div class="right-aligned-icons">
        <a-button type="primary" @click="handleCreateAlarm" style="margin-right: 16px;">
          新建闹铃
        </a-button>
        <ReloadOutlined @click="onRefresh" />
        <InfoCircleOutlined @click="onInfoClick" />
        <SettingOutlined @click="onSettingClick" />
      </div>
    </div>
      
    <!-- table area -->
    <div class="table-container">
      <a-table
        :columns="columns"
        :data-source="filteredData"
        :pagination="filteredData.length === 0 ? false : pagination"
        :loading="loading"
        :size="tableSize"
        :scroll="{ x: 1200 }"
        @change="handleTableChange"
        :showSorterTooltip="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'alarmFileAddress'">
            <span class="file-address">{{ record.alarmFileAddress }}</span>
          </template>
          <template v-if="column.key === 'audition'">
            <a-button type="link" size="small" @click="handleAudition(record)">
              <PlayCircleOutlined v-if="!record.isPlaying" />
              <PauseCircleOutlined v-else />
            </a-button>
          </template>
          <template v-if="column.key === 'updater'">
            <span>{{ record.updater }}</span>
          </template>
          <template v-if="column.key === 'operation'">
            <a-space class="action-cell" direction="horizontal">
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

    <!-- Create Alarm Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新建闹铃</h3>
          <button class="close-btn" @click="closeCreateModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 闹铃名称</label>
            <input 
              type="text" 
              v-model="createForm.alarmName" 
              class="form-input" 
              placeholder="请输入"
              maxlength="15"
            >
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 上传闹铃</label>
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
                <div class="upload-text">支持文件格式: mp3、wav、opus</div>
              </div>
            </div>
            <!-- File display after upload -->
            <div v-if="createForm.alarmFile" class="file-info">
              <span class="file-icon">📎</span>
              <span class="file-name">{{ createForm.alarmFile.name }}</span>
              <span class="delete-icon" @click="removeUploadedFile">🗑️</span>
            </div>
            <!-- Upload progress bar -->
            <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
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

    <!-- Edit Alarm Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑闹铃</h3>
          <button class="close-btn" @click="closeEditModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 闹铃名称</label>
            <input 
              type="text" 
              v-model="editForm.alarmName" 
              class="form-input" 
              placeholder="请输入"
              maxlength="15"
            >
          </div>
          <div class="form-group">
            <label>上传闹铃</label>
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
            <!-- File display after upload -->
            <div v-if="editForm.alarmFile" class="file-info">
              <span class="file-icon">📎</span>
              <span class="file-name">{{ editForm.alarmFile.name }}</span>
              <span class="delete-icon" @click="removeEditUploadedFile">🗑️</span>
            </div>
            <!-- Upload progress bar -->
            <div v-if="editUploadProgress > 0 && editUploadProgress < 100" class="upload-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: editUploadProgress + '%' }"></div>
              </div>
              <span class="progress-text">{{ editUploadProgress }}%</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeEditModal">取消</button>
          <button class="btn btn-primary" @click="handleEditConfirm">确定</button>
        </div>
      </div>
    </div>

    <!-- View Alarm Modal -->
    <div v-if="showViewModal" class="modal-overlay" @click="closeViewModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>查看闹铃</h3>
          <button class="close-btn" @click="closeViewModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 闹铃名称</label>
            <div class="view-field">{{ viewForm.alarmName }}</div>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 闹铃文件地址</label>
            <div class="view-field">{{ viewForm.alarmFileAddress }}</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeViewModal">关闭</button>
        </div>
      </div>
    </div>

  </a-config-provider>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme } from 'ant-design-vue';
import { ReloadOutlined, SettingOutlined, SearchOutlined, InfoCircleOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons-vue';
import { createColumnConfigs, useTableColumns, createColumn, type ColumnDefinition } from '../utils/tableConfig';
import axios from 'axios';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '',
  },
}));

// Define your data interface
interface DataItem {
  id: number;
  alarmId: string;
  alarmName: string;
  alarmFileAddress: string;
  updater: string;
  createTime: string;
  updateTime: string;
  isPlaying: boolean; // Add isPlaying property
}

// Define column definitions - this is where you add/remove columns
const columnDefinitions: ColumnDefinition[] = [
  createColumn('rowIndex', '序号', 'rowIndex', 60, { fixed: 'left' }),
  createColumn('alarmId', '闹铃 ID', 'alarmId', 150, { sortable: true, sortType: 'string' }),
  createColumn('alarmName', '闹铃名称', 'alarmName', 150, { sortable: true, sortType: 'string' }),
  createColumn('alarmFileAddress', '闹铃文件地址', 'alarmFileAddress', 300),
  createColumn('audition', '试听', 'audition', 80),
  createColumn('updater', '更新人', 'updater', 120),
  createColumn('createTime', '创建时间', 'createTime', 180, { sortable: true, sortType: 'date' }),
  createColumn('updateTime', '更新时间', 'updateTime', 180),
  createColumn('operation', '操作', 'operation', 200, { fixed: 'right' }),
];

// Create column configs from definitions
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
const rawData = ref<DataItem[]>([]);
const loading = ref(false);
const audioElements = ref<Map<number, HTMLAudioElement>>(new Map()); // Store audio elements

const fetchData = async () => {
  console.log('fetchData called');
  loading.value = true;
  try {
    console.log('Calling alarm endpoint');
    // Request all data without pagination parameters
    const response = await axios.get(`${API_BASE_URL}/alarm?page=1&pageSize=1000`);
    console.log('Alarm response:', response.data);
    // Add key property to each item for table identification
    rawData.value = response.data.data.map((item: any) => ({
      ...item,
      key: item.id, // Use id as key for table rows
      isPlaying: false // Initialize isPlaying to false
    }));
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

// Filter and search logic
const searchInputValue = ref('');
const tableSize = ref('middle');
const currentPage = ref(1);
const pageSize = ref(10);

const filteredData = computed(() => {
  let dataToFilter = rawData.value;

  // Search filter
  if (searchInputValue.value) {
    const searchTerm = searchInputValue.value.toLowerCase();
    dataToFilter = dataToFilter.filter((item: DataItem) => {
      return Object.values(item).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(searchTerm)
      );
    });
  }

  // Default sorting by updateTime in descending order using plain JavaScript
  dataToFilter.sort((a: DataItem, b: DataItem) => {
    const dateA = new Date(a.updateTime).getTime();
    const dateB = new Date(b.updateTime).getTime();
    return dateB - dateA; // Descending order (newest first)
  });

  return dataToFilter;
});

const pagination = computed(() => ({
  total: filteredData.value.length,
  current: currentPage.value,
  pageSize: pageSize.value,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
  showTotal: (total: number, range: [number, number]) => `第${range[0]}-${range[1]}条/共${total}条`,
  showQuickJumper: { goButton: '页' },
  onShowSizeChange: (current: number, size: number) => {
    currentPage.value = current;
    pageSize.value = size;
  },
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
  fetchData(); // Re-fetch data on refresh

  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const onInfoClick = () => console.log('Info clicked');
const onSettingClick = () => console.log('Setting clicked');

// Action handlers
const handleCreateAlarm = () => {
  console.log('Create alarm clicked');
  showCreateModal.value = true;
};

const handleView = (record: DataItem) => {
  console.log('View clicked for record:', record);
  viewForm.value = { 
    id: record.id,
    alarmName: record.alarmName,
    alarmFileAddress: record.alarmFileAddress
  };
  showViewModal.value = true;
};

const handleEdit = (record: DataItem) => {
  console.log('Edit clicked for record:', record);
  editForm.value = { 
    id: record.id,
    alarmName: record.alarmName,
    alarmFile: null
  };
  showEditModal.value = true;
};

const handleDelete = (record: DataItem) => {
  console.log('Delete clicked for record:', record);
  // TODO: Implement delete functionality
  alert(`确认删除闹铃: ${record.alarmName}?`);
};

const handleAudition = (record: DataItem) => {
  console.log('Audition clicked:', record);
  
  // Get or create the audio element for this record
  let audioElement = audioElements.value.get(record.id);

  if (!audioElement) {
    // Construct the full URL for the audio file using the backend server
    const audioUrl = `${API_BASE_URL}${record.alarmFileAddress}`;
    console.log('Audio URL:', audioUrl);
    
    audioElement = new Audio(audioUrl);
    audioElements.value.set(record.id, audioElement);
    
    // Add event listener for when audio ends
    audioElement.addEventListener('ended', () => {
      record.isPlaying = false;
    });
    
    // Add event listener for when audio is paused
    audioElement.addEventListener('pause', () => {
      record.isPlaying = false;
    });
  }

  if (record.isPlaying) {
    // Currently playing, so stop it
    audioElement.pause();
    record.isPlaying = false;
  } else {
    // Currently stopped, so play it
    // Stop any other currently playing audio
    audioElements.value.forEach((el, id) => {
      if (id !== record.id && el.readyState > 0) {
        el.pause();
        // Find and update the corresponding record
        const otherRecord = rawData.value.find(item => item.id === id);
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

// Modal state and form
const showCreateModal = ref(false);
const createForm = ref({
  alarmName: '',
  alarmFile: null as File | null
});

const fileInput = ref<HTMLInputElement>();
const uploadProgress = ref(0);

// Import auth store for username
import { useAuthStore } from '../stores/auth';
const authStore = useAuthStore();

const closeCreateModal = () => {
  showCreateModal.value = false;
  uploadProgress.value = 0;
  // Reset form
  createForm.value = {
    alarmName: '',
    alarmFile: null
  };
};

const handleCreateConfirm = async () => {
  console.log('=== CREATE ALARM START ===');
  console.log('Creating alarm with form:', createForm.value);
  console.log('Form alarmName:', createForm.value.alarmName);
  console.log('Form alarmFile:', createForm.value.alarmFile);
  console.log('Auth store username:', authStore.username);
  
  // Validate required fields
  if (!createForm.value.alarmName || createForm.value.alarmName.trim() === '') {
    alert('请输入闹铃名称');
    return;
  }
  
  if (createForm.value.alarmName.length > 15) {
    alert('闹铃名称不能超过15个字符');
    return;
  }
  
  if (!createForm.value.alarmFile) {
    alert('请上传闹铃文件');
    return;
  }
  
  try {
    loading.value = true;
    uploadProgress.value = 0;
    
    const formData = new FormData();
    formData.append('alarmName', createForm.value.alarmName);
    formData.append('alarmFile', createForm.value.alarmFile);
    formData.append('updater', authStore.username || '管理员');
    
    console.log('FormData created:');
    console.log('- alarmName:', createForm.value.alarmName);
    console.log('- alarmFile:', createForm.value.alarmFile);
    console.log('- updater:', authStore.username || '管理员');
    
    console.log('Sending request to:', `${API_BASE_URL}/alarm`);
    
    const response = await axios.post(`${API_BASE_URL}/alarm`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', uploadProgress.value + '%');
        }
      },
    });
    
    console.log('=== CREATE ALARM SUCCESS ===');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    if (response.data.success) {
      alert('闹铃创建成功');
      showCreateModal.value = false;
      resetCreateForm();
      fetchData(); // Refresh the data
    } else {
      alert('创建失败: ' + (response.data.error || '未知错误'));
    }
  } catch (error: any) {
    console.log('=== CREATE ALARM ERROR ===');
    console.error('Error creating alarm:', error);
    console.error('Error response:', error.response);
    console.error('Error message:', error.message);
    alert('创建失败: ' + (error.response?.data?.error || error.message || '未知错误'));
  } finally {
    loading.value = false;
    uploadProgress.value = 0;
    console.log('=== CREATE ALARM END ===');
  }
};

const resetCreateForm = () => {
  createForm.value = {
    alarmName: '',
    alarmFile: null
  };
  uploadProgress.value = 0;
};

const triggerFileUpload = () => {
  console.log('triggerFileUpload called');
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  console.log('handleFileChange called');
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    console.log('File selected:', file);
    console.log('File name:', file.name);
    console.log('File size:', file.size);
    console.log('File type:', file.type);
    createForm.value.alarmFile = file;
    console.log('createForm.value.alarmFile set to:', createForm.value.alarmFile);
  }
};

const handleFileDrop = (event: DragEvent) => {
  console.log('handleFileDrop called');
  event.preventDefault();
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const file = event.dataTransfer.files[0];
    console.log('File dropped:', file);
    console.log('File name:', file.name);
    console.log('File size:', file.size);
    console.log('File type:', file.type);
    createForm.value.alarmFile = file;
    console.log('createForm.value.alarmFile set to:', createForm.value.alarmFile);
  }
};

const removeUploadedFile = () => {
  console.log('removeUploadedFile called');
  console.log('Before removal - createForm.value.alarmFile:', createForm.value.alarmFile);
  createForm.value.alarmFile = null;
  console.log('After removal - createForm.value.alarmFile:', createForm.value.alarmFile);
  // Reset the file input
  if (fileInput.value) {
    fileInput.value.value = '';
    console.log('File input reset');
  }
};

// Edit Modal state and form
const showEditModal = ref(false);
const editForm = ref({
  id: 0,
  alarmName: '',
  alarmFile: null as File | null
});

const editFileInput = ref<HTMLInputElement>();
const editUploadProgress = ref(0);

const closeEditModal = () => {
  showEditModal.value = false;
  editUploadProgress.value = 0;
  // Reset form
  editForm.value = {
    id: 0,
    alarmName: '',
    alarmFile: null
  };
};

const handleEditConfirm = async () => {
  console.log('Editing alarm with form:', editForm.value);
  
  // Validate required fields
  if (!editForm.value.alarmName || editForm.value.alarmName.trim() === '') {
    alert('请输入闹铃名称');
    return;
  }
  
  if (editForm.value.alarmName.length > 15) {
    alert('闹铃名称不能超过15个字符');
    return;
  }
  
  try {
    loading.value = true;
    editUploadProgress.value = 0;
    
    const formData = new FormData();
    formData.append('alarmName', editForm.value.alarmName);
    if (editForm.value.alarmFile) {
      formData.append('alarmFile', editForm.value.alarmFile);
    }
    formData.append('updater', authStore.username || '管理员');
    
    console.log('Sending edit form data:', {
      alarmName: editForm.value.alarmName,
      updater: authStore.username || '管理员'
    });
    
    const response = await axios.put(`${API_BASE_URL}/alarm/${editForm.value.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          editUploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        }
      },
    });
    
    console.log('Edit response:', response.data);
    
    if (response.data.success) {
      alert('闹铃更新成功');
      showEditModal.value = false;
      resetEditForm();
      fetchData(); // Refresh the data
    } else {
      alert('更新失败: ' + (response.data.error || '未知错误'));
    }
  } catch (error: any) {
    console.error('Error updating alarm:', error);
    alert('更新失败: ' + (error.response?.data?.error || error.message || '未知错误'));
  } finally {
    loading.value = false;
    editUploadProgress.value = 0;
  }
};

const resetEditForm = () => {
  editForm.value = {
    id: 0,
    alarmName: '',
    alarmFile: null
  };
  editUploadProgress.value = 0;
};

const triggerEditFileUpload = () => {
  editFileInput.value?.click();
};

const handleEditFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    editForm.value.alarmFile = target.files[0];
  }
};

const handleEditFileDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    editForm.value.alarmFile = event.dataTransfer.files[0];
  }
};

const removeEditUploadedFile = () => {
  editForm.value.alarmFile = null;
};

// View Modal state and form
const showViewModal = ref(false);
const viewForm = ref({
  id: 0,
  alarmName: '',
  alarmFileAddress: ''
});

const closeViewModal = () => {
  showViewModal.value = false;
  // Reset view form
  viewForm.value = {
    id: 0,
    alarmName: '',
    alarmFileAddress: ''
  };
};

onMounted(() => {
  fetchData(); // Fetch data on mount
  selectedColumnKeys.value = updatedColumnConfigs.map(config => config.key);
});

defineExpose({
  handleTableChange,
});
</script>

<style scoped>
/* Reuse the same styles from IPAudio.vue */
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
  margin-bottom: 20px;
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
.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  background-color: white;
  transition: all 0.3s;
  height: 36px;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-input::placeholder {
  color: rgba(0, 0, 0, 0.25);
}

.upload-area {
  width: 100%;
  height: 120px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
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
  font-weight: bold;
}

.upload-text {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 12px;
  background-color: #fafafa;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.file-icon {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.65);
}

.file-name {
  flex: 1;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
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

.upload-progress {
  margin-top: 12px;
}

.progress-text {
  color: #1890ff;
  font-weight: 500;
  font-size: 12px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
}

.progress-fill {
  height: 100%;
  background-color: #1890ff;
  transition: width 0.3s ease;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.3s;
  font-weight: 500;
  min-width: 80px;
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

/* View Modal Styles */
.view-field {
  padding: 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  background-color: transparent;
  border-radius: 0;
  min-height: auto;
  display: block;
  border: none;
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
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s;
}

:deep(.ant-table-cell .action-cell .view-link:hover) {
  color: #40a9ff !important;
}

:deep(.ant-table-cell .action-cell .edit-link) {
  color: #1890ff !important;
  font-weight: bold;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s;
}

:deep(.ant-table-cell .action-cell .edit-link:hover) {
  color: #40a9ff !important;
}

/* Ensure delete link is highly visible */
:deep(.ant-table-cell .action-cell .danger-link) {
  color: #ff4d4f !important;
  font-weight: bold;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s;
  opacity: 1 !important;
  display: inline-block !important;
  position: relative !important;
  z-index: 1 !important;
}

:deep(.ant-table-cell .action-cell .danger-link:hover) {
  color: #ff7875 !important;
}

:deep(.ant-table-cell .action-cell .danger-link:active) {
  color: #d9363e !important;
}

/* Additional specific rule to override any potential conflicts */
:deep(.ant-table .ant-table-cell .action-cell a.danger-link) {
  color: #ff4d4f !important;
  font-weight: bold !important;
  font-size: 14px !important;
  opacity: 1 !important;
  visibility: visible !important;
}

.file-address {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
  word-break: break-all;
}
</style> 