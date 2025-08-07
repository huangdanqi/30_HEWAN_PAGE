<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>IP音频</h2>
    </div>

    <!-- Control Bar -->
    <div class="top-controls-wrapper">
      <div class="left-aligned-section">
        <div class="select-container ip-name-select" style="margin-right: 16px;">
          <span class="select-always-placeholder">IP名称:</span>
          <a-tooltip :title="ipNameValue.label">
            <a-select
              v-model:value="ipNameValue"
              style="width: 120px;"
              :options="ipNameOptions"
              @change="handleIpNameChange"
              :allowClear="true"
              label-in-value
              placeholder="请选择IP名称"
            >
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div>
        <div class="select-container audio-type-select" style="margin-right: 16px;">
          <span class="select-always-placeholder">音频类型:</span>
          <a-tooltip :title="audioTypeValue.label">
            <a-select
              v-model:value="audioTypeValue"
              style="width: 130px;"
              :options="audioTypeOptions"
              @change="handleAudioTypeChange"
              :allowClear="true"
              label-in-value
              placeholder="请选择音频类型"
            >
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div>
        <div class="select-container emotion-select" style="margin-right: 16px;">
          <span class="select-always-placeholder">情绪:</span>
          <a-tooltip :title="emotionValue.label">
            <a-select
              v-model:value="emotionValue"
              style="width: 100px;"
              :options="emotionOptions"
              @change="handleEmotionChange"
              :allowClear="true"
              label-in-value
              placeholder="请选择情绪"
            >
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div>
        <div class="select-container language-select" style="margin-right: 16px;">
          <span class="select-always-placeholder">语种:</span>
          <a-tooltip :title="languageValue.label">
            <a-select
              v-model:value="languageValue"
              style="width: 100px;"
              :options="languageOptions"
              @change="handleLanguageChange"
              :allowClear="true"
              label-in-value
              placeholder="请选择语种"
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
          placeholder="输入关键字搜索"
          style="width: 200px; margin-right: 16px;"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
        <a-button type="primary" @click="handleCreateAudio" style="margin-right: 16px;">
          新建音频
        </a-button>
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
        <!-- <ExportOutlined @click="handleExport" /> -->
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
        :scroll="{ x: 1800 }"
        @change="handleTableChange"
        :showSorterTooltip="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'ipName'">
            <a class="link-text" @click="handleIpNameClick(record)">{{ record.ipName }}</a>
          </template>
          <template v-if="column.key === 'audioFileAddress'">
            <span class="file-address">{{ record.audioFileAddress }}</span>
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

    <!-- Create Audio Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新建音频</h3>
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
            <label class="required-field"><span class="asterisk">*</span> 音频名称</label>
            <input 
              type="text" 
              v-model="createForm.audioName" 
              class="form-input" 
              placeholder="请输入"
              maxlength="15"
            >
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 音频类型</label>
            <select v-model="createForm.audioType" class="form-select">
              <option value="">请选择</option>
              <option value="情绪">情绪</option>
              <option value="对话">对话</option>
              <option value="唱歌">唱歌</option>
            </select>
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
            <label class="required-field"><span class="asterisk">*</span> 情绪</label>
            <select v-model="createForm.emotion" class="form-select">
              <option value="">请选择</option>
              <option value="开心">开心</option>
              <option value="悲伤">悲伤</option>
              <option value="愤怒">愤怒</option>
              <option value="惊讶">惊讶</option>
              <option value="平静">平静</option>
              <option value="兴奋">兴奋</option>
            </select>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 语种</label>
            <select v-model="createForm.language" class="form-select">
              <option value="">请选择</option>
              <option value="绒绒语">绒绒语</option>
              <option value="普通话">普通话</option>
              <option value="中文">中文</option>
              <option value="英文">英文</option>
              <option value="四川话">四川话</option>
              <option value="湖南话">湖南话</option>
              <option value="重庆话">重庆话</option>
              <option value="台湾话">台湾话</option>
            </select>
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
            <div v-if="createForm.audioFile" class="file-info">
              <span class="file-icon">📎</span>
              <span class="file-name">{{ createForm.audioFile.name }}</span>
              <span class="delete-icon" @click="removeUploadedFile">🗑️</span>
          </div>
            <!-- Progress bar for upload -->
            <!-- <div v-if="uploadProgress > 0 && uploadProgress < 100" class="file-progress">
              <div class="file-info">
                <span class="file-icon">📎</span>
                <span class="file-name">{{ createForm.audioFile?.name }}</span>
                <span class="progress-text">{{ uploadProgress }}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
              </div>
            </div> -->
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeCreateModal">取消</button>
          <button class="btn btn-primary" @click="handleCreateConfirm">确定</button>
        </div>
      </div>
    </div>

    <!-- Edit Audio Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑音频</h3>
          <button class="close-btn" @click="closeEditModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> IP名称</label>
            <select v-model="editForm.ipName" class="form-select">
              <option value="">请选择</option>
              <option value="啵啵">啵啵</option>
              <option value="蝴蝶">蝴蝶</option>
              <option value="小熊">小熊</option>
              <option value="小兔">小兔</option>
              <option value="小猫">小猫</option>
            </select>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 音频名称</label>
            <input 
              type="text" 
              v-model="editForm.audioName" 
              class="form-input" 
              placeholder="请输入"
              maxlength="15"
            >
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 音频类型</label>
            <select v-model="editForm.audioType" class="form-select">
              <option value="">请选择</option>
              <option value="情绪">情绪</option>
              <option value="对话">对话</option>
              <option value="唱歌">唱歌</option>
            </select>
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
            <label class="required-field"><span class="asterisk">*</span> 情绪</label>
            <input type="text" v-model="editForm.emotion" class="form-input" placeholder="请输入">
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 语种</label>
            <input type="text" v-model="editForm.language" class="form-input" placeholder="请输入">
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 上传音频</label>
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
            <div v-if="editForm.audioFile" class="file-info">
                <span class="file-icon">📎</span>
                <span class="file-name">{{ editForm.audioFile.name }}</span>
              <span class="delete-icon" @click="removeEditFile">🗑️</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeEditModal">取消</button>
          <button class="btn btn-primary" @click="handleEditConfirm">确定</button>
        </div>
      </div>
    </div>

    <!-- View Audio Modal -->
    <div v-if="showViewModal" class="modal-overlay" @click="closeViewModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>查看音频</h3>
          <button class="close-btn" @click="closeViewModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> IP名称</label>
            <div class="form-text">{{ viewForm.ipName }}</div>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 音频名称</label>
            <div class="form-text">{{ viewForm.audioName }}</div>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 音频类型</label>
            <div class="form-text">{{ viewForm.audioType }}</div>
          </div>
          <div class="form-group">
            <label>标签</label>
            <div class="tags-display">
              <span v-for="(tag, index) in viewForm.tags" :key="index" class="tag">
                {{ tag }}
              </span>
              <span v-if="viewForm.tags.length === 0" class="no-tags">无标签</span>
            </div>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 情绪</label>
            <div class="form-text">{{ viewForm.emotion }}</div>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 语种</label>
            <div class="form-text">{{ viewForm.language }}</div>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 音频文件</label>
            <div class="file-info">
              <span class="file-icon">📎</span>
              <span class="file-name">{{ viewForm.audioFileAddress }}</span>
            </div>
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
import { useRouter } from 'vue-router';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme } from 'ant-design-vue';
import { ReloadOutlined, ColumnHeightOutlined, SettingOutlined, SearchOutlined, ExportOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons-vue';
import draggable from 'vuedraggable';
import { 
  createColumnConfigs, 
  useTableColumns, 
  createColumn,
  type ColumnDefinition 
} from '../utils/tableConfig';
import axios from 'axios';

const router = useRouter();

const API_BASE_URL = 'http://localhost:2829/api';

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
  audioId: string;
  ipName: string;
  audioName: string;
  audioType: string;
  tags: string;
  emotion: string;
  language: string;
  audioFileAddress: string;
  updater: string;
  createTime: string;
  updateTime: string;
  isPlaying: boolean; // Add isPlaying property
}

