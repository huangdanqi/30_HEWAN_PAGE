<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>设备OTA</h2>
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
          <a-button type="primary" @click="handleAddBatchClick">设备导入</a-button>
          <a-button type="primary" @click="otaConfigModalVisible = true">OTA配置</a-button>
          <!-- <a-button type="primary" @click="handleVersionRelease">版本发布</a-button> -->
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
                @change="($event: any) => handleColumnVisibilityChange(colKey, ($event.target as HTMLInputElement).checked)"
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
        :scroll="{ x: 3000 }"
        @change="handleTableChange"
        :showSorterTooltip="false"
      >
      <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'operation_24'">
        <a-space class="action-cell" direction="horizontal">
          <a class="edit-link" @click="$emit('edit-record', record)">编辑</a>
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

    <DeviceImportModal
      v-model:visible="deviceImportModalVisible"
      :deviceModelOptions="deviceModelOptions"
      :manufacturerOptions="manufacturerOptions"
      :productionBatchOptions="productionBatchOptions"
      @finish="handleDeviceImportFinish"
    />

    <OtaConfigModal
      v-model:visible="otaConfigModalVisible"
      :deviceModelOptions="deviceModelOptions"
      :latestFirmwareOptions="latestFirmwareOptions"
      v-model:deviceModelValue="otaModalDeviceModelValue"
      v-model:latestFirmwareValue="otaModalLatestFirmwareValue"
      @ok="handleOtaConfigOk"
    />

  </a-config-provider>
</template>
<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme } from 'ant-design-vue';
import { ReloadOutlined, ColumnHeightOutlined ,SettingOutlined, SearchOutlined} from '@ant-design/icons-vue';
import draggable from 'vuedraggable';
import type { ColumnsType } from 'ant-design-vue/es/table';
import DeviceImportModal from '@/components/DeviceImportModal.vue';
import OtaConfigModal from '@/components/OtaConfigModal.vue';

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '', // Override the '页' suffix for quick jumper
  },
}));

