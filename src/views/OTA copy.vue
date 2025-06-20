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
  { key: 'deviceId', title: '设备ID', dataIndex: 'deviceId', width: 180 },
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
  { key: 'tempName', title: '温子名称', dataIndex: 'tempName', width: 160 },
  { key: 'imei', title: 'IMEI', dataIndex: 'imei', width: 160 },
  { key: 'sim', title: '4G卡号', dataIndex: 'sim', width: 160 },
  { key: 'cpu', title: 'CPU序列', dataIndex: 'cpu', width: 120 },
  { key: 'creator', title: '创建人', dataIndex: 'creator', width: 80 },
  { key: 'createTime', title: '创建时间', dataIndex: 'createTime', width: 160, 
    sorter: (a: any, b: any) => a.createTime.localeCompare(b.createTime),
    sortDirections: ['ascend', 'descend'] },
  { key: 'updateTime', title: '更新时间', dataIndex: 'updateTime', width: 160, 
    sorter: (a: any, b: any) => a.updateTime.localeCompare(b.updateTime),
    sortDirections: ['ascend', 'descend'] },
  // { key: 'operation_24', title: '操作', dataIndex: '', width: 100, fixed: 'right' },
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
    defaultSortOrder: config.defaultSortOrder,
    customRender: config.customRender
      ? config.customRender
      : ({ text }: { text: string | number | undefined }) => (text === undefined || text === null || text === '' ? '-' : text),
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
  return visibleColumns.sort((a: any, b: any) => {
    const fixedOrder = { 'left': 1, undefined: 2, 'right': 3 };
    const aFixed = fixedOrder[a.fixed as keyof typeof fixedOrder] || 2;
    const bFixed = fixedOrder[b.fixed as keyof typeof fixedOrder] || 2;
    return aFixed - bFixed;
  });
});