// Define column definitions - this is where you add/remove columns
const columnDefinitions: ColumnDefinition[] = [
  createColumn('rowIndex', '序号', 'rowIndex', 60, { fixed: 'left' }),
  createColumn('audioId', '音频 ID', 'audioId', 150, { sortable: true, sortType: 'string' }),
  createColumn('ipName', 'IP名称', 'ipName', 120),
  createColumn('audioName', '音频名称', 'audioName', 150, { sortable: true, sortType: 'string' }),
  createColumn('audioType', '音频类型', 'audioType', 120, { sortable: true, sortType: 'string' }),
  createColumn('tags', '标签', 'tags', 100),
  createColumn('emotion', '情绪', 'emotion', 120, { sortable: true, sortType: 'string' }),
  createColumn('language', '语种', 'language', 100, { sortable: true, sortType: 'string' }),
  createColumn('audioFileAddress', '音频文件地址', 'audioFileAddress', 300),
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
    console.log('Calling IPaudio endpoint');
    // Request all data without pagination parameters
    const response = await axios.get(`${API_BASE_URL}/ipaudio?page=1&pageSize=1000`);
    console.log('IPaudio response:', response.data);
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
const ipNameValue = ref({ key: 'all', label: '全部', value: 'all' });
const audioTypeValue = ref({ key: 'all', label: '全部', value: 'all' });
const emotionValue = ref({ key: 'all', label: '全部', value: 'all' });
const languageValue = ref({ key: 'all', label: '全部', value: 'all' });
const tableSize = ref('middle');
const currentPage = ref(1);
const pageSize = ref(10);

const ipNameOptions = computed(() => {
  const uniqueIpNames = Array.from(new Set(rawData.value.map(item => item.ipName)));
  const options = uniqueIpNames.map(name => ({
    key: name,
    value: name,
    label: name,
  }));
  return [
    { key: 'all', value: 'all', label: '全部' },
    ...options
  ];
});

const audioTypeOptions = computed(() => {
  const uniqueAudioTypes = Array.from(new Set(rawData.value.map(item => item.audioType)));
  const options = uniqueAudioTypes.map(type => ({
    key: type,
    value: type,
    label: type,
  }));
  return [
    { key: 'all', value: 'all', label: '全部' },
    ...options
  ];
});

const emotionOptions = computed(() => {
  const uniqueEmotions = Array.from(new Set(rawData.value.map(item => item.emotion)));
  const options = uniqueEmotions.map(emotion => ({
    key: emotion,
    value: emotion,
    label: emotion,
  }));
  return [
    { key: 'all', value: 'all', label: '全部' },
    ...options
  ];
});

const languageOptions = computed(() => {
  const uniqueLanguages = Array.from(new Set(rawData.value.map(item => item.language)));
  const options = uniqueLanguages.map(language => ({
    key: language,
    value: language,
    label: language,
  }));
  return [
    { key: 'all', value: 'all', label: '全部' },
    ...options
  ];
});

const handleIpNameChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    ipNameValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    ipNameValue.value = val;
  }
};

const handleAudioTypeChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    audioTypeValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    audioTypeValue.value = val;
  }
};

const handleEmotionChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    emotionValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    emotionValue.value = val;
  }
};

const handleLanguageChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    languageValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    languageValue.value = val;
  }
};

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

  // IP Name filter
  if (ipNameValue.value && ipNameValue.value.value !== 'all') {
    dataToFilter = dataToFilter.filter(item => item.ipName === ipNameValue.value.value);
  }

  // Audio Type filter
  if (audioTypeValue.value && audioTypeValue.value.value !== 'all') {
    dataToFilter = dataToFilter.filter(item => item.audioType === audioTypeValue.value.value);
  }

  // Emotion filter
  if (emotionValue.value && emotionValue.value.value !== 'all') {
    dataToFilter = dataToFilter.filter(item => item.emotion === emotionValue.value.value);
  }

  // Language filter
  if (languageValue.value && languageValue.value.value !== 'all') {
    dataToFilter = dataToFilter.filter(item => item.language === languageValue.value.value);
  }

  // Default sorting by updateTime in descending order using plain JavaScript
  dataToFilter.sort((a: DataItem, b: DataItem) => {
    const dateA = new Date(a.updateTime).getTime();
    const dateB = new Date(b.updateTime).getTime();
    return dateB - dateA; // Descending order (newest first)
  });

  // Additional sorting logic for user-initiated sorting (if any)
  if (sorterInfo.value && sorterInfo.value.order) {
    const { columnKey, order } = sorterInfo.value;
    const sorterFn = updatedColumnConfigs.find(c => c.key === columnKey)?.sorter;
    if (sorterFn) {
      dataToFilter.sort((a, b) => {
        const result = sorterFn(a, b);
        return order === 'ascend' ? result : -result;
      });
    }
  }

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
  size: 'default'
}));

