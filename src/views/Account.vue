<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>账户信息</h2>
    </div>

    <!-- select item area -->
    <div class="top-controls-wrapper">
      <div class="left-aligned-section">
        <div class="select-container ip-role-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">IP角色:</span>
          <a-tooltip :title="ipRoleValue.label">
            <a-select
              v-model:value="ipRoleValue"
              style="width: 110px;"
              :options="ipRoleOptions"
              @change="handleIpRoleChange"
              :allowClear="true"
              label-in-value
            >
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div>
        <div class="select-container member-type-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">当前会员类型:</span>
          <a-tooltip :title="memberTypeValue.label">
            <a-select
              v-model:value="memberTypeValue"
              style="width: 150px;"
              :options="memberTypeOptions"
              @change="handleMemberTypeChange"
              :allowClear="true"
              label-in-value
            >
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div>
        <div class="select-container member-payment-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">会员付费:</span>
          <a-tooltip :title="memberPaymentValue.label">
            <a-select
              v-model:value="memberPaymentValue"
              style="width: 120px;"
              :options="memberPaymentOptions"
              @change="handleMemberPaymentChange"
              :allowClear="true"
              label-in-value
            >
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div>
        <div class="select-container fourg-plan-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">4G套餐:</span>
          <a-tooltip :title="fourGPlanValue.label">
            <a-select
              v-model:value="fourGPlanValue"
              style="width: 120px;"
              :options="fourGPlanOptions"
              @change="handleFourGPlanChange"
              :allowClear="true"
              label-in-value
            >
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div>
        <div class="select-container fourg-payment-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">4G付费:</span>
          <a-tooltip :title="fourGPaymentValue.label">
            <a-select
              v-model:value="fourGPaymentValue"
              style="width: 120px;"
              :options="fourGPaymentOptions"
              @change="handleFourGPaymentChange"
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
            @input="handleSearchChange"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
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
        :scroll="{ x: 1000 }"
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

  </a-config-provider>
</template>
<script lang="ts" setup>
import { ref, computed, onMounted, watch, h } from 'vue';
import { useRouter } from 'vue-router';
import type { ColumnsType } from 'ant-design-vue/es/table';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme } from 'ant-design-vue';
import { ReloadOutlined, ColumnHeightOutlined, SettingOutlined, SearchOutlined, ExportOutlined } from '@ant-design/icons-vue';
import draggable from 'vuedraggable';
import { constructApiUrl } from '../utils/api';
import axios from 'axios';

const router = useRouter();

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '', // Override the '页' suffix for quick jumper
  },
}));

interface DataItem {
  id: number; // Add id field
  key: number;
  memberId: string; // 主账户ID
  phoneNumber: string; // 手机号
  deviceModel: string; // 设备型号
  deviceId: string; // 设备ID
  ipRole: string; // IP角色
  productId: string; // 产品ID
  commodityId: string; // 商品ID
  voiceCloningModelId: string; // 音色复刻模型ID
  initialActivationTime: string; // 首次激活时间
  currentMemberType: string; // 当前会员类型
  memberPayment: string; // 会员付费
  memberActivationTime: string; // 会员激活时间
  memberExpirationTime: string; // 会员到期时间
  fourGCardNumber: string; // 4G卡号
  fourGPlan: string; // 4G套餐
  remainingDataCurrentMonth: string; // 当月剩余流量
  fourGPayment: string; // 4G付费
  fourGActivationTime: string; // 4G激活时间
  fourGExpirationTime: string; // 4G到期时间
  annualServiceFeeBalance: number; // 服务年费用盈余
  asrUsage: string; // ASR用量
  llmUsage: string; // LLM用量
  ttsUsage: string; // TTS用量
  voiceCloneUsage: string; // 音色克隆用量
  registrationTime: string; // 注册时间
}

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Define API endpoints for different data sources
const API_ENDPOINTS = {
  basic: constructApiUrl('accounts/basic'),
  membership: constructApiUrl('accounts/membership'),
  fourgService: constructApiUrl('accounts/4g-service'),
  usage: constructApiUrl('accounts/usage'),
  all: constructApiUrl('accounts')
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
  apiEndpoint?: string; // Which API endpoint this column uses
}

