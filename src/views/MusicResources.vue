<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>音乐素材</h2>
    </div>

    <!-- Control Bar -->
    <div class="top-controls-wrapper">
      <div class="left-aligned-section">
        <div class="select-container music-type-select" style="margin-right: 16px;">
          <span class="select-always-placeholder">音乐类型:</span>
          <a-tooltip :title="musicTypeValue.label">
            <a-select
              v-model:value="musicTypeValue"
              style="width: 130px;"
              :options="musicTypeOptions"
              @change="handleMusicTypeChange"
              :allowClear="true"
              label-in-value
              placeholder="请选择音乐类型"
            >
            <a-select-option value="all">全部</a-select-option>
          </a-select>
          </a-tooltip>
        </div>
        </div>
        
      <!-- icon area -->
      <div class="right-aligned-icons">
        <a-input
          v-model:value="searchInputValue"
          placeholder="请输入音乐名称/音乐ID/演唱者/标签"
          style="width: 200px; margin-right: 16px;"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
        <a-button type="primary" @click="handleCreateMusic" style="margin-right: 16px;">
          新建音乐
        </a-button>
        <ReloadOutlined @click="onRefresh" />
        <InfoCircleOutlined @click="onInfoClick" />
        <SettingOutlined @click="onSettingClick" />
      </div>
    </div>
      
    <!-- table area -->
    <div class="table-container">
      <!-- Debug info -->
      <!-- <div style="background: #f0f0f0; padding: 10px; margin-bottom: 10px; font-size: 12px;">
        Debug: filteredData length = {{ filteredData.length }}, rawData length = {{ rawData.length }}, loading = {{ loading }}
      </div> -->
      
      <a-table
        :columns="columns"
        :data-source="filteredData"
        :pagination="pagination"
        :loading="loading"
        :size="tableSize"
        :scroll="{ x: 1800 }"
        @change="handleTableChange"
        :showSorterTooltip="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'musicFileAddress'">
            <span class="file-address">{{ record.musicFileAddress }}</span>
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

    <!-- Create Music Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新建音乐</h3>
          <button class="close-btn" @click="closeCreateModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 音乐名称</label>
            <input 
              type="text" 
              v-model="createForm.musicName" 
              class="form-input" 
              placeholder="请输入"
              maxlength="15"
            >
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 音乐类型</label>
            <select v-model="createForm.musicType" class="form-select">
              <option value="">请选择</option>
              <option value="流行乐">流行乐</option>
              <option value="摇滚">摇滚</option>
              <option value="R&B">R&B</option>
              <option value="爵士">爵士</option>
              <option value="古典">古典</option>
              <option value="钢琴曲">钢琴曲</option>
              <option value="纯音乐">纯音乐</option>
              <option value="冥想音乐">冥想音乐</option>
              <option value="轻音乐">轻音乐</option>
              <option value="解压">解压</option>
              <option value="激情">激情</option>
              <option value="舒缓">舒缓</option>
              <option value="欢快">欢快</option>
              <option value="伤感">伤感</option>
              <option value="自然音乐">自然音乐</option>
              <option value="白噪音">白噪音</option>
            </select>
          </div>
          <div class="form-group">
            <label>演唱者</label>
            <input 
              type="text" 
              v-model="createForm.singer" 
              class="form-input" 
              placeholder="请输入"
            >
          </div>
          <div class="form-group">
            <label>标签</label>
            <div class="tags-input">
              <div class="tags-container">
                <span v-for="(tag, index) in createForm.tags" :key="index" class="tag">
                  {{ tag }}
                  <span class="tag-remove" @click="removeTag(index)">×</span>
                </span>
                <input 
                  v-if="showTagInput" 
                  v-model="newTag" 
                  @blur="addTag" 
                  @keyup.enter="addTag"
                  class="tag-input" 
                  placeholder="输入标签"
                  ref="tagInput"
                >
                <span v-else @click="showTagInput = true" class="add-tag-btn">+ 添加标签</span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 上传音频</label>
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
            <div v-if="createForm.musicFile" class="file-info">
              <span class="file-icon">📎</span>
              <span class="file-name">{{ createForm.musicFile.name }}</span>
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

    <!-- Edit Music Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑音乐</h3>
          <button class="close-btn" @click="closeEditModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 音乐名称</label>
            <input 
              type="text" 
              v-model="editForm.musicName" 
              class="form-input" 
              placeholder="请输入"
              maxlength="15"
            >
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 音乐类型</label>
            <select v-model="editForm.musicType" class="form-select">
              <option value="">请选择</option>
              <option value="流行乐">流行乐</option>
              <option value="摇滚">摇滚</option>
              <option value="R&B">R&B</option>
              <option value="爵士">爵士</option>
              <option value="古典">古典</option>
              <option value="钢琴曲">钢琴曲</option>
              <option value="纯音乐">纯音乐</option>
              <option value="冥想音乐">冥想音乐</option>
              <option value="轻音乐">轻音乐</option>
              <option value="解压">解压</option>
              <option value="激情">激情</option>
              <option value="舒缓">舒缓</option>
              <option value="欢快">欢快</option>
              <option value="伤感">伤感</option>
              <option value="自然音乐">自然音乐</option>
              <option value="白噪音">白噪音</option>
            </select>
          </div>
          <div class="form-group">
            <label>演唱者</label>
            <input 
              type="text" 
              v-model="editForm.singer" 
              class="form-input" 
              placeholder="请输入"
            >
          </div>
          <div class="form-group">
            <label>标签</label>
            <div class="tags-input">
              <div class="tags-container">
                <span v-for="(tag, index) in editForm.tags" :key="index" class="tag">
                  {{ tag }}
                  <span class="tag-remove" @click="removeEditTag(index)">×</span>
                </span>
                <input 
                  v-if="showEditTagInput" 
                  v-model="newEditTag" 
                  @blur="addEditTag" 
                  @keyup.enter="addEditTag"
                  class="tag-input" 
                  placeholder="输入标签"
                  ref="editTagInput"
                >
                <span v-else @click="showEditTagInput = true" class="add-tag-btn">+ 添加标签</span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>上传音频</label>
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
            <div v-if="editForm.musicFile" class="file-info">
              <span class="file-icon">📎</span>
              <span class="file-name">{{ editForm.musicFile.name }}</span>
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

    <!-- View Music Modal -->
    <div v-if="showViewModal" class="modal-overlay" @click="closeViewModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>查看音乐</h3>
          <button class="close-btn" @click="closeViewModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 音乐名称</label>
            <div class="view-field">{{ viewForm.musicName }}</div>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 音乐类型</label>
            <div class="view-field">{{ viewForm.musicType }}</div>
          </div>
          <div class="form-group">
            <label>演唱者</label>
            <div class="view-field">{{ viewForm.singer || '-' }}</div>
          </div>
          <div class="form-group">
            <label>标签</label>
            <div class="view-field">
              <span v-if="viewForm.tags && viewForm.tags.length > 0">
                <span v-for="(tag, index) in viewForm.tags" :key="index" class="view-tag">
                  {{ tag }}{{ index < viewForm.tags.length - 1 ? ', ' : '' }}
                </span>
              </span>
              <span v-else class="no-tags">-</span>
            </div>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 音频文件地址</label>
            <div class="view-field">{{ viewForm.musicFileAddress }}</div>
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
  musicId: string;
  musicName: string;
  musicType: string;
  singer: string;
  tags: string;
  musicFileAddress: string;
  updater: string;
  createTime: string;
  updateTime: string;
  isPlaying: boolean; // Add isPlaying property
}

