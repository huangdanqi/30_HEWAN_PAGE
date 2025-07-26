<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>IP管理</h2>
    </div>

    <!-- select item area -->
    <div class="top-controls-wrapper">
      <!-- <div class="left-aligned-section">

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
      </div> -->
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
    
            <a-button type="primary" @click="showCreateIpModal = true">新建 IP</a-button>
        
          <ReloadOutlined @click="onRefresh" />
          <a-dropdown>
            <ColumnHeightOutlined @click.prevent />
            <a-menu @click="handleMenuClick">
              <a-menu-item key="large">宽松</a-menu-item>
              <a-menu-item key="middle">中等</a-menu-item>
              <a-menu-item key="small">紧凑</a-menu-item>
            </a-menu>
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
          <a class="view-link">查看</a>
          <a-divider type="vertical" />
          <a class="edit-link" @click="handleEditClick(record)">编辑</a>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定要删除该信息吗?"
            @confirm="$emit('delete-record', record)"
          >
            <a class="danger-link">删除</a>
          </a-popconfirm>
        </a-space>
      </template>
      <template v-else-if="column.key === 'updater'">
        <span>33</span>
      </template>
    </template>
      </a-table>
    </div>

    <FirmwareReleaseModal
      :visible="showReleaseModal"
      @update:visible="handleReleaseModalClose"
      @submit="handleReleaseModalSubmit"
    />

    <a-modal
      v-model:visible="showCreateIpModal"
      title="新建IP"
      :footer="null"
      width="500px"
    >
      <a-form layout="vertical">
        <a-form-item required>
          <template #label>
            IP名称
          </template>
          <a-input placeholder="请输入" />
        </a-form-item>
        <a-form-item key="create-ip-intro-field" required>
          <template #label>
            IP介绍
          </template>
          <a-textarea placeholder="请输入" rows="4" />
        </a-form-item>
        <a-form-item label="Agent名称">
          <a-select placeholder="请选择">
            <a-select-option value="agent1">啵啵多模态情感陪伴智能体</a-select-option>
            <a-select-option value="agent2">其他智能体</a-select-option>
          </a-select>
        </a-form-item>
        <div style="display: flex; justify-content: flex-end; gap: 16px; margin-top: 24px;">
          <a-button @click="showCreateIpModal = false">取消</a-button>
          <a-button type="primary">确定</a-button>
        </div>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="showEditModal"
      title="编辑IP"
      :footer="null"
      width="500px"
    >
      <a-form layout="vertical" :model="editFormData">
        <a-form-item required>
          <template #label>
           IP名称
          </template>
          <a-input v-model:value="editFormData.ipName" placeholder="请输入" />
        </a-form-item>
        <a-form-item key="ip-intro-field" required>
          <template #label>
           IP介绍
          </template>
          <a-textarea v-model:value="editFormData.ipIntro" placeholder="请输入" rows="4" />
        </a-form-item>
        <a-form-item label="Agent名称">
          <a-select v-model:value="editFormData.agentName" placeholder="请选择">
            <a-select-option value="啵啵多模态情感陪伴智能体">啵啵多模态情感陪伴智能体</a-select-option>
            <a-select-option value="其他智能体">其他智能体</a-select-option>
          </a-select>
        </a-form-item>
        <div style="display: flex; justify-content: flex-end; gap: 16px; margin-top: 24px;">
          <a-button @click="showEditModal = false">取消</a-button>
          <a-button type="primary" @click="handleEditSubmit">确定</a-button>
        </div>
      </a-form>
    </a-modal>

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

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '', // Override the '页' suffix for quick jumper
  },
}));

interface DataItem {
  ipId: string;
  ipName: string;
  ipIntro: string;
  agentName: string;
  updater: string;
  createTime: string;
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
  { key: 'ipId', title: 'IP ID', dataIndex: 'ipId', width: 120 },
  { key: 'ipName', title: 'IP名称', dataIndex: 'ipName', width: 120 },
  { key: 'ipIntro', title: 'IP介绍', dataIndex: 'ipIntro', width: 320 },
  { key: 'agentName', title: 'Agent名称', dataIndex: 'agentName', width: 250 },
  { key: 'updater', title: '更新人', dataIndex: 'updater', width: 100 },
  { key: 'createTime', title: '创建时间', dataIndex: 'createTime', width: 160, sorter: (a: any, b: any) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'updateTime', title: '更新时间', dataIndex: 'updateTime', width: 160, sorter: (a: any, b: any) => new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'operation', title: '操作', dataIndex: '', width: 200, fixed: 'right' },
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

// Update the rawData to match the image content
const rawData = Array.from({ length: 10 }, (_, i) => ({
  ipId: 'hjhwn832nj2f',
  ipName: '啵啵',
  ipIntro: '星座:白羊座;MBTI: INFP;属性:火;性格:...',
  agentName: '啵啵多模态情感陪伴智能体',
  updater: '33',
  createTime: `2025-7-13 19:25:11`,
  updateTime: `2025-7-13 19:25:11`,
}));

console.log('Raw Data:', rawData);

const currentPage = ref(1);
const pageSize = ref(10);

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

const handleReleaseModalClose = () => {
  showReleaseModal.value = false;
};

const handleReleaseModalSubmit = (_data: any) => {
  // You can handle the submit data here
  showReleaseModal.value = false;
};

const showEditModal = ref(false);
const editRecord = ref<any>(null);

const editFormData = ref({
  ipName: '',
  ipIntro: '',
  agentName: ''
});

const handleEditClick = (record: DataItem) => {
  editRecord.value = record;
  // Pre-fill the form with record data
  editFormData.value = {
    ipName: record.ipName,
    ipIntro: record.ipIntro,
    agentName: record.agentName
  };
  showEditModal.value = true;
};

const handleEditModalClose = () => {
  showEditModal.value = false;
  editRecord.value = null;
  editFormData.value = {
    ipName: '',
    ipIntro: '',
    agentName: ''
  };
};

const handleEditSubmit = () => {
  // Update the record in the table data
  if (editRecord.value) {
    const index = rawData.findIndex(item => item.ipId === editRecord.value.ipId);
    if (index !== -1) {
      rawData[index] = {
        ...rawData[index],
        ipName: editFormData.value.ipName,
        ipIntro: editFormData.value.ipIntro,
        agentName: editFormData.value.agentName,
        updateTime: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      };
    }
  }
  message.success('更新成功');
  showEditModal.value = false;
  editRecord.value = null;
  editFormData.value = {
    ipName: '',
    ipIntro: '',
    agentName: ''
  };
};

const showCreateIpModal = ref(false);

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
  margin-left: auto;
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

/* Make the action buttons horizontal and style '编辑' as blue and bold */
:deep(.ant-table-cell .action-cell) {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 180px;
  flex-wrap: wrap;
}
:deep(.ant-table-cell .action-cell .view-link) {
  color: #1890ff !important; /* Ant Design blue */
  font-weight: bold;
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
</style>