<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>商品列表</h2>
    </div>

    <!-- select item area -->
    <div class="top-controls-wrapper">
      <div class="left-aligned-section">
        <div class="select-container product-type-select" style="margin-left: 10px;" :class="{ 'selected': productTypeValue }">
          <span class="select-always-placeholder">产品类型:</span>
          <a-tooltip :title="productTypeOptions.find(opt => opt.value === productTypeValue)?.label || '全部'">
            <a-select v-model:value="productTypeValue" style="width: 120px;" :options="productTypeOptions" allow-clear />
          </a-tooltip>
        </div>
        <div class="select-container product-name-select" style="margin-left: 10px;" :class="{ 'selected': productNameValue }">
          <span class="select-always-placeholder">商品名称:</span>
          <a-tooltip :title="productNameOptions.find(opt => opt.value === productNameValue)?.label || '全部'">
            <a-select v-model:value="productNameValue" style="width: 150px;" :options="productNameOptions" allow-clear />
          </a-tooltip>
        </div>
  
        <div class="select-container member-type-select" style="margin-left: 10px;" :class="{ 'selected': memberTypeValue }">
          <span class="select-always-placeholder">初始会员:</span>
          <a-tooltip :title="memberTypeOptions.find(opt => opt.value === memberTypeValue)?.label || '全部'">
            <a-select v-model:value="memberTypeValue" style="width: 120px;" :options="memberTypeOptions" allow-clear />
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
          <a class="edit-link" @click="handleEditClick">编辑</a>
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

  </a-config-provider>
</template>
<script lang="ts" setup>
import type { ColumnsType } from 'ant-design-vue/es/table';
import { ref, computed, onMounted } from 'vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme, message } from 'ant-design-vue';
import { ReloadOutlined, ColumnHeightOutlined ,SettingOutlined, SearchOutlined} from '@ant-design/icons-vue';
import draggable from 'vuedraggable';

const handleEditClick = () => {
  message.info('开发中');
};

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '', // Override the '页' suffix for quick jumper
  },
}));

// Define the type for the table data
interface ProductTableRow {
  productId: string;
  productName: string;
  productCode: string;
  productName2: string;
  productType: string;
  color: string;
  memberType: string;
  deviceId: string;
  subAccountId: string;
  activationTime: string;
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
  className?: string;
}

