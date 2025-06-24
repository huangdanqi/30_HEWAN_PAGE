<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>产品管理</h2>
    </div>

    <!-- select item area -->
    <div class="top-controls-wrapper">
      <div class="left-aligned-section">
        <div class="select-container device-model-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">设备型号:</span>
          <a-tooltip :title="deviceModelValue.label">
            <a-select
              v-model:value="deviceModelValue"
              style="width: 120px;"
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
        <div class="select-container product-type-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">产品类型:</span>
          <a-tooltip :title="productTypeValue.label">
            <a-select
              v-model:value="productTypeValue"
              style="width: 120px;"
              :options="productTypeOptions"
              @change="handleProductTypeChange"
              :allowClear="true"
              label-in-value
              class="product-type-select"
            >
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div>
        <div class="select-container ip-name-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">IP名称:</span>
          <a-tooltip :title="ipNameValue.label">
            <a-select
              v-model:value="ipNameValue"
              style="width: 120px;"
              :options="ipNameOptions"
              @change="handleIpNameChange"
              :allowClear="true"
              label-in-value
              class="ip-name-select"
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
          <a-button type="primary" @click="handleProductCreate">新建产品</a-button>
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
      :ipNameOptions="ipNameOptions"
      @submit="handleProductCreateSubmit"
    />

  </a-config-provider>
</template>
<script lang="ts" setup>
import type { ColumnsType } from 'ant-design-vue/es/table';
import { ref, computed, onMounted } from 'vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme, message } from 'ant-design-vue';
import { ReloadOutlined, ColumnHeightOutlined ,SettingOutlined, SearchOutlined} from '@ant-design/icons-vue';
import draggable from 'vuedraggable';
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
  productType: string;
  color: string;
  productDetails: string;
  deviceModel: string;
  ipName: string;
  creator: string;
  createTime: string;
  updateTime: string;
  releaseVersion?: string;
  versionNumber?: string;
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
  { key: 'productType', title: '产品类型', dataIndex: 'productType', width: 120 },
  { key: 'color', title: '颜色', dataIndex: 'color', width: 100 },
  { key: 'productDetails', title: '产品详情', dataIndex: 'productDetails', width: 300 },
  { key: 'deviceModel', title: '设备型号', dataIndex: 'deviceModel', width: 120 },
  { key: 'ipName', title: 'IP名称', dataIndex: 'ipName', width: 100 },
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
const rawData: DataItem[] = [
  {
    key: 1,
    productId: 'HWSZ001001',
    productName: '粉色碳碳富盒挂件',
    productType: '首盒挂件',
    color: '荧光粉',
    productDetails: '布料: 云朵塑 猫兔毛 10毛 33号; ...',
    deviceModel: 'HWSZ001',
    ipName: '喵喵',
    creator: '33',
    createTime: '2025-7-13 19:25:11',
    updateTime: '2025-7-13 19:25:11',
  },
  {
    key: 2,
    productId: 'HWSZ002001',
    productName: '蓝色碳碳富盒挂件',
    productType: '次盒挂件',
    color: '天蓝',
    productDetails: '布料: 棉 猫兔毛 8毛 22号; ...',
    deviceModel: 'HWSZ002',
    ipName: '汪汪',
    creator: '34',
    createTime: '2025-8-13 19:25:11',
    updateTime: '2025-8-13 19:25:11',
  },
  {
    key: 3,
    productId: 'HWSZ003001',
    productName: '绿色碳碳富盒挂件',
    productType: '首盒挂件',
    color: '草绿',
    productDetails: '布料: 亚麻 猫兔毛 12毛 44号; ...',
    deviceModel: 'HWSZ003',
    ipName: '咩咩',
    creator: '35',
    createTime: '2025-9-13 19:25:11',
    updateTime: '2025-9-13 19:25:11',
  },
  {
    key: 4,
    productId: 'HWSZ004001',
    productName: '黄色碳碳富盒挂件',
    productType: '其他类型',
    color: '柠檬黄',
    productDetails: '布料: 丝 猫兔毛 15毛 55号; ...',
    deviceModel: 'HWSZ004',
    ipName: '喵喵',
    creator: '36',
    createTime: '2025-10-13 19:25:11',
    updateTime: '2025-10-13 19:25:11',
  },
  {
    key: 5,
    productId: 'HWSZ005001',
    productName: '紫色碳碳富盒挂件',
    productType: '首盒挂件',
    color: '薰衣草紫',
    productDetails: '布料: 羊毛 猫兔毛 9毛 66号; ...',
    deviceModel: 'HWSZ001',
    ipName: '汪汪',
    creator: '37',
    createTime: '2025-11-13 19:25:11',
    updateTime: '2025-11-13 19:25:11',
  },
  {
    key: 6,
    productId: 'HWSZ006001',
    productName: '橙色碳碳富盒挂件',
    productType: '次盒挂件',
    color: '橙橘',
    productDetails: '布料: 棉 猫兔毛 7毛 77号; ...',
    deviceModel: 'HWSZ002',
    ipName: '咩咩',
    creator: '38',
    createTime: '2025-12-13 19:25:11',
    updateTime: '2025-12-13 19:25:11',
  },
  {
    key: 7,
    productId: 'HWSZ007001',
    productName: '红色碳碳富盒挂件',
    productType: '其他类型',
    color: '中国红',
    productDetails: '布料: 丝 猫兔毛 11毛 88号; ...',
    deviceModel: 'HWSZ003',
    ipName: '喵喵',
    creator: '39',
    createTime: '2026-1-13 19:25:11',
    updateTime: '2026-1-13 19:25:11',
  },
  {
    key: 8,
    productId: 'HWSZ008001',
    productName: '青色碳碳富盒挂件',
    productType: '首盒挂件',
    color: '青蓝',
    productDetails: '布料: 亚麻 猫兔毛 13毛 99号; ...',
    deviceModel: 'HWSZ004',
    ipName: '汪汪',
    creator: '40',
    createTime: '2026-2-13 19:25:11',
    updateTime: '2026-2-13 19:25:11',
  },
  {
    key: 9,
    productId: 'HWSZ009001',
    productName: '黑色碳碳富盒挂件',
    productType: '次盒挂件',
    color: '墨黑',
    productDetails: '布料: 棉 猫兔毛 10毛 100号; ...',
    deviceModel: 'HWSZ001',
    ipName: '咩咩',
    creator: '41',
    createTime: '2026-3-13 19:25:11',
    updateTime: '2026-3-13 19:25:11',
  },
  {
    key: 10,
    productId: 'HWSZ010001',
    productName: '白色碳碳富盒挂件',
    productType: '其他类型',
    color: '雪白',
    productDetails: '布料: 羊毛 猫兔毛 14毛 101号; ...',
    deviceModel: 'HWSZ002',
    ipName: '喵喵',
    creator: '42',
    createTime: '2026-4-13 19:25:11',
    updateTime: '2026-4-13 19:25:11',
  },
  {
    key: 11,
    productId: 'HWSZ011001',
    productName: '棕色碳碳富盒挂件',
    productType: '首盒挂件',
    color: '咖啡棕',
    productDetails: '布料: 棉 猫兔毛 12毛 102号; ...',
    deviceModel: 'HWSZ003',
    ipName: '汪汪',
    creator: '43',
    createTime: '2026-5-13 19:25:11',
    updateTime: '2026-5-13 19:25:11',
  },
  {
    key: 12,
    productId: 'HWSZ012001',
    productName: '银色碳碳富盒挂件',
    productType: '次盒挂件',
    color: '银灰',
    productDetails: '布料: 丝 猫兔毛 15毛 103号; ...',
    deviceModel: 'HWSZ004',
    ipName: '咩咩',
    creator: '44',
    createTime: '2026-6-13 19:25:11',
    updateTime: '2026-6-13 19:25:11',
  },
];

