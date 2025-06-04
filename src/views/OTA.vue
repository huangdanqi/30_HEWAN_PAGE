<template>
  <div class="ota-container">
    
    <OTAHeader
      v-model:filter-device-model="filterDeviceModel"
      v-model:filter-manufacturer="filterManufacturer"
      @search="handleSearch"
      @refresh="fetchData"
    />
    <OTATable
      :columns="columns"
      :data="data"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { TablePaginationConfig } from 'ant-design-vue';
import OTAHeader from '../components/OTAHeader.vue';
import OTATable from '../components/OTATable.vue';

interface DataItem {
  key: string;
  serialNumber: number; // 序号
  deviceId: string; // 设备ID
  deviceModel: string; // 设备型号
  manufacturer: string; // 生产厂家
  currentFirmware: string; // 当前固件版本
  initialFirmware: string; // 初始固件版本
  latestFirmware: string; // 最新固件版本
  onlineStatus: string; // 在线状态
  lastOnlineTime: string; // 最后在线时间
  otaStatus: string; // OTA状态
  otaProgress: string; // OTA进度
  otaCompletionTime: string; // OTA完成时间
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
  { title: '生产厂家', dataIndex: 'manufacturer', key: 'manufacturer' },
  { title: '当前固件版本', dataIndex: 'currentFirmware', key: 'currentFirmware' },
  { title: '初始固件版本', dataIndex: 'initialFirmware', key: 'initialFirmware' },
  { title: '最新固件版本', dataIndex: 'latestFirmware', key: 'latestFirmware' },
  { title: '在线状态', dataIndex: 'onlineStatus', key: 'onlineStatus' },
  { title: '最后在线时间', dataIndex: 'lastOnlineTime', key: 'lastOnlineTime' },
  { title: 'OTA状态', dataIndex: 'otaStatus', key: 'otaStatus' },
  { title: 'OTA进度', dataIndex: 'otaProgress', key: 'otaProgress' },
  { title: 'OTA完成时间', dataIndex: 'otaCompletionTime', key: 'otaCompletionTime' },
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
    manufacturer: `Manufacturer ${i % 2}`,
    currentFirmware: `v1.0.${i}`,
    initialFirmware: `v1.0.0`,
    latestFirmware: `v1.1.${i % 5}`,
    onlineStatus: i % 2 === 0 ? '在线' : '离线',
    lastOnlineTime: `2023-10-${String(i % 30 + 1).padStart(2, '0')} 10:00:00`,
    otaStatus: i % 3 === 0 ? '成功' : i % 3 === 1 ? '进行中' : '失败',
    otaProgress: `${(i * 2) % 101}%`,
    otaCompletionTime: i % 3 === 0 ? `2023-10-${String(i % 30 + 1).padStart(2, '0')} 10:05:00` : '-',
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

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.ota-container {
  padding: 24px; /* Keep padding for content within the page */
}
</style> 