const rawData: DataItem[] = [
  {
    key: 1,
    accountId: 'jkhg824&3*g1',
    phoneNumber: '183****7953',
    deviceModel: 'HWSZ001',
    deviceId: '0075A1B2SZTD...XJ8',
    productId: 'hjhtwn832nj1',
    ipRole: '王龙',
    productModel: 'HWSZ001001',
    currentMemberType: 'VIP',
    memberPayment: '自动续费',
    memberActivationTime: '2025-06-01 10:00:00',
    memberExpirationTime: '2026-06-01 10:00:00',
    fourGCardNumber: '1477629430136',
    fourGPlan: '500M/月',
    remainingDataThisMonth: '20M',
    fourGPayment: '自动续费',
    fourGActivationTime: '2025-06-01 10:00:00',
    fourGExpirationTime: '2026-06-01 10:00:00',
    serviceAnnualFeeBalance: 26.35,
    asrAnnualUsage: '384,3848 tokens',
    llmAnnualUsage: '384,3848 tokens',
    ttsAnnualUsage: '213.55 h',
    voiceCloneAnnualUsage: '213.55 h',
    registrationTime: '2025-06-01 10:00:00',
    bindAccount: '183****7953',
    productionBatch: '2025-06-30',
    manufacturer: '深圳沃能威科技有限公司',
    initFirmware: 'Z001 V 1.0.1',
    latestFirmware: 'Z001 V 2.0.1',
    currentFirmware: 'Z001 V 1.3.0',
    sn: 'SZTD...XJ8',
    efuseId: 'ESP32-0075A1B2',
    mac: 'DC:54:75:62:66:70',
    tempName: 'Zibbi 001 250619XJ8',
    imei: '35380100360174',
    sim: '1477629430136',
    cpu: '0x1FFFF7E8',
    creator: '33',
    createTime: '2025-7-13 19:25:11',
    updateTime: '2025-7-13 19:25:11',
  },
  {
    key: 2,
    accountId: 'jkhg824&3*g2',
    phoneNumber: '183****7954',
    deviceModel: 'HWSZ002',
    deviceId: '0075A1B2SZTD...XJ9',
    productId: 'hjhtwn832nj2',
    ipRole: '张三',
    productModel: 'HWSZ001002',
    currentMemberType: '普通会员',
    memberPayment: '赠送',
    memberActivationTime: '2025-07-01 11:00:00',
    memberExpirationTime: '2026-07-01 11:00:00',
    fourGCardNumber: '1477629430137',
    fourGPlan: '1G/月',
    remainingDataThisMonth: '50M',
    fourGPayment: '赠送',
    fourGActivationTime: '2025-07-01 11:00:00',
    fourGExpirationTime: '2026-07-01 11:00:00',
    serviceAnnualFeeBalance: 30.00,
    asrAnnualUsage: '100,000 tokens',
    llmAnnualUsage: '200,000 tokens',
    ttsAnnualUsage: '100.00 h',
    voiceCloneAnnualUsage: '50.00 h',
    registrationTime: '2025-07-01 11:00:00',
    bindAccount: '183****7954',
    productionBatch: '2025-07-30',
    manufacturer: '深圳沃能威科技有限公司',
    initFirmware: 'Z002 V 1.0.0',
    latestFirmware: 'Z002 V 2.0.0',
    currentFirmware: 'Z002 V 1.2.0',
    sn: 'SZTD...XJ9',
    efuseId: 'ESP32-0075A1B3',
    mac: 'DC:54:75:62:66:71',
    tempName: 'Zibbi 002 250619XJ9',
    imei: '35380100360175',
    sim: '1477629430137',
    cpu: '0x1FFFF7E9',
    creator: '34',
    createTime: '2025-8-13 19:25:11',
    updateTime: '2025-8-13 19:25:11',
  },
  {
    key: 3,
    accountId: 'jkhg824&3*g3',
    phoneNumber: '183****7955',
    deviceModel: 'HWSZ003',
    deviceId: '0075A1B2SZTD...XJ0',
    productId: 'hjhtwn832nj3',
    ipRole: '李四',
    productModel: 'HWSZ001003',
    currentMemberType: 'SVIP',
    memberPayment: '停止续费',
    memberActivationTime: '2025-08-01 12:00:00',
    memberExpirationTime: '2026-08-01 12:00:00',
    fourGCardNumber: '1477629430138',
    fourGPlan: '2G/月',
    remainingDataThisMonth: '100M',
    fourGPayment: '停止续费',
    fourGActivationTime: '2025-08-01 12:00:00',
    fourGExpirationTime: '2026-08-01 12:00:00',
    serviceAnnualFeeBalance: 15.50,
    asrAnnualUsage: '200,000 tokens',
    llmAnnualUsage: '300,000 tokens',
    ttsAnnualUsage: '150.00 h',
    voiceCloneAnnualUsage: '75.00 h',
    registrationTime: '2025-08-01 12:00:00',
    bindAccount: '183****7955',
    productionBatch: '2025-08-30',
    manufacturer: '深圳沃能威科技有限公司',
    initFirmware: 'Z003 V 1.0.0',
    latestFirmware: 'Z003 V 2.0.0',
    currentFirmware: 'Z003 V 1.2.0',
    sn: 'SZTD...XJ0',
    efuseId: 'ESP32-0075A1B4',
    mac: 'DC:54:75:62:66:72',
    tempName: 'Zibbi 003 250619XJ0',
    imei: '35380100360176',
    sim: '1477629430138',
    cpu: '0x1FFFF7EA',
    creator: '35',
    createTime: '2025-9-13 19:25:11',
    updateTime: '2025-9-13 19:25:11',
  },
  {
    key: 4,
    accountId: 'acc004',
    phoneNumber: '139****0004',
    deviceModel: 'HWSZ004',
    deviceId: '0075A1B2SZTD...XJ1',
    productId: 'prod004',
    ipRole: '赵五',
    productModel: 'HWSZ001004',
    currentMemberType: 'VIP',
    memberPayment: '自动续费',
    memberActivationTime: '2025-09-01 13:00:00',
    memberExpirationTime: '2026-09-01 13:00:00',
    fourGCardNumber: '1477629430139',
    fourGPlan: '3G/月',
    remainingDataThisMonth: '200M',
    fourGPayment: '自动续费',
    fourGActivationTime: '2025-09-01 13:00:00',
    fourGExpirationTime: '2026-09-01 13:00:00',
    serviceAnnualFeeBalance: 40.00,
    asrAnnualUsage: '500,000 tokens',
    llmAnnualUsage: '600,000 tokens',
    ttsAnnualUsage: '200.00 h',
    voiceCloneAnnualUsage: '100.00 h',
    registrationTime: '2025-09-01 13:00:00',
    bindAccount: '139****0004',
    productionBatch: '2025-09-30',
    manufacturer: '深圳沃能威科技有限公司',
    initFirmware: 'Z004 V 1.0.0',
    latestFirmware: 'Z004 V 2.0.0',
    currentFirmware: 'Z004 V 1.2.0',
    sn: 'SZTD...XJ1',
    efuseId: 'ESP32-0075A1B5',
    mac: 'DC:54:75:62:66:73',
    tempName: 'Zibbi 004 250619XJ1',
    imei: '35380100360177',
    sim: '1477629430139',
    cpu: '0x1FFFF7EB',
    creator: '36',
    createTime: '2025-10-13 19:25:11',
    updateTime: '2025-10-13 19:25:11',
  },
  {
    key: 5,
    accountId: 'acc005',
    phoneNumber: '139****0005',
    deviceModel: 'HWSZ005',
    deviceId: '0075A1B2SZTD...XJ2',
    productId: 'prod005',
    ipRole: '钱六',
    productModel: 'HWSZ001005',
    currentMemberType: '普通会员',
    memberPayment: '赠送',
    memberActivationTime: '2025-10-01 14:00:00',
    memberExpirationTime: '2026-10-01 14:00:00',
    fourGCardNumber: '1477629430140',
    fourGPlan: '500M/月',
    remainingDataThisMonth: '80M',
    fourGPayment: '赠送',
    fourGActivationTime: '2025-10-01 14:00:00',
    fourGExpirationTime: '2026-10-01 14:00:00',
    serviceAnnualFeeBalance: 22.00,
    asrAnnualUsage: '120,000 tokens',
    llmAnnualUsage: '220,000 tokens',
    ttsAnnualUsage: '110.00 h',
    voiceCloneAnnualUsage: '60.00 h',
    registrationTime: '2025-10-01 14:00:00',
    bindAccount: '139****0005',
    productionBatch: '2025-10-30',
    manufacturer: '深圳沃能威科技有限公司',
    initFirmware: 'Z005 V 1.0.0',
    latestFirmware: 'Z005 V 2.0.0',
    currentFirmware: 'Z005 V 1.2.0',
    sn: 'SZTD...XJ2',
    efuseId: 'ESP32-0075A1B6',
    mac: 'DC:54:75:62:66:74',
    tempName: 'Zibbi 005 250619XJ2',
    imei: '35380100360178',
    sim: '1477629430140',
    cpu: '0x1FFFF7EC',
    creator: '37',
    createTime: '2025-11-13 19:25:11',
    updateTime: '2025-11-13 19:25:11',
  },
  {
    key: 6,
    accountId: 'acc006',
    phoneNumber: '139****0006',
    deviceModel: 'HWSZ006',
    deviceId: '0075A1B2SZTD...XJ3',
    productId: 'prod006',
    ipRole: '孙七',
    productModel: 'HWSZ001006',
    currentMemberType: 'SVIP',
    memberPayment: '停止续费',
    memberActivationTime: '2025-11-01 15:00:00',
    memberExpirationTime: '2026-11-01 15:00:00',
    fourGCardNumber: '1477629430141',
    fourGPlan: '1G/月',
    remainingDataThisMonth: '120M',
    fourGPayment: '停止续费',
    fourGActivationTime: '2025-11-01 15:00:00',
    fourGExpirationTime: '2026-11-01 15:00:00',
    serviceAnnualFeeBalance: 18.75,
    asrAnnualUsage: '250,000 tokens',
    llmAnnualUsage: '350,000 tokens',
    ttsAnnualUsage: '160.00 h',
    voiceCloneAnnualUsage: '80.00 h',
    registrationTime: '2025-11-01 15:00:00',
    bindAccount: '139****0006',
    productionBatch: '2025-11-30',
    manufacturer: '深圳沃能威科技有限公司',
    initFirmware: 'Z006 V 1.0.0',
    latestFirmware: 'Z006 V 2.0.0',
    currentFirmware: 'Z006 V 1.2.0',
    sn: 'SZTD...XJ3',
    efuseId: 'ESP32-0075A1B7',
    mac: 'DC:54:75:62:66:75',
    tempName: 'Zibbi 006 250619XJ3',
    imei: '35380100360179',
    sim: '1477629430141',
    cpu: '0x1FFFF7ED',
    creator: '38',
    createTime: '2025-12-13 19:25:11',
    updateTime: '2025-12-13 19:25:11',
  },
  {
    key: 7,
    accountId: 'acc007',
    phoneNumber: '139****0007',
    deviceModel: 'HWSZ007',
    deviceId: '0075A1B2SZTD...XJ4',
    productId: 'prod007',
    ipRole: '周八',
    productModel: 'HWSZ001007',
    currentMemberType: 'VIP',
    memberPayment: '自动续费',
    memberActivationTime: '2025-12-01 16:00:00',
    memberExpirationTime: '2026-12-01 16:00:00',
    fourGCardNumber: '1477629430142',
    fourGPlan: '2G/月',
    remainingDataThisMonth: '300M',
    fourGPayment: '自动续费',
    fourGActivationTime: '2025-12-01 16:00:00',
    fourGExpirationTime: '2026-12-01 16:00:00',
    serviceAnnualFeeBalance: 50.00,
    asrAnnualUsage: '600,000 tokens',
    llmAnnualUsage: '700,000 tokens',
    ttsAnnualUsage: '250.00 h',
    voiceCloneAnnualUsage: '120.00 h',
    registrationTime: '2025-12-01 16:00:00',
    bindAccount: '139****0007',
    productionBatch: '2025-12-30',
    manufacturer: '深圳沃能威科技有限公司',
    initFirmware: 'Z007 V 1.0.0',
    latestFirmware: 'Z007 V 2.0.0',
    currentFirmware: 'Z007 V 1.2.0',
    sn: 'SZTD...XJ4',
    efuseId: 'ESP32-0075A1B8',
    mac: 'DC:54:75:62:66:76',
    tempName: 'Zibbi 007 250619XJ4',
    imei: '35380100360180',
    sim: '1477629430142',
    cpu: '0x1FFFF7EE',
    creator: '39',
    createTime: '2026-1-13 19:25:11',
    updateTime: '2026-1-13 19:25:11',
  },
  {
    key: 8,
    accountId: 'acc008',
    phoneNumber: '139****0008',
    deviceModel: 'HWSZ008',
    deviceId: '0075A1B2SZTD...XJ5',
    productId: 'prod008',
    ipRole: '吴九',
    productModel: 'HWSZ001008',
    currentMemberType: '普通会员',
    memberPayment: '赠送',
    memberActivationTime: '2026-01-01 17:00:00',
    memberExpirationTime: '2027-01-01 17:00:00',
    fourGCardNumber: '1477629430143',
    fourGPlan: '3G/月',
    remainingDataThisMonth: '400M',
    fourGPayment: '赠送',
    fourGActivationTime: '2026-01-01 17:00:00',
    fourGExpirationTime: '2027-01-01 17:00:00',
    serviceAnnualFeeBalance: 28.00,
    asrAnnualUsage: '130,000 tokens',
    llmAnnualUsage: '230,000 tokens',
    ttsAnnualUsage: '120.00 h',
    voiceCloneAnnualUsage: '70.00 h',
    registrationTime: '2026-01-01 17:00:00',
    bindAccount: '139****0008',
    productionBatch: '2026-01-30',
    manufacturer: '深圳沃能威科技有限公司',
    initFirmware: 'Z008 V 1.0.0',
    latestFirmware: 'Z008 V 2.0.0',
    currentFirmware: 'Z008 V 1.2.0',
    sn: 'SZTD...XJ5',
    efuseId: 'ESP32-0075A1B9',
    mac: 'DC:54:75:62:66:77',
    tempName: 'Zibbi 008 250619XJ5',
    imei: '35380100360181',
    sim: '1477629430143',
    cpu: '0x1FFFF7EF',
    creator: '40',
    createTime: '2026-2-13 19:25:11',
    updateTime: '2026-2-13 19:25:11',
  },
  {
    key: 9,
    accountId: 'acc009',
    phoneNumber: '139****0009',
    deviceModel: 'HWSZ009',
    deviceId: '0075A1B2SZTD...XJ6',
    productId: 'prod009',
    ipRole: '郑十',
    productModel: 'HWSZ001009',
    currentMemberType: 'SVIP',
    memberPayment: '停止续费',
    memberActivationTime: '2026-02-01 18:00:00',
    memberExpirationTime: '2027-02-01 18:00:00',
    fourGCardNumber: '1477629430144',
    fourGPlan: '500M/月',
    remainingDataThisMonth: '500M',
    fourGPayment: '停止续费',
    fourGActivationTime: '2026-02-01 18:00:00',
    fourGExpirationTime: '2027-02-01 18:00:00',
    serviceAnnualFeeBalance: 19.00,
    asrAnnualUsage: '270,000 tokens',
    llmAnnualUsage: '370,000 tokens',
    ttsAnnualUsage: '170.00 h',
    voiceCloneAnnualUsage: '90.00 h',
    registrationTime: '2026-02-01 18:00:00',
    bindAccount: '139****0009',
    productionBatch: '2026-02-28',
    manufacturer: '深圳沃能威科技有限公司',
    initFirmware: 'Z009 V 1.0.0',
    latestFirmware: 'Z009 V 2.0.0',
    currentFirmware: 'Z009 V 1.2.0',
    sn: 'SZTD...XJ6',
    efuseId: 'ESP32-0075A1C0',
    mac: 'DC:54:75:62:66:78',
    tempName: 'Zibbi 009 250619XJ6',
    imei: '35380100360182',
    sim: '1477629430144',
    cpu: '0x1FFFF7F0',
    creator: '41',
    createTime: '2026-3-13 19:25:11',
    updateTime: '2026-3-13 19:25:11',
  },
  {
    key: 10,
    accountId: 'acc010',
    phoneNumber: '139****0010',
    deviceModel: 'HWSZ010',
    deviceId: '0075A1B2SZTD...XJ7',
    productId: 'prod010',
    ipRole: '王十一',
    productModel: 'HWSZ001010',
    currentMemberType: 'VIP',
    memberPayment: '自动续费',
    memberActivationTime: '2026-03-01 19:00:00',
    memberExpirationTime: '2027-03-01 19:00:00',
    fourGCardNumber: '1477629430145',
    fourGPlan: '1G/月',
    remainingDataThisMonth: '600M',
    fourGPayment: '自动续费',
    fourGActivationTime: '2026-03-01 19:00:00',
    fourGExpirationTime: '2027-03-01 19:00:00',
    serviceAnnualFeeBalance: 55.00,
    asrAnnualUsage: '700,000 tokens',
    llmAnnualUsage: '800,000 tokens',
    ttsAnnualUsage: '300.00 h',
    voiceCloneAnnualUsage: '150.00 h',
    registrationTime: '2026-03-01 19:00:00',
    bindAccount: '139****0010',
    productionBatch: '2026-03-30',
    manufacturer: '深圳沃能威科技有限公司',
    initFirmware: 'Z010 V 1.0.0',
    latestFirmware: 'Z010 V 2.0.0',
    currentFirmware: 'Z010 V 1.2.0',
    sn: 'SZTD...XJ7',
    efuseId: 'ESP32-0075A1C1',
    mac: 'DC:54:75:62:66:79',
    tempName: 'Zibbi 010 250619XJ7',
    imei: '35380100360183',
    sim: '1477629430145',
    cpu: '0x1FFFF7F1',
    creator: '42',
    createTime: '2026-4-13 19:25:11',
    updateTime: '2026-4-13 19:25:11',
  },
  {
    key: 11,
    accountId: 'acc011',
    phoneNumber: '139****0011',
    deviceModel: 'HWSZ011',
    deviceId: '0075A1B2SZTD...XJ8',
    productId: 'prod011',
    ipRole: '李十二',
    productModel: 'HWSZ001011',
    currentMemberType: '普通会员',
    memberPayment: '赠送',
    memberActivationTime: '2026-04-01 20:00:00',
    memberExpirationTime: '2027-04-01 20:00:00',
    fourGCardNumber: '1477629430146',
    fourGPlan: '2G/月',
    remainingDataThisMonth: '700M',
    fourGPayment: '赠送',
    fourGActivationTime: '2026-04-01 20:00:00',
    fourGExpirationTime: '2027-04-01 20:00:00',
    serviceAnnualFeeBalance: 32.00,
    asrAnnualUsage: '150,000 tokens',
    llmAnnualUsage: '250,000 tokens',
    ttsAnnualUsage: '130.00 h',
    voiceCloneAnnualUsage: '80.00 h',
    registrationTime: '2026-04-01 20:00:00',
    bindAccount: '139****0011',
    productionBatch: '2026-04-30',
    manufacturer: '深圳沃能威科技有限公司',
    initFirmware: 'Z011 V 1.0.0',
    latestFirmware: 'Z011 V 2.0.0',
    currentFirmware: 'Z011 V 1.2.0',
    sn: 'SZTD...XJ8',
    efuseId: 'ESP32-0075A1C2',
    mac: 'DC:54:75:62:66:80',
    tempName: 'Zibbi 011 250619XJ8',
    imei: '35380100360184',
    sim: '1477629430146',
    cpu: '0x1FFFF7F2',
    creator: '43',
    createTime: '2026-5-13 19:25:11',
    updateTime: '2026-5-13 19:25:11',
  },
  {
    key: 12,
    accountId: 'acc012',
    phoneNumber: '139****0012',
    deviceModel: 'HWSZ012',
    deviceId: '0075A1B2SZTD...XJ9',
    productId: 'prod012',
    ipRole: '赵十三',
    productModel: 'HWSZ001012',
    currentMemberType: 'SVIP',
    memberPayment: '停止续费',
    memberActivationTime: '2026-05-01 21:00:00',
    memberExpirationTime: '2027-05-01 21:00:00',
    fourGCardNumber: '1477629430147',
    fourGPlan: '3G/月',
    remainingDataThisMonth: '800M',
    fourGPayment: '停止续费',
    fourGActivationTime: '2026-05-01 21:00:00',
    fourGExpirationTime: '2027-05-01 21:00:00',
    serviceAnnualFeeBalance: 20.00,
    asrAnnualUsage: '300,000 tokens',
    llmAnnualUsage: '400,000 tokens',
    ttsAnnualUsage: '180.00 h',
    voiceCloneAnnualUsage: '100.00 h',
    registrationTime: '2026-05-01 21:00:00',
    bindAccount: '139****0012',
    productionBatch: '2026-05-30',
    manufacturer: '深圳沃能威科技有限公司',
    initFirmware: 'Z012 V 1.0.0',
    latestFirmware: 'Z012 V 2.0.0',
    currentFirmware: 'Z012 V 1.2.0',
    sn: 'SZTD...XJ9',
    efuseId: 'ESP32-0075A1C3',
    mac: 'DC:54:75:62:66:81',
    tempName: 'Zibbi 012 250619XJ9',
    imei: '35380100360185',
    sim: '1477629430147',
    cpu: '0x1FFFF7F3',
    creator: '44',
    createTime: '2026-6-13 19:25:11',
    updateTime: '2026-6-13 19:25:11',
  },
];