const onRefresh = () => {
  loading.value = true;
  searchInputValue.value = '';
  currentPage.value = 1;
  resetColumns();
  // Reset sorter info to ensure default sorting by updateTime
  sorterInfo.value = null;
  ipNameValue.value = { key: 'all', label: '全部', value: 'all' };
  audioTypeValue.value = { key: 'all', label: '全部', value: 'all' };
  emotionValue.value = { key: 'all', label: '全部', value: 'all' };
  languageValue.value = { key: 'all', label: '全部', value: 'all' };
  fetchData(); // Re-fetch data on refresh

  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const handleMenuClick = ({ key }: { key: string }) => {
  tableSize.value = key;
};

const onSettingClick = () => {
  console.log('Setting clicked');
};

// Action handlers
const handleCreateAudio = () => {
  console.log('Create audio clicked');
  showCreateModal.value = true;
};

const handleExport = () => {
  console.log('Export clicked');
};

const handleView = (record: DataItem) => {
  console.log('View clicked for record:', record);
  console.log('Record ID:', record.id);
  console.log('Record IP Name:', record.ipName);
  console.log('Record Audio Name:', record.audioName);
  
  viewForm.value = { 
    id: record.id,
    ipName: record.ipName,
    audioName: record.audioName,
    audioType: record.audioType,
    emotion: record.emotion,
    language: record.language,
    tags: record.tags ? record.tags.split(',').filter(tag => tag.trim()) : [],
    audioFileAddress: record.audioFileAddress
  };
  
  console.log('View form populated:', viewForm.value);
  showViewModal.value = true;
};

const handleEdit = (record: DataItem) => {
  console.log('Edit clicked for record:', record);
  console.log('Record ID:', record.id);
  console.log('Record IP Name:', record.ipName);
  console.log('Record Audio Name:', record.audioName);
  
  editForm.value = { 
    id: record.id,
    ipName: record.ipName,
    audioName: record.audioName,
    audioType: record.audioType,
    emotion: record.emotion,
    language: record.language,
    tags: record.tags ? record.tags.split(',').filter(tag => tag.trim()) : [],
    audioFile: null
  };
  
  console.log('Edit form populated:', editForm.value);
  showEditModal.value = true;
};

const handleDelete = (record: DataItem) => {
  console.log('Delete clicked for record:', record);
  console.log('Record ID:', record.id);
  console.log('Record IP Name:', record.ipName);
  console.log('Record Audio Name:', record.audioName);
  
  // TODO: Implement delete functionality
  alert(`确认删除音频: ${record.audioName}?`);
};

const handleIpNameClick = (record: DataItem) => {
  console.log('IP name clicked:', record.ipName);
  // Navigate to IP Management page with search parameter
  const searchTerm = record.ipName;
  router.push({
    path: '/ip-management',
    query: { search: searchTerm }
  });
};

const handleAudition = (record: DataItem) => {
  console.log('Audition clicked:', record);
  
  // Get or create the audio element for this record
  let audioElement = audioElements.value.get(record.id);

  if (!audioElement) {
    // Construct the full URL for the audio file using the backend server
    const audioUrl = `http://localhost:2829${record.audioFileAddress}`;
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
      alert('音频文件不存在或无法播放');
      record.isPlaying = false; // Revert to false on error
    });
  }
};