// Define column definitions - this is where you add/remove columns
const columnDefinitions: ColumnDefinition[] = [
  createColumn('rowIndex', '序号', 'rowIndex', 60, { fixed: 'left' }),
  createColumn('musicId', '音乐 ID', 'musicId', 150, { sortable: true, sortType: 'string' }),
  createColumn('musicName', '音乐名称', 'musicName', 150, { sortable: true, sortType: 'string' }),
  createColumn('musicType', '音乐类型', 'musicType', 120, { sortable: true, sortType: 'string' }),
  createColumn('singer', '演唱者', 'singer', 120, { sortable: true, sortType: 'string' }),
  createColumn('tags', '标签', 'tags', 100),
  createColumn('musicFileAddress', '音乐文件地址', 'musicFileAddress', 300),
  createColumn('audition', '试听', 'audition', 80),
  createColumn('updater', '更新人', 'updater', 120),
  createColumn('createTime', '创建时间', 'createTime', 180, { sortable: true, sortType: 'date' }),
  createColumn('updateTime', '更新时间', 'updateTime', 180),
  createColumn('operation', '操作', 'operation', 200, { fixed: 'right' }),
];

// Data fetching
const rawData = ref<DataItem[]>([]);
const loading = ref(false);
const audioElements = ref<Map<number, HTMLAudioElement>>(new Map()); // Store audio elements

