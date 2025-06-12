<template>
  <div class="account-container">
    <AccountTitle />

    <!-- AccountHeader component for filters and actions -->
    <AccountHeader
      :filter-device-model="filterDeviceModel"
      @update:filterDeviceModel="(newValue: string) => { filterDeviceModel = newValue; }"
      :filter-manufacturer="filterManufacturer"
      @update:filterManufacturer="(newValue: string) => { filterManufacturer = newValue; }"
      :filter-device-status="filterDeviceStatus"
      @update:filterDeviceStatus="(newValue: string) => { filterDeviceStatus = newValue; }"
      :unique-roles="uniqueRoles"
      :unique-membership-types="uniqueMembershipTypes"
      :filter-membership-type="filterMembershipType"
      @update:filterMembershipType="(newValue: string) => { filterMembershipType = newValue; }"
      :unique-membership-payments="uniqueMembershipPayments"
      :filter-membership-payment="filterMembershipPayment"
      @update:filterMembershipPayment="(newValue: string) => { filterMembershipPayment = newValue; }"
      :unique-four-g-plans="uniqueFourGPlans"
      :filter-four-g-plan="filter4GPlan"
      @update:filter4GPlan="(newValue: string) => { filter4GPlan = newValue; console.log('Account.vue: @update:filter4GPlan received', newValue); }"
      :unique-four-g-payments="uniqueFourGPayments"
      :filter-four-g-payment="filter4GPayment"
      @update:filter4GPayment="(newValue: string) => { filter4GPayment = newValue; console.log('Account.vue: @update:filter4GPayment received', newValue); }"
      :unique-device-statuses="uniqueDeviceStatuses"
      :searchText="searchText"
      @update:searchText="(newValue: string) => { searchText = newValue; }"
      @refresh="fetchData"
      @configure-columns="showConfigModal"
      @show-info="handleShowInfo"
      @apply-filters="handleApplyFilters"
      :filter-role="filterRole"
      @update:filterRole="newValue => filterRole = newValue"
    />
    <!-- AccountTable component for displaying data -->
    <AccountTable
      :columns="displayedColumns"
      :data="data"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      @update:data="(newData: DataItem[]) => { data = newData; }"
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
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue';
import type { TablePaginationConfig, TableColumnType } from 'ant-design-vue';
import AccountHeader from '../components/AccountHeader.vue';
import AccountTable from '../components/AccountTable.vue';
import AccountTitle from '../components/AccountTitle.vue';

// Interface defining the structure of a single data item in the table
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
  deviceStatus: string;
}

// Reactive state for table data, loading status, and pagination
const data = ref<DataItem[]>([]); // Data displayed in the table
const loading = ref(false); // Loading indicator for the table
const pagination = reactive<TablePaginationConfig>({
  current: 1, // Current page number
  pageSize: 5, // Number of items per page
  total: 0, // Total number of items
  showTotal: (total: number) => `第 ${((pagination.current as number) - 1) * (pagination.pageSize as number) + 1}-${Math.min((pagination.current as number) * (pagination.pageSize as number), total)}条/共 ${total} 条`, // Function to display total items
  showSizeChanger: true, // Enable page size changer
  pageSizeOptions: ['10', '20', '50', '100'], // Options for page size
  // showQuickJumper: true, // Enable quick jumper for pagination
});

// Ref to store the original unfiltered data fetched from the "API"
const originalData = ref<DataItem[]>([]);

// Define local reactive references (refs) for filter values and search text
// These refs are updated by the AccountHeader component and trigger data fetching via the watcher
const filterDeviceModel = ref('');
const filterManufacturer = ref('');
const filterRole = ref('all'); // Initial value 'all' for "全部" (all) selection
const filterMembershipType = ref('all');
const filterMembershipPayment = ref('all');
const filter4GPlan = ref('all');
const filter4GPayment = ref('all');
const filterDeviceStatus = ref('all');
const searchText = ref(''); // Search input text

