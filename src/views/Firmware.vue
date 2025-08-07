<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>固件管理</h2>
    </div>

    <!-- select item area -->
    <div class="top-controls-wrapper">
      <div class="left-aligned-section">

        <div class="select-container device-model-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">设备型号:</span>
          <a-tooltip :title="deviceModelValue.label">
            <a-select
              v-model:value="deviceModelValue"
              style="width: 130px;"
              :options="deviceModelOptions"
              @change="handleDeviceModelChange"
              :allowClear="true"
              label-in-value
              class="device-model-select"
            >
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div>
        <div class="select-container release-version-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">发布版本:</span>
          <a-tooltip :title="releaseVersionValue.label">
            <a-select
              v-model:value="releaseVersionValue"
              style="width: 130px;"
              :options="releaseVersionOptions"
              @change="handleReleaseVersionChange"
              :allowClear="true"
              label-in-value
              class="release-version-select"
            >
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
          <span v-if="nextVersionNumber" style="color: red; font-weight: bold; margin-left: 10px;">{{ nextVersionNumber }}</span>
        </div>
        <div class="select-container version-number-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">版本号:</span>
          <a-tooltip :title="versionNumberValue.label">
            <a-select
              v-model:value="versionNumberValue"
              style="width: 120px;"
              :options="versionNumberOptions"
              @change="handleVersionNumberChange"
              :allowClear="true"
              label-in-value
              class="version-number-select"
            >
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div>
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
          <a-button type="primary" @click="handleVersionRelease">版本发布</a-button>
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
        :scroll="{ x: 1000 }"
        @change="handleTableChange"
        :showSorterTooltip="false"
      >
      <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'operation'">
        <a-space class="action-cell" direction="horizontal">
          <a class="view-link" @click="handleViewClick(record)">查看</a>
          <a-divider type="vertical" />
          <a class="edit-link" @click="handleEditClick(record)">编辑</a>
          <a-divider type="vertical" />
          <a class="download-link" @click="handleDownloadClick(record)">固件下载</a>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定要删除该信息吗?"
            @confirm="handleDeleteRecord(record)"
          >
            <a class="danger-link">删除</a>
          </a-popconfirm>
        </a-space>
      </template>
    </template>
      </a-table>
      
      <!-- No data message -->
      <!-- <div v-if="showNoDataMessage" class="no-data-message">
        <a-empty 
          :description="noDataMessage"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
        >
          <a-button type="primary" @click="clearSearch">清除搜索</a-button>
        </a-empty>
      </div> -->
    </div>

    <FirmwareReleaseModal
      :visible="showReleaseModal"
      :uniqueDeviceModels="uniqueDeviceModels"
      :editRecord="editRecord"
      @update:visible="handleReleaseModalClose"
      @submit="handleReleaseModalSubmit"
    />

    <FirmwareEditModal
      :visible="showEditModal"
      :record="editRecord"
      @update:visible="handleEditModalClose"
      @submit="handleEditModalSubmit"
    />

  </a-config-provider>
</template>
<script lang="ts" setup>
import type { ColumnsType } from 'ant-design-vue/es/table';
import { ref, computed, onMounted, h } from 'vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme, message } from 'ant-design-vue';
import { ReloadOutlined, ColumnHeightOutlined ,SettingOutlined, SearchOutlined} from '@ant-design/icons-vue';
import draggable from 'vuedraggable';
import FirmwareReleaseModal from '@/components/FirmwareReleaseModal.vue';
import FirmwareEditModal from '@/components/FirmwareEditModal.vue';
import { useRoute, useRouter } from 'vue-router';
import { Empty } from 'ant-design-vue';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface DataItem {
  id?: number;
  key?: number;
  deviceModel: string;
  releaseVersion: string;
  versionNumber: string;
  description: string;
  fileAddress: string;
  creator: string;
  releaseTime: string;
  updateTime: string;
}