// Filter and search logic
const searchInputValue = ref('');
const musicTypeValue = ref({ key: 'all', label: '全部', value: 'all' });
const tableSize = ref('middle');
const currentPage = ref(1);
const pageSize = ref(10);

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

const fetchData = async () => {
  console.log('fetchData called');
  loading.value = true;
  try {
    console.log('Calling IPmusic endpoint');
    // Request all data without pagination parameters
    const response = await axios.get(`${API_BASE_URL}/ipmusic?page=1&pageSize=1000`);
    console.log('IPmusic response:', response.data);
    console.log('Response data length:', response.data.data?.length);
    console.log('Response total:', response.data.total);
    
    // Add key property to each item for table identification
    if (response.data.data && Array.isArray(response.data.data)) {
      rawData.value = response.data.data.map((item: any) => ({
        ...item,
        key: item.id, // Use id as key for table rows
        isPlaying: false // Initialize isPlaying to false
      }));
      console.log('Processed data length:', rawData.value.length);
    } else {
      console.error('No data array in response:', response.data);
      rawData.value = [];
    }
  } catch (error: any) {
    console.error('Error fetching data:', error);
    console.error('Error details:', error.response?.data);
    rawData.value = [];
  } finally {
    loading.value = false;
  }
};

const musicTypeOptions = computed(() => {
  const uniqueMusicTypes = Array.from(new Set(rawData.value.map(item => item.musicType)));
  const options = uniqueMusicTypes.map(type => ({
    key: type,
    value: type,
    label: type,
  }));
  return [
    { key: 'all', value: 'all', label: '全部' },
    ...options
  ];
});

const handleMusicTypeChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    musicTypeValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    musicTypeValue.value = val;
  }
};

const filteredData = computed(() => {
  console.log('filteredData computed - rawData length:', rawData.value.length);
  console.log('filteredData computed - rawData:', rawData.value);
  
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

  // Music Type filter
  if (musicTypeValue.value && musicTypeValue.value.value !== 'all') {
    dataToFilter = dataToFilter.filter(item => item.musicType === musicTypeValue.value.value);
  }

  // Default sorting by updateTime in descending order using plain JavaScript
  dataToFilter.sort((a: DataItem, b: DataItem) => {
    const dateA = new Date(a.updateTime).getTime();
    const dateB = new Date(b.updateTime).getTime();
    return dateB - dateA; // Descending order (newest first)
  });

  console.log('filteredData computed - final result length:', dataToFilter.length);
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
  musicTypeValue.value = { key: 'all', label: '全部', value: 'all' };
  fetchData();

  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const onInfoClick = () => console.log('Info clicked');
const onSettingClick = () => console.log('Setting clicked');

// Action handlers
const handleCreateMusic = () => {
  console.log('Create music clicked');
  showCreateModal.value = true;
};

const handleView = (record: DataItem) => {
  console.log('View clicked for record:', record);
  viewForm.value = { 
    id: record.id,
    musicName: record.musicName,
    singer: record.singer,
    musicType: record.musicType, // Convert string to array for display
    tags: record.tags ? record.tags.split(',').filter(tag => tag.trim()) : [],
    musicFileAddress: record.musicFileAddress
  };
  showViewModal.value = true;
};

const handleEdit = (record: DataItem) => {
  console.log('Edit clicked for record:', record);
  editForm.value = { 
    id: record.id,
    musicName: record.musicName,
    singer: record.singer,
    musicType: record.musicType, // Changed from musicTypes to musicType
    tags: record.tags ? record.tags.split(',').filter(tag => tag.trim()) : [],
    musicFile: null
  };
  showEditModal.value = true;
};

const handleDelete = (record: DataItem) => {
  console.log('Delete clicked for record:', record);
  // TODO: Implement delete functionality
  alert(`确认删除音乐: ${record.musicName}?`);
};

const handleAudition = (record: DataItem) => {
  console.log('Audition clicked:', record);
  
  // Get or create the audio element for this record
  let audioElement = audioElements.value.get(record.id);

  if (!audioElement) {
    // Construct the full URL for the audio file using the backend server
    const audioUrl = `${API_BASE_URL}${record.musicFileAddress}`;
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
      alert('音乐文件不存在或无法播放');
      record.isPlaying = false; // Revert to false on error
    });
  }
};

