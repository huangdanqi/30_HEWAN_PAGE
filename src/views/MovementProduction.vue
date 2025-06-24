<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>机芯生产</h2>
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
        <div class="select-container manufacturer-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">生产厂家:</span>
          <a-tooltip :title="manufacturerValue.label">
            <a-select
              v-model:value="manufacturerValue"
              style="width: 130px;"
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
            v-model:value="searchInputValue"
            placeholder="输入关键字搜索"
            style="width: 200px"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
          <a-button type="primary" @click="handleAddBatchClick">新增批次</a-button>
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
        rowKey="key"
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
          <a class="edit-link" @click="handleBomUpload(record)">上传</a>
          <a-divider type="vertical" />
          <a class="download-link">下载BOM</a>
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

    <AddBatchModal
      v-model:open="showAddBatchModal"
      :deviceModelOptions="deviceModelOptions.filter(opt => opt.value !== 'all')"
      :manufacturerOptions="manufacturerOptions.filter(opt => opt.value !== 'all')"
      @submit="handleAddBatchSubmit"
    />

    <AddBatchModal
      v-model:open="showEditModal"
      title="编辑批次"
      :deviceModelOptions="deviceModelOptions.filter(opt => opt.value !== 'all')"
      :manufacturerOptions="manufacturerOptions.filter(opt => opt.value !== 'all')"
      :initialValues="editRecord"
      @submit="handleEditBatchSubmit"
    />

    <BomUploadModal
      :visible="showBomModal"
      @update:visible="showBomModal = $event"
      @submit="handleBomSubmit"
    />

  </a-config-provider>
</template>
<script lang="ts" setup>
import type { ColumnsType } from 'ant-design-vue/es/table';
import { ref, computed, onMounted } from 'vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme } from 'ant-design-vue';
import { ReloadOutlined, ColumnHeightOutlined ,SettingOutlined, SearchOutlined} from '@ant-design/icons-vue';
import draggable from 'vuedraggable';
import FirmwareReleaseModal from '@/components/FirmwareReleaseModal.vue';
import AddBatchModal from '@/components/AddBatchModal.vue';
import BomUploadModal from '@/components/BomUploadModal.vue';

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '', // Override the '页' suffix for quick jumper
  },
}));