// Define column configuration separately from the table columns
interface ColumnConfig {
  key: string;
  title: string;
  dataIndex: string;
  width: number;
  fixed?: 'left' | 'right' | boolean;
  sorter?: (a: any, b: any) => number;
  sortDirections?: ('ascend' | 'descend')[];
  defaultSortOrder?: 'ascend' | 'descend';
  customRender?: (record: any) => string | number;
}

const columnConfigs: ColumnConfig[] = [
  { key: 'rowIndex', title: '序号', dataIndex: 'rowIndex', width: 60, fixed: 'left' },
  { key: 'deviceModel', title: '设备型号', dataIndex: 'deviceModel', width: 100 },
  { key: 'releaseVersion', title: '发布版本', dataIndex: 'releaseVersion', width: 100 },
  { key: 'versionNumber', title: '版本号', dataIndex: 'versionNumber', width: 100, sorter: (a: any, b: any) => a.versionNumber.localeCompare(b.versionNumber), sortDirections: ['ascend', 'descend'] },
  { key: 'description', title: '内容描述', dataIndex: 'description', width: 600 },
  { key: 'fileAddress', title: '文件地址', dataIndex: 'fileAddress', width: 200 },
  { key: 'creator', title: '更新人', dataIndex: 'creator', width: 100 },
  { key: 'releaseTime', title: '发布时间', dataIndex: 'releaseTime', width: 180, sorter: (a: any, b: any) => new Date(a.releaseTime).getTime() - new Date(b.releaseTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'updateTime', title: '更新时间', dataIndex: 'updateTime', width: 180, sorter: (a: any, b: any) => new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'operation', title: '操作', dataIndex: '', width: 280, fixed: 'right' },
];

// Store column order and visibility separately
const columnOrder = ref<string[]>(columnConfigs.map(config => config.key));
const selectedColumnKeys = ref<string[]>(columnConfigs.map(config => config.key));

// Create columns from configs
const createColumnsFromConfigs = (configs: ColumnConfig[]): ColumnsType => {
  return configs.map(config => {
    const column: any = {
      title: config.title,
      dataIndex: config.dataIndex,
      key: config.key,
      width: config.width,
      fixed: config.fixed,
      sorter: config.sorter,
      sortDirections: config.sortDirections,
      sortOrder: sorterInfo.value && config.key === sorterInfo.value.columnKey ? sorterInfo.value.order : undefined,
      defaultSortOrder: config.defaultSortOrder,
    };

    // Handle rowIndex column
    if (config.key === 'rowIndex') {
      column.customRender = ({ index }: { index: number }) => (currentPage.value - 1) * pageSize.value + index + 1;
    } else if (config.key === 'deviceModel') {
      // Handle deviceModel column with hyperlink
      column.customRender = ({ text }: { text: any }) => {
        if (text) {
          return h('a', {
            style: { color: '#1890ff', cursor: 'pointer' },
            onClick: () => router.push({ name: 'device-type', query: { search: text } })
          }, text);
        }
        return '-';
      };
    } else if (config.key !== 'operation') {
      // Use customRender for other columns that need custom rendering (except operation)
      column.customRender = ({ text }: { text: any }) => (text === undefined || text === null || text === '' ? '-' : text);
    }

    return column;
  }) as ColumnsType;
};

// Computed property for visible columns
const columns = computed<ColumnsType>(() => {
  // Get visible configs based on selected keys and order
  const visibleConfigs = columnOrder.value
    .filter(key => selectedColumnKeys.value.includes(key))
    .map(key => columnConfigs.find(config => config.key === key))
    .filter(Boolean) as ColumnConfig[];

  // Create columns from visible configs
  const visibleColumns = createColumnsFromConfigs(visibleConfigs);

  // Sort columns: fixed left, then unfixed, then fixed right
  return visibleColumns.sort((a, b) => {
    const fixedOrder = { 'left': 1, undefined: 2, 'right': 3 };
    const aFixed = fixedOrder[a.fixed as keyof typeof fixedOrder] || 2;
    const bFixed = fixedOrder[b.fixed as keyof typeof fixedOrder] || 2;
    return aFixed - bFixed;
  });
});

// Replace static data with reactive data
const rawData = ref<DataItem[]>([]);
const loading = ref(false);
const total = ref(0); // Add total count for server-side pagination

// API functions
const fetchFirmware = async () => {
  try {
    loading.value = true;
    console.log('Fetching firmware with page:', currentPage.value, 'pageSize:', pageSize.value);
    
    const response = await axios.get(`${API_BASE_URL}/firmware`, {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value
      }
    });
    
    if (response.data && response.data.data) {
      // Server-side pagination response
      rawData.value = response.data.data.map((item: any, index: number) => ({
        ...item,
        key: index + 1
      }));
      
      // Update pagination info from server
      if (response.data.pagination) {
        currentPage.value = response.data.pagination.current;
        pageSize.value = response.data.pagination.pageSize;
        total.value = response.data.pagination.total;
        
        console.log('Updated pagination - current:', currentPage.value, 'pageSize:', pageSize.value, 'total:', total.value);
      }
    } else {
      // Fallback for old API format
      rawData.value = response.data.map((item: any, index: number) => ({
        ...item,
        key: index + 1
      }));
      total.value = response.data.length;
    }
  } catch (error) {
    console.error('Error fetching firmware:', error);
    // Fallback to static data if API fails
    const fallbackData: DataItem[] = [
      // HWSZ001
      { key: 1, deviceModel: 'HWSZ001', releaseVersion: '主版本', versionNumber: 'Z001 V 1.0.0', description: 'desc', fileAddress: 'https://example.com/firmware.bin', creator: '张三', releaseTime: '2025-07-13 19:25:11', updateTime: '2025-07-13 19:25:11' },
      { key: 2, deviceModel: 'HWSZ001', releaseVersion: '主版本', versionNumber: 'Z001 V 2.0.0', description: 'desc', fileAddress: 'https://example.com/firmware.bin', creator: '张三', releaseTime: '2025-08-13 19:25:11', updateTime: '2025-08-13 19:25:11' },
      // HWSZ002

    ];
    rawData.value = fallbackData;
    total.value = fallbackData.length;
  } finally {
    loading.value = false;
  }
};