console.log('Raw Data:', rawData);

const ipRoleValue = ref({ key: 'all', label: '全部', value: 'all' });

const ipRoleOptions = computed(() => {
  const uniqueIpRoles = Array.from(new Set(rawData.map(item => item.ipRole)));
  const options = uniqueIpRoles.map(role => ({
    key: role,
    value: role,
    label: role,
  }));
  return [
    { key: 'all', value: 'all', label: '全部' },
    ...options
  ];
});

const handleIpRoleChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    ipRoleValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    ipRoleValue.value = val;
  }
};

const currentPage = ref(1);
const pageSize = ref(10);

console.log('Initial ipRoleValue:', ipRoleValue.value);

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
  ipRoleValue.value = { key: 'all', label: '全部', value: 'all' };
  memberTypeValue.value = { key: 'all', label: '全部', value: 'all' };
  memberPaymentValue.value = { key: 'all', label: '全部', value: 'all' };
  fourGPlanValue.value = { key: 'all', label: '全部', value: 'all' };
  fourGPaymentValue.value = { key: 'all', label: '全部', value: 'all' };
  deviceModelValue.value = { key: 'all', label: '全部', value: 'all' };
  manufacturerValue.value = { key: 'all', label: '全部', value: 'all' };

  // Simulate data fetching
  setTimeout(() => {
    loading.value = false; // Hide loading icon after a delay
  }, 500); // Adjust delay as needed
};

