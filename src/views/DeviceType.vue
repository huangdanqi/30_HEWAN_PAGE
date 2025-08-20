<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>设备型号</h2>
    </div>

    <!-- Control Bar -->
    <div class="top-controls-wrapper">
      <div class="left-aligned-section">
        <!-- No filter controls for this page -->
      </div>
      <!-- icon area -->
      <div class="right-aligned-icons">
          <!-- search area  -->
          <a-input
            v-model:value="searchInputValue"
            placeholder="请输入搜索内容"
            style="width: 200px"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
          <a-button type="primary" @click="handleCreateDeviceType">新建设备型号</a-button>
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
      <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'rowIndex'">
        {{ (currentPage - 1) * pageSize + index + 1 }}
      </template>
      <template v-else-if="column.key === 'operation_9'">
        <a-space class="action-cell" direction="horizontal">
          <a class="view-link" @click="$emit('view-record', record)">查看</a>
          <a-divider type="vertical" />
          <a class="edit-link" @click="handleEditDeviceType(record)">编辑</a>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定要删除该设备型号吗?"
            @confirm="handleDeleteRecord(record)"
          >
            <a class="danger-link">删除</a>
          </a-popconfirm>
        </a-space>
      </template>
      <template v-else-if="column.key === 'latestFirmwareVersion_5'">
        <a v-if="record.latestFirmwareVersion" class="link-text" @click="handleFirmwareVersionClick(record.latestFirmwareVersion, record)">{{ record.latestFirmwareVersion }}</a>
        <span v-else class="no-data-text">{{ record.latestFirmwareVersion || '-' }}</span>
      </template>
      <template v-else-if="column.key === 'updater_6'">
        <span>{{ record.updater }}</span>
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

    <!-- 新建设备型号 Modal -->
    <a-modal
      v-model:open="showCreateDeviceTypeModal"
      title="新建设备型号"
      :width="600"
      @cancel="handleCreateDeviceTypeModalCancel"
    >
      <a-form
        :model="createDeviceTypeForm"
        :rules="createDeviceTypeFormRules"
        layout="vertical"
        ref="createDeviceTypeFormRef"
      >
        <a-form-item label="设备型号名称" name="deviceModelName" required>
          <a-input v-model:value="createDeviceTypeForm.deviceModelName" placeholder="请输入" maxlength="10" />
        </a-form-item>

        <a-form-item label="介绍" name="introduction" required>
          <a-textarea 
            v-model:value="createDeviceTypeForm.introduction" 
            placeholder="请输入" 
            :rows="4"
            maxlength="2000"
            show-count
          />
        </a-form-item>

        <a-form-item label="是否开通4G" name="enable4G" required>
          <a-radio-group v-model:value="createDeviceTypeForm.enable4G">
            <a-radio value="是">是</a-radio>
            <a-radio value="否">否</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="最新可更新的固件版本" name="latestFirmwareVersion">
          <a-select 
            v-model:value="createDeviceTypeForm.latestFirmwareVersion" 
            placeholder="请选择"
            :options="firmwareVersionOptions"
            :disabled="!createDeviceTypeForm.deviceModelName"
          >
          </a-select>
        </a-form-item>
      </a-form>
      
      <template #footer>
        <div style="text-align: right; padding: 10px 0;">
          <a-button @click="handleCreateDeviceTypeModalCancel">取消</a-button>
          <a-button type="primary" @click="handleCreateDeviceTypeModalConfirm" style="margin-left: 8px;">确定</a-button>
        </div>
      </template>
    </a-modal>

    <!-- 编辑设备型号 Modal -->
    <a-modal
      v-model:open="showEditDeviceTypeModal"
      title="编辑设备型号"
      :width="600"
      @cancel="handleEditDeviceTypeModalCancel"
    >
      <a-form
        :model="editDeviceTypeForm"
        :rules="editDeviceTypeFormRules"
        layout="vertical"
        ref="editDeviceTypeFormRef"
      >
        <a-form-item label="设备型号名称" name="deviceModelName" required>
          <a-input v-model:value="editDeviceTypeForm.deviceModelName" placeholder="请输入" maxlength="10" />
        </a-form-item>

        <a-form-item label="介绍" name="introduction" required>
          <a-textarea 
            v-model:value="editDeviceTypeForm.introduction" 
            placeholder="请输入" 
            :rows="4"
            maxlength="2000"
            show-count
          />
        </a-form-item>

        <a-form-item label="是否开通4G" name="enable4G" required>
          <a-radio-group v-model:value="editDeviceTypeForm.enable4G">
            <a-radio value="是">是</a-radio>
            <a-radio value="否">否</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="最新可更新的固件版本" name="latestFirmwareVersion">
          <a-select 
            v-model:value="editDeviceTypeForm.latestFirmwareVersion" 
            placeholder="请选择"
            :options="editFirmwareVersionOptions"
            :disabled="!editDeviceTypeForm.deviceModelName"
          >
          </a-select>
        </a-form-item>
      </a-form>
      
      <template #footer>
        <div style="text-align: right; padding: 10px 0;">
          <a-button @click="handleEditDeviceTypeModalCancel">取消</a-button>
          <a-button type="primary" @click="handleEditDeviceTypeModalConfirm" style="margin-left: 8px;">确定</a-button>
        </div>
      </template>
    </a-modal>
  </a-config-provider>
