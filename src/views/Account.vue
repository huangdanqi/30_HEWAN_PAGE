<template>
  <div class="account-container">

    
    <AccountHeader
      v-model:filter-device-model="filterDeviceModel"
      v-model:filter-manufacturer="filterManufacturer"
      :unique-roles="uniqueRoles"
      :unique-membership-types="uniqueMembershipTypes"
      :unique-membership-payments="uniqueMembershipPayments"
      :unique-four-g-plans="uniqueFourGPlans"
      :unique-four-g-payments="uniqueFourGPayments"
      @search="handleSearch"
      @refresh="fetchData"
      @configure-columns="showConfigModal"
      @show-info="handleShowInfo"
      @apply-filters="handleApplyFilters"
    />
    <AccountTable
      :columns="displayedColumns"
      :data="data"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
    />

    <!-- Column Configuration Modal -->
    <a-modal
      title="Configure Table Columns"
      :visible="isConfigModalVisible"
      @cancel="handleConfigModalClose"
      @ok="handleConfigModalClose"
    >
      <div>
        <h3>
          Visible Columns
          <a-button type="link" @click="selectAllColumns" style="float: right;">Select All</a-button>
        </h3>
        <a-checkbox-group v-model:value="visibleColumnKeys">
          <div v-for="column in allColumns" :key="column.key as string">
            <a-checkbox :value="column.key as string">{{ column.title }}</a-checkbox>
          </div>
        </a-checkbox-group>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import type { TablePaginationConfig } from 'ant-design-vue';
import AccountHeader from '../components/AccountHeader.vue';
import AccountTable from '../components/AccountTable.vue';

interface DataItem {
  key: string;
  serialNumber: number;
  accountId: string;
  phoneNumber: string;
  deviceModel: string;
  deviceId: string;
  ipRole: string;
  productModel: string;
  membershipType: string;
  membershipPaymentStatus: string;
  membershipActivationTime: string;
  membershipExpirationTime: string;
  fourGPlan: string;
  remainingData: string;
  fourGPaymentStatus: string;
  annualServiceFee: number;
  asrAnnualUsage: string;
  llmAnnualUsage: string;
  ttsAnnualUsage: string;
  voiceCloningAnnualUsage: string;
  creationTime: string;
}

const data = ref<DataItem[]>([]);
const loading = ref(false);
const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 3,
  total: 0,
  showTotal: (total: number) => `Total ${total} items`,
});

const filterDeviceModel = ref('');
const filterManufacturer = ref('');

// Computed properties to get unique values for filters
const uniqueRoles = computed(() => [
  '全部',
  ...new Set(data.value.map(item => item.ipRole))
]);

const uniqueMembershipTypes = computed(() => [
  '全部',
  ...new Set(data.value.map(item => item.membershipType))
]);

const uniqueMembershipPayments = computed(() => [
  '全部',
  ...new Set(data.value.map(item => item.membershipPaymentStatus))
]);

const uniqueFourGPlans = computed(() => [
  '全部',
  ...new Set(data.value.map(item => item.fourGPlan))
]);

const uniqueFourGPayments = computed(() => [
  '全部',
  ...new Set(data.value.map(item => item.fourGPaymentStatus))
]);

// Define the original complete list of columns
const allColumns = [
  { title: '序号', dataIndex: 'serialNumber', key: 'serialNumber', sorter: true },
  { title: '账户ID', dataIndex: 'accountId', key: 'accountId', sorter: true },
  { title: '手机号', dataIndex: 'phoneNumber', key: 'phoneNumber', sorter: true },
  { title: '设备型号', dataIndex: 'deviceModel', key: 'deviceModel', sorter: true },
  { title: '设备ID', dataIndex: 'deviceId', key: 'deviceId', sorter: true },
  { title: 'IP角色', dataIndex: 'ipRole', key: 'ipRole', sorter: true },
  { title: '产品型号', dataIndex: 'productModel', key: 'productModel', sorter: true },
  { title: '会员类型', dataIndex: 'membershipType', key: 'membershipType', sorter: true },
  { title: '会员付费', dataIndex: 'membershipPaymentStatus', key: 'membershipPaymentStatus', sorter: true },
  { title: '会员激活时间', dataIndex: 'membershipActivationTime', key: 'membershipActivationTime', sorter: true },
  { title: '会员到期时间', dataIndex: 'membershipExpirationTime', key: 'membershipExpirationTime', sorter: true },
  { title: '4G套餐', dataIndex: 'fourGPlan', key: 'fourGPlan', sorter: true },
  { title: '当月剩余流量', dataIndex: 'remainingData', key: 'remainingData', sorter: true },
  { title: '4G付费', dataIndex: 'fourGPaymentStatus', key: '4GPaymentStatus', sorter: true },
  { title: '服务年费用 (元)', dataIndex: 'annualServiceFee', key: 'annualServiceFee', sorter: true },
  { title: 'ASR年用量', dataIndex: 'asrAnnualUsage', key: 'asrAnnualUsage', sorter: true },
  { title: 'LLM年用量', dataIndex: 'llmAnnualUsage', key: 'llmAnnualUsage', sorter: true },
  { title: 'TTS年用量', dataIndex: 'ttsAnnualUsage', key: 'ttsAnnualUsage', sorter: true },
  { title: '音色克隆年用量', dataIndex: 'voiceCloningAnnualUsage', key: 'voiceCloningAnnualUsage', sorter: true },
  { title: '创建时间', dataIndex: 'creationTime', key: 'creationTime', sorter: true },
];