const columnConfigs = [
  { key: 'rowIndex', title: '序号', dataIndex: 'rowIndex', width: 60, fixed: 'left', customRender: ({ index }: { index: number }) => index + 1 },
  { key: 'productId', title: '商品ID', dataIndex: 'productId', width: 120 },
  { key: 'productName', title: '商品名称', dataIndex: 'productName', width: 200 },
  { key: 'productCode', title: '产品ID', dataIndex: 'productCode', width: 120 },
  { key: 'productName2', title: '产品名称', dataIndex: 'productName2', width: 200 },
  { key: 'productType', title: '产品类型', dataIndex: 'productType', width: 120 },
  { key: 'color', title: '颜色', dataIndex: 'color', width: 100 },
  { key: 'memberType', title: '初始会员', dataIndex: 'memberType', width: 120 },
  { key: 'deviceId', title: '设备ID', dataIndex: 'deviceId', width: 220 },
  { key: 'subAccountId', title: '子账户ID', dataIndex: 'subAccountId', width: 120 },
  { key: 'activationTime', title: '激活时间', dataIndex: 'activationTime', width: 160, sorter: (a: any, b: any) => new Date(a.activationTime).getTime() - new Date(b.activationTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'updateTime', title: '更新时间', dataIndex: 'updateTime', width: 160, sorter: (a: any, b: any) => new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'operation', title: '操作', dataIndex: 'operation', width: 150, fixed: 'right' },
];

// Store column order and visibility separately
const columnOrder = ref<string[]>(columnConfigs.map(config => config.key));
const selectedColumnKeys = ref<string[]>(columnConfigs.map(config => config.key));

const sorterInfo = ref<any>({
  columnKey: 'updateTime',
  order: 'descend',
});

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

const rawData: ProductTableRow[] = Array.from({ length: 30 }, (_, i) => {
  const productTypes = ['普通挂件', '毛绒玩具', '模型'];
  const productNames = ['粉色碳碳娃挂件富盒普通款', '蓝色小熊玩偶', '绿色恐龙模型'];
const memberTypes = ['普通会员', 'VIP', 'SVIP'];
  const colors = ['亮光粉', '天蓝', '草绿'];
  return {
    productId: `A${(i % 3) + 1}`,
    productName: productNames[i % 3],
    productCode: `HWSZ00100${(i % 3) + 1}`,
    productName2: productNames[i % 3],
    productType: productTypes[i % 3],
    color: colors[i % 3],
    memberType: memberTypes[i % 3],
    deviceId: `0075A1B2SZTD5ZSD69I892XJU${String.fromCharCode(66 + i)}`,
    subAccountId: `183****79${53 + (i % 10)}`,
    activationTime: `2025-7-${13 + (i % 10)} ${10 + (i % 10)}:25:1${i % 10}`,
    updateTime: `2025-7-${13 + (i % 10)} ${11 + (i % 10)}:30:2${i % 10}`,
  };
});

console.log('Raw Data:', rawData);

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

const onRefresh = () => {
  console.log('Refresh button clicked!');
  loading.value = true; // Show loading icon
  searchInputValue.value = '';
  productTypeValue.value = '';
  productNameValue.value = '';
  memberTypeValue.value = '';
  resetColumns(); // Reset column order and visibility

  // Simulate data fetching
  setTimeout(() => {
    loading.value = false; // Hide loading icon after a delay
  }, 500); // Adjust delay as needed
};

// Add selector reactive values and computed options
const productIdValue = ref('');
const productNameValue = ref('');
const productCodeValue = ref('');
const productTypeValue = ref('');
const colorValue = ref('');
const memberTypeValue = ref('');

const productNameOptions = computed(() => [{ value: '', label: '全部' }, ...Array.from(new Set(rawData.map(item => item.productName))).map(v => ({ value: v, label: v }))]);
const productTypeOptions = computed(() => [{ value: '', label: '全部' }, ...Array.from(new Set(rawData.map(item => item.productType))).map(v => ({ value: v, label: v }))]);
const memberTypeOptions = computed(() => [{ value: '', label: '全部' }, ...Array.from(new Set(rawData.map(item => item.memberType))).map(v => ({ value: v, label: v }))]);

const filteredData = computed(() => {
  let dataToFilter: ProductTableRow[] = [...rawData];
  
  if (productIdValue.value) {
    dataToFilter = dataToFilter.filter(item => item.productId === productIdValue.value);
  }
  if (productNameValue.value) {
    dataToFilter = dataToFilter.filter(item => item.productName === productNameValue.value);
  }
  if (productCodeValue.value) {
    dataToFilter = dataToFilter.filter(item => item.productCode === productCodeValue.value);
  }
  if (productTypeValue.value) {
    dataToFilter = dataToFilter.filter(item => item.productType === productTypeValue.value);
  }
  if (colorValue.value) {
    dataToFilter = dataToFilter.filter(item => item.color === colorValue.value);
  }
  if (memberTypeValue.value) {
    dataToFilter = dataToFilter.filter(item => item.memberType === memberTypeValue.value);
  }
  if (searchInputValue.value) {
    const searchTerm = searchInputValue.value.toLowerCase();
    dataToFilter = dataToFilter.filter((item) => {
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

const currentPage = ref(1);
const pageSize = ref(10);

const pagination = computed(() => ({
  total: filteredData.value.length, 
  current: currentPage.value,
  pageSize: pageSize.value,
  showSizeChanger: true, 
  pageSizeOptions: ['10', '20', '50'], 
  showTotal: (total: number, range: [number, number]) => `第${range[0]}-${range[1]}条/共${total}条`, 
  showQuickJumper: { goButton: '页' }, 
}));

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

:deep(.product-type-select .ant-select-selector) {
  padding-left: 65px !important;
}
:deep(.product-name-select .ant-select-selector) {
  padding-left: 70px !important;
}
:deep(.product-code-select .ant-select-selector) {
  padding-left: 60px !important;
}
:deep(.color-select .ant-select-selector) {
  padding-left: 40px !important;
}
:deep(.member-type-select .ant-select-selector) {
  padding-left: 65px !important;
}

:deep(.ip-role-select .ant-select-selector) {
  padding-left: 50px !important;
}

:deep(.member-payment-select .ant-select-selector) {
  padding-left: 65px !important;
}

:deep(.fourg-payment-select .ant-select-selector) {
  padding-left: 55px !important;
}

:deep(.fourg-plan-select .ant-select-selector) {
  padding-left: 55px !important;
}

:deep(.nowrap-header) {
  white-space: nowrap !important;
}

:deep(.ant-select-selector:hover),
:deep(.ant-select-focused .ant-select-selector) {
  background-color: #f5f5f5 !important;
  transition: background 0.2s;
}

:deep(.ant-table-column-sorter-up),
:deep(.ant-table-column-sorter-down) {
  color: #bfbfbf; /* grey by default */
}
:deep(.ant-table-column-sorter-up.active),
:deep(.ant-table-column-sorter-down.active) {
  color: #1677ff; /* blue when active */
}
</style>