<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>IP图片</h2>
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
        <div class="select-container category-select" style="margin-right: 16px;">
          <span class="select-always-placeholder">品类:</span>
          <a-tooltip :title="categoryValue.label">
            <a-select
              v-model:value="categoryValue"
              style="width: 100px;"
              :options="categoryOptions"
              @change="handleCategoryChange"
              :allowClear="true"
              label-in-value
              placeholder="请选择品类"
            >
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div>
        <div class="select-container weather-select" style="margin-right: 16px;">
          <span class="select-always-placeholder">天气:</span>
          <a-tooltip :title="weatherValue.label">
            <a-select
              v-model:value="weatherValue"
              style="width: 100px;"
              :options="weatherOptions"
              @change="handleWeatherChange"
              :allowClear="true"
              label-in-value
              placeholder="请选择天气"
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
        <div class="select-container time-select" style="margin-right: 16px;">
          <span class="select-always-placeholder">时间:</span>
          <a-tooltip :title="timeValue.label">
            <a-select
              v-model:value="timeValue"
              style="width: 100px;"
              :options="timeOptions"
              @change="handleTimeChange"
              :allowClear="true"
              label-in-value
              placeholder="请选择时间"
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
          placeholder="请输入"
          style="width: 200px; margin-right: 16px;"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
        <a-button type="primary" @click="handleCreateImage" style="margin-right: 16px;">
          新建图片
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
        <ExportOutlined @click="handleExport" />
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
          <template v-if="column.key === 'imageFileAddress'">
            <span class="file-address">{{ record.imageFileAddress }}</span>
          </template>
          <template v-if="column.key === 'preview'">
            <a-button type="link" size="small" @click="handlePreview(record)">
              <EyeOutlined />
            </a-button>
          </template>
          <template v-if="column.key === 'updater'">
            <div class="updater-cell">
              <a-avatar size="small" style="margin-right: 8px;">{{ record.updater.charAt(0) }}</a-avatar>
              <span>{{ record.updater }}</span>
            </div>
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

    <!-- Create Image Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新建图片</h3>
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
            <label class="required-field"><span class="asterisk">*</span> 图片名称</label>
            <input type="text" v-model="createForm.imageName" class="form-input" placeholder="请输入">
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 场景</label>
            <input type="text" v-model="createForm.scene" class="form-input" placeholder="请输入">
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 天气</label>
            <select v-model="createForm.weather" class="form-select">
              <option value="">请选择</option>
              <option value="通用">通用</option>
              <option value="晴天">晴天</option>
              <option value="阴天">阴天</option>
              <option value="多云">多云</option>
              <option value="小雨">小雨</option>
              <option value="大雨">大雨</option>
              <option value="雷雨">雷雨</option>
              <option value="大风">大风</option>
              <option value="台风">台风</option>
            </select>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 情绪</label>
            <select v-model="createForm.emotion" class="form-select">
              <option value="">请选择</option>
              <option value="通用">通用</option>
              <option value="开心">开心</option>
              <option value="放松">放松</option>
              <option value="兴奋">兴奋</option>
              <option value="平静">平静</option>
              <option value="忧郁">忧郁</option>
              <option value="愤怒">愤怒</option>
              <option value="悲伤">悲伤</option>
            </select>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 时间段</label>
            <select v-model="createForm.timePeriod" class="form-select">
              <option value="">请选择</option>
              <option value="通用">通用</option>
              <option value="上午">上午 (8:00 - 11:59)</option>
              <option value="下午">下午 (12:00 - 17:59)</option>
              <option value="中午">中午 (12:00 - 13:30)</option>
              <option value="白天">白天 (8:00 - 17:59)</option>
              <option value="晚上">晚上 (18:00 - 23:59)</option>
              <option value="凌晨">凌晨 (00:00 - 7:59)</option>
            </select>
          </div>
          <div class="form-group">
            <label>标签</label>
            <input type="text" v-model="createForm.tags" class="form-input" placeholder="请输入">
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 上传图片</label>
            <div class="upload-area" @click="triggerFileUpload" @drop="handleFileDrop" @dragover.prevent @dragenter.prevent>
              <input 
                ref="fileInput" 
                type="file" 
                accept=".png,.jpg,.jpeg,.svg" 
                @change="handleFileChange" 
                style="display: none;"
              >
              <div class="upload-content">
                <div class="upload-icon">↑</div>
                <div class="upload-text">支持文件格式: png、jpg、jpeg、svg</div>
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

    <!-- Edit Image Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑图片</h3>
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
            </select>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 图片名称</label>
            <input type="text" v-model="editForm.imageName" class="form-input" placeholder="请输入">
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 场景</label>
            <input type="text" v-model="editForm.scene" class="form-input" placeholder="请输入">
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 天气</label>
            <select v-model="editForm.weather" class="form-select">
              <option value="">请选择</option>
              <option value="通用">通用</option>
              <option value="晴天">晴天</option>
              <option value="阴天">阴天</option>
              <option value="多云">多云</option>
              <option value="小雨">小雨</option>
              <option value="大雨">大雨</option>
              <option value="雷雨">雷雨</option>
              <option value="大风">大风</option>
              <option value="台风">台风</option>
            </select>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 情绪</label>
            <select v-model="editForm.emotion" class="form-select">
              <option value="">请选择</option>
              <option value="通用">通用</option>
              <option value="开心">开心</option>
              <option value="放松">放松</option>
              <option value="兴奋">兴奋</option>
              <option value="平静">平静</option>
              <option value="忧郁">忧郁</option>
              <option value="愤怒">愤怒</option>
              <option value="悲伤">悲伤</option>
            </select>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 时间段</label>
            <select v-model="editForm.timePeriod" class="form-select">
              <option value="">请选择</option>
              <option value="通用">通用</option>
              <option value="上午">上午 (8:00 - 11:59)</option>
              <option value="下午">下午 (12:00 - 17:59)</option>
              <option value="中午">中午 (12:00 - 13:30)</option>
              <option value="白天">白天 (8:00 - 17:59)</option>
              <option value="晚上">晚上 (18:00 - 23:59)</option>
              <option value="凌晨">凌晨 (00:00 - 7:59)</option>
            </select>
          </div>
          <div class="form-group">
            <label>标签</label>
            <div class="tags-input">
              <div class="tags-container">
                <span v-for="(tag, index) in editForm.tags" :key="index" class="tag">
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
            <label class="required-field"><span class="asterisk">*</span> 上传图片</label>
            <div class="upload-area" @click="triggerEditFileUpload" @drop="handleEditFileDrop" @dragover.prevent @dragenter.prevent>
              <input 
                ref="editFileInput" 
                type="file" 
                accept=".png,.jpg,.jpeg,.svg" 
                @change="handleEditFileChange" 
                style="display: none;"
              >
              <div class="upload-content">
                <div class="upload-icon">↑</div>
                <div class="upload-text">支持文件格式: png、jpg、jpeg、svg</div>
              </div>
            </div>
            <div v-if="editForm.imageFile" class="file-progress">
              <div class="file-info">
                <span class="file-icon">📎</span>
                <span class="file-name">{{ editForm.imageFile.name }}</span>
                <span class="progress-text">{{ uploadProgress }}%</span>
                <span class="delete-icon" @click="removeFile">🗑️</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
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
import { ReloadOutlined, ColumnHeightOutlined, SettingOutlined, SearchOutlined, ExportOutlined, EyeOutlined } from '@ant-design/icons-vue';
import draggable from 'vuedraggable';
import { 
  createColumnConfigs, 
  useTableColumns, 
  createColumn,
  type ColumnDefinition 
} from '../utils/tableConfig';

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '',
  },
}));