interface DataItem {
  key: number;
  accountId: string; // 账户ID
  phoneNumber: string; // 手机号
  deviceModel: string; // 设备型号
  deviceId: string; // 设备ID
  productId: string; // 商品ID
  ipRole: string; // IP角色
  productModel: string; // 产品型号
  currentMemberType: string; // 当前会员类型
  memberPayment: string; // 会员付费
  memberActivationTime: string; // 会员激活时间
  memberExpirationTime: string; // 会员到期时间
  fourGCardNumber: string; // 4G卡号
  fourGPlan: string; // 4G套餐
  remainingDataThisMonth: string; // 当月剩余流量
  fourGPayment: string; // 4G付费
  fourGActivationTime: string; // 4G激活时间
  fourGExpirationTime: string; // 4G到期时间
  serviceAnnualFeeBalance: number; // 服务年费用余额 (元)
  asrAnnualUsage: string; // ASR年用量
  llmAnnualUsage: string; // LLM年用量
  ttsAnnualUsage: string; // TTS年用量
  voiceCloneAnnualUsage: string; // 音色克隆年用量
  registrationTime: string; // 注册时间
  bindAccount: string; // 绑定子账户
  productionBatch: string; // 生产批次
  manufacturer: string; // 生产厂家
  initFirmware: string; // 初始固件
  latestFirmware: string; // 最新固件
  currentFirmware: string; // 当前固件版本
  sn: string; // SN码
  efuseId: string; // eFuse ID
  mac: string; // MAC地址
  tempName: string; // 温子名称
  imei: string; // IMEI
  sim: string; // 4G卡号
  cpu: string; // CPU序列
  creator: string; // 创建人
  createTime: string; // 创建时间
  updateTime: string; // 更新时间
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

const columnConfigs: ColumnConfig[] = [
  { key: 'rowIndex', title: '序号', dataIndex: 'rowIndex', width: 60, fixed: 'left', customRender: ({ index }) => (currentPage.value - 1) * pageSize.value + index + 1 },
  { key: 'deviceId', title: '设备ID', dataIndex: 'deviceId', width: 200 },
  { key: 'bindAccount', title: '绑定子账户', dataIndex: 'bindAccount', width: 120 },
  { key: 'deviceModel', title: '设备型号', dataIndex: 'deviceModel', width: 100 },
  { key: 'productionBatch', title: '生产批次', dataIndex: 'productionBatch', width: 120 },
  { key: 'manufacturer', title: '生产厂家', dataIndex: 'manufacturer', width: 180 },
  { key: 'initFirmware', title: '初始固件', dataIndex: 'initFirmware', width: 120 },
  { key: 'latestFirmware', title: '最新固件', dataIndex: 'latestFirmware', width: 120 },
  { key: 'currentFirmware', title: '当前固件版本', dataIndex: 'currentFirmware', width: 120 },
  { key: 'sn', title: 'SN码', dataIndex: 'sn', width: 180 },
  { key: 'efuseId', title: 'eFuse ID', dataIndex: 'efuseId', width: 180 },
  { key: 'mac', title: 'MAC地址', dataIndex: 'mac', width: 160 },
  { key: 'tempName', title: '蓝牙名称', dataIndex: 'tempName', width: 160 },
  { key: 'imei', title: 'IMEI', dataIndex: 'imei', width: 160 },
  { key: 'sim', title: '4G卡号', dataIndex: 'sim', width: 160 },
  { key: 'cpu', title: 'CPU序列', dataIndex: 'cpu', width: 120 },
  { key: 'creator', title: '创建人', dataIndex: 'creator', width: 80 },
  { key: 'createTime', title: '创建时间', dataIndex: 'createTime', width: 160, 
    sorter: (a: any, b: any) => a.createTime.localeCompare(b.createTime),
    sortDirections: ['ascend', 'descend'] },
  { key: 'updateTime', title: '更新时间', dataIndex: 'updateTime', width: 160, 
    sorter: (a: any, b: any) => a.updateTime.localeCompare(b.updateTime),
    sortDirections: ['ascend', 'descend'],
    defaultSortOrder: 'descend' },
  // { key: 'operation_24', title: '操作', dataIndex: 'operation_24', width: 120, fixed: 'right' }
];

const selectedColumnKeys = ref<string[]>(columnConfigs.map(c => c.key));
const columnOrder = ref<string[]>(columnConfigs.map(c => c.key));

const columns = computed(() => {
  const orderedAndVisibleConfigs = columnOrder.value
    .map(key => columnConfigs.find(c => c.key === key))
    .filter((c): c is ColumnConfig => !!c && selectedColumnKeys.value.includes(c.key));

  return orderedAndVisibleConfigs.map(config => {
    const col = {
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
        : ({ text }: { text: string | number | undefined }) => (text === undefined || text === null || text === '' ? '-' : text),
    className: config.className,
    } as ColumnsType[number];

    return col;
  });
});

const rawData = ref<DataItem[]>([]);
const sorterInfo = ref({ columnKey: 'updateTime', order: 'descend' });

onMounted(async () => {
  rawData.value = [...mockData]; 
  console.log('Raw Data:', rawData.value);
});

const deviceModelValue = ref({ value: 'all', label: '全部' });
const manufacturerValue = ref({ value: 'all', label: '全部' });

const deviceModelOptions = computed(() => {
  const options = new Set<string>();
  mockData.forEach(item => {
    if (item.deviceModel) {
      options.add(item.deviceModel);
    }
  });
  return Array.from(options).map(option => ({
    label: option,
    value: option,
  }));
});

const handleDeviceModelChange = (val: any) => {
  if (val && val.value) {
    console.log('Selected Device Model:', val.label);
  } else {
    console.log('Device Model cleared');
  }
};

const manufacturerOptions = computed(() => {
  const options = new Set<string>();
  mockData.forEach(item => {
    if (item.manufacturer) {
      options.add(item.manufacturer);
    }
  });
  return Array.from(options).map(option => ({
    label: option,
    value: option,
  }));
});

const handleManufacturerChange = (val: any) => {
  if (val && val.value) {
    console.log('Selected Manufacturer:', val.label);
  } else {
    console.log('Manufacturer cleared');
  }
};

const productionBatchOptions = computed(() => {
  const options = new Set<string>();
  mockData.forEach(item => {
    if (item.productionBatch) {
      options.add(item.productionBatch);
    }
  });
  return Array.from(options).map(option => ({
    label: option,
    value: option,
  }));
});

const latestFirmwareOptions = computed(() => {
  const options = new Set<string>();
  mockData.forEach(item => {
    if (item.latestFirmware) {
      options.add(item.latestFirmware);
    }
  });
  return Array.from(options).map(option => ({
    label: option,
    value: option,
  }));
});

const searchInputValue = ref('');

const filteredData = computed(() => {
  let data = rawData.value;
  if (searchInputValue.value) {
    data = data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchInputValue.value.toLowerCase())
      )
    );
  }
  return data;
});

const loading = ref(false);

const onRefresh = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 1000);
};

const tableSize = ref('middle');

const handleMenuClick = (e: any) => {
  if (e.key === 'large' || e.key === 'middle' || e.key === 'small') {
    tableSize.value = e.key;
  }
};

const onSettingClick = () => {
  console.log('Settings icon clicked');
};

const resetColumns = () => {
  selectedColumnKeys.value = columnConfigs.map(c => c.key);
  columnOrder.value = columnConfigs.map(c => c.key);
};

const handleColumnVisibilityChange = (key: string, checked: boolean) => {
  if (checked) {
      selectedColumnKeys.value.push(key);
  } else {
    selectedColumnKeys.value = selectedColumnKeys.value.filter(k => k !== key);
  }
};