// Modal state and form
const showCreateModal = ref(false);
const createForm = ref({
  musicName: '',
  singer: '',
  musicType: '',
  tags: [] as string[],
  musicFile: null as File | null
});

const fileInput = ref<HTMLInputElement>();
const showTagInput = ref(false);
const newTag = ref('');
const uploadProgress = ref(0);

// Import auth store for username
import { useAuthStore } from '../stores/auth';
const authStore = useAuthStore();

const resetCreateForm = () => {
  createForm.value = {
    musicName: '',
    singer: '',
    musicType: '',
    tags: [],
    musicFile: null
  };
  showTagInput.value = false;
  newTag.value = '';
  uploadProgress.value = 0;
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  showTagInput.value = false;
  newTag.value = '';
  uploadProgress.value = 0;
  createForm.value = {
    musicName: '',
    singer: '',
    musicType: '',
    tags: [],
    musicFile: null
  };
};

const handleCreateConfirm = async () => {
  console.log('Creating music with form:', createForm.value);
  
  // Validate required fields
  if (!createForm.value.musicName || createForm.value.musicName.trim() === '') {
    alert('请输入音乐名称');
    return;
  }
  
  if (createForm.value.musicName.length > 15) {
    alert('音乐名称不能超过15个字符');
    return;
  }
  
  if (!createForm.value.musicType) {
    alert('请选择音乐类型');
    return;
  }
  
  if (!createForm.value.musicFile) {
    alert('请上传音频文件');
    return;
  }
  
  try {
    loading.value = true;
    uploadProgress.value = 0;
    
    const formData = new FormData();
    formData.append('musicName', createForm.value.musicName);
    formData.append('singer', createForm.value.singer || '');
    formData.append('musicType', createForm.value.musicType);
    formData.append('tags', createForm.value.tags.join(','));
    formData.append('musicFile', createForm.value.musicFile);
    formData.append('updater', authStore.username || '管理员');
    
    console.log('Sending form data:', {
      musicName: createForm.value.musicName,
      singer: createForm.value.singer,
      musicType: createForm.value.musicType,
      tags: createForm.value.tags,
      updater: authStore.username || '管理员'
    });
    
    const response = await axios.post(`${API_BASE_URL}/ipmusic`, formData, {
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
      alert('音乐创建成功');
      showCreateModal.value = false;
      resetCreateForm();
      fetchData(); // Refresh the data
    } else {
      alert('创建失败: ' + (response.data.error || '未知错误'));
    }
  } catch (error: any) {
    console.error('Error creating music:', error);
    alert('创建失败: ' + (error.response?.data?.error || error.message || '未知错误'));
  } finally {
    loading.value = false;
    uploadProgress.value = 0;
  }
};

const triggerFileUpload = () => {
  fileInput.value?.click();
};

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

const addTag = () => {
  if (newTag.value.trim()) {
    createForm.value.tags.push(newTag.value.trim());
    newTag.value = '';
  }
  showTagInput.value = false;
};

const removeTag = (index: number) => {
  createForm.value.tags.splice(index, 1);
};

const removeUploadedFile = () => {
  createForm.value.musicFile = null;
};

// Edit Modal state and form
const showEditModal = ref(false);
const editForm = ref({
  id: 0,
  musicName: '',
  singer: '',
  musicType: '',
  tags: [] as string[],
  musicFile: null as File | null
});

const editFileInput = ref<HTMLInputElement>();
const showEditTagInput = ref(false);
const newEditTag = ref('');
const editUploadProgress = ref(0);

const closeEditModal = () => {
  showEditModal.value = false;
  showEditTagInput.value = false;
  newEditTag.value = '';
  editUploadProgress.value = 0;
  editForm.value = {
    id: 0,
    musicName: '',
    singer: '',
    musicType: '',
    tags: [],
    musicFile: null
  };
};

const handleEditConfirm = async () => {
  console.log('Edit music form submitted:', editForm.value);
  
  // Validate required fields
  if (!editForm.value.musicName || !editForm.value.musicType) {
    alert('请填写所有必填字段');
    return;
  }

  // Validate music name length
  if (editForm.value.musicName.length > 15) {
    alert('音乐名称不能超过15个字符');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('musicName', editForm.value.musicName);
    formData.append('singer', editForm.value.singer);
    formData.append('musicType', editForm.value.musicType);
    formData.append('tags', editForm.value.tags.join(','));
    if (editForm.value.musicFile) {
      formData.append('musicFile', editForm.value.musicFile);
    }
    formData.append('updater', authStore.user?.name || authStore.user?.username || '管理员');

    const response = await axios.put(`${API_BASE_URL}/ipmusic/${editForm.value.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          editUploadProgress.value = percentCompleted;
        }
      }
    });

    console.log('Music updated successfully:', response.data);
    editUploadProgress.value = 100;
    setTimeout(() => {
      editUploadProgress.value = 0;
    }, 1000);
    alert('音乐更新成功！');
    closeEditModal();
    fetchData();
  } catch (error: any) {
    console.error('Error updating music:', error);
    let errorMessage = '更新音乐失败，请重试';
    
    if (error.response) {
      console.error('Server error response:', error.response.data);
      if (error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
      errorMessage = '服务器无响应，请检查网络连接';
    } else {
      console.error('Request setup error:', error.message);
      errorMessage = '请求设置错误: ' + error.message;
    }
    
    alert(errorMessage);
    editUploadProgress.value = 0;
  }
};

const triggerEditFileUpload = () => {
  editFileInput.value?.click();
};

const handleEditFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    editForm.value.musicFile = target.files[0];
  }
};

const handleEditFileDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    editForm.value.musicFile = event.dataTransfer.files[0];
  }
};

const addEditTag = () => {
  if (newEditTag.value.trim()) {
    editForm.value.tags.push(newEditTag.value.trim());
    newEditTag.value = '';
  }
  showEditTagInput.value = false;
};

const removeEditTag = (index: number) => {
  editForm.value.tags.splice(index, 1);
};

const removeEditUploadedFile = () => {
  editForm.value.musicFile = null;
};

// View Modal state and form
const showViewModal = ref(false);
const viewForm = ref({
  id: 0,
  musicName: '',
  singer: '',
  musicType: '',
  tags: [] as string[],
  musicFileAddress: ''
});

const closeViewModal = () => {
  showViewModal.value = false;
  viewForm.value = {
    id: 0,
    musicName: '',
    singer: '',
    musicType: '',
    tags: [],
    musicFileAddress: ''
  };
};

onMounted(() => {
  fetchData();
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

:deep(.music-type-select .ant-select-selector) {
  padding-left: 65px !important;
}

/* Pagination dropdown text alignment */
:deep(.ant-pagination .ant-select-selector) {
  text-align: left !important;
}

:deep(.ant-pagination .ant-select-selection-item) {
  text-align: left !important;
  justify-content: flex-start !important;
}

/* More specific selectors for pagination dropdown */
:deep(.ant-pagination .ant-select .ant-select-selector .ant-select-selection-item) {
  text-align: left !important;
  justify-content: flex-start !important;
  padding-left: 8px !important;
}

:deep(.ant-pagination .ant-select .ant-select-selection-search-input) {
  text-align: left !important;
}

:deep(.ant-pagination .ant-select .ant-select-selection-placeholder) {
  text-align: left !important;
}

/* Global pagination dropdown alignment */
:deep(.ant-pagination .ant-select) {
  text-align: left !important;
}

:deep(.ant-pagination .ant-select .ant-select-selector) {
  text-align: left !important;
}

:deep(.ant-pagination .ant-select .ant-select-selection-item) {
  text-align: left !important;
  justify-content: flex-start !important;
  padding-left: 8px !important;
}

/* Force left alignment for all pagination select elements */
:deep(.ant-pagination .ant-select-selection-item) {
  text-align: left !important;
  justify-content: flex-start !important;
  padding-left: 8px !important;
}

/* Most specific selector for pagination dropdown */
:deep(.ant-table-pagination .ant-pagination .ant-select .ant-select-selector .ant-select-selection-item) {
  text-align: left !important;
  justify-content: flex-start !important;
  padding-left: 8px !important;
}

/* Alternative approach using attribute selector */
:deep(.ant-pagination [class*="ant-select-selection-item"]) {
  text-align: left !important;
  justify-content: flex-start !important;
  padding-left: 8px !important;
}

/* Global override for pagination dropdown alignment */
:deep(.ant-pagination .ant-select .ant-select-selector .ant-select-selection-item) {
  text-align: left !important;
  justify-content: flex-start !important;
  padding-left: 8px !important;
  display: flex !important;
  align-items: center !important;
}

/* Force left alignment with !important and high specificity */
:deep(.ant-table .ant-pagination .ant-select .ant-select-selector .ant-select-selection-item) {
  text-align: left !important;
  justify-content: flex-start !important;
  padding-left: 8px !important;
  display: flex !important;
  align-items: center !important;
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
  font-weight: 0;
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

/* Form styling - ensure consistent font sizes */
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 0;
  color: rgba(0, 0, 0, 0.85);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.form-input,
.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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

.file-progress {
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

/* Tags input styling */
.tags-input {
  width: 100%;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  min-height: 36px;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background-color: white;
  transition: border-color 0.3s;
}

.tags-container:focus-within {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.tag {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: #1890ff;
}

.tag-remove {
  cursor: pointer;
  color: #1890ff;
  font-weight: bold;
  margin-left: 4px;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.tag-remove:hover {
  color: #ff4d4f;
}

.tag-input {
  border: none;
  outline: none;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: transparent;
  min-width: 100px;
  padding: 4px 0;
}

.add-tag-btn {
  color: #1890ff;
  cursor: pointer;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  padding: 2px 8px;
  border: 1px dashed #91d5ff;
  border-radius: 12px;
  transition: all 0.3s;
}

.add-tag-btn:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

/* View Modal Styles */
.view-field {
  padding: 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  background-color: transparent;
  border: none;
  min-height: auto;
  line-height: 1.5;
  margin-top: 4px;
}

.view-tag {
  background-color: transparent;
  border: none;
  padding: 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  margin-right: 8px;
  margin-bottom: 0;
  display: inline;
}

.no-tags {
  color: rgba(0, 0, 0, 0.45);
  font-style: normal;
  font-size: 14px;
}

/* View modal specific file info styling */
.modal-body .file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 0;
  padding: 0;
  background-color: transparent;
  border-radius: 0;
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

/* Additional global style to ensure left alignment */
:deep(.ant-pagination .ant-select-selection-item) {
  text-align: left !important;
  justify-content: flex-start !important;
  padding-left: 8px !important;
}
</style>

<style>
/* Global style to override Ant Design pagination dropdown alignment */
.ant-pagination .ant-select .ant-select-selector .ant-select-selection-item {
  text-align: left !important;
  justify-content: flex-start !important;
  padding-left: 8px !important;
}
</style> 