// Watcher to trigger data fetching when any filter variable, search text, or pagination changes
// pagination.current is reset to 1 to go back to the first page with new filters
// nextTick ensures that filter/pagination refs are updated in the DOM before fetchData is called
watch(
  [filterRole, filterMembershipType, filterMembershipPayment, filter4GPlan, filter4GPayment, filterDeviceStatus, searchText, () => pagination.current, () => pagination.pageSize],
  () => {
    console.log('Account.vue: Watcher triggered.');
    console.log('  filter4GPayment (in watcher):', filter4GPayment.value);
    // Always reset current page when any watched filter/search value changes
    pagination.current = 1;
    nextTick(() => fetchData());
  }
);

// Computed properties to get unique values for filters from the original data
// These are passed as props to AccountHeader for populating dropdown options
const uniqueRoles = computed(() => [
  ...new Set(originalData.value.map(item => item.ipRole))
]);

const uniqueMembershipTypes = computed(() => [
  // Collects unique membership types from the original data
  ...new Set(originalData.value.map(item => item.membershipType))
]);

const uniqueMembershipPayments = computed(() => [
  // Collects unique membership payment statuses from the original data
  ...new Set(originalData.value.map(item => item.membershipPaymentStatus))
]);

const uniqueFourGPlans = computed(() => {
  // If originalData is empty, return the expected values
  if (originalData.value.length === 0) {
    return ['unlimited', 'limited'];
  }
  // Otherwise, collect unique 4G plans from the original data
  return [...new Set(originalData.value.map(item => item.fourGPlan))];
});

const uniqueFourGPayments = computed(() => [
  // Collects unique 4G payment statuses from the original data
  ...new Set(originalData.value.map(item => item.fourGPaymentStatus))
]);

const uniqueDeviceStatuses = computed(() => [
  // Collects unique device statuses from the original data
  ...new Set(originalData.value.map(item => item.deviceStatus))
]);

// Define the original complete list of columns for the table
// Each column has a title, dataIndex (key for data mapping), key, and sorter property
const allColumns: TableColumnType[] = [
  { title: '序号', dataIndex: 'serialNumber', key: 'serialNumber', sorter: true, width: 80 },
  { title: '账户ID', dataIndex: 'accountId', key: 'accountId', sorter: true, width: 120 },
  { title: '手机号', dataIndex: 'phoneNumber', key: 'phoneNumber', sorter: true, width: 120 },
  { title: '设备型号', dataIndex: 'deviceModel', key: 'deviceModel', sorter: true, width: 120 },
  { title: '设备ID', dataIndex: 'deviceId', key: 'deviceId', sorter: true, width: 120 },
  { title: 'IP角色', dataIndex: 'ipRole', key: 'ipRole', sorter: true, width: 120 },
  { title: '产品型号', dataIndex: 'productModel', key: 'productModel', sorter: true, width: 120 },
  { title: '会员类型', dataIndex: 'membershipType', key: 'membershipType', sorter: true, width: 120 },
  { title: '会员付费', dataIndex: 'membershipPaymentStatus', key: 'membershipPaymentStatus', sorter: true, width: 120 },
  { title: '会员激活时间', dataIndex: 'membershipActivationTime', key: 'membershipActivationTime', sorter: true, width: 140 },
  { title: '会员到期时间', dataIndex: 'membershipExpirationTime', key: 'membershipExpirationTime', sorter: true, width: 140 },
  { title: '4G套餐', dataIndex: 'fourGPlan', key: 'fourGPlan', sorter: true, width: 100 },
  { title: '当月剩余流量', dataIndex: 'remainingData', key: 'remainingData', sorter: true, width: 160 },
  { title: '4G付费', dataIndex: 'fourGPaymentStatus', key: '4GPaymentStatus', sorter: true, width: 100 },
  { title: '服务年费用 (元)', dataIndex: 'annualServiceFee', key: 'annualServiceFee', sorter: true, width: 160 },
  { title: 'ASR年用量', dataIndex: 'asrAnnualUsage', key: 'asrAnnualUsage', sorter: true, width: 120 },
  { title: 'LLM年用量', dataIndex: 'llmAnnualUsage', key: 'llmAnnualUsage', sorter: true, width: 120 },
  { title: 'TTS年用量', dataIndex: 'ttsAnnualUsage', key: 'ttsAnnualUsage', sorter: true, width: 120 },
  { title: '音色克隆年用量', dataIndex: 'voiceCloningAnnualUsage', key: 'voiceCloningAnnualUsage', sorter: true, width: 160 },
  { title: '创建时间', dataIndex: 'creationTime', key: 'creationTime', sorter: true, width: 120 },
  { title: '设备状态', dataIndex: 'deviceStatus', key: 'deviceStatus', sorter: true, width: 120, fixed: 'right' },
];

