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
      <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'operation_10'">
        <a-space class="action-cell" direction="horizontal">
          <a class="view-link" @click="$emit('view-record', record)">查看</a>
          <a-divider type="vertical" />
          <a class="edit-link" @click="handleEditDeviceType(record)">编辑</a>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定要删除该设备型号吗?"
            @confirm="$emit('delete-record', record)"
          >
            <a class="danger-link">删除</a>
          </a-popconfirm>
        </a-space>
      </template>
      <template v-else-if="column.key === 'latestFirmwareVersion_7'">
        <a class="firmware-link">{{ record.latestFirmwareVersion }}</a>
      </template>
      <template v-else-if="column.key === 'creator_8'">
        <a-avatar size="small" style="margin-right: 4px;">3D</a-avatar>
        <span>3D</span>
      </template>
    </template>
      </a-table>
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
        <a-form-item label="设备型号" name="deviceModel" required>
          <a-input v-model:value="createDeviceTypeForm.deviceModel" placeholder="请输入" />
        </a-form-item>

        <a-form-item label="介绍" name="introduction" required>
          <a-textarea 
            v-model:value="createDeviceTypeForm.introduction" 
            placeholder="请输入" 
            :rows="4"
          />
        </a-form-item>

        <a-form-item label="是否开通4G" name="enable4G" required>
          <a-radio-group v-model:value="createDeviceTypeForm.enable4G">
            <a-radio value="yes">是</a-radio>
            <a-radio value="no">否</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="最新可更新的固件版本" name="latestFirmwareVersion">
          <a-select v-model:value="createDeviceTypeForm.latestFirmwareVersion" placeholder="请选择">
            <a-select-option value="ZSW V1.0.0">ZSW V1.0.0</a-select-option>
            <a-select-option value="ZSW V1.1.0">ZSW V1.1.0</a-select-option>
            <a-select-option value="ZSW V1.2.0">ZSW V1.2.0</a-select-option>
            <a-select-option value="ZSW V2.0.0">ZSW V2.0.0</a-select-option>
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
        <a-form-item label="设备型号" name="deviceModel" required>
          <a-input v-model:value="editDeviceTypeForm.deviceModel" placeholder="请输入" />
        </a-form-item>

        <a-form-item label="介绍" name="introduction" required>
          <a-textarea 
            v-model:value="editDeviceTypeForm.introduction" 
            placeholder="请输入" 
            :rows="4"
          />
        </a-form-item>

        <a-form-item label="是否开通4G" name="enable4G" required>
          <a-radio-group v-model:value="editDeviceTypeForm.enable4G">
            <a-radio value="yes">是</a-radio>
            <a-radio value="no">否</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="最新可更新的固件版本" name="latestFirmwareVersion">
          <a-select v-model:value="editDeviceTypeForm.latestFirmwareVersion" placeholder="请选择">
            <a-select-option value="HWZ001 V 1.0.0">HWZ001 V 1.0.0</a-select-option>
            <a-select-option value="HWZ001 V 1.1.0">HWZ001 V 1.1.0</a-select-option>
            <a-select-option value="HWZ001 V 1.2.0">HWZ001 V 1.2.0</a-select-option>
            <a-select-option value="HWZ001 V 2.0.0">HWZ001 V 2.0.0</a-select-option>
            <a-select-option value="ZSW V1.0.0">ZSW V1.0.0</a-select-option>
            <a-select-option value="ZSW V1.1.0">ZSW V1.1.0</a-select-option>
            <a-select-option value="ZSW V1.2.0">ZSW V1.2.0</a-select-option>
            <a-select-option value="ZSW V2.0.0">ZSW V2.0.0</a-select-option>
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
import { ReloadOutlined, ColumnHeightOutlined ,SettingOutlined, SearchOutlined} from '@ant-design/icons-vue';
import draggable from 'vuedraggable';

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '', // Override the '页' suffix for quick jumper
  },
}));