const createFirmware = async (firmwareData: Omit<DataItem, 'key' | 'id' | 'releaseTime' | 'updateTime'>) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/firmware`, firmwareData);
    await fetchFirmware(); // Refresh data
    return response.data;
  } catch (error) {
    console.error('Error creating firmware:', error);
    throw error;
  }
};

const updateFirmware = async (id: number, firmwareData: Partial<DataItem>) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/firmware/${id}`, firmwareData);
    await fetchFirmware(); // Refresh data
    return response.data;
  } catch (error) {
    console.error('Error updating firmware:', error);
    throw error;
  }
};

const deleteFirmware = async (id: number) => {
  try {
    await axios.delete(`${API_BASE_URL}/firmware/${id}`);
    await fetchFirmware(); // Refresh data
  } catch (error) {
    console.error('Error deleting firmware:', error);
    throw error;
  }
};


const deviceModelValue = ref({ key: 'all', label: '全部', value: 'all' });
const releaseVersionValue = ref({ key: 'all', label: '全部', value: 'all' });
const versionNumberValue = ref({ key: 'all', label: '全部', value: 'all' });

const deviceModelOptions = computed(() => {
  const unique = Array.from(new Set(rawData.value.map(item => item.deviceModel)));
  return [{ key: 'all', value: 'all', label: '全部' }, ...unique.map(v => ({ key: v, value: v, label: v }))];
});

const releaseVersionOptions = computed(() => {
  const unique = Array.from(new Set(rawData.value.map(item => item.releaseVersion)));
  return [{ key: 'all', value: 'all', label: '全部' }, ...unique.map(v => ({ key: v, value: v, label: v }))];
});