const filteredData = computed<DataItem[]>(() => {
  let dataToFilter = rawData;

  if (searchInputValue.value) {
    const searchTerm = searchInputValue.value.toLowerCase();
    dataToFilter = dataToFilter.filter((item: DataItem) => {
      return Object.values(item).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(searchTerm)
      );
    });
  }

  // Filter by IP Role
  if (
    ipRoleValue.value &&
    ipRoleValue.value.value !== 'all' &&
    ipRoleValue.value.value !== ''
  ) {
    const selectedIpRole = ipRoleValue.value.value;
    dataToFilter = dataToFilter.filter(item => item.ipRole === selectedIpRole);
  }

  // Filter by member type
  if (
    memberTypeValue.value &&
    memberTypeValue.value.value !== 'all' &&
    memberTypeValue.value.value !== ''
  ) {
    const selectedType = memberTypeValue.value.value;
    dataToFilter = dataToFilter.filter(item => item.currentMemberType === selectedType);
  }

  // Filter by member payment
  if (
    memberPaymentValue.value &&
    memberPaymentValue.value.value !== 'all' &&
    memberPaymentValue.value.value !== ''
  ) {
    const selectedPayment = memberPaymentValue.value.value;
    dataToFilter = dataToFilter.filter(item => item.memberPayment === selectedPayment);
  }

  // Filter by 4G payment
  if (
    fourGPaymentValue.value &&
    fourGPaymentValue.value.value !== 'all' &&
    fourGPaymentValue.value.value !== ''
  ) {
    const selectedFourGPayment = fourGPaymentValue.value.value;
    dataToFilter = dataToFilter.filter(item => item.fourGPayment === selectedFourGPayment);
  }

  // Filter by 4G plan
  if (
    fourGPlanValue.value &&
    fourGPlanValue.value.value !== 'all' &&
    fourGPlanValue.value.value !== ''
  ) {
    const selectedPlan = fourGPlanValue.value.value;
    dataToFilter = dataToFilter.filter(item => item.fourGPlan === selectedPlan);
  }

  // Filter by device model
  if (
    deviceModelValue.value &&
    deviceModelValue.value.value !== 'all' &&
    deviceModelValue.value.value !== ''
  ) {
    const selectedModel = deviceModelValue.value.value;
    dataToFilter = dataToFilter.filter(item => item.deviceModel === selectedModel);
  }

  // Filter by manufacturer
  if (
    manufacturerValue.value &&
    manufacturerValue.value.value !== 'all' &&
    manufacturerValue.value.value !== ''
  ) {
    const selectedManu = manufacturerValue.value.value;
    dataToFilter = dataToFilter.filter(item => item.manufacturer === selectedManu);
  }

  // Filter by latest firmware
  if (
    latestFirmwareValue.value &&
    latestFirmwareValue.value.value !== 'all' &&
    latestFirmwareValue.value.value !== ''
  ) {
    const selectedFirmware = latestFirmwareValue.value.value;
    dataToFilter = dataToFilter.filter(item => item.latestFirmware === selectedFirmware);
  }

  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return dataToFilter.slice(start, end);
});