// Modal state and form
const showCreateModal = ref(false);
const createForm = ref({
  ipName: '',
  audioName: '',
  audioType: '',
  emotion: '',
  language: '',
  tags: [] as string[],
  audioFile: null as File | null
});

const fileInput = ref<HTMLInputElement>();
const showTagInput = ref(false);
const newTag = ref('');
const uploadProgress = ref(0); // Add upload progress tracking

// Import auth store for username
import { useAuthStore } from '../stores/auth';
const authStore = useAuthStore();

const closeCreateModal = () => {
  showCreateModal.value = false;
  showTagInput.value = false;
  newTag.value = '';
  uploadProgress.value = 0; // Reset progress
  // Reset form
  createForm.value = {
    ipName: '',
    audioName: '',
    audioType: '',
    emotion: '',
    language: '',
    tags: [],
    audioFile: null
  };
};

const handleCreateConfirm = async () => {
  console.log('Create audio form submitted:', createForm.value);
  
  // Validate required fields
  if (!createForm.value.ipName || !createForm.value.audioName || 
      !createForm.value.audioType || !createForm.value.emotion || 
      !createForm.value.language || !createForm.value.audioFile) {
    alert('请填写所有必填字段');
    return;
  }

  // Validate image name length
  if (createForm.value.audioName.length > 15) {
    alert('音频名称不能超过15个字符');
    return;
  }

  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('ipName', createForm.value.ipName);
    formData.append('audioName', createForm.value.audioName);
    formData.append('audioType', createForm.value.audioType);
    formData.append('emotion', createForm.value.emotion);
    formData.append('language', createForm.value.language);
    formData.append('tags', createForm.value.tags.join(','));
    formData.append('audioFile', createForm.value.audioFile!);
    formData.append('updater', authStore.user?.name || authStore.user?.username || '管理员');

    console.log('Sending request to:', `${API_BASE_URL}/ipaudio`);
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(key, ':', value);
    }

    // Send to backend
    const response = await axios.post(`${API_BASE_URL}/ipaudio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000, // 30 second timeout
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          uploadProgress.value = percentCompleted;
        }
      }
    });

    console.log('Audio created successfully:', response.data);
    uploadProgress.value = 100; // Set to 100% on success
    setTimeout(() => {
      uploadProgress.value = 0; // Reset after showing 100%
    }, 1000);
    alert('音频创建成功！');
  closeCreateModal();
    fetchData(); // Refresh the data
  } catch (error: any) {
    console.error('Error creating audio:', error);
    
    let errorMessage = '创建音频失败，请重试';
    
    if (error.response) {
      // Server responded with error
      console.error('Server error response:', error.response.data);
      if (error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
    } else if (error.request) {
      // Request was made but no response
      console.error('No response received:', error.request);
      errorMessage = '服务器无响应，请检查网络连接';
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
      errorMessage = '请求设置错误: ' + error.message;
    }
    
    alert(errorMessage);
    uploadProgress.value = 0; // Reset progress on error
  }
};

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    createForm.value.audioFile = target.files[0];
  }
};

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    createForm.value.audioFile = event.dataTransfer.files[0];
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
  createForm.value.audioFile = null;
};

// Edit Modal state and form
const showEditModal = ref(false);
const editForm = ref({
  id: 0,
  ipName: '',
  audioName: '',
  audioType: '',
  emotion: '',
  language: '',
  tags: [] as string[],
  audioFile: null as File | null
});

const editFileInput = ref<HTMLInputElement>();
const showEditTagInput = ref(false);
const newEditTag = ref('');

const closeEditModal = () => {
  showEditModal.value = false;
  showEditTagInput.value = false;
  newEditTag.value = '';
  uploadProgress.value = 0; // Reset progress
  // Reset form
  editForm.value = {
    id: 0,
    ipName: '',
    audioName: '',
    audioType: '',
    emotion: '',
    language: '',
    tags: [],
    audioFile: null
  };
};

const handleEditConfirm = async () => {
  console.log('Edit audio form submitted:', editForm.value);
  
  // Validate required fields
  if (!editForm.value.ipName || !editForm.value.audioName || 
      !editForm.value.audioType || !editForm.value.emotion || 
      !editForm.value.language) {
    alert('请填写所有必填字段');
    return;
  }

  // Validate audio name length
  if (editForm.value.audioName.length > 15) {
    alert('音频名称不能超过15个字符');
    return;
  }

  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('ipName', editForm.value.ipName);
    formData.append('audioName', editForm.value.audioName);
    formData.append('audioType', editForm.value.audioType);
    formData.append('tags', editForm.value.tags.join(','));
    formData.append('emotion', editForm.value.emotion);
    formData.append('language', editForm.value.language);
    if (editForm.value.audioFile) {
      formData.append('audioFile', editForm.value.audioFile);
    }
    formData.append('updater', authStore.user?.name || authStore.user?.username || '管理员');

    console.log('Sending update request to:', `${API_BASE_URL}/ipaudio/${editForm.value.id}`);
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(key, ':', value);
    }

    // Send to backend
    const response = await axios.put(`${API_BASE_URL}/ipaudio/${editForm.value.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000, // 30 second timeout
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          uploadProgress.value = percentCompleted;
        }
      }
    });

    console.log('Audio updated successfully:', response.data);
    uploadProgress.value = 100; // Set to 100% on success
    setTimeout(() => {
      uploadProgress.value = 0; // Reset after showing 100%
    }, 1000);
    alert('音频更新成功！');
  closeEditModal();
    fetchData(); // Refresh the data
  } catch (error: any) {
    console.error('Error updating audio:', error);
    
    let errorMessage = '更新音频失败，请重试';
    
    if (error.response) {
      // Server responded with error
      console.error('Server error response:', error.response.data);
      if (error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
    } else if (error.request) {
      // Request was made but no response
      console.error('No response received:', error.request);
      errorMessage = '服务器无响应，请检查网络连接';
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
      errorMessage = '请求设置错误: ' + error.message;
    }
    
    alert(errorMessage);
    uploadProgress.value = 0; // Reset progress on error
  }
};