const versionNumberOptions = computed(() => {
  const unique = Array.from(new Set(rawData.value.map(item => item.versionNumber)));
  return [{ key: 'all', value: 'all', label: '全部' }, ...unique.map(v => ({ key: v, value: v, label: v }))];
});

const handleDeviceModelChange = (val: any) => {
  deviceModelValue.value = !val || !val.value || val.value === 'all'
    ? { key: 'all', label: '全部', value: 'all' }
    : val;
};

const handleReleaseVersionChange = (val: any) => {
  releaseVersionValue.value = !val || !val.value || val.value === 'all'
    ? { key: 'all', label: '全部', value: 'all' }
    : val;
};

const handleVersionNumberChange = (val: any) => {
  versionNumberValue.value = !val || !val.value || val.value === 'all'
    ? { key: 'all', label: '全部', value: 'all' }
    : val;
};

const currentPage = ref(1);
const pageSize = ref(10);

console.log('Initial deviceModelValue:', deviceModelValue.value);

const sorterInfo = ref<any>({
  columnKey: 'updateTime',
  order: 'descend',
});

// Create pagination handlers as separate functions
const handlePageChange = (page: number, size: number) => {
  console.log('handlePageChange called:', page, size);
  currentPage.value = page;
  pageSize.value = size;
  // No need to fetch firmware since we're using client-side filtering
};

const handlePageSizeChange = (current: number, size: number) => {
  console.log('handlePageSizeChange called:', current, size);
  currentPage.value = current;
  pageSize.value = size;
  // No need to fetch firmware since we're using client-side filtering
};

// Create pagination as a computed property
const pagination = computed(() => ({
  total: filteredData.value.length,
  current: currentPage.value,
  pageSize: pageSize.value,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
  showTotal: (total: number, range: [number, number]) => `第${range[0]}-${range[1]}条/共${total}条`,
  showQuickJumper: { goButton: '页' },
  onShowSizeChange: handlePageSizeChange,
  onChange: handlePageChange,
}));

const onRefresh = () => {
  console.log('Refresh button clicked!');
  searchInputValue.value = '';
  currentPage.value = 1;
  pageSize.value = 10;
  resetColumns(); // Reset column order and visibility

  // Reset all selector values to '全部'
  deviceModelValue.value = { key: 'all', label: '全部', value: 'all' };
  releaseVersionValue.value = { key: 'all', label: '全部', value: 'all' };
  versionNumberValue.value = { key: 'all', label: '全部', value: 'all' };

  fetchFirmware(); // Fetch fresh data from API
};