const onColumnOrderChange = (event: any) => {
  const { oldIndex, newIndex } = event;
  const item = columnOrder.value.splice(oldIndex, 1)[0];
  columnOrder.value.splice(newIndex, 0, item);
};

const currentPage = ref(1);
const pageSize = ref(10);
const total = computed(() => filteredData.value.length);

const pagination = computed(() => ({
  total: total.value,
  current: currentPage.value,
  pageSize: pageSize.value,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '30', '40', '50', '100'],
  showTotal: (total: number) => `共 ${total} 条`,
  position: ['bottomRight'],
}));

const handleTableChange = ( newPagination: any, filters: any, sorter: any) => {
  console.log('Table changed:', newPagination, filters, sorter);
  currentPage.value = newPagination.current;
  pageSize.value = newPagination.pageSize;
  sorterInfo.value = sorter;
};

const deviceImportModalVisible = ref(false);

const handleAddBatchClick = () => {
  deviceImportModalVisible.value = true;
};

const handleDeviceImportFinish = (values: any) => {
  console.log('Device import finished with values:', values);
  deviceImportModalVisible.value = false;
};

const otaConfigModalVisible = ref(false);
const otaModalDeviceModelValue = ref();
const otaModalLatestFirmwareValue = ref();

const handleOtaConfigOk = () => {
  console.log('OTA Config OK');
  otaConfigModalVisible.value = false;
};

const mockData: DataItem[] = Array.from({ length: 100 }, (_, i) => {
  const createMinute = 25 + Math.floor(i / 60);
  const createSecond = i % 60;
  const updateMinute = 30 + Math.floor(i / 60);
  const updateSecond = i % 60;

  return {
    key: i + 1,
    accountId: `jkhg824&3*g${i + 1}`,
    phoneNumber: `183****795${i % 10}`,
    deviceModel: `HWSZ001`,
    deviceId: `0075A1B2SZTDS250619B2X9J${i.toString().padStart(2, '0')}`,
    productId: `hjhtwn832nj${i + 1}`,
    ipRole: `王龙${i + 1}`,
    productModel: `HWSZ00100${i + 1}`,
    currentMemberType: i % 3 === 0 ? 'VIP' : i % 2 === 0 ? '普通会员' : 'SVIP',
    memberPayment: i % 2 === 0 ? '自动续费' : '赠送',
    memberActivationTime: `2025-06-01 10:00:00`,
    memberExpirationTime: `2026-06-01 10:00:00`,
    fourGCardNumber: `147762943013${i.toString().padStart(2, '0')}`,
    fourGPlan: i % 2 === 0 ? '500M/月' : '1G/月',
    remainingDataThisMonth: `${i * 10}M`,
    fourGPayment: i % 2 === 0 ? '自动续费' : '赠送',
    fourGActivationTime: `2025-06-01 10:00:00`,
    fourGExpirationTime: `2026-06-01 10:00:00`,
    serviceAnnualFeeBalance: 26.35,
    asrAnnualUsage: `384,3848 tokens`,
    llmAnnualUsage: `384,3848 tokens`,
    ttsAnnualUsage: `213.55 h`,
    voiceCloneAnnualUsage: `213.55 h`,
    registrationTime: `2025-06-01 10:00:00`,
    bindAccount: i % 4 === 0 ? '-' : `183****795${i % 10}`,
    productionBatch: `2025-06-30`,
    manufacturer: `深圳天德胜科技有限公司`,
    initFirmware: `Z001 V 1.0.1`,
    latestFirmware: `Z001 V 2.0.1`,
    currentFirmware: `Z001 V 1.3.0`,
    sn: `SZTDS250619B2X9J${i.toString().padStart(2, '0')}`,
    efuseId: `ESP32-0075A1B${i.toString().padStart(2, '0')}`,
    mac: `DC:54:75:62:66:7${i % 10}`,
    tempName: `Zibbi 001 250619B${i.toString().padStart(2, '0')}`,
    imei: `3538010036017${i.toString().padStart(2, '0')}`,
    sim: `147762943013${i.toString().padStart(2, '0')}`,
    cpu: `0x1FFFF7E${i + 8}`,
    creator: `33`,
    createTime: `2025-07-13 19:${String(createMinute).padStart(2, '0')}:${String(createSecond).padStart(2, '0')}`,
    updateTime: `2025-07-13 19:${String(updateMinute).padStart(2, '0')}:${String(updateSecond).padStart(2, '0')}`,
  };
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

:deep(.member-type-select .ant-select-selector) {
  padding-left: 90px !important;
}

:deep(.ip-role-select .ant-select-selector) {
  padding-left: 50px !important;
}

:deep(.member-payment-select .ant-select-selector) {
  padding-left: 65px !important;
}

:deep(.manufacturer-select .ant-select-selector) {
  padding-left: 65px !important;
}

:deep(.device-model-select .ant-select-selector) {
  padding-left: 65px !important;
}

:deep(.nowrap-header) {
  white-space: nowrap !important;
}
</style>