// Reactive state for visible column keys and their order
const visibleColumnKeys = ref(allColumns.map(col => col.key as string));
const columnOrder = ref(allColumns.map(col => col.key as string));

const isConfigModalVisible = ref(false);

// Computed property to get the columns to display based on visibility and order
const displayedColumns = computed(() => {
  const orderedColumns = columnOrder.value
    .map(key => allColumns.find(col => col.key === key))
    .filter(col => col !== undefined);

  return orderedColumns.filter(col => visibleColumnKeys.value.includes(col!.key as string));
});

// Function to show the configuration modal
const showConfigModal = () => {
  isConfigModalVisible.value = true;
};

// Function to handle modal close/cancel
const handleConfigModalClose = () => {
  isConfigModalVisible.value = false;
  // The changes to visibleColumnKeys are already reactive, so no need to explicitly save here
  // TODO: Add logic to save column configuration persistently (e.g., using localStorage)
};

// Function to handle the Info button click
const handleShowInfo = () => {
  alert('Account Information Page - Info'); // Replace with a more sophisticated notification if needed
};

// Function to handle applying filters
const handleApplyFilters = () => {
  console.log('Applying filters...');
  // TODO: Implement filtering logic here based on selected filter values
  // This will likely involve calling fetchData with current filter values
  fetchData(); // Refetch data with current filters
};

// Function to select all columns
const selectAllColumns = () => {
  visibleColumnKeys.value = allColumns.map(col => col.key as string);
};

// TODO: Implement persistence for visibleColumnKeys and columnOrder (e.g., using localStorage)

const fetchData = async () => {
  loading.value = true;
  // Replace with actual API call to fetch accounting data
  console.log('Fetching data with filters:', filterDeviceModel.value, filterManufacturer.value);
  console.log('Pagination:', pagination.current, pagination.pageSize);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  const dummyData: DataItem[] = Array.from({ length: 50 }).map((_, i) => ({
    key: `item-${i}`,
    serialNumber: i + 1,
    accountId: `acc-${i + 1}`,
    phoneNumber: `1380000${String(i).padStart(4, '0')}`,
    deviceModel: `Model ${i % 5}`,
    deviceId: `dev-${i + 1000}`,
    ipRole: i % 2 === 0 ? 'Admin' : 'User',
    productModel: `Prod ${i % 3}`,
    membershipType: i % 2 === 0 ? 'Premium' : 'Standard',
    membershipPaymentStatus: i % 2 === 0 ? 'Paid' : 'Unpaid',
    membershipActivationTime: `2023-01-${String(i % 30 + 1).padStart(2, '0')}`,
    membershipExpirationTime: `2024-01-${String(i % 30 + 1).padStart(2, '0')}`,
    fourGPlan: i % 3 === 0 ? 'Unlimited' : 'Limited',
    remainingData: `${(100 - i).toFixed(2)} GB`,
    fourGPaymentStatus: i % 3 === 0 ? 'Active' : 'Inactive',
    annualServiceFee: (i + 1) * 100,
    asrAnnualUsage: `${(i * 10).toFixed(2)} hrs`,
    llmAnnualUsage: `${(i * 50).toFixed(2)} tokens`,
    ttsAnnualUsage: `${(i * 20).toFixed(2)} hrs`,
    voiceCloningAnnualUsage: `${(i * 5).toFixed(2)} clones`,
    creationTime: `2022-12-${String(i % 31 + 1).padStart(2, '0')}`,
  }));

  data.value = dummyData.slice(
    ((pagination.current as number) - 1) * (pagination.pageSize as number),
    (pagination.current as number) * (pagination.pageSize as number)
  );
  pagination.total = dummyData.length;
  loading.value = false;
};

const handleSearch = (value: string) => {
  console.log('Search:', value);
  // Implement search logic here
  fetchData();
};

const handleTableChange = (pag: TablePaginationConfig, filters: any, sorter: any) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  console.log('Table change - Pagination:', pag);
  console.log('Table change - Filters:', filters);
  console.log('Table change - Sorter:', sorter);
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.account-container {
  padding: 24px; /* Keep padding for content within the page */
}
</style> 