</template>
<script lang="ts" setup>
import type { ColumnsType } from 'ant-design-vue/es/table';
import { ref, computed, onMounted } from 'vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme } from 'ant-design-vue';
import axios from 'axios';
import { constructApiUrl } from '../utils/api';
import { message } from 'ant-design-vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth'; // Import the auth store
import draggable from 'vuedraggable';
import {
  SearchOutlined,
  ReloadOutlined,
  ColumnHeightOutlined,
  SettingOutlined
} from '@ant-design/icons-vue';
import { 
  createColumnConfigs, 
  useTableColumns, 
  createColumn,
  type ColumnDefinition 
} from '../utils/tableConfig';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore(); // Get the auth store instance

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '', // Override the '页' suffix for quick jumper
  },
}));

interface DataItem {
  id?: number;
  key?: number;
  deviceModelId: string; // 设备型号ID
  deviceModelName: string; // 设备型号名称
  introduction: string; // 介绍
  enable4G: string; // 开通4G
  latestFirmwareVersion: string; // 最新可更新固件版本
  updater: string; // 更新人
  createTime: string; // 创建时间
  updateTime: string; // 更新时间
}

// Safely convert a date-like string to a comparable timestamp
const getSafeTime = (value?: string) => {
  const time = value ? new Date(value).getTime() : 0;
  return isNaN(time) ? 0 : time;
};

// Define column configuration separately from the table columns
interface ColumnConfig {
  key: string;
  title: string;
  dataIndex: string;
  width: number;
  fixed?: 'left' | 'right' | boolean;
  sorter?: (a: any, b: any) => number;
  sortDirections?: ('ascend' | 'descend')[];
  sortOrder?: 'ascend' | 'descend';
  defaultSortOrder?: 'ascend' | 'descend';
  customRender?: (record: any) => string | number;
  className?: string;
}