interface DataItem {
  key: number;
  deviceModelId: string; // 设备型号ID
  deviceModelName: string; // 设备型号名称
  productName: string; // 产品名称
  productId: string; // 产品ID
  firmwareVersion: string; // 固件版本
  latestFirmwareVersion: string; // 最新可更新固件版本
  creator: string; // 创建人
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
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
  sortOrder?: 'ascend' | 'descend';
  defaultSortOrder?: 'ascend' | 'descend';
  customRender?: (record: any) => string | number;
  className?: string;
}

const columnConfigs: ColumnConfig[] = [
  { key: 'rowIndex', title: '序号', dataIndex: 'rowIndex', width: 60, fixed: 'left', customRender: ({ index }) => (currentPage.value - 1) * pageSize.value + index + 1 },
  { key: 'deviceModelId_1', title: '设备型号ID', dataIndex: 'deviceModelId', width: 150 },
  { key: 'deviceModelName_2', title: '设备型号名称', dataIndex: 'deviceModelName', width: 300 },
  { key: 'productName_3', title: '产品名称', dataIndex: 'productName', width: 120 },
  { key: 'productId_4', title: '产品ID', dataIndex: 'productId', width: 120 },
  { key: 'firmwareVersion_5', title: '固件版本', dataIndex: 'firmwareVersion', width: 150 },
  { key: 'latestFirmwareVersion_6', title: '最新可更新固件版本', dataIndex: 'latestFirmwareVersion', width: 200 },
  { key: 'creator_7', title: '创建人', dataIndex: 'creator', width: 100 },
  { key: 'createdAt_8', title: '创建时间', dataIndex: 'createdAt', width: 150, sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'updatedAt_9', title: '更新时间', dataIndex: 'updatedAt', width: 150, sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'operation_10', title: '操作', dataIndex: '', width: 150, fixed: 'right' },
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

const rawData: DataItem[] = [];
const deviceModelNames = [
  'ESP32-S3芯片，带WIFI和蓝牙功能，加入4G模块，支持语音识别和语音合成',
  'ESP32-S3芯片，带WIFI和蓝牙功能，加入4G模块，支持语音识别和语音合成，支持AI对话',
  'ESP32-S3芯片，带WIFI和蓝牙功能，加入4G模块，支持语音识别和语音合成，支持AI对话，支持情感识别',
  'ESP32-S3芯片，带WIFI和蓝牙功能，加入4G模块，支持语音识别和语音合成，支持AI对话，支持情感识别，支持多模态交互'
];
const productNames = ['HXZ001', 'HXZ002', 'HXZ003', 'HXZ004'];
const firmwareVersions = ['ZSW V1.0.0', 'ZSW V1.1.0', 'ZSW V1.2.0', 'ZSW V2.0.0'];

for (let i = 0; i < 100; i++) {
  const date = new Date(2025, 6, 12, 19, 25, 11); // Example base date
  date.setDate(date.getDate() + i); // Vary date by day for each record
  date.setHours(date.getHours() + (i % 24)); // Vary hours
  date.setMinutes(date.getMinutes() + (i % 60)); // Vary minutes
  date.setSeconds(date.getSeconds() + (i % 60)); // Vary seconds

  const createdAt = date.toISOString().slice(0, 19).replace('T', ' ');
  const updatedDate = new Date(date);
  updatedDate.setHours(date.getHours() + 2);
  const updatedAt = updatedDate.toISOString().slice(0, 19).replace('T', ' ');

  rawData.push({
    key: i + 1,
    deviceModelId: `njhwr800y${27 + i}`,
    deviceModelName: deviceModelNames[i % deviceModelNames.length],
    productName: productNames[i % productNames.length],
    productId: productNames[i % productNames.length],
    firmwareVersion: firmwareVersions[i % firmwareVersions.length],
    latestFirmwareVersion: firmwareVersions[i % firmwareVersions.length],
    creator: '3D',
    createdAt: createdAt,
    updatedAt: updatedAt,
  });
}

console.log('Raw Data:', rawData);

const currentPage = ref(1);
const pageSize = ref(10);

const sorterInfo = ref<any>({
  columnKey: 'updatedAt',
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

  // Simulate data fetching
  setTimeout(() => {
    loading.value = false; // Hide loading icon after a delay
  }, 500); // Adjust delay as needed
};

const filteredData = computed(() => {
  let dataToFilter = rawData;

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
      columnKey: 'updatedAt',
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

const handleCreateDeviceType = () => {
  console.log('Create device type button clicked');
  showCreateDeviceTypeModal.value = true;
};

// Create device type modal state variables
const showCreateDeviceTypeModal = ref(false);
const createDeviceTypeForm = ref({
  deviceModel: '',
  introduction: '',
  enable4G: 'yes',
  latestFirmwareVersion: ''
});

const createDeviceTypeFormRules = {
  deviceModel: [{ required: true, message: '请输入设备型号', trigger: 'blur' }],
  introduction: [{ required: true, message: '请输入介绍', trigger: 'blur' }],
  enable4G: [{ required: true, message: '请选择是否开通4G', trigger: 'change' }]
};

const createDeviceTypeFormRef = ref();

// Create device type modal handlers
const handleCreateDeviceTypeModalCancel = () => {
  showCreateDeviceTypeModal.value = false;
  createDeviceTypeFormRef.value?.resetFields();
  // Reset form data
  createDeviceTypeForm.value = {
    deviceModel: '',
    introduction: '',
    enable4G: 'yes',
    latestFirmwareVersion: ''
  };
};

const handleCreateDeviceTypeModalConfirm = async () => {
  try {
    await createDeviceTypeFormRef.value?.validate();
    console.log('Create device type form data:', createDeviceTypeForm.value);
    // Here you would typically send the data to your API
    showCreateDeviceTypeModal.value = false;
    createDeviceTypeFormRef.value?.resetFields();
  } catch (error) {
    console.error('Form validation failed:', error);
  }
};

// Edit device type modal state variables
const showEditDeviceTypeModal = ref(false);
const editDeviceTypeForm = ref({
  deviceModel: '',
  introduction: '',
  enable4G: 'yes',
  latestFirmwareVersion: ''
});

const editDeviceTypeFormRules = {
  deviceModel: [{ required: true, message: '请输入设备型号', trigger: 'blur' }],
  introduction: [{ required: true, message: '请输入介绍', trigger: 'blur' }],
  enable4G: [{ required: true, message: '请选择是否开通4G', trigger: 'change' }]
};

const editDeviceTypeFormRef = ref();

// Edit device type modal handlers
const handleEditDeviceTypeModalCancel = () => {
  showEditDeviceTypeModal.value = false;
  editDeviceTypeFormRef.value?.resetFields();
  // Reset form data
  editDeviceTypeForm.value = {
    deviceModel: '',
    introduction: '',
    enable4G: 'yes',
    latestFirmwareVersion: ''
  };
};

const handleEditDeviceTypeModalConfirm = async () => {
  try {
    await editDeviceTypeFormRef.value?.validate();
    console.log('Edit device type form data:', editDeviceTypeForm.value);
    // Here you would typically send the data to your API
    showEditDeviceTypeModal.value = false;
    editDeviceTypeFormRef.value?.resetFields();
  } catch (error) {
    console.error('Form validation failed:', error);
  }
};

const handleEditDeviceType = (record: DataItem) => {
  console.log('Edit device type clicked for record:', record);
  // Pre-fill the form with data from the selected row
  editDeviceTypeForm.value = {
    deviceModel: record.productName || 'HWZ001',
    introduction: record.deviceModelName || 'ESP32-S3芯片,自带Wi-Fi和蓝牙功能,加入4G模块,支持语音识别和语音合成',
    enable4G: 'yes', // Default to yes for 4G enabled devices
    latestFirmwareVersion: record.latestFirmwareVersion || 'HWZ001 V 1.0.0'
  };
  showEditDeviceTypeModal.value = true;
};

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

:deep(.firmware-link) {
  color: #1890ff !important; /* Ant Design blue */
  text-decoration: underline;
  cursor: pointer;
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
</style> 