// Define your data interface
interface DataItem {
  key: number;
  imageId: string;
  ipName: string;
  imageName: string;
  scene: string;
  weather: string;
  emotion: string;
  time: string;
  imageFileAddress: string;
  updater: string;
  createTime: string;
  updateTime: string;
}

// Define column definitions - this is where you add/remove columns
const columnDefinitions: ColumnDefinition[] = [
  createColumn('rowIndex', '序号', 'rowIndex', 60, { fixed: 'left' }),
  createColumn('imageId', '图片 ID', 'imageId', 150, { sortable: true, sortType: 'string' }),
  createColumn('ipName', 'IP名称', 'ipName', 120),
  createColumn('imageName', '图片名称', 'imageName', 150, { sortable: true, sortType: 'string' }),
  createColumn('scene', '场景', 'scene', 120, { sortable: true, sortType: 'string' }),
  createColumn('weather', '天气', 'weather', 100, { sortable: true, sortType: 'string' }),
  createColumn('emotion', '情绪', 'emotion', 120, { sortable: true, sortType: 'string' }),
  createColumn('time', '时间', 'time', 100, { sortable: true, sortType: 'string' }),
  createColumn('imageFileAddress', '图片文件地址', 'imageFileAddress', 200),
  createColumn('preview', '预览', 'preview', 80),
  createColumn('updater', '更新人', 'updater', 120),
  createColumn('createTime', '创建时间', 'createTime', 180, { sortable: true, sortType: 'date' }),
  createColumn('updateTime', '更新时间', 'updateTime', 180, { sortable: true, sortType: 'date' }),
  createColumn('operation', '操作', 'operation', 150, { fixed: 'right' }),
];

