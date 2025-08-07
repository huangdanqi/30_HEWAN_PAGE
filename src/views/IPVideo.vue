<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>IP视频</h2>
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
        <div class="select-container scene-select" style="margin-right: 16px;">
          <span class="select-always-placeholder">场景:</span>
          <a-tooltip :title="sceneValue.label">
            <a-select
              v-model:value="sceneValue"
              style="width: 100px;"
              :options="sceneOptions"
              @change="handleSceneChange"
              :allowClear="true"
              label-in-value
              placeholder="请选择场景"
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
        <div class="select-container time-period-select" style="margin-right: 16px;">
          <span class="select-always-placeholder">时间段:</span>
          <a-tooltip :title="timeValue.label">
            <a-select
              v-model:value="timeValue"
              style="width: 120px;"
              :options="timeOptions"
              @change="handleTimeChange"
              :allowClear="true"
              label-in-value
              placeholder="请选择时间段"
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
        <a-button type="primary" @click="handleCreateVideo" style="margin-right: 16px;">
          新建视频
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
          <template v-if="column.key === 'videoFileAddress'">
            <span class="file-address">{{ record.videoFileAddress }}</span>
          </template>
          <template v-if="column.key === 'play'">
            <a-button 
              type="link" 
              size="small" 
              @click="handlePlay(record)"
              :class="{ 'playing': playingVideoId === record.id }"
            >
              <PlayCircleOutlined v-if="playingVideoId !== record.id" />
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
            <input 
              type="text" 
              v-model="createForm.videoName" 
              class="form-input" 
              placeholder="请输入"
              maxlength="15"
            >
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 场景</label>
            <input 
              type="text" 
              v-model="createForm.scene" 
              class="form-input" 
              placeholder="请输入"
              maxlength="15"
            >
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
            <label class="required-field"><span class="asterisk">*</span> 上传视频</label>
            <div class="upload-area" @click="triggerFileUpload" @drop="handleFileDrop" @dragover.prevent @dragenter.prevent>
              <input 
                ref="fileInput" 
                type="file" 
                accept=".gif,.mp4,.pv9,.mov" 
                @change="handleFileChange" 
                style="display: none;"
              >
              <div class="upload-content">
                <div class="upload-icon">↑</div>
                <div class="upload-text">支持文件格式: gif、mp4、pv9、mov</div>
              </div>
            </div>
            <!-- File display after upload -->
            <div v-if="createForm.videoFile" class="file-info">
              <span class="file-icon">📎</span>
              <span class="file-name">{{ createForm.videoFile.name }}</span>
              <span class="delete-icon" @click="removeUploadedFile">🗑️</span>
            </div>
            <!-- Progress bar for upload -->
            <div v-if="uploadProgress > 0 && uploadProgress < 100" class="file-progress">
              <div class="file-info">
                <span class="file-icon">📎</span>
                <span class="file-name">{{ createForm.videoFile?.name }}</span>
                <span class="progress-text">{{ uploadProgress }}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
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
            <select v-model="editForm.ipName" class="form-select">
              <option value="">请选择</option>
              <option value="啵啵">啵啵</option>
              <option value="蝴蝶">蝴蝶</option>
              <option value="小熊">小熊</option>
            </select>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 视频名称</label>
            <input 
              type="text" 
              v-model="editForm.videoName" 
              class="form-input" 
              placeholder="请输入"
              maxlength="15"
            >
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 场景</label>
            <input 
              type="text" 
              v-model="editForm.scene" 
              class="form-input" 
              placeholder="请输入"
              maxlength="15"
            >
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
            <label class="required-field"><span class="asterisk">*</span> 上传视频</label>
            <div class="upload-area" @click="triggerEditFileUpload" @drop="handleEditFileDrop" @dragover.prevent @dragenter.prevent>
              <input 
                ref="editFileInput" 
                type="file" 
                accept=".gif,.mp4,.pv9,.mov" 
                @change="handleEditFileChange" 
                style="display: none;"
              >
                <div class="upload-content">
                  <div class="upload-icon">↑</div>
                <div class="upload-text">支持文件格式: gif、mp4、pv9、mov</div>
                </div>
              </div>
            <!-- File display after upload -->
            <div v-if="editForm.videoFile" class="file-info">
              <span class="file-icon">📎</span>
              <span class="file-name">{{ editForm.videoFile.name }}</span>
              <span class="delete-icon" @click="removeEditUploadedFile">🗑️</span>
            </div>
            <!-- Progress bar for upload -->
            <div v-if="editUploadProgress > 0 && editUploadProgress < 100" class="file-progress">
              <div class="file-info">
                <span class="file-icon">📎</span>
                <span class="file-name">{{ editForm.videoFile?.name }}</span>
                <span class="progress-text">{{ editUploadProgress }}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: editUploadProgress + '%' }"></div>
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

    <!-- View Video Modal -->
    <div v-if="showViewModal" class="modal-overlay" @click="closeViewModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>查看视频</h3>
          <button class="close-btn" @click="closeViewModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> IP名称</label>
            <div class="view-field">{{ viewForm.ipName }}</div>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 视频名称</label>
            <div class="view-field">{{ viewForm.videoName }}</div>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 场景</label>
            <div class="view-field">{{ viewForm.scene }}</div>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 天气</label>
            <div class="view-field">{{ viewForm.weather }}</div>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 情绪</label>
            <div class="view-field">{{ viewForm.emotion }}</div>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 时间段</label>
            <div class="view-field">{{ viewForm.timePeriod }}</div>
          </div>
          <div class="form-group">
            <label>标签</label>
            <div class="view-field">
              <span v-for="(tag, index) in viewForm.tags" :key="index" class="view-tag">
                {{ tag }}
              </span>
              <span v-if="viewForm.tags.length === 0" class="no-tags">无标签</span>
            </div>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 视频文件</label>
            <div class="view-field">
              <span class="file-icon">📎</span>
              <span class="file-name">{{ viewForm.videoFileAddress }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeViewModal">关闭</button>
        </div>
      </div>
    </div>

    <!-- Video Player Modal -->
    <div v-if="showVideoModal" class="modal-overlay" @click="closeVideoModal">
      <div class="video-modal-content" @click.stop>
        <div class="video-modal-header">
          <h3>视频播放</h3>
          <button class="close-btn" @click="closeVideoModal">×</button>
        </div>
        <div class="video-modal-body">
          <video 
            ref="videoPlayer" 
            controls 
            class="video-player"
            @ended="onVideoEnded"
            @play="onVideoPlay"
            @pause="onVideoPause"
          >
            <source :src="currentVideoUrl" type="video/mp4">
            <source :src="currentVideoUrl" type="video/webm">
            <source :src="currentVideoUrl" type="video/ogg">
            您的浏览器不支持视频播放。
          </video>
          <div class="video-info">
            <p><strong>视频名称:</strong> {{ currentVideoInfo.videoName }}</p>
            <p><strong>IP名称:</strong> {{ currentVideoInfo.ipName }}</p>
            <p><strong>场景:</strong> {{ currentVideoInfo.scene }}</p>
          </div>
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
import { ReloadOutlined, ColumnHeightOutlined, SettingOutlined, SearchOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons-vue';
import draggable from 'vuedraggable';
import { 
  createColumnConfigs, 
  useTableColumns, 
  createColumn,
  type ColumnDefinition 
} from '../utils/tableConfig';
import axios from 'axios';

const router = useRouter();

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
  videoId: string;
  ipName: string;
  videoName: string;
  scene: string;
  weather: string;
  emotion: string;
  timePeriod: string;
  tags: string;
  videoFileAddress: string;
  updater: string;
  createTime: string;
  updateTime: string;
}

// Define column definitions - this is where you add/remove columns
const columnDefinitions: ColumnDefinition[] = [
  createColumn('rowIndex', '序号', 'rowIndex', 60, { fixed: 'left' }),
  createColumn('videoId', '视频 ID', 'videoId', 150, { sortable: true, sortType: 'string' }),
  createColumn('ipName', 'IP名称', 'ipName', 120),
  createColumn('videoName', '视频名称', 'videoName', 150, { sortable: true, sortType: 'string' }),
  createColumn('scene', '场景', 'scene', 120, { sortable: true, sortType: 'string' }),
  createColumn('weather', '天气', 'weather', 100, { sortable: true, sortType: 'string' }),
  createColumn('emotion', '情绪', 'emotion', 120, { sortable: true, sortType: 'string' }),
  createColumn('timePeriod', '时间段', 'timePeriod', 100, { sortable: true, sortType: 'string' }),
  createColumn('tags', '标签', 'tags', 150, { sortable: true, sortType: 'string' }),
  createColumn('videoFileAddress', '视频文件地址', 'videoFileAddress', 300),
  createColumn('play', '播放', 'play', 80),
  createColumn('updater', '更新人', 'updater', 120),
  createColumn('createTime', '创建时间', 'createTime', 180, { sortable: true, sortType: 'date' }),
  createColumn('updateTime', '更新时间', 'updateTime', 180, { sortable: true, sortType: 'date' }),
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

const fetchData = async () => {
  console.log('fetchData called');
  loading.value = true;
  try {
    console.log('Calling IPvideo endpoint');
    const response = await axios.get(`${API_BASE_URL}/ipvideo?page=1&pageSize=1000`);
    console.log('IPvideo response:', response.data);
    rawData.value = response.data.data.map((item: any) => ({
      ...item,
      key: item.id,
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
const sceneValue = ref({ key: 'all', label: '全部', value: 'all' });
const weatherValue = ref({ key: 'all', label: '全部', value: 'all' });
const emotionValue = ref({ key: 'all', label: '全部', value: 'all' });
const timeValue = ref({ key: 'all', label: '全部', value: 'all' });
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

const sceneOptions = computed(() => {
  const uniqueScenes = Array.from(new Set(rawData.value.map(item => item.scene)));
  const options = uniqueScenes.map(scene => ({
    key: scene,
    value: scene,
    label: scene,
  }));
  return [
    { key: 'all', value: 'all', label: '全部' },
    ...options
  ];
});

const weatherOptions = computed(() => {
  const uniqueWeathers = Array.from(new Set(rawData.value.map(item => item.weather)));
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

const timeOptions = computed(() => {
  const uniqueTimes = Array.from(new Set(rawData.value.map(item => item.timePeriod)));
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

const handleSceneChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    sceneValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    sceneValue.value = val;
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

  // Scene filter
  if (sceneValue.value && sceneValue.value.value !== 'all') {
    dataToFilter = dataToFilter.filter(item => item.scene === sceneValue.value.value);
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
    dataToFilter = dataToFilter.filter(item => item.timePeriod === timeValue.value.value);
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
  ipNameValue.value = { key: 'all', label: '全部', value: 'all' };
  sceneValue.value = { key: 'all', label: '全部', value: 'all' };
  weatherValue.value = { key: 'all', label: '全部', value: 'all' };
  emotionValue.value = { key: 'all', label: '全部', value: 'all' };
  timeValue.value = { key: 'all', label: '全部', value: 'all' };
  fetchData();

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
const handleCreateVideo = () => {
  console.log('Create video clicked');
  showCreateModal.value = true;
};

const handleView = (record: DataItem) => {
  console.log('View:', record);
  // Populate view form with current data
  viewForm.value = {
    id: record.id,
    ipName: record.ipName,
    videoName: record.videoName,
    scene: record.scene,
    weather: record.weather,
    emotion: record.emotion,
    timePeriod: record.timePeriod,
    tags: record.tags ? record.tags.split(',').filter(tag => tag.trim()) : [],
    videoFileAddress: record.videoFileAddress,
    videoFile: null
  };
  showViewModal.value = true;
};

const handleEdit = (record: DataItem) => {
  console.log('Edit:', record);
  // Populate edit form with current data
  editForm.value = {
    id: record.id,
    ipName: record.ipName,
    videoName: record.videoName,
    scene: record.scene,
    weather: record.weather,
    emotion: record.emotion,
    timePeriod: record.timePeriod,
    tags: record.tags ? record.tags.split(',').filter(tag => tag.trim()) : [],
    videoFile: null
  };
  showEditModal.value = true;
};

const handleDelete = (record: DataItem) => {
  console.log('Delete:', record);
};

const handleIpNameClick = (record: DataItem) => {
  console.log('IP name clicked:', record.ipName);
  const searchTerm = record.ipName;
  router.push({
    path: '/ip-management',
    query: { search: searchTerm }
  });
};

const handlePlay = (record: DataItem) => {
  console.log('Play video:', record);
  
  // If this video is already playing, stop it
  if (playingVideoId.value === record.id) {
    playingVideoId.value = null;
    showVideoModal.value = false;
    if (videoPlayer.value) {
      videoPlayer.value.pause();
    }
    return;
  }
  
  // Stop any currently playing video
  if (playingVideoId.value !== null) {
    playingVideoId.value = null;
    if (videoPlayer.value) {
      videoPlayer.value.pause();
    }
  }
  
  // Set up video URL and info
  const videoUrl = record.videoFileAddress;
  if (videoUrl && videoUrl !== 'https://example.com/firmware.bin') {
    // Use the actual video file path
    currentVideoUrl.value = `${API_BASE_URL}${videoUrl}`;
    currentVideoInfo.value = {
      videoName: record.videoName,
      ipName: record.ipName,
      scene: record.scene
    };
    playingVideoId.value = record.id;
    showVideoModal.value = true;
  } else {
    // Show demo video or placeholder
    currentVideoUrl.value = 'https://www.w3schools.com/html/mov_bbb.mp4'; // Demo video
    currentVideoInfo.value = {
      videoName: record.videoName,
      ipName: record.ipName,
      scene: record.scene
    };
    playingVideoId.value = record.id;
    showVideoModal.value = true;
  }
};

// Modal state and form
const showCreateModal = ref(false);
const createForm = ref({
  ipName: '',
  videoName: '',
  scene: '',
  weather: '',
  emotion: '',
  timePeriod: '',
  tags: [] as string[],
  videoFile: null as File | null
});

const fileInput = ref<HTMLInputElement>();
const showTagInput = ref(false);
const newTag = ref('');
const uploadProgress = ref(0);

const showEditModal = ref(false);
const editForm = ref({
  id: 0,
  ipName: '',
  videoName: '',
  scene: '',
  weather: '',
  emotion: '',
  timePeriod: '',
  tags: [] as string[],
  videoFile: null as File | null
});

const editFileInput = ref<HTMLInputElement>();
const showEditTagInput = ref(false);
const newEditTag = ref('');
const editUploadProgress = ref(0);

const showViewModal = ref(false);
const viewForm = ref({
  id: 0,
  ipName: '',
  videoName: '',
  scene: '',
  weather: '',
  emotion: '',
  timePeriod: '',
  tags: [] as string[],
  videoFileAddress: '',
  videoFile: null as File | null
});

// Video playback state
const showVideoModal = ref(false);
const currentVideoUrl = ref('');
const currentVideoInfo = ref({
  videoName: '',
  ipName: '',
  scene: ''
});
const playingVideoId = ref<number | null>(null);
const videoPlayer = ref<HTMLVideoElement>();

// Import auth store for username
import { useAuthStore } from '../stores/auth';
const authStore = useAuthStore();

const closeCreateModal = () => {
  showCreateModal.value = false;
  showTagInput.value = false;
  newTag.value = '';
  uploadProgress.value = 0;
  createForm.value = {
    ipName: '',
    videoName: '',
    scene: '',
    weather: '',
    emotion: '',
    timePeriod: '',
    tags: [],
    videoFile: null
  };
};

const closeEditModal = () => {
  showEditModal.value = false;
  showEditTagInput.value = false;
  newEditTag.value = '';
  editUploadProgress.value = 0;
  editForm.value = {
    id: 0,
    ipName: '',
    videoName: '',
    scene: '',
    weather: '',
    emotion: '',
    timePeriod: '',
    tags: [],
    videoFile: null
  };
};

const closeViewModal = () => {
  showViewModal.value = false;
};

const closeVideoModal = () => {
  showVideoModal.value = false;
  playingVideoId.value = null;
  if (videoPlayer.value) {
    videoPlayer.value.pause();
  }
};

const onVideoEnded = () => {
  playingVideoId.value = null;
};

const onVideoPlay = () => {
  // Video started playing
};

const onVideoPause = () => {
  // Video paused
};

const handleCreateConfirm = async () => {
  console.log('Create video form submitted:', createForm.value);
  
  // Validate required fields
  if (!createForm.value.ipName || !createForm.value.videoName || 
      !createForm.value.scene || !createForm.value.weather || 
      !createForm.value.emotion || !createForm.value.timePeriod || 
      !createForm.value.videoFile) {
    alert('请填写所有必填字段');
    return;
  }

  // Validate video name length
  if (createForm.value.videoName.length > 15) {
    alert('视频名称不能超过15个字符');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('ipName', createForm.value.ipName);
    formData.append('videoName', createForm.value.videoName);
    formData.append('scene', createForm.value.scene);
    formData.append('weather', createForm.value.weather);
    formData.append('emotion', createForm.value.emotion);
    formData.append('timePeriod', createForm.value.timePeriod);
    formData.append('tags', createForm.value.tags.join(','));
    formData.append('videoFile', createForm.value.videoFile!);
    formData.append('updater', authStore.user?.name || authStore.user?.username || '管理员');

    const response = await axios.post(`${API_BASE_URL}/ipvideo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          uploadProgress.value = percentCompleted;
        }
      }
    });

    console.log('Video created successfully:', response.data);
    uploadProgress.value = 100;
    setTimeout(() => {
      uploadProgress.value = 0;
    }, 1000);
    alert('视频创建成功！');
  closeCreateModal();
    fetchData();
  } catch (error: any) {
    console.error('Error creating video:', error);
    let errorMessage = '创建视频失败，请重试';
    
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
    uploadProgress.value = 0;
  }
};

const handleEditConfirm = async () => {
  console.log('Edit video form submitted:', editForm.value);
  
  // Validate required fields (video file is optional for editing)
  if (!editForm.value.ipName || !editForm.value.videoName || 
      !editForm.value.scene || !editForm.value.weather || 
      !editForm.value.emotion || !editForm.value.timePeriod) {
    alert('请填写所有必填字段');
    return;
  }

  // Validate video name length
  if (editForm.value.videoName.length > 15) {
    alert('视频名称不能超过15个字符');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('ipName', editForm.value.ipName);
    formData.append('videoName', editForm.value.videoName);
    formData.append('scene', editForm.value.scene);
    formData.append('weather', editForm.value.weather);
    formData.append('emotion', editForm.value.emotion);
    formData.append('timePeriod', editForm.value.timePeriod);
    formData.append('tags', editForm.value.tags.join(','));
    if (editForm.value.videoFile) {
      formData.append('videoFile', editForm.value.videoFile);
    }
    formData.append('updater', authStore.user?.name || authStore.user?.username || '管理员');

    const response = await axios.put(`${API_BASE_URL}/ipvideo/${editForm.value.id}`, formData, {
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

    console.log('Video updated successfully:', response.data);
    editUploadProgress.value = 100;
    setTimeout(() => {
      editUploadProgress.value = 0;
    }, 1000);
    alert('视频更新成功！');
    closeEditModal();
    fetchData();
  } catch (error: any) {
    console.error('Error updating video:', error);
    let errorMessage = '更新视频失败，请重试';
    
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
  createForm.value.videoFile = null;
};

const triggerEditFileUpload = () => {
  editFileInput.value?.click();
};

const handleEditFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    editForm.value.videoFile = target.files[0];
  }
};

const handleEditFileDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    editForm.value.videoFile = event.dataTransfer.files[0];
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
  editForm.value.videoFile = null;
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

:deep(.scene-select .ant-select-selector) {
  padding-left: 45px !important;
}


:deep(.weather-select .ant-select-selector) {
  padding-left: 43px !important;
}
:deep(.emotion-select .ant-select-selector) {
  padding-left: 43px !important;
}
:deep(.time-period-select .ant-select-selector) {
  padding-left: 55px !important;
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

.field-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
  margin-bottom: 8px;
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

/* New styles for tags input */
.tags-input {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  background-color: white;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;
  color: #1890ff;
  display: flex;
  align-items: center;
  gap: 4px;
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
  background-color: transparent;
}

.add-tag-btn {
  cursor: pointer;
  font-size: 12px;
  color: #1890ff;
  padding: 2px 8px;
  border: 1px dashed #91d5ff;
  border-radius: 4px;
  transition: all 0.3s;
}

.add-tag-btn:hover {
  background-color: #e6f7ff;
  border-color: #40a9ff;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
}

.file-icon {
  font-size: 16px;
  color: #1890ff;
}

.file-name {
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Column Setting Panel Styles */
.column-setting-panel {
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background-color: #fafafa;
  max-height: 300px;
  overflow-y: auto;
}

.setting-section {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.column-checkbox-group {
  display: flex;
  flex-direction: column;
}

.column-checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.column-checkbox-item:last-child {
  border-bottom: none;
}

.column-checkbox-item .ant-checkbox-wrapper {
  flex-grow: 1;
}

.column-checkbox-item .ant-checkbox-wrapper .ant-checkbox {
  margin-right: 8px;
}

.column-checkbox-item .ant-checkbox-wrapper .ant-checkbox-inner {
  border-radius: 4px;
}

.column-checkbox-item .ant-checkbox-wrapper .ant-checkbox-checked .ant-checkbox-inner {
  background-color: #1890ff;
  border-color: #1890ff;
}

.column-checkbox-item .ant-checkbox-wrapper .ant-checkbox-checked .ant-checkbox-inner::after {
  border-color: #fff;
}

.column-checkbox-item .ant-checkbox-wrapper .ant-checkbox-disabled .ant-checkbox-inner {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
}

.column-checkbox-item .ant-checkbox-wrapper .ant-checkbox-disabled .ant-checkbox-inner::after {
  border-color: #f5f5f5;
}

/* View modal styles */
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

/* Video modal styles */
.video-modal-content {
  background: white;
  border-radius: 8px;
  width: 800px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.video-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.video-modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.video-modal-body {
  padding: 24px;
}

.video-player {
  width: 100%;
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin-bottom: 16px;
}

.video-info {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.video-info p {
  margin: 8px 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
}

.video-info strong {
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
}

/* Play button styles */
.playing {
  color: #1890ff !important;
}

.ant-btn-link.playing {
  background-color: #e6f7ff;
  border-radius: 4px;
}
</style> 