const triggerEditFileUpload = () => {
  editFileInput.value?.click();
};

const handleEditFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    editForm.value.audioFile = target.files[0];
  }
};

const handleEditFileDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    editForm.value.audioFile = event.dataTransfer.files[0];
  }
};

const removeEditFile = () => {
  editForm.value.audioFile = null;
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

// View Modal state and form
const showViewModal = ref(false);
const viewForm = ref({
  id: 0,
  ipName: '',
  audioName: '',
  audioType: '',
  emotion: '',
  language: '',
  tags: [] as string[],
  audioFileAddress: ''
});

const closeViewModal = () => {
  showViewModal.value = false;
  // Reset view form
  viewForm.value = {
    id: 0,
    ipName: '',
    audioName: '',
    audioType: '',
    emotion: '',
    language: '',
    tags: [],
    audioFileAddress: ''
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
/* Reuse the same styles from Account.vue */
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

:deep(.ip-name-select .ant-select-selector) {
  padding-left: 50px !important;
}

:deep(.audio-type-select .ant-select-selector) {
  padding-left: 65px !important;
}


:deep(.emotion-select .ant-select-selector) {
  padding-left: 40px !important;
}
:deep(.language-select .ant-select-selector) {
  padding-left: 40px !important;
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
  font-size: 12px;
  color: #1890ff;
}

.tag-remove {
  cursor: pointer;
  color: #1890ff;
  font-weight: bold;
  margin-left: 4px;
  font-size: 12px;
}

.tag-remove:hover {
  color: #ff4d4f;
}

.tag-input {
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
  min-width: 100px;
  padding: 4px 0;
}

.add-tag-btn {
  color: #1890ff;
  cursor: pointer;
  font-size: 12px;
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
.form-text {
  padding: 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  background-color: transparent;
  border-radius: 0;
  min-height: auto;
  display: block;
  border: none;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  min-height: auto;
  padding: 0;
  background-color: transparent;
  border-radius: 0;
  border: none;
}

.no-tags {
  color: rgba(0, 0, 0, 0.45);
  font-style: italic;
  font-size: 12px;
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