// Reactive state for visible column keys and their order for the column configuration modal
const visibleColumnKeys = ref(allColumns.map(col => col.key as string)); // Keys of currently visible columns
const columnOrder = ref(allColumns.map(col => col.key as string)); // Order of columns

// State for the column configuration modal visibility
const isConfigModalVisible = ref(false);

// Computed property to get the columns to display based on visibility and order selected by the user
const displayedColumns = computed(() => {
  const orderedColumns = columnOrder.value
    .map(key => allColumns.find(col => col.key === key))
    .filter(col => col !== undefined);

  return orderedColumns.filter(col => visibleColumnKeys.value.includes(col!.key as string));
});

// Function to show the column configuration modal
const showConfigModal = () => {
  isConfigModalVisible.value = true;
};

// Function to handle modal close/cancel for column configuration
const handleConfigModalClose = () => {
  isConfigModalVisible.value = false;
  // The changes to visibleColumnKeys are already reactive, so no need to explicitly save here
  // TODO: Add logic to save column configuration persistently (e.g., using localStorage) if desired
};

// Function to handle the Info button click (placeholder/example)
const handleShowInfo = () => {
  alert('Account Information Page - Info'); // Replace with a more sophisticated notification if needed
};

// Function to handle applying filters from a dedicated "Apply Filters" button (if implemented in header)
// Resets pagination and triggers fetchData
const handleApplyFilters = () => {
  console.log('Applying filters...', {
    filterRole: filterRole.value,
    filterMembershipType: filterMembershipType.value,
    filterMembershipPayment: filterMembershipPayment.value,
    filter4GPlan: filter4GPlan.value,
    filter4GPayment: filter4GPayment.value,
    filterDeviceStatus: filterDeviceStatus.value,
    searchText: searchText.value,
  });
  // Reset pagination to the first page when applying filters
  pagination.current = 1;
  nextTick(() => fetchData()); // Ensure fetchData is called after filter refs are updated
};

// Function to handle drag sort end event (currently commented out/not implemented)
// const handleDragSortEnd = (reorderedData: DataItem[]) => {
//   console.log('Data after drag sort:', reorderedData);
//   data.value = reorderedData; // Update the data with the new order
// };

// Function to select all columns in the configuration modal
const selectAllColumns = () => {
  visibleColumnKeys.value = allColumns.map(col => col.key as string);
};

// TODO: Implement persistence for visibleColumnKeys and columnOrder (e.g., using localStorage)

