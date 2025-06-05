<template>
  <div class="ota-container">

    <OtaHeader
      v-model:filter-device-model="filterDeviceModel"
      v-model:filter-manufacturer="filterManufacturer"
      @search="handleSearch"
      @refresh="fetchData"
    />
    <OtaTable
      :columns="columns"
      :data="data"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      @drag-sort-end="handleDragSortEnd"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { TablePaginationConfig } from 'ant-design-vue';
// Corrected import paths for case sensitivity - please ensure your filenames match this casing
import OtaHeader from '../components/OtaHeader.vue';
import OtaTable from '../components/OtaTable.vue';

interface DataItem {
  key: string;
  serialNumber: number; // 序号
  deviceModel: string; // 设备型号
  deviceId: string; // 设备ID
  onlineStatus: string; // 在线状态
  deviceStatus: string; // 设备状态
  softwareVersion: string; // 软件版本
  lastOnlineTime: string; // 最后一次在线时间
  lastOfflineTime: string; // 最后一次离线时间
  creationTime: string; // 创建时间
  otaCompletionTime: string; // OTA完成时间
  operations?: string; // Placeholder for operations column
}

const data = ref<DataItem[]>([]);
const loading = ref(false);
const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 3, // You can adjust the default page size here
  total: 0,
  showTotal: (total: number) => `Total ${total} items`,
});

const filterDeviceModel = ref('');
const filterManufacturer = ref('');
const searchText = ref('');

const columns = [
  { title: '序号', dataIndex: 'serialNumber', key: 'serialNumber' },
  { title: '设备ID', dataIndex: 'deviceId', key: 'deviceId' },
  { title: '设备型号', dataIndex: 'deviceModel', key: 'deviceModel' },
  { title: '在线状态', dataIndex: 'onlineStatus', key: 'onlineStatus' },
  { title: '设备状态', dataIndex: 'deviceStatus', key: 'deviceStatus' },
  { title: '软件版本', dataIndex: 'softwareVersion', key: 'softwareVersion' },
  { title: '最后一次在线时间', dataIndex: 'lastOnlineTime', key: 'lastOnlineTime' },
  { title: '最后一次离线时间', dataIndex: 'lastOfflineTime', key: 'lastOfflineTime' },
  { title: '创建时间', dataIndex: 'creationTime', key: 'creationTime' },
  { title: 'OTA完成时间', dataIndex: 'otaCompletionTime', key: 'otaCompletionTime' },
  {
    title: '操作',
    key: 'operations',
    fixed: 'right' as const,
    width: 180,
  },
];

const fetchData = async () => {
  loading.value = true;
  // Replace with actual API call to fetch OTA data
  console.log('Fetching OTA data with filters:', filterDeviceModel.value, filterManufacturer.value, searchText.value);
  console.log('Pagination:', pagination.current, pagination.pageSize);

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  const dummyData: DataItem[] = Array.from({ length: 50 }).map((_, i) => ({
    key: `ota-item-${i}`,
    serialNumber: i + 1,
    deviceId: `ota-dev-${i + 1000}`,
    deviceModel: `OTA Model ${i % 3}`,
    onlineStatus: i % 2 === 0 ? '在线' : '离线',
    deviceStatus: i % 2 === 0 ? '正常' : '异常',
    softwareVersion: `v1.0.${i}`,
    lastOnlineTime: `2023-10-${String(i % 30 + 1).padStart(2, '0')} 10:00:00`,
    lastOfflineTime: i % 2 === 0 ? '-': `2023-10-${String(i % 30 + 1).padStart(2, '0')} 10:00:00`,
    creationTime: `2023-10-${String(i % 30 + 1).padStart(2, '0')} 10:00:00`,
    otaCompletionTime: i % 3 === 0 ? `2023-10-${String(i % 30 + 1).padStart(2, '0')} 10:05:00` : '-',
    operations: ''
  }));

  data.value = dummyData.slice(
    ((pagination.current as number) - 1) * (pagination.pageSize as number),
    (pagination.current as number) * (pagination.pageSize as number)
  );
  pagination.total = dummyData.length;
  loading.value = false;
};

const handleSearch = (value: string) => {
  searchText.value = value;
  console.log('Search OTA:', searchText.value);
  // Implement search logic here, likely refetching data
  fetchData();
};

const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchData();
};

// Function to handle drag sort end event
const handleDragSortEnd = (reorderedData: DataItem[]) => {
  console.log('OTA data after drag sort:', reorderedData);
  data.value = reorderedData; // Update the data with the new order
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.ota-container {
  padding: 24px; /* Keep padding for content within the page */
}
</style>