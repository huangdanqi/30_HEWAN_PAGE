<template>
  <div class="firmware-container">
    <FirmwareTitle />

    <FirmwareHeader
      v-model:searchText="searchText"
      v-model:filterDeviceModel="filterDeviceModel"
      :unique-device-models="uniqueDeviceModels"
      v-model:filterDeviceStatus="filterDeviceStatus"
      :unique-device-statuses="uniqueDeviceStatuses"
      @refresh="fetchData"
      @release-version="handleReleaseVersion"
      @configure-columns="showConfigModal"
    />

    <FirmwareTable
      :columns="displayedColumns"
      :data="data"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      @edit-record="editRecord"
      @delete-record="deleteRecord"
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

    <FirmwareReleaseModal
      v-model:visible="isReleaseModalVisible"
      :unique-device-models="uniqueDeviceModels"
      @submit="handleReleaseSubmit"
    />

    <FirmwareEditModal
      v-model:visible="isEditModalVisible"
      :record="currentEditRecord"
      @submit="handleEditSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue';
import type { TablePaginationConfig, TableColumnType } from 'ant-design-vue';
import FirmwareTitle from '../components/FirmwareTitle.vue';
import FirmwareHeader from '../components/FirmwareHeader.vue';
import FirmwareTable from '../components/FirmwareTable.vue';
import FirmwareReleaseModal from '../components/FirmwareReleaseModal.vue';
import FirmwareEditModal from '../components/FirmwareEditModal.vue';

// Placeholder comment to trigger linter re-evaluation

interface DataItem {
  key: string;
  serialNumber: number; // 序号
  deviceModel: string; // 设备型号
  releaseVersion: string; // 发布版本
  versionNumber: string; // 版本号
  contentDescription: string; // 内容描述
  creator: string; // 创建人
  releaseTime: string; // 发布时间
  updateTime: string; // 更新时间
  deviceStatus: string; // 设备状态
}

export type { DataItem }; // Export the interface as a type

const data = ref<DataItem[]>([]);
const loading = ref(false);
const searchText = ref('');
const filterDeviceModel = ref('all'); // New filter for device model
const filterDeviceStatus = ref('all'); // New filter for device status
const isConfigModalVisible = ref(false);
const isReleaseModalVisible = ref(false);
const isEditModalVisible = ref(false);
const currentEditRecord = ref<DataItem | null>(null);

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
  { title: '设备型号', dataIndex: 'deviceModel', key: 'deviceModel', width: 120 },
  { title: '发布版本', dataIndex: 'releaseVersion', key: 'releaseVersion', width: 120 },
  { title: '版本号', dataIndex: 'versionNumber', key: 'versionNumber', sorter: true, width: 120 },
  { title: '内容描述', dataIndex: 'contentDescription', key: 'contentDescription', width: 300 },
  { title: '创建人', dataIndex: 'creator', key: 'creator', width: 100 },
  { title: '发布时间', dataIndex: 'releaseTime', key: 'releaseTime', sorter: true, width: 150 },
  { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', sorter: true, width: 150 },
  { title: '设备状态', dataIndex: 'deviceStatus', key: 'deviceStatus', width: 120 },
  {
    title: '操作',
    key: 'operation',
    fixed: 'right',
    width: 180,
  },
];

const visibleColumnKeys = ref(allColumns.map(col => col.key as string));
const columnOrder = ref(allColumns.map(col => col.key as string));

const originalData = ref<DataItem[]>([]);

const uniqueDeviceModels = computed(() => {
  const models = new Set(originalData.value.map(item => item.deviceModel));
  return Array.from(models);
});

const uniqueDeviceStatuses = computed(() => {
  const statuses = new Set(originalData.value.map(item => item.deviceStatus));
  return Array.from(statuses);
});

const displayedColumns = computed(() => {
  const orderedColumns = columnOrder.value
    .map(key => allColumns.find(col => col.key === key))
    .filter(col => col !== undefined);

  return orderedColumns.filter(col => visibleColumnKeys.value.includes(col!.key as string));
});

const fetchData = async () => {
  loading.value = true;
  console.log('Firmware.vue: fetchData called.');
  console.log('  filterDeviceModel (inside fetchData):', filterDeviceModel.value);
  await new Promise(resolve => setTimeout(resolve, 1000));

  const generatedData: DataItem[] = Array.from({ length: 50 }).map((_, i) => ({
    key: `firmware-${i + 1}`,
    serialNumber: i + 1,
    deviceModel: `HWSZ00${i % 5}`, // Example device models
    releaseVersion: i % 2 === 0 ? '首版' : '修订版',
    versionNumber: `Z001 V 1.0.${i}`,
    contentDescription: `1.修改压力传感器间隔采样时间，改为300ms。2.增加复合事件类型：压力+触摸。 (${i})`,
    creator: `${30 + i}`,
    releaseTime: `2025-07-13 19:25:${String(i).padStart(2, '0')}`,
    updateTime: `2025-07-13 19:25:${String(i).padStart(2, '0')}`,
    deviceStatus: i % 2 === 0 ? '在线' : '离线', // Example device status
  }));

  // Store original data to derive unique filters
  originalData.value = generatedData;

  const filteredData = originalData.value.filter(item => {
    const deviceModelMatch = filterDeviceModel.value === 'all' || item.deviceModel === filterDeviceModel.value;
    const deviceStatusMatch = filterDeviceStatus.value === 'all' || item.deviceStatus === filterDeviceStatus.value;
    const searchMatch = !searchText.value || Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchText.value.toLowerCase())
    );
    return deviceModelMatch && deviceStatusMatch && searchMatch;
  });

  data.value = filteredData.slice(
    ((pagination.current as number) - 1) * (pagination.pageSize as number),
    (pagination.current as number) * (pagination.pageSize as number)
  );
  pagination.total = filteredData.length;
  loading.value = false;
};

const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchData();
};

const editRecord = (record: DataItem) => {
  console.log('Editing firmware record:', record);
  currentEditRecord.value = record;
  isEditModalVisible.value = true;
};

const handleEditSubmit = (updatedRecord: DataItem) => {
  console.log('Updated firmware record:', updatedRecord);
  const index = data.value.findIndex(item => item.key === updatedRecord.key);
  if (index !== -1) {
    data.value[index] = updatedRecord;
  }
};

const deleteRecord = (record: DataItem) => {
  console.log('Deleting firmware record:', record);
  // Implement delete logic here
};

const handleReleaseVersion = () => {
  console.log('Release Version button clicked');
  isReleaseModalVisible.value = true;
};

const handleReleaseSubmit = (data: { formState: any; files: any[] }) => {
  console.log('Firmware Release Data:', data);
  fetchData();
};

const showConfigModal = () => {
  isConfigModalVisible.value = true;
};

const handleConfigModalClose = () => {
  isConfigModalVisible.value = false;
};

const selectAllColumns = () => {
  visibleColumnKeys.value = allColumns.map(col => col.key as string);
};

watch([searchText, filterDeviceModel, filterDeviceStatus, () => pagination.current, () => pagination.pageSize], () => {
  console.log('Firmware.vue: Watcher triggered. New search/filter criteria:');
  console.log('  searchText:', searchText.value);
  console.log('  filterDeviceModel:', filterDeviceModel.value);
  console.log('  filterDeviceStatus:', filterDeviceStatus.value);
  pagination.current = 1;
  nextTick(() => fetchData());
});

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.firmware-container {
  padding: 14px;
  width: 100%;
  height: auto;
  font-size: 12px;
}
</style> 