// Function to fetch data based on current filters and pagination settings
const fetchData = async () => {
  loading.value = true; // Set loading state to true
  console.log('Account.vue: fetchData called.');
  console.log('  filterRole:', filterRole.value);
  console.log('  filterMembershipType:', filterMembershipType.value);
  console.log('  filterMembershipPayment:', filterMembershipPayment.value);
  console.log('  filter4GPlan (inside fetchData):', filter4GPlan.value);
  console.log('  filter4GPayment:', filter4GPayment.value);
  console.log('  filterDeviceStatus:', filterDeviceStatus.value);
  console.log('  searchText:', searchText.value);
  console.log('  Pagination:', pagination.current, pagination.pageSize);
  
  // Replace with actual API call to fetch accounting data
  console.log('Fetching data with filters:', filterDeviceModel.value, filterManufacturer.value);
  
  // Simulate API call or fetch real data (e.g., from a backend API)
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Generate dummy data or assign fetched data to originalData
  // In a real application, you'd assign the data from your API call here
  const generatedDummyData: DataItem[] = Array.from({ length: 50 }).map((_, i) => ({
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
    fourGPlan: i % 3 === 0 ? 'unlimited' : 'limited',
    remainingData: `${(100 - i).toFixed(2)} GB`,
    fourGPaymentStatus: i % 3 === 0 ? 'Active' : 'Inactive',
    annualServiceFee: (i + 1) * 100,
    asrAnnualUsage: `${(i * 10).toFixed(2)} hrs`,
    llmAnnualUsage: `${(i * 50).toFixed(2)} tokens`,
    ttsAnnualUsage: `${(i * 20).toFixed(2)} hrs`,
    voiceCloningAnnualUsage: `${(i * 5).toFixed(2)} clones`,
    creationTime: `2022-12-${String(i % 31 + 1).padStart(2, '0')}`,
    deviceStatus: i % 2 === 0 ? 'Online' : 'Offline',
  }));

  originalData.value = generatedDummyData; // For simulation, assign dummy data

  // Apply filters to the original data
  const filteredData = originalData.value.filter(item => {
    const roleMatch = filterRole.value === 'all' || item.ipRole === filterRole.value;
    const membershipTypeMatch = filterMembershipType.value === 'all' || item.membershipType === filterMembershipType.value;
    const membershipPaymentMatch = filterMembershipPayment.value === 'all' || item.membershipPaymentStatus === filterMembershipPayment.value;
    const fourGPlanMatch = filter4GPlan.value === 'all' || item.fourGPlan === filter4GPlan.value;
    const fourGPaymentMatch = filter4GPayment.value === 'all' || item.fourGPaymentStatus === filter4GPayment.value;
    console.log(`Filtering: item.fourGPaymentStatus=${item.fourGPaymentStatus}, filter4GPayment.value=${filter4GPayment.value}, fourGPaymentMatch=${fourGPaymentMatch}`);
    const deviceStatusMatch = filterDeviceStatus.value === 'all' || item.deviceStatus === filterDeviceStatus.value;
    const searchMatch = !searchText.value || Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchText.value.toLowerCase())
    );
    
    return roleMatch && membershipTypeMatch && membershipPaymentMatch && fourGPlanMatch && fourGPaymentMatch && deviceStatusMatch && searchMatch;
  });

  console.log('Filtered data length:', filteredData.length);
  console.log('Sample filtered data (first 5 items):', filteredData.slice(0, 5));

  // Apply pagination to the filtered data
  data.value = filteredData.slice(
    ((pagination.current as number) - 1) * (pagination.pageSize as number),
    (pagination.current as number) * (pagination.pageSize as number)
  );
  pagination.total = filteredData.length; // Update total count for pagination
  loading.value = false; // Set loading state to false
};

// Handler for table changes (pagination, filters, sorter)
const handleTableChange = (pag: TablePaginationConfig, filters: any, sorter: any) => {
  pagination.current = pag.current; // Update current page
  pagination.pageSize = pag.pageSize; // Update page size
  console.log('Table change - Pagination:', pag);
  console.log('Table change - Filters:', filters);
  console.log('Table change - Sorter:', sorter);
  // The watcher will handle triggering fetchData once pagination state is updated
  // Removed direct fetchData() call to prevent infinite reactivity loop
};

// Fetch data when the component is mounted
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* Scoped styles for the account container */
.account-container {
  padding: 14px; /* Adjusted padding (24px * 0.60) */
  width: 100%; /* Ensure full width */
  height: auto; /* Allow height to adjust naturally */
  font-size: 12px; /* Set base font size for the account page */
}
</style>

<style>
/* Global styles to override Ant Design pagination defaults if needed */
.ant-pagination {
  text-align: right; /* Default Ant Design pagination alignment */
}



</style> 