console.log('Raw Data:', rawData);

const deviceModelValue = ref({ key: 'all', label: '全部', value: 'all' });
const productTypeValue = ref({ key: 'all', label: '全部', value: 'all' });
const ipNameValue = ref({ key: 'all', label: '全部', value: 'all' });

const deviceModelOptions = computed(() => {
  const unique = Array.from(new Set(rawData.map(item => item.deviceModel)));
  return [{ key: 'all', value: 'all', label: '全部' }, ...unique.map(v => ({ key: v, value: v, label: v }))];
});

const productTypeOptions = computed(() => {
  const unique = Array.from(new Set(rawData.map(item => item.productType)));
  return [{ key: 'all', value: 'all', label: '全部' }, ...unique.map(v => ({ key: v, value: v, label: v }))];
});

const ipNameOptions = computed(() => {
  const unique = Array.from(new Set(rawData.map(item => item.ipName)));
  return [{ key: 'all', value: 'all', label: '全部' }, ...unique.map(v => ({ key: v, value: v, label: v }))];
});

const handleDeviceModelChange = (val: any) => {
  deviceModelValue.value = !val || !val.value || val.value === 'all'
    ? { key: 'all', label: '全部', value: 'all' }
    : val;
};

const handleProductTypeChange = (val: any) => {
  productTypeValue.value = !val || !val.value || val.value === 'all'
    ? { key: 'all', label: '全部', value: 'all' }
    : val;
};

const handleIpNameChange = (val: any) => {
  ipNameValue.value = !val || !val.value || val.value === 'all'
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
  total: rawData.length, 
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
  },
  onChange: (page: number, size: number) => {
    console.log('onChange', page, size);
    currentPage.value = page;
    pageSize.value = size;
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
  productTypeValue.value = { key: 'all', label: '全部', value: 'all' };
  ipNameValue.value = { key: 'all', label: '全部', value: 'all' };

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

  // Filter by product type
  if (
    productTypeValue.value &&
    productTypeValue.value.value !== 'all' &&
    productTypeValue.value.value !== ''
  ) {
    dataToFilter = dataToFilter.filter(item => item.productType === productTypeValue.value.value);
  }

  // Filter by IP name
  if (
    ipNameValue.value &&
    ipNameValue.value.value !== 'all' &&
    ipNameValue.value.value !== ''
  ) {
    dataToFilter = dataToFilter.filter(item => item.ipName === ipNameValue.value.value);
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

const handleProductCreate = () => {
  showProductCreateModal.value = true;
};

const handleProductCreateSubmit = (_data: any) => {
  // You can add logic to add the new product to rawData here
  showProductCreateModal.value = false;
};

onMounted(() => {
  selectedColumnKeys.value = columnConfigs.map(config => config.key);
});

defineExpose({
  handleTableChange, // Explicitly expose handleTableChange
});

console.log('Selected deviceModel:', deviceModelValue.value.value);
console.log('All versions for this model:', rawData.filter(item => item.deviceModel === deviceModelValue.value.value).map(item => item.versionNumber));
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
</style>