// Create column configs from definitions
const columnConfigs = createColumnConfigs(columnDefinitions);

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
} = useTableColumns(columnConfigs);

// Generate sample data based on the image
const rawData: DataItem[] = [];
for (let i = 0; i < 43; i++) {
  rawData.push({
    key: i + 1,
    imageId: 'hjhwn832nj2f',
    ipName: '啵啵',
    imageName: '晒太阳',
    scene: '居家',
    weather: '晴天',
    emotion: '放松',
    time: '白天',
    imageFileAddress: 'https://example.com/firmware.bin',
    updater: '33',
    createTime: '2025-7-13 19:25:11',
    updateTime: '2025-7-13 19:25:11',
  });
}

// Filter and search logic
const searchInputValue = ref('');
const ipNameValue = ref({ key: 'all', label: '全部', value: 'all' });
const categoryValue = ref({ key: 'all', label: '全部', value: 'all' });
const weatherValue = ref({ key: 'all', label: '全部', value: 'all' });
const emotionValue = ref({ key: 'all', label: '全部', value: 'all' });
const timeValue = ref({ key: 'all', label: '全部', value: 'all' });
const loading = ref(false);
const tableSize = ref('middle');
const currentPage = ref(1);
const pageSize = ref(10);

const ipNameOptions = computed(() => {
  const uniqueIpNames = Array.from(new Set(rawData.map(item => item.ipName)));
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

const categoryOptions = computed(() => {
  const uniqueCategories = Array.from(new Set(rawData.map(item => item.scene)));
  const options = uniqueCategories.map(category => ({
    key: category,
    value: category,
    label: category,
  }));
  return [
    { key: 'all', value: 'all', label: '全部' },
    ...options
  ];
});

const weatherOptions = computed(() => {
  const uniqueWeathers = Array.from(new Set(rawData.map(item => item.weather)));
  const options = uniqueWeathers.map(weather => ({
    key: weather,
    value: weather,
    label: weather,
  }));
  return [
    { key: 'all', value: 'all', label: '全部' },
    ...options
  ];
});

const emotionOptions = computed(() => {
  const uniqueEmotions = Array.from(new Set(rawData.map(item => item.emotion)));
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

const timeOptions = computed(() => {
  const uniqueTimes = Array.from(new Set(rawData.map(item => item.time)));
  const options = uniqueTimes.map(time => ({
    key: time,
    value: time,
    label: time,
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

const handleCategoryChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    categoryValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    categoryValue.value = val;
  }
};

const handleWeatherChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    weatherValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    weatherValue.value = val;
  }
};

const handleEmotionChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    emotionValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    emotionValue.value = val;
  }
};

const handleTimeChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    timeValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    timeValue.value = val;
  }
};

const filteredData = computed(() => {
  let dataToFilter = rawData;

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

  // Category filter
  if (categoryValue.value && categoryValue.value.value !== 'all') {
    dataToFilter = dataToFilter.filter(item => item.scene === categoryValue.value.value);
  }

  // Weather filter
  if (weatherValue.value && weatherValue.value.value !== 'all') {
    dataToFilter = dataToFilter.filter(item => item.weather === weatherValue.value.value);
  }

  // Emotion filter
  if (emotionValue.value && emotionValue.value.value !== 'all') {
    dataToFilter = dataToFilter.filter(item => item.emotion === emotionValue.value.value);
  }

  // Time filter
  if (timeValue.value && timeValue.value.value !== 'all') {
    dataToFilter = dataToFilter.filter(item => item.time === timeValue.value.value);
  }

  // Sorting logic
  if (sorterInfo.value && sorterInfo.value.order) {
    const { columnKey, order } = sorterInfo.value;
    const sorterFn = columnConfigs.find(c => c.key === columnKey)?.sorter;
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
}));

const onRefresh = () => {
  loading.value = true;
  searchInputValue.value = '';
  currentPage.value = 1;
  resetColumns();
  ipNameValue.value = { key: 'all', label: '全部', value: 'all' };
  categoryValue.value = { key: 'all', label: '全部', value: 'all' };
  weatherValue.value = { key: 'all', label: '全部', value: 'all' };
  emotionValue.value = { key: 'all', label: '全部', value: 'all' };
  timeValue.value = { key: 'all', label: '全部', value: 'all' };

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
const handleCreateImage = () => {
  console.log('Create image clicked');
  showCreateModal.value = true;
};

// Modal state and form
const showCreateModal = ref(false);
const createForm = ref({
  ipName: '',
  imageName: '',
  scene: '',
  weather: '',
  emotion: '',
  timePeriod: '',
  tags: '',
  imageFile: null as File | null
});

const fileInput = ref<HTMLInputElement>();

const closeCreateModal = () => {
  showCreateModal.value = false;
  // Reset form
  createForm.value = {
    ipName: '',
    imageName: '',
    scene: '',
    weather: '',
    emotion: '',
    timePeriod: '',
    tags: '',
    imageFile: null
  };
};

const handleCreateConfirm = () => {
  console.log('Create image form submitted:', createForm.value);
  // Here you would typically send the data to your API
  closeCreateModal();
};

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    createForm.value.imageFile = target.files[0];
  }
};

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    createForm.value.imageFile = event.dataTransfer.files[0];
  }
};