const filteredData = computed<DataItem[]>(() => {
  let dataToFilter: DataItem[] = [...rawData.value];

  if (searchInputValue.value) {
    const searchTerm = searchInputValue.value.toLowerCase();
    dataToFilter = dataToFilter.filter((item: DataItem) => {
      return Object.values(item).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(searchTerm)
      );
    });
  }

  // Filter by device model
  if (
    deviceModelValue.value &&
    deviceModelValue.value.value !== 'all' &&
    deviceModelValue.value.value !== ''
  ) {
    dataToFilter = dataToFilter.filter(item => item.deviceModel === deviceModelValue.value.value);
  }

  // Filter by release version
  if (
    releaseVersionValue.value &&
    releaseVersionValue.value.value !== 'all' &&
    releaseVersionValue.value.value !== ''
  ) {
    dataToFilter = dataToFilter.filter(item => item.releaseVersion === releaseVersionValue.value.value);
  }

  // Filter by version number
  if (
    versionNumberValue.value &&
    versionNumberValue.value.value !== 'all' &&
    versionNumberValue.value.value !== ''
  ) {
    dataToFilter = dataToFilter.filter(item => item.versionNumber === versionNumberValue.value.value);
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

// Computed property to show no data message
const showNoDataMessage = computed(() => {
  return searchInputValue.value && filteredData.value.length === 0;
});

// Computed property for no data message
const noDataMessage = computed(() => {
  if (searchInputValue.value && filteredData.value.length === 0) {
    return `未找到包含 "${searchInputValue.value}" 的固件`;
  }
  return '';
});

const clearSearch = () => {
  searchInputValue.value = '';
  currentPage.value = 1; // Reset to first page when clearing search
};

const searchInputValue = ref('');

const handleTableChange = (
  paginationData: any,
  filters: any,
  sorter: any,
) => {
  console.log('Table change:', paginationData, filters, sorter);
  
  // Handle pagination changes - this is handled by the pagination handlers
  if (paginationData && (paginationData.current !== currentPage.value || paginationData.pageSize !== pageSize.value)) {
    currentPage.value = paginationData.current;
    pageSize.value = paginationData.pageSize;
    // No need to fetch firmware since we're using client-side filtering
    return; // Exit early to avoid duplicate calls
  }
  
  const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;

  if (currentSorter && currentSorter.order) {
    sorterInfo.value = {
      columnKey: currentSorter.columnKey,
      order: currentSorter.order,
    };
    // No need to fetch firmware since we're using client-side filtering
  } else {
    // When sorting is cleared, revert to default
    sorterInfo.value = {
      columnKey: 'updateTime',
      order: 'descend',
    };
    // No need to fetch firmware since we're using client-side filtering
  }
};

const onSettingClick = () => {
  console.log('Setting clicked');
};

const tableSize = ref('middle'); // Default table size

const handleMenuClick = ({ key }: { key: string }) => {
  tableSize.value = key;
};

const resetColumns = () => {
  selectedColumnKeys.value = columnConfigs.map(config => config.key);
  columnOrder.value = columnConfigs.map(config => config.key);
};

const onColumnOrderChange = (event: { newIndex: number; oldIndex: number }) => {
  const { newIndex, oldIndex } = event;
  const movedColumn = columnOrder.value[oldIndex];
  const newOrder = [...columnOrder.value];
  newOrder.splice(oldIndex, 1);
  newOrder.splice(newIndex, 0, movedColumn);
  columnOrder.value = newOrder;

  // The selectedColumnKeys should not be altered here, as it maintains visibility state.
  // Its order is implicitly handled by the 'columns' computed property based on columnOrder.
};

const handleColumnVisibilityChange = (key: string, checked: boolean) => {
  if (checked) {
    if (!selectedColumnKeys.value.includes(key)) {
      selectedColumnKeys.value.push(key);
    }
  } else {
    selectedColumnKeys.value = selectedColumnKeys.value.filter(k => k !== key);
  }
};

const showReleaseModal = ref(false);
const showEditModal = ref(false);
const editRecord = ref<any>(null);
const uniqueDeviceModels = computed(() => Array.from(new Set(rawData.value.map(item => item.deviceModel))));

const handleVersionRelease = () => {
  showReleaseModal.value = true;
};

const handleEditClick = (record: DataItem) => {
  editRecord.value = record;
  showEditModal.value = true;
};

const handleEditModalClose = () => {
  showEditModal.value = false;
  editRecord.value = null;
};

const handleEditModalSubmit = async (data: any) => {
  try {
    // Handle edit submission
    if (data.isEdit && data.originalRecord?.id) {
      await updateFirmware(data.originalRecord.id, {
        deviceModel: data.deviceModel,
        releaseVersion: data.releaseType,
        versionNumber: data.versionNumber,
        description: data.contentDescription,
        fileAddress: data.fileAddress,
      });
    }
    showEditModal.value = false;
    editRecord.value = null;
    message.success('固件编辑成功!');
    fetchFirmware(); // Refresh data
  } catch (error) {
    console.error('Edit failed:', error);
    message.error('编辑失败，请重试');
  }
};

const handleReleaseModalClose = () => {
  showReleaseModal.value = false;
  editRecord.value = null;
};

const handleReleaseModalSubmit = async (data: any) => {
  try {
    // Handle new firmware submission
    if (!data.isEdit) {
      await createFirmware({
        deviceModel: data.deviceModel,
        releaseVersion: data.releaseType,
        versionNumber: data.versionNumber,
        description: data.contentDescription,
        fileAddress: data.fileAddress,
        creator: '当前用户', // This should come from user context
      });
    } else {
      // Handle edit submission
      if (data.originalRecord?.id) {
        await updateFirmware(data.originalRecord.id, {
          deviceModel: data.deviceModel,
          releaseVersion: data.releaseType,
          versionNumber: data.versionNumber,
          description: data.contentDescription,
          fileAddress: data.fileAddress,
        });
      }
    }
    showReleaseModal.value = false;
    editRecord.value = null;
    message.success(data.isEdit ? '固件编辑成功!' : '固件发布成功!');
    fetchFirmware(); // Refresh data
  } catch (error) {
    console.error('Submit failed:', error);
    message.error('操作失败，请重试');
  }
};

const handleViewClick = (record: DataItem) => {
  // Show firmware details in a modal or navigate to detail page
  message.info(`查看固件详情: ${record.deviceModel} - ${record.versionNumber}`);
  // You can implement a view modal here similar to edit modal
  console.log('View firmware details:', record);
};

const handleDownloadClick = (record: DataItem) => {
  // Download firmware file
  if (record.fileAddress) {
    // Check if it's a relative path (starts with /firmware/)
    if (record.fileAddress.startsWith('/firmware/')) {
      // Use the download endpoint
      const downloadUrl = `${API_BASE_URL}/firmware/download/${record.fileAddress.split('/').pop()}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${record.deviceModel}_${record.versionNumber}.bin`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success(`开始下载固件: ${record.deviceModel} - ${record.versionNumber}`);
    } else {
      // Handle external URLs
      const link = document.createElement('a');
      link.href = record.fileAddress;
      link.download = `${record.deviceModel}_${record.versionNumber}.bin`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success(`开始下载固件: ${record.deviceModel} - ${record.versionNumber}`);
    }
  } else {
    message.error('固件文件地址不存在');
  }
};

const nextVersionNumber = computed(() => {
  const deviceModel = deviceModelValue.value.value;
  const releaseType = releaseVersionValue.value.label;
  if (!deviceModel || deviceModel === 'all' || !releaseType) return '';
  const versions = rawData.value
    .filter(item => item.deviceModel === deviceModel)
    .map(item => item.versionNumber)
    .map(v => {
      const vStr = v.trim();
      const match = vStr.match(/V\s*(\d+)\.(\d+)\.(\d+)/);
      if (match) {
        return {
          x: parseInt(match[1]),
          y: parseInt(match[2]),
          z: parseInt(match[3]),
        };
      }
      return null;
    })
    .filter(Boolean);
  console.log('Selected deviceModel:', deviceModel);
  console.log('All versions for this model:', rawData.value.filter(item => item.deviceModel === deviceModel).map(item => item.versionNumber));
  console.log('Parsed versions:', versions);
  if (versions.length === 0) {
    if (releaseType === '主版本') return 'V 1.0.0';
    if (releaseType === '子版本') return 'V 1.1.0';
    if (releaseType === '修订版') return 'V 1.0.1';
    return '';
  }
  let maxX = Math.max(...versions.map(v => v!.x));
  let maxY = Math.max(...versions.filter(v => v!.x === maxX).map(v => v!.y));
  let maxZ = Math.max(...versions.filter(v => v!.x === maxX && v!.y === maxY).map(v => v!.z));
  if (releaseType === '主版本') {
    return `V ${maxX + 1}.0.0`;
  } else if (releaseType === '子版本') {
    return `V ${maxX}.${maxY + 1}.0`;
  } else if (releaseType === '修订版') {
    return `V ${maxX}.${maxY}.${maxZ + 1}`;
  }
  return '';
});

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '', // Override the '页' suffix for quick jumper
  },
}));