const columnConfigs: ColumnConfig[] = [
  { key: 'rowIndex', title: '序号', dataIndex: 'rowIndex', width: 60, fixed: 'left', customRender: ({ index }) => (currentPage.value - 1) * pageSize.value + index + 1, apiEndpoint: 'basic' },
  { key: 'memberId_1', title: '主账户ID', dataIndex: 'memberId', width: 150, apiEndpoint: 'basic', sorter: (a, b) => (a.memberId || '').localeCompare(b.memberId || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'phoneNumber_2', title: '手机号', dataIndex: 'phoneNumber', width: 120, apiEndpoint: 'basic', sorter: (a, b) => (a.phoneNumber || '').localeCompare(b.phoneNumber || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'deviceModel_3', title: '设备型号', dataIndex: 'deviceModel', width: 100, apiEndpoint: 'basic', sorter: (a, b) => (a.deviceModel || '').localeCompare(b.deviceModel || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'deviceId_4', title: '设备ID', dataIndex: 'deviceId', width: 210, apiEndpoint: 'basic', sorter: (a, b) => (a.deviceId || '').localeCompare(b.deviceId || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'ipRole_5', title: 'IP角色', dataIndex: 'ipRole', width: 100, apiEndpoint: 'basic', sorter: (a, b) => (a.ipRole || '').localeCompare(b.ipRole || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'productId_6', title: '产品ID', dataIndex: 'productId', width: 120, apiEndpoint: 'basic', sorter: (a, b) => (a.productId || '').localeCompare(b.productId || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'commodityId_7', title: '商品ID', dataIndex: 'commodityId', width: 150, apiEndpoint: 'basic', sorter: (a, b) => (a.commodityId || '').localeCompare(b.commodityId || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'voiceCloningModelId_8', title: '音色复刻模型ID', dataIndex: 'voiceCloningModelId', width: 180, apiEndpoint: 'basic', sorter: (a, b) => (a.voiceCloningModelId || '').localeCompare(b.voiceCloningModelId || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'initialActivationTime_9', title: '首次激活时间', dataIndex: 'initialActivationTime', width: 150, sorter: (a, b) => new Date(a.initialActivationTime || 0).getTime() - new Date(b.initialActivationTime || 0).getTime(), sortDirections: ['ascend', 'descend'], apiEndpoint: 'basic' },
  { key: 'currentMemberType_10', title: '当前会员类型', dataIndex: 'currentMemberType', width: 120, apiEndpoint: 'membership', sorter: (a, b) => (a.currentMemberType || '').localeCompare(b.currentMemberType || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'memberPayment_11', title: '会员付费', dataIndex: 'memberPayment', width: 120, apiEndpoint: 'membership', sorter: (a, b) => (a.memberPayment || '').localeCompare(b.memberPayment || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'memberActivationTime_12', title: '会员激活时间', dataIndex: 'memberActivationTime', width: 150, sorter: (a, b) => new Date(a.memberActivationTime || 0).getTime() - new Date(b.memberActivationTime || 0).getTime(), sortDirections: ['ascend', 'descend'], apiEndpoint: 'membership' },
  { key: 'memberExpirationTime_13', title: '会员到期时间', dataIndex: 'memberExpirationTime', width: 150, sorter: (a, b) => new Date(a.memberExpirationTime || 0).getTime() - new Date(b.memberExpirationTime || 0).getTime(), sortDirections: ['ascend', 'descend'], apiEndpoint: 'membership' },
  { key: 'fourGCardNumber_14', title: '4G卡号', dataIndex: 'fourGCardNumber', width: 120, apiEndpoint: 'fourgService', sorter: (a, b) => (a.fourGCardNumber || '').localeCompare(b.fourGCardNumber || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'fourGPlan_15', title: '4G套餐', dataIndex: 'fourGPlan', width: 100, apiEndpoint: 'fourgService', sorter: (a, b) => (a.fourGPlan || '').localeCompare(b.fourGPlan || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'remainingDataCurrentMonth_16', title: '当月剩余流量', dataIndex: 'remainingDataCurrentMonth', width: 120, apiEndpoint: 'fourgService', sorter: (a, b) => (a.remainingDataCurrentMonth || '').localeCompare(b.remainingDataCurrentMonth || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'fourGPayment_17', title: '4G付费', dataIndex: 'fourGPayment', width: 100, apiEndpoint: 'fourgService', sorter: (a, b) => (a.fourGPayment || '').localeCompare(b.fourGPayment || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'fourGActivationTime_18', title: '4G激活时间', dataIndex: 'fourGActivationTime', width: 150, sorter: (a, b) => new Date(a.fourGActivationTime || 0).getTime() - new Date(b.fourGActivationTime || 0).getTime(), sortDirections: ['ascend', 'descend'], apiEndpoint: 'fourgService' },
  { key: 'fourGExpirationTime_19', title: '4G到期时间', dataIndex: 'fourGExpirationTime', width: 150, sorter: (a, b) => new Date(a.fourGExpirationTime || 0).getTime() - new Date(b.fourGExpirationTime || 0).getTime(), sortDirections: ['ascend', 'descend'], apiEndpoint: 'fourgService' },
  { key: 'annualServiceFeeBalance_20', title: '服务年费用盈余(元)', dataIndex: 'annualServiceFeeBalance', width: 180, sorter: (a, b) => (a.annualServiceFeeBalance || 0) - (b.annualServiceFeeBalance || 0), sortDirections: ['ascend', 'descend'], apiEndpoint: 'membership' },
  { key: 'asrUsage_21', title: 'ASR用量', dataIndex: 'asrUsage', width: 120, apiEndpoint: 'usage', sorter: (a, b) => (a.asrUsage || '').localeCompare(b.asrUsage || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'llmUsage_22', title: 'LLM用量', dataIndex: 'llmUsage', width: 120, apiEndpoint: 'usage', sorter: (a, b) => (a.llmUsage || '').localeCompare(b.llmUsage || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'ttsUsage_23', title: 'TTS用量', dataIndex: 'ttsUsage', width: 120, apiEndpoint: 'usage', sorter: (a, b) => (a.ttsUsage || '').localeCompare(b.ttsUsage || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'voiceCloneUsage_24', title: '音色克隆用量', dataIndex: 'voiceCloneUsage', width: 150, apiEndpoint: 'usage', sorter: (a, b) => (a.voiceCloneUsage || '').localeCompare(b.voiceCloneUsage || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'registrationTime_25', title: '注册时间', dataIndex: 'registrationTime', width: 150, apiEndpoint: 'basic', sorter: (a, b) => new Date(a.registrationTime || 0).getTime() - new Date(b.registrationTime || 0).getTime(), sortDirections: ['ascend', 'descend'], customRender: ({ text }) => text === undefined || text === null || text === '' ? '-' : text },
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
    // Show sort order when user actively sorts
    sortOrder: sorterInfo.value && config.key === sorterInfo.value.columnKey ? sorterInfo.value.order : undefined,
    customRender: config.customRender
      ? config.customRender
      : ({ text, record }) => {
          // Handle hyperlinks for specific columns
          if (config.key === 'deviceModel_3') {
            return text ? h('a', {
              style: { color: '#1890ff', cursor: 'pointer' },
              onClick: () => router.push({ name: 'device-type', query: { search: text } })
            }, text) : '-';
          }
          if (config.key === 'deviceId_4') {
            return text ? h('a', {
              style: { color: '#1890ff', cursor: 'pointer' },
              onClick: () => router.push({ name: 'device-management', query: { search: text } })
            }, text) : '-';
          }
          if (config.key === 'ipRole_5') {
            return text ? h('a', {
              style: { color: '#1890ff', cursor: 'pointer' },
              onClick: () => router.push({ name: 'agent-configuration', query: { search: text } })
            }, text) : '-';
          }
          if (config.key === 'productId_6') {
            return text ? h('a', {
              style: { color: '#1890ff', cursor: 'pointer' },
              onClick: () => router.push({ name: 'product-type', query: { search: text } })
            }, text) : '-';
          }
          if (config.key === 'commodityId_7') {
            return text ? h('a', {
              style: { color: '#1890ff', cursor: 'pointer' },
              onClick: () => router.push({ name: 'product-list', query: { search: text } })
            }, text) : '-';
          }
          // Default rendering for other columns
          return text === undefined || text === null || text === '' ? '-' : text;
        },
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

// Data state for different endpoints
const dataSources = ref<{ [key: string]: DataItem[] }>({
  basic: [],
  membership: [],
  fourgService: [],
  usage: []
});
const totalRecords = ref(0);
const loading = ref(false);

// Fetch data from specific API endpoint
const fetchDataFromEndpoint = async (endpoint: string, params: URLSearchParams) => {
  try {
    console.log(`Fetching from ${endpoint} endpoint:`, `${API_ENDPOINTS[endpoint as keyof typeof API_ENDPOINTS]}?${params}`);
    const response = await axios.get(`${API_ENDPOINTS[endpoint as keyof typeof API_ENDPOINTS]}?${params}`);
    console.log(`${endpoint} response:`, response.data);
    dataSources.value[endpoint] = response.data.data;
    return response.data.total;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    return 0;
  }
};

// Fetch data from all endpoints
const fetchData = async () => {
  console.log('fetchData called');
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      pageSize: pageSize.value.toString()
    });

    // Add search filter
    if (searchInputValue.value) {
      params.append('search', searchInputValue.value);
    }

    // Add IP role filter
    if (ipRoleValue.value.value !== 'all') {
      params.append('ipRole', ipRoleValue.value.value);
    }

    // Add sorting for all columns including registration time
    if (sorterInfo.value?.columnKey) {
      const sortByField = getSortByField(sorterInfo.value.columnKey);
      params.append('sortBy', sortByField);
      params.append('sortOrder', sorterInfo.value.order);
      console.log('Sorting by:', sortByField, 'Order:', sorterInfo.value.order);
    }

    console.log('Calling basic endpoint with params:', params.toString());
    
    // Use only the basic endpoint since it now returns all columns
    const response = await axios.get(`${API_ENDPOINTS.basic}?${params}`);
    console.log('Basic endpoint response:', response.data);
    
    // Store the data directly
    dataSources.value.basic = response.data.data;
    totalRecords.value = response.data.total;

  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

// Helper function to map frontend column keys to database field names
const getSortByField = (columnKey?: string) => {
  const fieldMap: { [key: string]: string } = {
    'memberId_1': 'member_id',
    'phoneNumber_2': 'phone_number',
    'deviceModel_3': 'device_model',
    'deviceId_4': 'device_id',
    'ipRole_5': 'ip_role',
    'productId_6': 'product_id',
    'commodityId_7': 'commodity_id',
    'voiceCloningModelId_8': 'voice_cloning_model_id',
    'initialActivationTime_9': 'initial_activation_time',
    'currentMemberType_10': 'current_member_type',
    'memberPayment_11': 'member_payment',
    'memberActivationTime_12': 'member_activation_time',
    'memberExpirationTime_13': 'member_expiration_time',
    'fourGCardNumber_14': 'fourg_card_number',
    'fourGPlan_15': 'fourg_plan',
    'remainingDataCurrentMonth_16': 'remaining_data_current_month',
    'fourGPayment_17': 'fourg_payment',
    'fourGActivationTime_18': 'fourg_activation_time',
    'fourGExpirationTime_19': 'fourg_expiration_time',
    'annualServiceFeeBalance_20': 'annual_service_fee_balance',
    'asrUsage_21': 'asr_usage',
    'llmUsage_22': 'llm_usage',
    'ttsUsage_23': 'tts_usage',
    'voiceCloneUsage_24': 'voice_clone_usage',
    'registrationTime_25': 'registration_time'
  };
  return fieldMap[columnKey || ''] || 'registration_time';
};

// Combine data from all sources for display
const combinedData = computed(() => {
  console.log('combinedData computed called, dataSources:', dataSources.value);
  
  // Since the basic endpoint now returns all columns, just return the basic data
  return dataSources.value.basic || [];
});

// Fetch filter options from API
const fetchFilterOptions = async () => {
  try {
    const response = await axios.get(constructApiUrl('accounts/filter-options'));
    const { ipRoles, memberTypes, memberPayments, fourGPlans, fourGPayments } = response.data;
    
    // Update the computed options
    ipRoleOptions.value = [
    { key: 'all', value: 'all', label: '全部' },
      ...ipRoles.map((item: any) => ({ key: item.value, value: item.value, label: item.label }))
    ];
    
    memberTypeOptions.value = [
      { key: 'all', value: 'all', label: '全部' },
      ...memberTypes.map((item: any) => ({ key: item.value, value: item.value, label: item.label }))
    ];
    
    memberPaymentOptions.value = [
      { key: 'all', value: 'all', label: '全部' },
      ...memberPayments.map((item: any) => ({ key: item.value, value: item.value, label: item.label }))
    ];
    
    fourGPlanOptions.value = [
      { key: 'all', value: 'all', label: '全部' },
      ...fourGPlans.map((item: any) => ({ key: item.value, value: item.value, label: item.label }))
    ];
    
    fourGPaymentOptions.value = [
      { key: 'all', value: 'all', label: '全部' },
      ...fourGPayments.map((item: any) => ({ key: item.value, value: item.value, label: item.label }))
    ];
  } catch (error) {
    console.error('Error fetching filter options:', error);
  }
};

const ipRoleValue = ref({ key: 'all', label: '全部', value: 'all' });
const ipRoleOptions = ref([{ key: 'all', value: 'all', label: '全部' }]);

const handleIpRoleChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    ipRoleValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    ipRoleValue.value = val;
  }
  fetchData();
};

const currentPage = ref(1);
const pageSize = ref(10);

const sorterInfo = ref<any>({
  columnKey: undefined,
  order: undefined,
});

const pagination = computed(() => ({
  total: totalRecords.value, 
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
    fetchData();
  },
  onChange: (page: number, size: number) => {
    console.log('onChange', page, size);
    currentPage.value = page;
    pageSize.value = size;
    fetchData();
  },
}));

const onRefresh = () => {
  console.log('Refresh button clicked!');
  loading.value = true;
  searchInputValue.value = '';
  currentPage.value = 1;
  resetColumns();

  // Reset all selector values to '全部'
  ipRoleValue.value = { key: 'all', label: '全部', value: 'all' };
  memberTypeValue.value = { key: 'all', label: '全部', value: 'all' };
  memberPaymentValue.value = { key: 'all', label: '全部', value: 'all' };
  fourGPlanValue.value = { key: 'all', label: '全部', value: 'all' };
  fourGPaymentValue.value = { key: 'all', label: '全部', value: 'all' };

  // Reset sorter to default (no active sorting)
  sorterInfo.value = {
    columnKey: undefined,
    order: undefined,
  };

  // Always fetch fresh data on refresh
  fetchData();
};

const filteredData = computed(() => {
  let data = combinedData.value;

  // Apply sorting based on sorterInfo
  if (sorterInfo.value?.columnKey === 'registrationTime_25') {
    // Use Ant Design sorter for registration time when user interacts
    const columnConfig = columnConfigs.find(config => config.key === 'registrationTime_25');
    if (columnConfig?.sorter) {
      data.sort((a, b) => {
        const result = columnConfig.sorter!(a, b);
        return sorterInfo.value.order === 'ascend' ? result : -result;
      });
    }
  } else if (sorterInfo.value?.columnKey) {
    const columnConfig = columnConfigs.find(config => config.key === sorterInfo.value.columnKey);
    if (columnConfig?.sorter) {
      // Use the Ant Design sorter for other columns
      data.sort((a, b) => {
        const result = columnConfig.sorter!(a, b);
        return sorterInfo.value.order === 'ascend' ? result : -result;
      });
    } else {
      // Fallback to default sorting
      const sortByField = getSortByField(sorterInfo.value.columnKey);
      if (sortByField && sortByField !== 'registration_time') {
        data.sort((a, b) => {
          const fieldA = (a as any)[sortByField];
          const fieldB = (b as any)[sortByField];
          if (fieldA === null || fieldA === undefined) return 1; // Sort null/undefined to the end
          if (fieldB === null || fieldB === undefined) return -1;

          if (typeof fieldA === 'string') {
            return sorterInfo.value.order === 'ascend' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
          } else if (typeof fieldA === 'number') {
            return sorterInfo.value.order === 'ascend' ? fieldA - fieldB : fieldB - fieldA;
          }
          return 0; // Default sort for other types
        });
      }
    }
  } else {
    // Default sorting when no user interaction - use plain JavaScript for registration time
    data.sort((a, b) => {
      const dateA = new Date(a.registrationTime || 0).getTime();
      const dateB = new Date(b.registrationTime || 0).getTime();
      return dateB - dateA; // Default to descending order
    });
  }

  return data;
});

const searchInputValue = ref('');

const handleTableChange = (
  paginationData: any,
  filters: any,
  sorter: any,
) => {
  console.log('Table change:', paginationData, filters, sorter);
  const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;

  // Handle pagination changes
  if (paginationData) {
    currentPage.value = paginationData.current || 1;
    pageSize.value = paginationData.pageSize || 10;
  }

  // Handle sorting changes
  if (currentSorter && currentSorter.order) {
    sorterInfo.value = {
      columnKey: currentSorter.columnKey,
      order: currentSorter.order,
    };
  } else {
    // When sorting is cleared, reset to default
    sorterInfo.value = {
      columnKey: undefined,
      order: undefined,
    };
  }
  
  // Fetch data from API for all sorting changes
  fetchData();
};

const onSettingClick = () => {
  console.log('Setting clicked');
};

const tableSize = ref('middle');

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

const memberTypeValue = ref({ key: 'all', label: '全部', value: 'all' });
const memberTypeOptions = ref([{ key: 'all', value: 'all', label: '全部' }]);

const handleMemberTypeChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    memberTypeValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    memberTypeValue.value = val;
  }
  fetchData();
};

const memberPaymentValue = ref({ key: 'all', label: '全部', value: 'all' });
const memberPaymentOptions = ref([{ key: 'all', value: 'all', label: '全部' }]);

const handleMemberPaymentChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    memberPaymentValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    memberPaymentValue.value = val;
  }
  fetchData();
};

const fourGPaymentValue = ref({ key: 'all', label: '全部', value: 'all' });
const fourGPaymentOptions = ref([{ key: 'all', value: 'all', label: '全部' }]);

const handleFourGPaymentChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    fourGPaymentValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    fourGPaymentValue.value = val;
  }
  fetchData();
};

const fourGPlanValue = ref({ key: 'all', label: '全部', value: 'all' });
const fourGPlanOptions = ref([{ key: 'all', value: 'all', label: '全部' }]);

const handleFourGPlanChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    fourGPlanValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    fourGPlanValue.value = val;
  }
  fetchData();
};

// Watch for search input changes
const searchTimeout = ref<NodeJS.Timeout | null>(null);
const handleSearchChange = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  searchTimeout.value = setTimeout(() => {
  currentPage.value = 1;
    fetchData();
  }, 500);
};

// Watch for route changes to update search input
watch(() => router.currentRoute.value.query.search, (newSearchValue) => {
  if (newSearchValue && newSearchValue !== searchInputValue.value) {
    searchInputValue.value = newSearchValue as string;
    currentPage.value = 1;
    fetchData();
  }
});

onMounted(() => {
  selectedColumnKeys.value = columnConfigs.map(config => config.key);
  
  // Check for search query parameter from URL
  if (router.currentRoute.value.query.search) {
    searchInputValue.value = router.currentRoute.value.query.search as string;
    // Trigger search with the URL parameter
    currentPage.value = 1;
    fetchData();
  }
  
  fetchFilterOptions();
  fetchData();
});

defineExpose({
  handleTableChange,
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

:deep(.fourg-payment-select .ant-select-selector) {
  padding-left: 55px !important;
}

:deep(.fourg-plan-select .ant-select-selector) {
  padding-left: 55px !important;
}

:deep(.nowrap-header) {
  white-space: nowrap !important;
}

:deep(.product-type-select .ant-select-selector) {
  padding-left: 70px !important;
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

/* Make all sort indicators grey instead of blue */
:deep(.ant-table-column-sorter) {
  color: #bfbfbf !important;
}

:deep(.ant-table-column-sorter .ant-table-column-sorter-inner) {
  color: #bfbfbf !important;
}

:deep(.ant-table-column-sorter .ant-table-column-sorter-inner .ant-table-column-sorter-up) {
  color: #bfbfbf !important;
}

:deep(.ant-table-column-sorter .ant-table-column-sorter-inner .ant-table-column-sorter-down) {
  color: #bfbfbf !important;
}

/* Active sort indicators should be blue */
:deep(.ant-table-column-sorter .ant-table-column-sorter-inner .ant-table-column-sorter-up.active) {
  color: #1677ff !important;
}

:deep(.ant-table-column-sorter .ant-table-column-sorter-inner .ant-table-column-sorter-down.active) {
  color: #1677ff !important;
}
</style>