const handleExport = () => {
  console.log('Export clicked');
};

const handleView = (record: DataItem) => {
  console.log('View:', record);
};

const handleEdit = (record: DataItem) => {
  console.log('Edit:', record);
  showEditModal.value = true;
  // Populate edit form with record data
  editForm.value = {
    ipName: record.ipName,
    imageName: record.imageName,
    scene: record.scene,
    weather: record.weather,
    emotion: record.emotion,
    timePeriod: record.time || '', // Use time as timePeriod
    tags: '', // Initialize as empty string
    imageFile: null // Clear previous file
  };
  // Reset file progress
  uploadProgress.value = 0;
  fileUploading.value = false;
};

const handleDelete = (record: DataItem) => {
  console.log('Delete:', record);
};

const handleIpNameClick = (record: DataItem) => {
  console.log('IP name clicked:', record.ipName);
};

const handlePreview = (record: DataItem) => {
  console.log('Preview clicked:', record);
};

// Edit Modal State and Form
const showEditModal = ref(false);
const editForm = ref({
  ipName: '',
  imageName: '',
  scene: '',
  weather: '',
  emotion: '',
  timePeriod: '',
  tags: '',
  imageFile: null as File | null
});

const tagInput = ref<HTMLInputElement>();
const editFileInput = ref<HTMLInputElement>();
const showTagInput = ref(false);
const newTag = ref('');
const fileUploading = ref(false);
const uploadProgress = ref(0);