const columnConfigs: ColumnConfig[] = [
  { key: 'rowIndex', title: '序号', dataIndex: 'rowIndex', width: 60, fixed: 'left' },
  { key: 'deviceModelId_1', title: '设备型号ID', dataIndex: 'deviceModelId', width: 150, sorter: (a, b) => a.deviceModelId.localeCompare(b.deviceModelId), sortDirections: ['ascend', 'descend'] },
  { key: 'deviceModelName_2', title: '设备型号名称', dataIndex: 'deviceModelName', width: 120, sorter: (a, b) => a.deviceModelName.localeCompare(b.deviceModelName), sortDirections: ['ascend', 'descend'] },
  { key: 'introduction_3', title: '介绍', dataIndex: 'introduction', width: 300, sorter: (a, b) => (a.introduction || '').localeCompare(b.introduction || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'enable4G_4', title: '开通4G', dataIndex: 'enable4G', width: 100, sorter: (a, b) => (a.enable4G ? 1 : 0) - (b.enable4G ? 1 : 0), sortDirections: ['ascend', 'descend'] },
  { key: 'latestFirmwareVersion_5', title: '最新可更新固件版本', dataIndex: 'latestFirmwareVersion', width: 200, sorter: (a, b) => (a.latestFirmwareVersion || '').localeCompare(b.latestFirmwareVersion || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'updater_6', title: '更新人', dataIndex: 'updater', width: 120, sorter: (a, b) => (a.updater || '').localeCompare(b.updater || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'createTime_7', title: '创建时间', dataIndex: 'createTime', width: 150, sorter: (a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'updateTime_8', title: '更新时间', dataIndex: 'updateTime', width: 150, sorter: (a, b) => new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'operation_9', title: '操作', dataIndex: '', width: 180, fixed: 'right' },
];

// Store column order and visibility separately
const columnOrder = ref<string[]>(columnConfigs.map(config => config.key));
const selectedColumnKeys = ref<string[]>(columnConfigs.map(config => config.key));

// Create columns from configs
const createColumnsFromConfigs = (configs: ColumnConfig[]): ColumnsType => {
  return configs.map(config => ({
    title: config.title,
    dataIndex: config.dataIndex,
    key: config.key,
    width: config.width,
    fixed: config.fixed,
    sorter: config.sorter,
    sortDirections: config.sortDirections,
    sortOrder: sorterInfo.value && config.key === sorterInfo.value.columnKey ? sorterInfo.value.order : undefined,
    customRender: config.customRender
      ? config.customRender
      : ({ text }) => (text === undefined || text === null || text === '' ? '-' : text),
    className: config.className,
  })) as ColumnsType;
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
const total = ref(0); // New ref for total items

// API functions
const fetchDeviceTypes = async () => {
  try {
    loading.value = true;
    console.log('Fetching device types with page:', currentPage.value, 'pageSize:', pageSize.value);
    
    const response = await axios.get(constructApiUrl('device-type'), {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value
      }
    });
    
    console.log('API Response:', response.data);
    
    if (response.data && response.data.data) {
      // Server-side pagination response
      rawData.value = response.data.data.map((item: any, index: number) => {
        console.log(`Item ${index}:`, item);
        return {
          ...item,
          key: index + 1
        };
      });
      // Default sort by 更新时间 descending using plain JavaScript
      rawData.value.sort((a, b) => getSafeTime(b.updateTime) - getSafeTime(a.updateTime));
      console.log('Processed rawData:', rawData.value);
      
      // Update pagination info from server
      if (response.data.pagination) {
        currentPage.value = response.data.pagination.current;
        pageSize.value = response.data.pagination.pageSize;
        total.value = response.data.pagination.total;
        
        console.log('Updated pagination - current:', currentPage.value, 'pageSize:', pageSize.value, 'total:', total.value);
      }
    } else if (response.data && Array.isArray(response.data)) {
      // Fallback for old API format
      rawData.value = response.data.map((item: any, index: number) => {
        console.log(`Item ${index}:`, item);
        return {
          ...item,
          key: index + 1
        };
      });
      // Default sort by 更新时间 descending using plain JavaScript
      rawData.value.sort((a, b) => getSafeTime(b.updateTime) - getSafeTime(a.updateTime));
      total.value = response.data.length;
      console.log('Processed rawData:', rawData.value);
    } else {
      message.error('获取数据失败：服务器返回无效数据');
      rawData.value = [];
      total.value = 0;
    }
  } catch (error: any) {
    console.error('Error fetching device types:', error);
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      if (error.response.status === 404) {
        message.error('错误：设备型号表不存在，请检查数据库');
      } else if (error.response.status === 500) {
        message.error('错误：数据库连接失败或表结构错误');
      } else {
        message.error(`获取数据失败：${error.response.data?.message || '服务器错误'}`);
      }
    } else if (error.request) {
      // Network error
      message.error('错误：无法连接到服务器，请检查网络连接');
    } else {
      // Other errors
      message.error('错误：获取数据时发生未知错误');
    }
    
    // Set empty data instead of fallback data
    rawData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const createDeviceType = async (deviceTypeData: Omit<DataItem, 'key' | 'id' | 'createTime' | 'updateTime'>) => {
  try {
    console.log('Creating device type with data:', deviceTypeData);
    console.log('API URL:', constructApiUrl('device-type'));
    
    const response = await axios.post(constructApiUrl('device-type'), deviceTypeData);
    console.log('Create response:', response.data);
    
    await fetchDeviceTypes(); // Refresh data
    return response.data;
  } catch (error) {
    console.error('Error creating device type:', error);
    throw error;
  }
};

const updateDeviceType = async (id: number, deviceTypeData: Partial<DataItem>) => {
  try {
    console.log('Updating device type with ID:', id);
    console.log('Update data:', deviceTypeData);
    console.log('API URL:', constructApiUrl(`device-type/${id}`));
    
    const response = await axios.put(constructApiUrl(`device-type/${id}`), deviceTypeData);
    console.log('Update response:', response.data);
    
    await fetchDeviceTypes(); // Refresh data
    return response.data;
  } catch (error) {
    console.error('Error updating device type:', error);
    throw error;
  }
};

const deleteDeviceType = async (id: number) => {
  try {
    await axios.delete(constructApiUrl(`device-type/${id}`));
    await fetchDeviceTypes(); // Refresh data
  } catch (error) {
    console.error('Error deleting device type:', error);
    throw error;
  }
};

const currentPage = ref(1);
const pageSize = ref(10);

const sorterInfo = ref<any>({
  columnKey: undefined,
  order: undefined,
});

// Create pagination handlers as separate functions
const handlePageChange = (page: number, size: number) => {
  console.log('handlePageChange called:', page, size);
  currentPage.value = page;
  pageSize.value = size;
  fetchDeviceTypes();
};

const handlePageSizeChange = (current: number, size: number) => {
  console.log('handlePageSizeChange called:', current, size);
  currentPage.value = current;
  pageSize.value = size;
  fetchDeviceTypes();
};

const pagination = computed(() => ({
  total: total.value, 
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
  fetchDeviceTypes(); // Fetch fresh data from API
};

const filteredData = computed(() => {
  let dataToFilter = rawData.value;

  if (searchInputValue.value) {
    const searchTerm = searchInputValue.value.toLowerCase();
    dataToFilter = dataToFilter.filter((item: DataItem) => {
      return Object.values(item).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(searchTerm)
      );
    });
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

const searchInputValue = ref('');

// Handle search parameter from URL
onMounted(() => {
  if (route.query.search) {
    searchInputValue.value = route.query.search as string;
  }
  fetchDeviceTypes(); // Fetch data on component mount
});

// Computed property to show no data message
const showNoDataMessage = computed(() => {
  return searchInputValue.value && filteredData.value.length === 0;
});

// Computed property for no data message
// const noDataMessage = computed(() => {
//   if (searchInputValue.value && filteredData.value.length === 0) {
//     return `未找到包含 "${searchInputValue.value}" 的数据`;
//   }
//   return '';
// });

const clearSearch = () => {
  searchInputValue.value = '';
};

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
    fetchDeviceTypes(); // Fetch fresh data when pagination changes
    return; // Exit early to avoid duplicate calls
  }
  
  const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;

  if (currentSorter && currentSorter.order) {
    sorterInfo.value = {
      columnKey: currentSorter.columnKey,
      order: currentSorter.order,
    };
    fetchDeviceTypes(); // Fetch fresh data when sorting changes
  } else {
    // When sorting is cleared, remove any default sort
    sorterInfo.value = {
      columnKey: undefined,
      order: undefined,
    };
    fetchDeviceTypes(); // Fetch fresh data when sorting is cleared
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

const handleCreateDeviceType = () => {
  console.log('Create device type button clicked');
  showCreateDeviceTypeModal.value = true;
};

// Create device type modal state variables
const showCreateDeviceTypeModal = ref(false);
const createDeviceTypeForm = ref({
  deviceModelName: '',
  introduction: '',
  enable4G: '是',
  latestFirmwareVersion: ''
});

// Computed property for firmware version options based on device model
const firmwareVersionOptions = computed(() => {
  if (!createDeviceTypeForm.value.deviceModelName) {
    return [];
  }
  
  // Get firmware versions for the selected device model
  // This would typically come from an API call, but for now we'll use static data
  const deviceModel = createDeviceTypeForm.value.deviceModelName;
  
  // Filter firmware versions based on device model
  // In a real implementation, this would be fetched from the backend
  const firmwareVersions = [
    { value: 'Z001 V 1.0.0', label: 'Z001 V 1.0.0' },
    { value: 'Z001 V 1.1.0', label: 'Z001 V 1.1.0' },
    { value: 'Z001 V 1.2.0', label: 'Z001 V 1.2.0' },
    { value: 'Z001 V 2.0.0', label: 'Z001 V 2.0.0' },
    { value: 'Z001 V 2.1.0', label: 'Z001 V 2.1.0' },
    { value: 'Z001 V 2.2.0', label: 'Z001 V 2.2.0' },
    { value: 'Z001 V 3.0.0', label: 'Z001 V 3.0.0' },
    { value: 'Z001 V 3.1.0', label: 'Z001 V 3.1.0' },
    { value: 'Z001 V 3.2.0', label: 'Z001 V 3.2.0' },
    { value: 'Z001 V 3.3.0', label: 'Z001 V 3.3.0' },
    { value: 'Z001 V 3.4.0', label: 'Z001 V 3.4.0' },
    { value: 'Z001 V 3.5.0', label: 'Z001 V 3.5.0' },
    { value: 'Z001 V 4.0.0', label: 'Z001 V 4.0.0' },
    { value: 'Z001 V 4.1.0', label: 'Z001 V 4.1.0' },
    { value: 'Z001 V 4.2.0', label: 'Z001 V 4.2.0' },
    { value: 'Z001 V 4.3.0', label: 'Z001 V 4.3.0' },
    { value: 'Z001 V 4.4.0', label: 'Z001 V 4.4.0' },
    { value: 'Z001 V 4.5.0', label: 'Z001 V 4.5.0' },
    { value: 'Z001 V 5.0.0', label: 'Z001 V 5.0.0' }
  ];
  
  return firmwareVersions;
});

// Custom validator for unique device model name
const validateUniqueDeviceModelName = (rule: any, value: string) => {
  if (!value) {
    return Promise.resolve();
  }
  
  // Check if the name already exists in the current data
  const existingDevice = rawData.value.find(item => 
    item.deviceModelName.toLowerCase() === value.toLowerCase()
  );
  
  if (existingDevice) {
    return Promise.reject('设备型号名称已存在，请使用其他名称');
  }
  
  return Promise.resolve();
};

// Custom validator for unique device model name (for edit form - excludes current record)
const validateUniqueDeviceModelNameEdit = (rule: any, value: string) => {
  if (!value) {
    return Promise.resolve();
  }
  
  // Check if the name already exists in the current data, excluding the current record being edited
  const existingDevice = rawData.value.find(item => 
    item.deviceModelName.toLowerCase() === value.toLowerCase() && 
    item.id !== editDeviceTypeForm.value.id
  );
  
  if (existingDevice) {
    return Promise.reject('设备型号名称已存在，请使用其他名称');
  }
  
  return Promise.resolve();
};

const createDeviceTypeFormRules = {
  deviceModelName: [
    { required: true, message: '请输入设备型号名称', trigger: 'blur' },
    { max: 10, message: '设备型号名称不能超过10个字符', trigger: 'blur' },
    { validator: validateUniqueDeviceModelName, trigger: 'blur' }
  ],
  introduction: [
    { required: true, message: '请输入介绍', trigger: 'blur' },
    { max: 2000, message: '介绍不能超过2000个字符', trigger: 'blur' }
  ],
  enable4G: [{ required: true, message: '请选择是否开通4G', trigger: 'change' }]
};

const createDeviceTypeFormRef = ref();

// Create device type modal handlers
const handleCreateDeviceTypeModalCancel = () => {
  showCreateDeviceTypeModal.value = false;
  createDeviceTypeFormRef.value?.resetFields();
  // Reset form data
  createDeviceTypeForm.value = {
    deviceModelName: '',
    introduction: '',
    enable4G: '是',
    latestFirmwareVersion: ''
  };
};

const handleCreateDeviceTypeModalConfirm = async () => {
  try {
    await createDeviceTypeFormRef.value?.validate();
    console.log('Create device type form data:', createDeviceTypeForm.value);
    
    // Prepare data for API
    const deviceTypeData = {
      deviceModelId: 'hjhwn832nj2f', // Default ID
      deviceModelName: createDeviceTypeForm.value.deviceModelName,
      introduction: createDeviceTypeForm.value.introduction,
      enable4G: createDeviceTypeForm.value.enable4G,
      latestFirmwareVersion: createDeviceTypeForm.value.latestFirmwareVersion,
      updater: authStore.user?.name || authStore.user?.username || '管理员' // Use username from auth store
    };
    
    await createDeviceType(deviceTypeData);
    message.success('设备型号创建成功');
    showCreateDeviceTypeModal.value = false;
    createDeviceTypeFormRef.value?.resetFields();
    
    // Reset form data
    createDeviceTypeForm.value = {
      deviceModelName: '',
      introduction: '',
      enable4G: '是',
      latestFirmwareVersion: ''
    };
  } catch (error: any) {
    console.error('Form validation or API call failed:', error);
    
    // Show user-friendly error message
    if (error.response) {
      if (error.response.status === 400) {
        message.error('请求数据格式错误，请检查输入');
      } else if (error.response.status === 409) {
        message.error('设备型号名称已存在，请使用其他名称');
      } else if (error.response.status === 500) {
        message.error('服务器内部错误，请稍后重试');
      } else {
        message.error(`创建失败：${error.response.data?.message || '未知错误'}`);
      }
    } else if (error.request) {
      message.error('网络连接失败，请检查网络连接');
    } else {
      message.error('创建过程中发生未知错误');
    }
  }
};

// Edit device type modal state variables
const showEditDeviceTypeModal = ref(false);
const editDeviceTypeForm = ref({
  id: 0, // Add ID field to store the record ID
  deviceModelId: '', // Add deviceModelId field
  deviceModelName: '',
  introduction: '',
  enable4G: '是',
  latestFirmwareVersion: ''
});

// Computed property for edit form firmware version options
const editFirmwareVersionOptions = computed(() => {
  if (!editDeviceTypeForm.value.deviceModelName) {
    return [];
  }
  
  // Get firmware versions for the selected device model in edit form
  const deviceModel = editDeviceTypeForm.value.deviceModelName;
  
  // Filter firmware versions based on device model
  const firmwareVersions = [
    { value: 'HWZ001 V 1.0.0', label: 'HWZ001 V 1.0.0' },
    { value: 'HWZ001 V 1.1.0', label: 'HWZ001 V 1.1.0' },
    { value: 'HWZ001 V 1.2.0', label: 'HWZ001 V 1.2.0' },
    { value: 'HWZ001 V 2.0.0', label: 'HWZ001 V 2.0.0' },
    { value: 'ZSW V1.0.0', label: 'ZSW V1.0.0' },
    { value: 'ZSW V1.1.0', label: 'ZSW V1.1.0' },
    { value: 'ZSW V1.2.0', label: 'ZSW V1.2.0' },
    { value: 'ZSW V2.0.0', label: 'ZSW V2.0.0' }
  ];
  
  return firmwareVersions;
});

const editDeviceTypeFormRules = {
  deviceModelName: [
    { required: true, message: '请输入设备型号名称', trigger: 'blur' },
    { max: 10, message: '设备型号名称不能超过10个字符', trigger: 'blur' },
    { validator: validateUniqueDeviceModelNameEdit, trigger: 'blur' }
  ],
  introduction: [
    { required: true, message: '请输入介绍', trigger: 'blur' },
    { max: 2000, message: '介绍不能超过2000个字符', trigger: 'blur' }
  ],
  enable4G: [{ required: true, message: '请选择是否开通4G', trigger: 'change' }]
};

const editDeviceTypeFormRef = ref();

// Edit device type modal handlers
const handleEditDeviceTypeModalCancel = () => {
  showEditDeviceTypeModal.value = false;
  editDeviceTypeFormRef.value?.resetFields();
  // Reset form data
  editDeviceTypeForm.value = {
    id: 0, // Reset ID as well
    deviceModelId: '', // Reset deviceModelId as well
    deviceModelName: '',
    introduction: '',
    enable4G: '是',
    latestFirmwareVersion: ''
  };
};

const handleEditDeviceTypeModalConfirm = async () => {
  try {
    await editDeviceTypeFormRef.value?.validate();
    console.log('Edit device type form data:', editDeviceTypeForm.value);
    
    // Check if we have a valid ID
    if (!editDeviceTypeForm.value.id) {
      message.error('无法找到要更新的记录ID');
      return;
    }
    
    const updateData = {
      deviceModelId: editDeviceTypeForm.value.deviceModelId, // Use deviceModelId from form
      deviceModelName: editDeviceTypeForm.value.deviceModelName,
      introduction: editDeviceTypeForm.value.introduction,
      enable4G: editDeviceTypeForm.value.enable4G,
      latestFirmwareVersion: editDeviceTypeForm.value.latestFirmwareVersion,
      updater: authStore.user?.name || authStore.user?.username || '管理员' // Use username from auth store
    };
    
    await updateDeviceType(editDeviceTypeForm.value.id, updateData);
    message.success('设备型号更新成功');
    showEditDeviceTypeModal.value = false;
    editDeviceTypeFormRef.value?.resetFields();
    
    // Reset form data
    editDeviceTypeForm.value = {
      id: 0,
      deviceModelId: '',
      deviceModelName: '',
      introduction: '',
      enable4G: '是',
      latestFirmwareVersion: ''
    };
  } catch (error: any) {
    console.error('Form validation or API call failed:', error);
    
    // Show user-friendly error message
    if (error.response) {
      if (error.response.status === 404) {
        message.error('要更新的记录不存在');
      } else if (error.response.status === 500) {
        message.error('服务器内部错误，请稍后重试');
      } else {
        message.error(`更新失败：${error.response.data?.message || '未知错误'}`);
      }
    } else if (error.request) {
      message.error('网络连接失败，请检查网络连接');
    } else {
      message.error('更新过程中发生未知错误');
    }
  }
};

const handleEditDeviceType = (record: DataItem) => {
  console.log('Edit device type:', record);
  editDeviceTypeForm.value = {
    id: record.id || 0, // Store the record ID
    deviceModelId: record.deviceModelId || 'hjhwn832nj2f', // Store the deviceModelId
    deviceModelName: record.deviceModelName,
    introduction: record.introduction,
    enable4G: record.enable4G,
    latestFirmwareVersion: record.latestFirmwareVersion
  };
  showEditDeviceTypeModal.value = true;
};

onMounted(() => {
  selectedColumnKeys.value = columnConfigs.map(config => config.key);
});

defineExpose({
  handleTableChange, // Explicitly expose handleTableChange
});

// Handle delete record
const handleDeleteRecord = async (record: DataItem) => {
  try {
    if (record.id) {
      await deleteDeviceType(record.id);
      message.success('设备型号删除成功');
    }
  } catch (error: any) {
    console.error('Error deleting record:', error);
    
    // Show user-friendly error message
    if (error.response) {
      if (error.response.status === 404) {
        message.error('要删除的记录不存在');
      } else if (error.response.status === 500) {
        message.error('服务器内部错误，请稍后重试');
      } else {
        message.error(`删除失败：${error.response.data?.message || '未知错误'}`);
      }
    } else if (error.request) {
      message.error('网络连接失败，请检查网络连接');
    } else {
      message.error('删除过程中发生未知错误');
    }
  }
};

const handleFirmwareVersionClick = (firmwareVersion: string, record: DataItem) => {
  console.log('Firmware version clicked:', firmwareVersion);
  console.log('Record data:', record);
  
  if (!firmwareVersion || firmwareVersion.trim() === '') {
    message.warning('固件版本信息为空，无法跳转');
    return;
  }
  
  try {
    // Navigate to the Firmware page with parameters for filtering
    const targetRoute = {
      name: 'firmware',
      query: {
        action: 'add', // Indicates "新增" (Add New) action
        versionName: firmwareVersion, // Pass the version name for filtering
        deviceModel: record.deviceModelName // Use the device model name from the record
      }
    };
    
    console.log('Navigating to:', targetRoute);
    
    router.push(targetRoute).then(() => {
      console.log('Navigation successful');
      // message.success(`正在跳转到固件页面，搜索版本: ${firmwareVersion}`);
    }).catch((error) => {
      console.error('Navigation failed:', error);
      message.error('页面跳转失败，请重试');
    });
  } catch (error) {
    console.error('Error in handleFirmwareVersionClick:', error);
    message.error('跳转过程中发生错误，请重试');
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
:deep(.ant-select-selector) {
  padding-left: 100px !important;
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

/* Make the action buttons horizontal and style '编辑' as blue and bold */
:deep(.ant-table-cell .action-cell) {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 120px;
  white-space: nowrap;
  flex-wrap: nowrap;
}

:deep(.ant-table-cell .action-cell .view-link) {
  color: #1890ff !important; /* Ant Design blue */
  font-weight: bold;
  white-space: nowrap;
}

:deep(.ant-table-cell .action-cell .edit-link) {
  color: #1890ff !important; /* Ant Design blue */
  font-weight: bold;
  white-space: nowrap;
}

:deep(.ant-table-cell .action-cell .danger-link) {
  color: #ff4d4f !important; /* Ant Design red */
  font-weight: bold;
  white-space: nowrap;
}

:deep(.nowrap-header) {
  white-space: nowrap !important;
}

/* Remove all padding and ensure text is flush left for form inputs */
:deep(.ant-input) {
  padding-left: 0 !important;
  text-align: left !important;
}

:deep(.ant-input::placeholder) {
  padding-left: 0 !important;
  text-align: left !important;
}

:deep(.ant-textarea) {
  padding-left: 0 !important;
  text-align: left !important;
}

:deep(.ant-textarea::placeholder) {
  padding-left: 0 !important;
  text-align: left !important;
}

/* Remove all padding and ensure text is flush left for select dropdowns */
:deep(.ant-select-selection-item) {
  padding: 0 !important;
  margin: 0 !important;
  text-align: left !important;
}

:deep(.ant-select-selection-item > span) {
  padding-left: 0 !important;
  margin-left: 0 !important;
}

:deep(.ant-select-selector) {
  padding-left: 8px !important;
}

:deep(.ant-select-selection-search) {
  padding-left: 0 !important;
}

:deep(.ant-select-selection-placeholder) {
  padding-left: 0 !important;
}

:deep(.ant-select-selection-overflow) {
  padding-left: 0 !important;
}

:deep(.ant-select-selection-overflow-item) {
  padding-left: 0 !important;
}

/* Override any remaining padding */
:deep(.ant-select-selection-item) {
  padding: 0 !important;
  margin: 0 !important;
  text-align: left !important;
}

/* Additional override for modal forms */
:deep(.ant-modal .ant-select-selection-item) {
  padding: 0 !important;
  margin: 0 !important;
  text-align: left !important;
}

:deep(.ant-modal .ant-select-selection-item > span) {
  padding-left: 0 !important;
  margin-left: 0 !important;
}

:deep(.ant-modal .ant-input) {
  padding-left: 0 !important;
  text-align: left !important;
}

:deep(.ant-modal .ant-textarea) {
  padding-left: 0 !important;
  text-align: left !important;
}

:deep(.product-type-select .ant-select-selector) {
  padding-left: 70px !important;
}

/* Hyperlink styling - using Account.vue style */
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
</style> 