interface DataItem {
  key: number;
  deviceModel: string;
  productionBatch: string;
  manufacturer: string;
  burnedFirmware: string;
  unitPrice: number;
  quantity: number;
  totalPrice: string;
  creator: string;
  creationTime: string;
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
  { key: 'rowIndex', title: '序号', dataIndex: 'rowIndex', width: 60, fixed: 'left', customRender: ({ index }: { index: number }) => (currentPage.value - 1) * pageSize.value + index + 1 },
  { key: 'deviceModel', title: '设备型号', dataIndex: 'deviceModel', width: 100 },
  { key: 'productionBatch', title: '生产批次', dataIndex: 'productionBatch', width: 120, sorter: (a: any, b: any) => new Date(a.productionBatch).getTime() - new Date(b.productionBatch).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'manufacturer', title: '生产厂家', dataIndex: 'manufacturer', width: 180 },
  { key: 'burnedFirmware', title: '烧录固件', dataIndex: 'burnedFirmware', width: 120 },
  { key: 'unitPrice', title: '单价（元）', dataIndex: 'unitPrice', width: 100, sorter: (a: any, b: any) => a.unitPrice - b.unitPrice, sortDirections: ['ascend', 'descend'] },
  { key: 'quantity', title: '数量（个）', dataIndex: 'quantity', width: 100, sorter: (a: any, b: any) => a.quantity - b.quantity, sortDirections: ['ascend', 'descend'] },
  { key: 'totalPrice', title: '总价（元）', dataIndex: 'totalPrice', width: 120, sorter: (a: any, b: any) => parseFloat(a.totalPrice) - parseFloat(b.totalPrice), sortDirections: ['ascend', 'descend'] },
  { key: 'creator', title: '创建人', dataIndex: 'creator', width: 100, customRender: ({ record }: any) => record.creator },
  { key: 'creationTime', title: '创建时间', dataIndex: 'creationTime', width: 160, sorter: (a: any, b: any) => new Date(a.creationTime).getTime() - new Date(b.creationTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'updateTime', title: '更新时间', dataIndex: 'updateTime', width: 160, sorter: (a: any, b: any) => new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'operation', title: '操作', dataIndex: '', width: 280, fixed: 'right' },
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
const rawData: any[] = [];
const deviceModels = ['HWSZ001', 'HWSZ002', 'HWSZ003'];
const manufacturers = ['深圳沃能威科技有限公司', '上海智造电子有限公司', '北京创新科技有限公司'];
const creatorAvatars = [
  'https://randomuser.me/api/portraits/men/33.jpg',
  'https://randomuser.me/api/portraits/men/34.jpg',
];
const creatorNames = ['张三', '李四'];
rawData.length = 0;
for (let i = 0; i < 12; i++) {
  rawData.push({
    key: i + 1,
    deviceModel: deviceModels[i % deviceModels.length],
    productionBatch: `2025-06-${10 + (i % 20)}`,
    manufacturer: manufacturers[i % manufacturers.length],
    burnedFirmware: `Z00${i % 4 + 1} V ${i % 3 + 1}.${i % 2 + 1}`,
    unitPrice: 80 + (i % 3) * 5 + 0.75,
    quantity: 500 + i * 10,
    totalPrice: (80 + (i % 3) * 5 + 0.75) * (500 + i * 10) + '',
    creator: creatorNames[i % 2],
    creatorAvatar: creatorAvatars[i % 2],
    creationTime: `2025-7-${13 + (i % 10)} 19:25:11`,
    updateTime: `2025-7-${13 + (i % 10)} 19:25:11`,
  });
}

console.log('Raw Data:', rawData);

const ipRoleValue = ref({ key: 'all', label: '全部', value: 'all' });
const deviceModelValue = ref({ key: 'all', label: '全部', value: 'all' });
const releaseVersionValue = ref({ key: 'all', label: '全部', value: 'all' });
const versionNumberValue = ref({ key: 'all', label: '全部', value: 'all' });
const manufacturerValue = ref({ key: 'all', label: '全部', value: 'all' });

const deviceModelOptions = computed(() => {
  const unique = Array.from(new Set(rawData.map(item => item.deviceModel)));
  return [{ key: 'all', value: 'all', label: '全部' }, ...unique.map(v => ({ key: v, value: v, label: v }))];
});

const manufacturerOptions = computed(() => {
  const unique = Array.from(new Set(rawData.map(item => item.manufacturer)));
  return [{ key: 'all', value: 'all', label: '全部' }, ...unique.map(v => ({ key: v, value: v, label: v }))];
});

const handleDeviceModelChange = (val: any) => {
  deviceModelValue.value = !val || !val.value || val.value === 'all'
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
  total: filteredData.value.length, 
  current: currentPage.value,
  pageSize: pageSize.value,
  showSizeChanger: true, 
  pageSizeOptions: ['10', '20', '50'], 
  showTotal: (total: number, range: [number, number]) => `第${range[0]}-${range[1]}条/共${total}条`, 
  showQuickJumper: { goButton: '页' }, 
}));

const onRefresh = () => {
  console.log('Refresh button clicked!');
  loading.value = true; // Show loading icon
  searchInputValue.value = '';
  currentPage.value = 1;
  resetColumns(); // Reset column order and visibility

  // Reset all selector values to '全部'
  ipRoleValue.value = { key: 'all', label: '全部', value: 'all' };
  deviceModelValue.value = { key: 'all', label: '全部', value: 'all' };
  releaseVersionValue.value = { key: 'all', label: '全部', value: 'all' };
  versionNumberValue.value = { key: 'all', label: '全部', value: 'all' };
  manufacturerValue.value = { key: 'all', label: '全部', value: 'all' };

  // Simulate data fetching
  setTimeout(() => {
    loading.value = false; // Hide loading icon after a delay
  }, 500); // Adjust delay as needed
};

