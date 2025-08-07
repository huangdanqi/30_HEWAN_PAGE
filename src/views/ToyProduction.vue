<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>玩具生产</h2>
    </div>

    <!-- select item area -->
    <div class="top-controls-wrapper">
      <div class="left-aligned-section">



        <div class="select-container product-name-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">产品名称:</span>
          <a-tooltip :title="productNameValue.label">
            <a-select
              v-model:value="productNameValue"
              style="width: 120px;"
              :options="productNameOptions"
              @change="handleProductNameChange"
              :allowClear="true"
              label-in-value
              class="product-name-select"
            >
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div>
        <div class="select-container manufacturer-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">生产厂家:</span>
          <a-tooltip :title="manufacturerValue.label">
            <a-select
              v-model:value="manufacturerValue"
              style="width: 120px;"
              :options="manufacturerOptions"
              @change="handleManufacturerChange"
              :allowClear="true"
              label-in-value
              class="manufacturer-select"
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
            v-model="searchInputValue"
            placeholder="输入关键字搜索"
            style="width: 200px"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
          <a-button type="primary" @click="showBatchModal = true">新增批次</a-button>
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
        @edit-record="handleEditRecord"
      >
      <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'operation'">
        <a-space class="action-cell" direction="horizontal">
          <a class="edit-link" @click="handleEditRecord(record)">编辑</a>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定要删除该信息吗?"
            @confirm="$emit('delete-record', record)"
          >
            <a class="danger-link">删除</a>
          </a-popconfirm>
        </a-space>
      </template>
    </template>
      </a-table>
    </div>

    <FirmwareReleaseModal
      :visible="showReleaseModal"
      :uniqueDeviceModels="uniqueDeviceModels"
      @update:visible="handleReleaseModalClose"
      @submit="handleReleaseModalSubmit"
    />

    <FirmwareEditModal
      :visible="showEditModal"
      :record="editRecord"
      @update:visible="handleEditModalClose"
      @submit="handleEditModalSubmit"
    />

    <ProductCreateModal
      v-model:visible="showProductCreateModal"
      :deviceModelOptions="deviceModelOptions"
      :ipNameOptions="[]"
      @submit="handleProductCreateSubmit"
    />

    <a-modal
      v-model:visible="showBatchModal"
      title="新增批次"
      @ok="handleBatchOk"
      @cancel="showBatchModal = false"
      width="400px"
    >
      <a-form layout="vertical">
        <a-form-item required label="产品名称">
          <a-select placeholder="请选择" />
        </a-form-item>
        <a-form-item required label="生产批次">
          <a-date-picker style="width: 100%;" placeholder="请选择" />
        </a-form-item>
        <a-form-item label="生产厂家">
          <a-input placeholder="请输入" />
        </a-form-item>
        <a-form-item required label="单价">
          <a-input suffix="元" placeholder="请输入" />
        </a-form-item>
        <a-form-item required label="数量">
          <a-input suffix="个" placeholder="请输入" />
        </a-form-item>
      </a-form>
    </a-modal>

  </a-config-provider>
</template>
<script lang="ts" setup>
import type { ColumnsType } from 'ant-design-vue/es/table';
import { ref, computed, onMounted, watch } from 'vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme, message } from 'ant-design-vue';
import { ReloadOutlined, ColumnHeightOutlined ,SettingOutlined, SearchOutlined} from '@ant-design/icons-vue';
import draggable from 'vuedraggable';
import axios from 'axios';
import FirmwareReleaseModal from '@/components/FirmwareReleaseModal.vue';
import FirmwareEditModal from '@/components/FirmwareEditModal.vue';
import ProductCreateModal from '@/components/ProductCreateModal.vue';

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '', // Override the '页' suffix for quick jumper
  },
}));