const searchInputValue = ref('');

const handleTableChange = (
  pagination: any,
  filters: any,
  sorter: any,
) => {
  console.log('Table change:', pagination, filters, sorter);
  // You can implement your logic here to handle pagination, filters, and sorter
  // For example, update currentPage, pageSize, or re-fetch data based on sorting/filtering
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

const handleVersionRelease = () => {
  console.log('版本发布 button clicked!');
  // Add your version release logic here
};

const memberTypeValue = ref({ key: 'all', label: '全部', value: 'all' });

const memberTypeOptions = computed(() => {
  const uniqueTypes = Array.from(new Set(rawData.map(item => item.currentMemberType)));
  const options = uniqueTypes.map(type => ({
    key: type,
    value: type,
    label: type,
  }));
  return [
    { key: 'all', value: 'all', label: '全部' },
    ...options
  ];
});

const handleMemberTypeChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    memberTypeValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    memberTypeValue.value = val;
  }
};

const memberPaymentValue = ref({ key: 'all', label: '全部', value: 'all' });

const memberPaymentOptions = computed(() => {
  const uniquePayments = Array.from(new Set(rawData.map(item => item.memberPayment)));
  const options = uniquePayments.map(payment => ({
    key: payment,
    value: payment,
    label: payment,
  }));
  return [
    { key: 'all', value: 'all', label: '全部' },
    ...options
  ];
});

const handleMemberPaymentChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    memberPaymentValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    memberPaymentValue.value = val;
  }
};

const fourGPaymentValue = ref({ key: 'all', label: '全部', value: 'all' });

const fourGPaymentOptions = computed(() => {
  const uniquePayments = Array.from(new Set(rawData.map(item => item.fourGPayment)));
  const options = uniquePayments.map(payment => ({
    key: payment,
    value: payment,
    label: payment,
  }));
  return [
    { key: 'all', value: 'all', label: '全部' },
    ...options
  ];
});

const handleFourGPaymentChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    fourGPaymentValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    fourGPaymentValue.value = val;
  }
};

const fourGPlanValue = ref({ key: 'all', label: '全部', value: 'all' });

const fourGPlanOptions = computed(() => {
  const uniquePlans = Array.from(new Set(rawData.map(item => item.fourGPlan)));
  const options = uniquePlans.map(plan => ({
    key: plan,
    value: plan,
    label: plan,
  }));
  return [
    { key: 'all', value: 'all', label: '全部' },
    ...options
  ];
});

const handleFourGPlanChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    fourGPlanValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    fourGPlanValue.value = val;
  }
};

const deviceModelValue = ref({ key: 'all', label: '全部', value: 'all' });
const manufacturerValue = ref({ key: 'all', label: '全部', value: 'all' });

