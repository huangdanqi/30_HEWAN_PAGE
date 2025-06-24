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
            <!-- If you have dynamic options, add them here -->
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
  sortOrder?: 'ascend' | 'descend';
  defaultSortOrder?: 'ascend' | 'descend';
  customRender?: (record: any) => string | number;
  className?: string;
}

const columnConfigs: ColumnConfig[] = [
  { key: 'rowIndex', title: '序号', dataIndex: 'rowIndex', width: 60, fixed: 'left', customRender: ({ index }) => (currentPage.value - 1) * pageSize.value + index + 1 },
  { key: 'accountId_1', title: '账户ID', dataIndex: 'accountId', width: 150  },
  { key: 'phoneNumber_2', title: '手机号', dataIndex: 'phoneNumber', width: 120 },
  { key: 'deviceModel', title: '设备型号', dataIndex: 'deviceModel', width: 100 },


  { key: 'deviceId_4', title: '设备ID', dataIndex: 'deviceId', width: 150 },
  { key: 'productId_5', title: '商品ID', dataIndex: 'productId', width: 150 },
  { key: 'ipRole_6', title: 'IP角色', dataIndex: 'ipRole', width: 80 },
  { key: 'productModel_7', title: '产品型号', dataIndex: 'productModel', width: 120 },
  { key: 'currentMemberType_8', title: '当前会员类型', dataIndex: 'currentMemberType', width: 120 },
  { key: 'memberPayment_9', title: '会员付费', dataIndex: 'memberPayment', width: 100 },
  { key: 'memberActivationTime_10', title: '会员激活时间', dataIndex: 'memberActivationTime', width: 150, sorter: (a, b) => new Date(a.memberActivationTime).getTime() - new Date(b.memberActivationTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'memberExpirationTime_11', title: '会员到期时间', dataIndex: 'memberExpirationTime', width: 150, sorter: (a, b) => new Date(a.memberExpirationTime).getTime() - new Date(b.memberExpirationTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'fourGCardNumber_12', title: '4G卡号', dataIndex: 'fourGCardNumber', width: 120 },
  { key: '4GPlan_13', title: '4G套餐', dataIndex: 'fourGPlan', width: 100 },
  { key: 'remainingDataThisMonth_14', title: '当月剩余流量', dataIndex: 'remainingDataThisMonth', width: 120, sorter: (a, b) => parseFloat(a.remainingDataThisMonth) - parseFloat(b.remainingDataThisMonth), sortDirections: ['ascend', 'descend'] },
  { key: '4GPayment_15', title: '4G付费', dataIndex: '4GPayment', width: 100 },
  { key: '4GActivationTime_16', title: '4G激活时间', dataIndex: 'fourGActivationTime', width: 150, sorter: (a, b) => new Date(a.fourGActivationTime).getTime() - new Date(b.fourGActivationTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: '4GExpirationTime_17', title: '4G到期时间', dataIndex: 'fourGExpirationTime', width: 150, sorter: (a, b) => new Date(a.fourGExpirationTime).getTime() - new Date(b.fourGExpirationTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'serviceAnnualFeeBalance_18', title: '服务年费用余额 (元)', dataIndex: 'serviceAnnualFeeBalance', width: 180, className: 'nowrap-header', sorter: (a, b) => a.serviceAnnualFeeBalance - b.serviceAnnualFeeBalance, sortDirections: ['ascend', 'descend'] },
  { key: 'asrAnnualUsage_19', title: 'ASR年用量', dataIndex: 'asrAnnualUsage', width: 120, sorter: (a, b) => parseFloat(a.asrAnnualUsage) - parseFloat(b.asrAnnualUsage), sortDirections: ['ascend', 'descend'] },
  { key: 'llmAnnualUsage_20', title: 'LLM年用量', dataIndex: 'llmAnnualUsage', width: 120, sorter: (a, b) => parseFloat(a.llmAnnualUsage) - parseFloat(b.llmAnnualUsage), sortDirections: ['ascend', 'descend'] },
  { key: 'ttsAnnualUsage_21', title: 'TTS年用量', dataIndex: 'ttsAnnualUsage', width: 120, sorter: (a, b) => parseFloat(a.ttsAnnualUsage) - parseFloat(b.ttsAnnualUsage), sortDirections: ['ascend', 'descend'] },
  { key: 'voiceCloneAnnualUsage_22', title: '音色克隆年用量', dataIndex: 'voiceCloneAnnualUsage', width: 150, sorter: (a, b) => parseFloat(a.voiceCloneAnnualUsage) - parseFloat(b.voiceCloneAnnualUsage), sortDirections: ['ascend', 'descend'] },
  { key: 'registrationTime_23', title: '注册时间', dataIndex: 'registrationTime', width: 150, sorter: (a, b) => new Date(a.registrationTime).getTime() - new Date(b.registrationTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'updateTime', title: '更新时间', dataIndex: 'updateTime', width: 160, sorter: (a: any, b: any) => new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime(), sortDirections: ['ascend', 'descend'] },
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
const memberTypes = ['普通会员', 'VIP', 'SVIP'];
const paymentStatuses = ['自动续费', '赠送', '停止续费', '未续购'];

for (let i = 0; i < 100; i++) {
  const date = new Date(2025, 5, 23, 23, 25, 33); // Example base date
  date.setDate(date.getDate() + i); // Vary date by day for each record
  date.setHours(date.getHours() + (i % 24)); // Vary hours
  date.setMinutes(date.getMinutes() + (i % 60)); // Vary minutes
  date.setSeconds(date.getSeconds() + (i % 60)); // Vary seconds

  const activationTime = date.toISOString().slice(0, 19).replace('T', ' ');
  const expirationDate = new Date(date);
  expirationDate.setDate(date.getDate() + 20); // Example expiration 20 days later
  const expirationTime = expirationDate.toISOString().slice(0, 19).replace('T', ' ');

  rawData.push({
    key: i + 1,
    accountId: `jkhg824&3*g${i % 10}`,
    phoneNumber: `183****${7950 + (i % 10)}`,
    deviceModel: `HWSZ00${i % 2 === 0 ? '1' : '2'}`,
    deviceId: `0075A1B2SZTD${1000 + i}`,
    productId: `hjhtwn832nj${i}`,
    ipRole: i % 2 === 0 ? '王龙' : '张三',
    productModel: `HWSZ00100${i % 3}`,
    currentMemberType: memberTypes[i % memberTypes.length],
    memberPayment: paymentStatuses[i % paymentStatuses.length],
    memberActivationTime: activationTime,
    memberExpirationTime: expirationTime,
    fourGCardNumber: `1477629430${10 + i}`,
    fourGPlan: `${(500 + (i % 3) * 100)}M/月`,
    remainingDataThisMonth: `${(20 + (i % 5))}M`,
    fourGPayment: paymentStatuses[(i + 1) % paymentStatuses.length],
    fourGActivationTime: activationTime,
    fourGExpirationTime: expirationTime,
    serviceAnnualFeeBalance: 26.35 + (i % 5),
    asrAnnualUsage: `384,3848 tokens`,
    llmAnnualUsage: `384,3848 tokens`,
    ttsAnnualUsage: `213.55 h`,
    voiceCloneAnnualUsage: `213.55 h`,
    registrationTime: activationTime,
    updateTime: activationTime,
  });
}

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
  ipRoleValue.value = { key: 'all', label: '全部', value: 'all' };
  memberTypeValue.value = { key: 'all', label: '全部', value: 'all' };
  memberPaymentValue.value = { key: 'all', label: '全部', value: 'all' };
  fourGPlanValue.value = { key: 'all', label: '全部', value: 'all' };
  fourGPaymentValue.value = { key: 'all', label: '全部', value: 'all' };

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

:deep(.fourg-payment-select .ant-select-selector) {
  padding-left: 55px !important;
}

:deep(.fourg-plan-select .ant-select-selector) {
  padding-left: 55px !important;
}

:deep(.nowrap-header) {
  white-space: nowrap !important;
}
</style>