interface DataItem {
  key: number;
  productId: string;
  productName: string;
  productionBatch: string;
  manufacturer: string;
  unitPrice: number;
  quantity: number;
  totalPrice: string;
  creator: string;
  createTime: string;
  updateTime: string;
  deviceModel: string;
  productType: string;
  ipName: string;
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

const columnConfigs = [
  { key: 'rowIndex', title: '序号', dataIndex: 'rowIndex', width: 60, fixed: 'left', customRender: ({ index }: { index: number }) => index + 1 },
  { key: 'productId', title: '产品ID', dataIndex: 'productId', width: 120 },
  { key: 'productName', title: '产品名称', dataIndex: 'productName', width: 180 },
  { key: 'productionBatch', title: '生产批次', dataIndex: 'productionBatch', width: 120, sorter: (a: any, b: any) => a.productionBatch.localeCompare(b.productionBatch), sortDirections: ['ascend', 'descend'] },
  { key: 'manufacturer', title: '生产厂家', dataIndex: 'manufacturer', width: 200 },
  { key: 'unitPrice', title: '单价(元)', dataIndex: 'unitPrice', width: 100, sorter: (a: any, b: any) => a.unitPrice - b.unitPrice, sortDirections: ['ascend', 'descend'] },
  { key: 'quantity', title: '数量(个)', dataIndex: 'quantity', width: 100 },
  { key: 'totalPrice', title: '总价(元)', dataIndex: 'totalPrice', width: 120, sorter: (a: any, b: any) => parseFloat(a.totalPrice.replace(/,/g, '')) - parseFloat(b.totalPrice.replace(/,/g, '')), sortDirections: ['ascend', 'descend'] },
  { key: 'creator', title: '创建人', dataIndex: 'creator', width: 80 },
  { key: 'createTime', title: '创建时间', dataIndex: 'createTime', width: 160, sorter: (a: any, b: any) => a.createTime.localeCompare(b.createTime), sortDirections: ['ascend', 'descend'] },
  { key: 'updateTime', title: '更新时间', dataIndex: 'updateTime', width: 160, sorter: (a: any, b: any) => a.updateTime.localeCompare(b.updateTime), sortDirections: ['ascend', 'descend'] },
  { key: 'operation', title: '操作', dataIndex: '', width: 100, fixed: 'right' },
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
    defaultSortOrder: config.defaultSortOrder,
    customRender: config.customRender
      ? config.customRender
      : ({ text }) => (text === undefined || text === null || text === '' ? '-' : text),
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

// Generate virtual data for the new columns
const rawData = ref<DataItem[]>([]);
const loading = ref(false);
const total = ref(0); // New ref for total items

// API base URL
const API_BASE_URL = '/api';

// API functions
const fetchToyProductionData = async () => {
  try {
    loading.value = true;
    console.log('Fetching toy production data with page:', currentPage.value, 'pageSize:', pageSize.value);
    
    const response = await axios.get(`${API_BASE_URL}/toy-production-hyphen`, {
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
          key: item.id || index + 1
        };
      });
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
          key: item.id || index + 1
        };
      });
      total.value = response.data.length;
      console.log('Processed rawData:', rawData.value);
    } else {
      message.error('获取数据失败：服务器返回无效数据');
      rawData.value = [];
      total.value = 0;
    }
  } catch (error: any) {
    console.error('Error fetching toy production data:', error);
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      if (error.response.status === 404) {
        message.error('错误：玩具生产表不存在，请检查数据库');
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

const deviceModelValue = ref({ key: 'all', label: '全部', value: 'all' });
const productNameValue = ref({ key: 'all', label: '全部', value: 'all' });
const manufacturerValue = ref({ key: 'all', label: '全部', value: 'all' });

const deviceModelOptions = computed(() => {
  const unique = Array.from(new Set(rawData.value.map(item => item.deviceModel)));
  return [{ key: 'all', value: 'all', label: '全部' }, ...unique.map(v => ({ key: v, value: v, label: v }))];
});

const productNameOptions = computed(() => {
  const unique = Array.from(new Set(rawData.value.map(item => item.productName)));
  return [{ key: 'all', value: 'all', label: '全部' }, ...unique.map(v => ({ key: v, value: v, label: v }))];
});

const manufacturerOptions = computed(() => {
  const unique = Array.from(new Set(rawData.value.map(item => item.manufacturer)));
  return [{ key: 'all', value: 'all', label: '全部' }, ...unique.map(v => ({ key: v, value: v, label: v }))];
});

const handleProductNameChange = (val: any) => {
  productNameValue.value = !val || !val.value || val.value === 'all'
    ? { key: 'all', label: '全部', value: 'all' }
    : val;
};

const handleManufacturerChange = (val: any) => {
  manufacturerValue.value = !val || !val.value || val.value === 'all'
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

const pagination = computed(() => ({
  total: total.value, 
  current: currentPage.value,
  pageSize: pageSize.value,
  showSizeChanger: true, 
  pageSizeOptions: ['10', '20', '50'], 
  showTotal: (total: number, range: [number, number]) => `第${range[0]}-${range[1]}条/共${total}条`, 
  showQuickJumper: { goButton: '页' }, 
  onShowSizeChange: (current: number, size: number) => {
    console.log('onShowSizeChange', current, size);
    currentPage.value = current;
    pageSize.value = size;
    fetchToyProductionData(); // Fetch fresh data when page size changes
  },
  onChange: (page: number, size: number) => {
    console.log('onChange', page, size);
    currentPage.value = page;
    pageSize.value = size;
    fetchToyProductionData(); // Fetch fresh data when page changes
  },
}));

const onRefresh = () => {
  console.log('Refresh button clicked!');
  loading.value = true; // Show loading icon
  searchInputValue.value = '';
  currentPage.value = 1;
  resetColumns(); // Reset column order and visibility

  // Reset all selector values to '全部'
  deviceModelValue.value = { key: 'all', label: '全部', value: 'all' };
  productNameValue.value = { key: 'all', label: '全部', value: 'all' };
  manufacturerValue.value = { key: 'all', label: '全部', value: 'all' };

  // Fetch fresh data from API
  fetchToyProductionData();
};

const searchInputValue = ref('');
const debouncedSearchValue = ref('');

let debounceTimeout: any = null;
watch(searchInputValue, (val) => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    debouncedSearchValue.value = val;
  }, 300); // 300ms debounce
});