// Handle search parameter from URL
onMounted(() => {
  // Handle search parameter from URL
  if (route.query.search) {
    searchInputValue.value = route.query.search as string;
  }
  
  // Handle versionName parameter from DeviceType.vue navigation
  if (route.query.versionName) {
    searchInputValue.value = route.query.versionName as string;
  }
  
  // Handle deviceModel parameter from DeviceType.vue navigation
  if (route.query.deviceModel) {
    const deviceModel = route.query.deviceModel as string;
    // Find the matching device model option
    const matchingOption = deviceModelOptions.value.find(option => 
      option.value === deviceModel || option.label === deviceModel
    );
    if (matchingOption) {
      deviceModelValue.value = matchingOption;
    }
  }
  
  // Handle action parameter (for "add" action)
  if (route.query.action === 'add') {
    // You can add specific logic here for the "add" action
    console.log('Navigated from DeviceType with add action');
  }
  
  fetchFirmware(); // Fetch data on component mount
});

defineExpose({
  handleTableChange, // Explicitly expose handleTableChange
});

// Handle delete record
const handleDeleteRecord = async (record: DataItem) => {
  try {
    if (record.id) {
      await deleteFirmware(record.id);
    }
  } catch (error) {
    console.error('Error deleting record:', error);
  }
};
</script>
<style scoped>
#components-table-demo-summary tfoot th,
#components-table-demo-summary tfoot td {
  background: #fafafa;
}
[data-theme='dark'] #components-table-demo-summary tfoot th,
[data-theme='dark'] #components-table-demo-summary tfoot td {
  background: #1d1d1d;
}