const filteredData = computed<DataItem[]>(() => {
  let dataToFilter: DataItem[] = [...rawData];

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

  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return dataToFilter.slice(start, end);
});

const searchInputValue = ref('');

const handleTableChange = (
  paginationData: any,
  filters: any,
  sorter: any,
) => {
  console.log('Table change:', paginationData, filters, sorter);
  const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;

  if (currentSorter && currentSorter.order) {
    sorterInfo.value = {
      columnKey: currentSorter.columnKey,
      order: currentSorter.order,
    };
  } else {
    // When sorting is cleared, revert to default
    sorterInfo.value = {
      columnKey: 'updateTime',
      order: 'descend',
    };
  }
  
  // When table changes, we should probably go back to the first page
  currentPage.value = 1;
};

const onSettingClick = () => {
  console.log('Setting clicked');
};

const loading = ref(false); // Add a loading state

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
const uniqueDeviceModels = computed(() => Array.from(new Set(rawData.map(item => item.deviceModel))));

const handleReleaseModalClose = () => {
  showReleaseModal.value = false;
};

const handleReleaseModalSubmit = (_data: any) => {
  // You can handle the submit data here
  showReleaseModal.value = false;
};

const showEditModal = ref(false);
const editRecord = ref<any>(null);

const handleEditRecord = (record: any) => {
  editRecord.value = { ...record };
  showEditModal.value = true;
};
const handleEditBatchSubmit = (data: any) => {
  // Find and update the record in rawData
  const idx = rawData.findIndex(item => item.key === editRecord.value.key);
  if (idx !== -1) {
    rawData[idx] = {
      ...rawData[idx],
      ...data,
      productionBatch: data.productionBatch?.format ? data.productionBatch.format('YYYY-MM-DD') : data.productionBatch,
      totalPrice: (data.unitPrice * data.quantity).toString(),
      updateTime: new Date().toLocaleString(),
    };
  }
  showEditModal.value = false;
  editRecord.value = null;
};

const showBomModal = ref(false);
const bomRecord = ref<any>(null);

function handleBomUpload(_record: any) {
  console.log('Upload clicked', _record);
  bomRecord.value = _record;
  showBomModal.value = true;
}

function handleBomSubmit(_file: any) {
  // Handle the uploaded file for bomRecord.value
  showBomModal.value = false;
}

const showAddBatchModal = ref(false);

function handleAddBatchClick() {
  showAddBatchModal.value = true;
}

function handleAddBatchSubmit(_data: any) {
  // Add the new batch to rawData
  rawData.unshift({
    key: rawData.length + 1,
    deviceModel: _data.deviceModel,
    productionBatch: _data.productionBatch?.format ? _data.productionBatch.format('YYYY-MM-DD') : _data.productionBatch,
    manufacturer: _data.manufacturer,
    burnedFirmware: _data.burnedFirmware,
    unitPrice: _data.unitPrice,
    quantity: _data.quantity,
    totalPrice: (_data.unitPrice * _data.quantity).toString(),
    creator: 'admin',
    creatorAvatar: '',
    creationTime: new Date().toLocaleString(),
    updateTime: new Date().toLocaleString(),
  });
  showAddBatchModal.value = false;
}

onMounted(() => {
  selectedColumnKeys.value = columnConfigs.map(config => config.key);
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

/* DEBUG: Force modal to be visible */
:deep(.ant-modal) {
  display: block !important;
  opacity: 1 !important;
  z-index: 99999 !important;
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
:deep(.manufacturer-select .ant-select-selector) {
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
  position: relative;
  z-index: 9999 !important;
  background: #fff !important;
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
  color: #bfbfbf; /* grey by default */
}
:deep(.ant-table-column-sorter-up.active),
:deep(.ant-table-column-sorter-down.active) {
  color: #1677ff; /* blue when active */
}

.download-link {
  color: #bfbfbf !important;
  cursor: not-allowed;
  pointer-events: none;
  font-weight: bold;
}
</style>