const deviceModelOptions = computed(() => {
  const uniqueModels = Array.from(new Set(rawData.map(item => item.deviceModel)));
  const options = uniqueModels.map(model => ({
    key: model,
    value: model,
    label: model,
  }));
  return [
    { key: 'all', value: 'all', label: '全部' },
    ...options
  ];
});

const manufacturerOptions = computed(() => {
  const uniqueManufacturers = Array.from(new Set(rawData.map(item => item.manufacturer)));
  const options = uniqueManufacturers.map(manu => ({
    key: manu,
    value: manu,
    label: manu,
  }));
  return [
    { key: 'all', value: 'all', label: '全部' },
    ...options
  ];
});

const productionBatchOptions = computed(() => {
  const uniqueBatches = Array.from(new Set(rawData.map(item => item.productionBatch)));
  const options = uniqueBatches.map(batch => ({
    key: batch,
    value: batch,
    label: batch,
  }));
  return [
    { key: 'all', value: 'all', label: '全部' },
    ...options
  ];
});

const handleDeviceModelChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    deviceModelValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    deviceModelValue.value = val;
  }
};

const handleManufacturerChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    manufacturerValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    manufacturerValue.value = val;
  }
};

// Modal state for 设备导入
const deviceImportModalVisible = ref(false);
const handleAddBatchClick = () => {
  deviceImportModalVisible.value = true;
};
const handleDeviceImportFinish = () => {
  deviceImportModalVisible.value = false;
};

const otaConfigModalVisible = ref(false);

// Add latestFirmwareValue and latestFirmwareOptions
const latestFirmwareValue = ref({ key: 'all', label: '全部', value: 'all' });
const latestFirmwareOptions = computed(() => {
  const uniqueFirmwares = Array.from(new Set(rawData.map(item => item.latestFirmware)));
  const options = uniqueFirmwares.map(fw => ({
    key: fw,
    value: fw,
    label: fw,
  }));
  return [
    { key: 'all', value: 'all', label: '全部' },
    ...options
  ];
});

const handleLatestFirmwareChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    latestFirmwareValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    latestFirmwareValue.value = val;
  }
};

function handleOtaConfigOk() {
  otaConfigModalVisible.value = false;
}

const otaModalDeviceModelValue = ref({ key: 'all', label: '全部', value: 'all' });
const otaModalLatestFirmwareValue = ref({ key: 'all', label: '全部', value: 'all' });

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