/* Custom style to adjust row height and font size based on table size */
.ant-table-tbody > tr > td,
.ant-table-thead > tr > th {
  font-family: 'PingFang SC', sans-serif; /* Keep font family consistent */
  white-space: nowrap; /* Prevent text from stacking */
  text-align: left; /* Ensure left alignment for headers */
}

.ant-table-wrapper-small .ant-table-tbody > tr > td,
.ant-table-wrapper-small .ant-table-thead > tr > th {
  padding: 2px 2px; /* Very compact */
  font-size: 10px;
  line-height: 1.2;
}

.ant-table-wrapper-middle .ant-table-tbody > tr > td,
.ant-table-wrapper-middle .ant-table-thead > tr > th {
  padding: 8px 8px; /* Medium density */
  font-size: 12px;
  line-height: 1.5;
}

.ant-table-wrapper-large .ant-table-tbody > tr > td,
.ant-table-wrapper-large .ant-table-thead > tr > th {
  padding: 16px 16px; /* Larger, more spacious */
  font-size: 14px;
  line-height: 1.8;
}

/* title like demo page */
.title-container {
   /* Light grey border */
  padding: 10px 14px; /* Adjusted from 16px 24px * 0.60 */
  margin-bottom: 10px; /* Adjusted from 16px * 0.60 */
  background-color: #fff; /* White background */
  border-radius: 4px; /* Slightly rounded corners */
}

.title-container h2 {
  margin: 0; /* Remove default margin from h2 */
  font-size: 16px; /* Adjusted to 12px */
  font-weight: 500; /* Adjust font weight if needed */
  color: rgba(0, 0, 0, 0.85); /* Standard Ant Design text color */
  text-align: left;
  font-weight: bold; /* Center the text horizontally */
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

.right-aligned-section {
  display: none;
}

.right-aligned-icons {
  display: flex;
  align-items: center;
  gap: 10px; /* Add space between icons */
  padding-right: 30px;
}

.right-aligned-icons > .anticon {
  padding: 6px 8px; /* Add padding to make them look like buttons */
  border: 1px solid #d9d9d9; /* Add a subtle border */
  background-color: #f0f0f0; /* Add a light background */
  border-radius: 4px; /* Slightly rounded corners */
  transition: all 0.3s; /* Smooth transition for hover effects */
  cursor: pointer;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.65);
   /* Slightly darker grey for better visibility */
}

