<template>
  <div class="ota-container">
    <OtaTitle />

    <!-- Placeholder for the new OtaHeader -->
    <OtaHeader
      v-model:filterDeviceModel="filterDeviceModel"
      v-model:filterManufacturer="filterManufacturer"
      v-model:searchText="searchText"
      @search="handleSearch"
      @refresh="fetchData"
      @device-import="handleDeviceImport"
      @ota-config="handleOtaConfig"
      @configure-columns="showConfigModal"
    />

    <OtaTable
      :columns="columns"
      :data="data"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      @upgrade="handleUpgrade"
      @details="handleDetails"
      @delete="handleDelete"
    />
    
    <!-- Column Configuration Modal -->
    <a-modal
      title="Configure Table Columns"
      v-model:visible="isConfigModalVisible"
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
import { ref, reactive, onMounted, computed, watch } from 'vue';
import type { TablePaginationConfig, TableColumnType } from 'ant-design-vue';
import { message } from 'ant-design-vue';

import OtaTitle from '../components/OtaTitle.vue';
import OtaHeader from '../components/OtaHeader.vue';
import OtaTable from '../components/OtaTable.vue';

interface DataItem {
  key: string;
  serialNumber: number; // 序号
  deviceId: string; // 设备ID
  boundSubAccount: string; // 绑定子账户
  deviceModel: string; // 设备型号
  productionBatch: string; // 生产批次
  manufacturer: string; // 生产厂家
  initialFirmware: string; // 初始固件
  latestFirmware: string; // 最新固件
  currentFirmwareVersion: string; // 当前固件版本
  snCode: string; // SN码
  eFuseId: string; // eFuse ID
  macAddress: string; // MAC地址
  bluetoothName: string; // 蓝牙名称
  imei: string; // IMEI
  fourGCardNumber: string; // 4G卡号
  cpuSerial: string; // CPU序列
  creator: string; // 创建人
  creationTime: string; // 创建时间
  updateTime: string; // 更新时间
}

const data = ref<DataItem[]>([]);
const loading = ref(false);
const searchText = ref('');
const filterDeviceModel = ref('all');
const filterManufacturer = ref('all');
const isConfigModalVisible = ref(false);
const visibleColumnKeys = ref<string[]>([]);

const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total: number) => `第 ${((pagination.current as number) - 1) * (pagination.pageSize as number) + 1}-${Math.min((pagination.current as number) * (pagination.pageSize as number), total)}条/共 ${total} 条`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
});

const allColumns: TableColumnType[] = [
  { title: '序号', dataIndex: 'serialNumber', key: 'serialNumber', fixed: 'left', width: 70 },
  { title: '设备ID', dataIndex: 'deviceId', key: 'deviceId', width: 150 },
  { title: '绑定子账户', dataIndex: 'boundSubAccount', key: 'boundSubAccount', width: 120 },
  { title: '设备型号', dataIndex: 'deviceModel', key: 'deviceModel', width: 100 },
  { title: '生产批次', dataIndex: 'productionBatch', key: 'productionBatch', width: 120 },
  { title: '生产厂家', dataIndex: 'manufacturer', key: 'manufacturer', width: 150 },
  { title: '初始固件', dataIndex: 'initialFirmware', key: 'initialFirmware', width: 120 },
  { title: '最新固件', dataIndex: 'latestFirmware', key: 'latestFirmware', width: 120 },
  { title: '当前固件版本', dataIndex: 'currentFirmwareVersion', key: 'currentFirmwareVersion', width: 150 },
  { title: 'SN码', dataIndex: 'snCode', key: 'snCode', width: 180 },
  { title: 'eFuse ID', dataIndex: 'eFuseId', key: 'eFuseId', width: 150 },
  { title: 'MAC地址', dataIndex: 'macAddress', key: 'macAddress', width: 150 },
  { title: '蓝牙名称', dataIndex: 'bluetoothName', key: 'bluetoothName', width: 150 },
  { title: 'IMEI', dataIndex: 'imei', key: 'imei', width: 150 },
  { title: '4G卡号', dataIndex: 'fourGCardNumber', key: 'fourGCardNumber', width: 150 },
  { title: 'CPU序列', dataIndex: 'cpuSerial', key: 'cpuSerial', width: 150 },
  { title: '创建人', dataIndex: 'creator', key: 'creator', width: 100 },
  { title: '创建时间', dataIndex: 'creationTime', key: 'creationTime', width: 150, sorter: true },
  { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 150, sorter: true },
  {
    title: '操作',
    key: 'operations',
    fixed: 'right' as const,
    width: 200,
  },
];

const columns = computed(() => {
  return allColumns.filter(column => visibleColumnKeys.value.includes(column.key as string));
});

const fetchData = async () => {
  loading.value = true;
  // Replace with actual API call to fetch OTA data
  console.log('Fetching OTA data with filters:', filterDeviceModel.value, filterManufacturer.value, searchText.value);
  console.log('Pagination:', pagination.current, pagination.pageSize);

  await new Promise(resolve => setTimeout(resolve, 1000));

  const dummyData: DataItem[] = Array.from({ length: 50 }).map((_, i) => ({
    key: `ota-item-${i}`,
    serialNumber: i + 1,
    deviceId: `0075A1B2SZTDS250619B2X9J8`,
    boundSubAccount: i % 2 === 0 ? '183****7953' : '-',
    deviceModel: 'HWSZ001',
    productionBatch: '2025-06-30',
    manufacturer: '深圳天德胜科技有限公司',
    initialFirmware: 'Z001 V 1.0.1',
    latestFirmware: 'Z001 V 2.0.1',
    currentFirmwareVersion: 'Z001 V 1.3.0',
    snCode: 'SZTDS250619B2X9J8',
    eFuseId: 'ESP32-0075A1B2',
    macAddress: 'DC:54:75:62:66:70',
    bluetoothName: 'Zibbi 001 250619X9J8',
    imei: '35380100360174',
    fourGCardNumber: '1477629430136',
    cpuSerial: '0x1FFFF7E8',
    creator: '33',
    creationTime: '2025-7-13 19:25:11',
    updateTime: '2025-7-13 19:25:11',
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
  fetchData();
};

const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.current = pag.current || 1;
  pagination.pageSize = pag.pageSize || 10;
  fetchData();
};

const showConfigModal = () => {
  isConfigModalVisible.value = true;
};

const handleConfigModalClose = () => {
  isConfigModalVisible.value = false;
};

const selectAllColumns = () => {
  visibleColumnKeys.value = allColumns.map(column => column.key as string);
};

const handleUpgrade = (record: DataItem) => {
  message.info(`Upgrade ${record.deviceId}`);
  // Implement upgrade logic
};

const handleDetails = (record: DataItem) => {
  message.info(`Details for ${record.deviceId}`);
  // Implement details logic
};

const handleDelete = (record: DataItem) => {
  message.info(`Delete ${record.deviceId}`);
  // Implement delete logic
};

const handleDeviceImport = () => {
  message.info('设备导入 functionality to be implemented');
  // TODO: Implement device import logic
};

const handleOtaConfig = () => {
  message.info('OTA配置 functionality to be implemented');
  // TODO: Implement OTA config logic
};

onMounted(() => {
  fetchData();
  selectAllColumns(); // Select all columns by default on mount
});

watch([filterDeviceModel, filterManufacturer], () => {
  pagination.current = 1;
  fetchData();
});

</script>

<style scoped>
.ota-container {
  padding: 24px;
}
</style>