const filteredData = computed<DataItem[]>(() => {
  let dataToFilter: DataItem[] = [...rawData.value];

  if (debouncedSearchValue.value) {
    const searchTerm = debouncedSearchValue.value.toLowerCase();
    dataToFilter = dataToFilter.filter((item: DataItem) => {
      return Object.values(item).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(searchTerm)
      );
    });
  }

  // Filter by product name
  if (
    productNameValue.value &&
    productNameValue.value.value !== 'all' &&
    productNameValue.value.value !== ''
  ) {
    dataToFilter = dataToFilter.filter(item => item.productName === productNameValue.value.value);
  }

  // Filter by manufacturer
  if (
    manufacturerValue.value &&
    manufacturerValue.value.value !== 'all' &&
    manufacturerValue.value.value !== ''
  ) {
    dataToFilter = dataToFilter.filter(item => item.manufacturer === manufacturerValue.value.value);
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
    fetchToyProductionData(); // Fetch fresh data when pagination changes
    return; // Exit early to avoid duplicate calls
  }
  
  const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;

  if (currentSorter && currentSorter.order) {
    sorterInfo.value = {
      columnKey: currentSorter.columnKey,
      order: currentSorter.order,
    };
    fetchToyProductionData(); // Fetch fresh data when sorting changes
  } else {
    // When sorting is cleared, revert to default
    sorterInfo.value = {
      columnKey: 'updateTime',
      order: 'descend',
    };
    fetchToyProductionData(); // Fetch fresh data when sorting is cleared
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
const uniqueDeviceModels = computed(() => Array.from(new Set(rawData.value.map(item => item.deviceModel))));

const handleReleaseModalClose = () => {
  showReleaseModal.value = false;
};
const handleReleaseModalSubmit = (_data: any) => {
  // You can handle the submit data here
  showReleaseModal.value = false;
};

const showEditModal = ref(false);
const editRecord = ref<any>(null);

const handleEditRecord = (_record: any) => {
  message.info('开发中');
  // editRecord.value = { ..._record };
  // showEditModal.value = true;
};
const handleEditModalClose = () => {
  showEditModal.value = false;
  editRecord.value = null;
};
const handleEditModalSubmit = (_data: any) => {
  // Update the data in your table as needed
  showEditModal.value = false;
  editRecord.value = null;
};

const showProductCreateModal = ref(false);

const handleProductCreateSubmit = (_data: any) => {
  // You can add logic to add the new product to rawData here
  showProductCreateModal.value = false;
};

const showBatchModal = ref(false);
const handleBatchOk = () => {
  // TODO: Validate and submit form data
  showBatchModal.value = false;
};

onMounted(() => {
  selectedColumnKeys.value = columnConfigs.map(config => config.key);
  fetchToyProductionData(); // Fetch data on component mount
});

defineExpose({
  handleTableChange, // Explicitly expose handleTableChange
});
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


:deep(.version-number-select .ant-select-selector) {
  padding-left: 60px !important;
}

:deep(.device-model-select .ant-select-selector) {
  padding-left: 65px !important;
}
:deep(.ip-name-select .ant-select-selector) {
  padding-left: 55px !important;
}

:deep(.product-type-select .ant-select-selector) {
  padding-left: 65px !important;
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
  min-width: 90px;
}
:deep(.ant-table-cell .action-cell .edit-link) {
  color: #1890ff !important; /* Ant Design blue */
  font-weight: bold;
}
:deep(.ant-table-cell .action-cell .danger-link) {
  color: #ff4d4f !important; /* Ant Design red */
  font-weight: bold;
}

:deep(.ant-table-column-sorter-up),
:deep(.ant-table-column-sorter-down) {
  color: #bfbfbf !important; /* grey by default */
}
:deep(.ant-table-column-sorter-up.active),
:deep(.ant-table-column-sorter-down.active) {
  color: #1677ff !important; /* blue when active */
}
:deep(th .ant-table-column-sorter-up:hover),
:deep(th .ant-table-column-sorter-down:hover) {
  color: #1677ff !important;
}

:deep(.product-name-select .ant-select-selector) {
  padding-left: 65px !important;
}
:deep(.manufacturer-select .ant-select-selector) {
  padding-left: 65px !important;
}
</style>