.right-aligned-icons > .anticon:hover {
  border-color: #4096ff; /* Ant Design primary color on hover */
  color: #4096ff; /* Change icon color on hover */
  background-color: #e6f7ff; /* Lighter background on hover */
}

.right-aligned-icons > .anticon:last-child,
.right-aligned-icons > .ant-btn:last-child,
.right-aligned-icons > .ant-dropdown:last-child,
.right-aligned-icons > .ant-popover:last-child {
  margin-right: 28px; /* Adjust this value for a bigger gap */
}

html, body {
  overflow-x: hidden;
}

.table-container {
  padding: 10px ;
  padding-right: 50px;
}

/* Styling for the custom always-visible placeholder */
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
:deep(.device-model-select .ant-select-selector) {
  padding-left: 65px !important;
}
:deep(.release-version-select .ant-select-selector) {
  padding-left: 65px !important;
}
:deep(.version-number-select .ant-select-selector) {
  padding-left: 50px !important;
}
:deep(.ant-select-selector),
:deep(.ant-select-dropdown),
:deep(.ant-select-item),
:deep(.ant-select-selection-item),
:deep(.ant-select-item-option-content) {
  font-size: 12px !important;
}

/* Add custom style for pagination font size */
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

:deep(.ant-pagination-options) .ant-select-selector {
  min-width: unset !important;
  width: auto !important;
  padding-left: 4px !important;
  padding-right: 18px !important; /* keep space for arrow */
}

/* Operation column specific styling to prevent text wrapping */
:deep(.ant-table-cell[data-col-key="operation"]) {
  white-space: nowrap !important;
  word-break: keep-all !important;
  text-wrap: nowrap !important;
  overflow: visible !important;
}

/* Ensure operation column content stays horizontal */
:deep(.ant-table-tbody .ant-table-cell:last-child) {
  white-space: nowrap !important;
  word-break: keep-all !important;
  text-wrap: nowrap !important;
}

/* Additional styling for cells containing action-cell */
:deep(.ant-table-cell .action-cell) {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 200px;
  white-space: nowrap;
  flex-wrap: nowrap;
}
:deep(.ant-table-cell .action-cell .ant-space) {
  white-space: nowrap !important;
  flex-wrap: nowrap !important;
}
:deep(.ant-table-cell .action-cell .ant-space-item) {
  white-space: nowrap !important;
  flex-shrink: 0 !important;
}
:deep(.ant-table-cell .action-cell .ant-divider-vertical) {
  flex-shrink: 0 !important;
  white-space: nowrap !important;
}
:deep(.ant-table-cell .action-cell a) {
  white-space: nowrap !important;
  word-break: keep-all !important;
  text-wrap: nowrap !important;
  flex-shrink: 0;
}
:deep(.ant-table-cell .action-cell .view-link) {
  color: #1890ff !important; /* Ant Design blue */
  font-weight: bold;
}
:deep(.ant-table-cell .action-cell .edit-link) {
  color: #1890ff !important; /* Ant Design blue */
  font-weight: bold;
}
:deep(.ant-table-cell .action-cell .download-link) {
  color: #1890ff !important; /* Ant Design blue */
  font-weight: bold;
}
:deep(.ant-table-cell .action-cell .danger-link) {
  color: #ff4d4f !important; /* Ant Design red */
  font-weight: bold;
}

/* No data message styling */
.no-data-message {
  text-align: center;
  padding: 40px 20px;
  background: #fafafa;
  border-radius: 6px;
  margin: 20px 0;
}

.no-data-message .ant-empty {
  margin: 0;
}

.no-data-message .ant-empty-description {
  color: #666;
  font-size: 14px;
}

/* Hyperlink styling */
:deep(.ant-table-tbody .ant-table-cell a) {
  color: #1890ff;
  text-decoration: none;
  transition: color 0.3s ease;
}

:deep(.ant-table-tbody .ant-table-cell a:hover) {
  color: #40a9ff;
  text-decoration: underline;
}

:deep(.ant-table-tbody .ant-table-cell a:active) {
  color: #096dd9;
}
</style>