const closeEditModal = () => {
  showEditModal.value = false;
  // Reset form
  editForm.value = {
    ipName: '',
    imageName: '',
    scene: '',
    weather: '',
    emotion: '',
    timePeriod: '',
    tags: '',
    imageFile: null
  };
  showTagInput.value = false;
  newTag.value = '';
  fileUploading.value = false;
  uploadProgress.value = 0;
};

const handleEditConfirm = () => {
  console.log('Edit image form submitted:', editForm.value);
  // Here you would typically send the data to your API
  closeEditModal();
};

const triggerEditFileUpload = () => {
  editFileInput.value?.click();
};

const handleEditFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    editForm.value.imageFile = target.files[0];
    fileUploading.value = true;
    uploadProgress.value = 0;
    // Simulate upload progress
    const interval = setInterval(() => {
      uploadProgress.value += 10;
      if (uploadProgress.value >= 100) {
        clearInterval(interval);
        fileUploading.value = false;
      }
    }, 100);
  }
};

const handleEditFileDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    editForm.value.imageFile = event.dataTransfer.files[0];
    fileUploading.value = true;
    uploadProgress.value = 0;
    // Simulate upload progress
    const interval = setInterval(() => {
      uploadProgress.value += 10;
      if (uploadProgress.value >= 100) {
        clearInterval(interval);
        fileUploading.value = false;
      }
    }, 100);
  }
};

const removeFile = () => {
  editForm.value.imageFile = null;
  fileUploading.value = false;
  uploadProgress.value = 0;
};

const addTag = () => {
  if (newTag.value && newTag.value.trim() && !editForm.value.tags.includes(newTag.value.trim())) {
    editForm.value.tags += (editForm.value.tags ? ', ' : '') + newTag.value.trim();
  }
  showTagInput.value = false;
  newTag.value = '';
};

const removeTag = (index: number) => {
  const tags = editForm.value.tags.split(', ');
  tags.splice(index, 1);
  editForm.value.tags = tags.join(', ');
};

onMounted(() => {
  selectedColumnKeys.value = columnConfigs.map(config => config.key);
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

:deep(.ip-name-select .ant-select-selector) {
  padding-left: 80px !important;
}

:deep(.category-select .ant-select-selector) {
  padding-left: 60px !important;
}

:deep(.weather-select .ant-select-selector) {
  padding-left: 60px !important;
}

:deep(.emotion-select .ant-select-selector) {
  padding-left: 60px !important;
}

:deep(.time-select .ant-select-selector) {
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

:deep(.link-text) {
  color: #1890ff !important;
  font-weight: bold;
}

:deep(.updater-cell) {
  display: flex;
  align-items: center;
}

:deep(.file-address) {
  color: rgba(0, 0, 0, 0.65);
  font-family: monospace;
  font-size: 12px;
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
.form-select {
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

/* New styles for tags input and file progress */
.tags-input {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  background-color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  padding: 2px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #1890ff;
}

.tag-remove {
  cursor: pointer;
  font-size: 12px;
  color: #ff4d4f;
}

.tag-remove:hover {
  color: #ff7875;
}

.tag-input {
  flex-grow: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  padding: 0;
}

.add-tag-btn {
  cursor: pointer;
  font-size: 12px;
  color: #1890ff;
  border: 1px dashed #91d5ff;
  border-radius: 4px;
  padding: 2px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.add-tag-btn:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

.file-progress {
  margin-top: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 8px;
  background-color: #fafafa;
}

.file-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
}

.file-icon {
  font-size: 16px;
  margin-right: 8px;
}

.file-name {
  flex-grow: 1;
  margin-right: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-text {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
}

.delete-icon {
  cursor: pointer;
  font-size: 16px;
  color: #ff4d4f;
  margin-left: 10px;
}

.delete-icon:hover {
  color: #ff7875;
}

.progress-bar {
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #1890ff;
  border-radius: 4px;
  transition: width 0.3s ease-in-out;
}
</style> 