<template>
  <div class="movement-production-container">
    <MovementProductionTitle />

    <!-- MovementProductionHeader component for filters and actions -->
    <MovementProductionHeader
      v-model:searchText="searchText"
      v-model:filterDeviceModel="filterDeviceModel"
      v-model:filterManufacturer="filterManufacturer"
      :unique-device-models="uniqueDeviceModels"
      :unique-manufacturers="uniqueManufacturers"
      @refresh="fetchData"
      @add-batch="showAddModal"
      @configure-columns="showConfigModal"
      @apply-filters="handleApplyFilters"
    />
    <!-- MovementProductionTable component for displaying data -->
    <MovementProductionTable
      :columns="displayedColumns"
      :data="data"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      @edit-record="editRecord"
      @delete-record="deleteRecord"
      @upload-bom="handleUploadBOM"
      @download-bom="handleDownloadBOM"
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

    <!-- Add Batch Modal -->
    <a-modal
      :visible="isAddModalVisible"
      title="新增批次"
      @ok="handleAddSubmit"
      @cancel="handleAddCancel"
    >
      <a-form :model="addFormState" :rules="addRules" ref="addForm" layout="vertical">
        <a-form-item label="设备型号" name="deviceModel">
          <a-input v-model:value="addFormState.deviceModel" />
        </a-form-item>
        <a-form-item label="生产批次" name="productionBatch">
          <a-input v-model:value="addFormState.productionBatch" />
        </a-form-item>
        <a-form-item label="生产厂家" name="manufacturer">
          <a-input v-model:value="addFormState.manufacturer" />
        </a-form-item>
        <a-form-item label="烧录固件" name="burnedFirmware">
          <a-input v-model:value="addFormState.burnedFirmware" />
        </a-form-item>
        <a-form-item label="单价 (元)" name="unitPrice">
          <a-input-number v-model:value="addFormState.unitPrice" :min="0" />
        </a-form-item>
        <a-form-item label="数量 (个)" name="quantity">
          <a-input-number v-model:value="addFormState.quantity" :min="0" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Edit Batch Modal -->
    <a-modal
      :visible="isEditModalVisible"
      title="编辑批次信息"
      @ok="handleEditSubmit"
      @cancel="handleEditCancel"
    >
      <a-form :model="editableRecord" :rules="editRules" ref="editForm" layout="vertical">
        <a-form-item label="设备型号" name="deviceModel">
          <a-input v-model:value="editableRecord.deviceModel" />
        </a-form-item>
        <a-form-item label="生产批次" name="productionBatch">
          <a-input v-model:value="editableRecord.productionBatch" :disabled="true" />
        </a-form-item>
        <a-form-item label="生产厂家" name="manufacturer">
          <a-input v-model:value="editableRecord.manufacturer" />
        </a-form-item>
        <a-form-item label="烧录固件" name="burnedFirmware">
          <a-input v-model:value="editableRecord.burnedFirmware" />
        </a-form-item>
        <a-form-item label="单价 (元)" name="unitPrice">
          <a-input-number v-model:value="editableRecord.unitPrice" :min="0" />
        </a-form-item>
        <a-form-item label="数量 (个)" name="quantity">
          <a-input-number v-model:value="editableRecord.quantity" :min="0" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue';
import type { TablePaginationConfig, TableColumnType, FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import MovementProductionTitle from '../components/MovementProductionTitle.vue';
import MovementProductionHeader from '../components/MovementProductionHeader.vue';
import MovementProductionTable from '../components/MovementProductionTable.vue';

interface DataItem {
  key: string;
  serialNumber: number; // 序号
  deviceModel: string; // 设备型号
  productionBatch: string; // 生产批次
  manufacturer: string; // 生产厂家
  burnedFirmware: string; // 烧录固件
  unitPrice: number; // 单价 (元)
  quantity: number; // 数量 (个)
  totalPrice: number; // 总价 (元)
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
const isAddModalVisible = ref(false);
const isEditModalVisible = ref(false);

const addForm = ref<FormInstance | null>(null);
const editForm = ref<FormInstance | null>(null);

const editableRecord = reactive<DataItem>({
  key: '',
  serialNumber: 0,
  deviceModel: '',
  productionBatch: '',
  manufacturer: '',
  burnedFirmware: '',
  unitPrice: 0,
  quantity: 0,
  totalPrice: 0,
  creator: '',
  creationTime: '',
  updateTime: '',
});

const addFormState = reactive({
  deviceModel: '',
  productionBatch: '',
  manufacturer: '',
  burnedFirmware: '',
  unitPrice: 0,
  quantity: 0,
});

const addRules = {
  deviceModel: [{ required: true, message: '请输入设备型号', trigger: 'blur' }],
  productionBatch: [{ required: true, message: '请输入生产批次', trigger: 'blur' }],
  manufacturer: [{ required: true, message: '请输入生产厂家', trigger: 'blur' }],
  burnedFirmware: [{ required: true, message: '请输入烧录固件', trigger: 'blur' }],
  unitPrice: [{ required: true, type: 'number', min: 0, message: '请输入单价', trigger: 'blur' }],
  quantity: [{ required: true, type: 'number', min: 0, message: '请输入数量', trigger: 'blur' }],
};

const editRules = {
  deviceModel: [{ required: true, message: '请输入设备型号', trigger: 'blur' }],
  manufacturer: [{ required: true, message: '请输入生产厂家', trigger: 'blur' }],
  burnedFirmware: [{ required: true, message: '请输入烧录固件', trigger: 'blur' }],
  unitPrice: [{ required: true, type: 'number', min: 0, message: '请输入单价', trigger: 'blur' }],
  quantity: [{ required: true, type: 'number', min: 0, message: '请输入数量', trigger: 'blur' }],
};

const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 10, // Increased page size for more visible data
  total: 0,
  showTotal: (total: number) => `第 ${((pagination.current as number) - 1) * (pagination.pageSize as number) + 1}-${Math.min((pagination.current as number) * (pagination.pageSize as number), total)}条/共 ${total} 条`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
});

const allColumns: TableColumnType[] = [
  { title: '序号', dataIndex: 'serialNumber', key: 'serialNumber', fixed: 'left', width: 70 },
  { title: '设备型号', dataIndex: 'deviceModel', key: 'deviceModel', width: 120 },
  { title: '生产批次', dataIndex: 'productionBatch', key: 'productionBatch', width: 120, sorter: true },
  { title: '生产厂家', dataIndex: 'manufacturer', key: 'manufacturer', width: 150 },
  { title: '烧录固件', dataIndex: 'burnedFirmware', key: 'burnedFirmware', width: 120 },
  { title: '单价 (元)', dataIndex: 'unitPrice', key: 'unitPrice', width: 100, sorter: true },
  { title: '数量 (个)', dataIndex: 'quantity', key: 'quantity', width: 100, sorter: true },
  { title: '总价 (元)', dataIndex: 'totalPrice', key: 'totalPrice', width: 100, sorter: true },
  { title: '创建人', dataIndex: 'creator', key: 'creator', width: 100 },
  { title: '创建时间', dataIndex: 'creationTime', key: 'creationTime', sorter: true, width: 150 },
  { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', sorter: true, width: 150 },
  {
    title: '操作',
    key: 'operation',
    fixed: 'right',
    width: 250,
  },
];

const visibleColumnKeys = ref(allColumns.map(col => col.key as string));
const columnOrder = ref(allColumns.map(col => col.key as string));

const originalData = ref<DataItem[]>([]);

const uniqueDeviceModels = computed(() => {
  const models = new Set(originalData.value.map(item => item.deviceModel));
  return Array.from(models);
});

const uniqueManufacturers = computed(() => {
  const manufacturers = new Set(originalData.value.map(item => item.manufacturer));
  return Array.from(manufacturers);
});

const displayedColumns = computed(() => {
  const orderedColumns = columnOrder.value
    .map(key => allColumns.find(col => col.key === key))
    .filter(col => col !== undefined);

  return orderedColumns.filter(col => visibleColumnKeys.value.includes(col!.key as string));
});

const fetchData = async () => {
  loading.value = true;
  await new Promise(resolve => setTimeout(resolve, 1000));

  const generatedData: DataItem[] = Array.from({ length: 50 }).map((_, i) => {
    const unitPrice = parseFloat((Math.random() * 50 + 50).toFixed(2)); // Price between 50 and 100
    const quantity = Math.floor(Math.random() * 500) + 100; // Quantity between 100 and 600
    const totalPrice = parseFloat((unitPrice * quantity).toFixed(2));

    return {
      key: `production-${i + 1}`,
      serialNumber: i + 1,
      deviceModel: `HWSZ00${i % 5}`,
      productionBatch: `Batch-${20230101 + i}`,
      manufacturer: `Manufacturer-${i % 3}`,
      burnedFirmware: `Firmware-V1.0.${i}`,
      unitPrice: unitPrice,
      quantity: quantity,
      totalPrice: totalPrice,
      creator: `user${i % 5}`,
      creationTime: `2023-01-01 10:00:${String(i).padStart(2, '0')}`,
      updateTime: `2023-01-01 11:00:${String(i).padStart(2, '0')}`,
    };
  });

  originalData.value = generatedData;

  const filteredData = originalData.value.filter(item => {
    const deviceModelMatch = filterDeviceModel.value === 'all' || item.deviceModel === filterDeviceModel.value;
    const manufacturerMatch = filterManufacturer.value === 'all' || item.manufacturer === filterManufacturer.value;
    const searchMatch = !searchText.value || Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchText.value.toLowerCase())
    );
    return deviceModelMatch && manufacturerMatch && searchMatch;
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

const showConfigModal = () => {
  isConfigModalVisible.value = true;
};

const handleConfigModalClose = () => {
  isConfigModalVisible.value = false;
};

const selectAllColumns = () => {
  visibleColumnKeys.value = allColumns.map(col => col.key as string);
};

const showAddModal = () => {
  isAddModalVisible.value = true;
};

const handleAddSubmit = async () => {
  try {
    await addForm.value?.validate();
    const newRecord: DataItem = {
      key: `production-${originalData.value.length + 1}`,
      serialNumber: originalData.value.length + 1,
      deviceModel: addFormState.deviceModel,
      productionBatch: addFormState.productionBatch,
      manufacturer: addFormState.manufacturer,
      burnedFirmware: addFormState.burnedFirmware,
      unitPrice: addFormState.unitPrice,
      quantity: addFormState.quantity,
      totalPrice: addFormState.unitPrice * addFormState.quantity,
      creator: 'admin', // Placeholder
      creationTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString(),
    };
    originalData.value.push(newRecord);
    message.success('批次添加成功!');
    fetchData();
    handleAddCancel();
  } catch (error) {
    console.error('Validation Failed:', error);
  }
};

const handleAddCancel = () => {
  isAddModalVisible.value = false;
  addForm.value?.resetFields();
};

const editRecord = (record: DataItem) => {
  Object.assign(editableRecord, record);
  isEditModalVisible.value = true;
};

const handleEditSubmit = async () => {
  try {
    await editForm.value?.validate();
    const index = originalData.value.findIndex(item => item.key === editableRecord.key);
    if (index !== -1) {
      Object.assign(originalData.value[index], editableRecord);
      originalData.value[index].totalPrice = editableRecord.unitPrice * editableRecord.quantity;
      originalData.value[index].updateTime = new Date().toLocaleString();
    }
    message.success('批次更新成功!');
    fetchData();
    handleEditCancel();
  } catch (error) {
    console.error('Validation Failed:', error);
  }
};

const handleEditCancel = () => {
  isEditModalVisible.value = false;
  editForm.value?.resetFields();
};

const deleteRecord = (record: DataItem) => {
  originalData.value = originalData.value.filter(item => item.key !== record.key);
  message.success('批次删除成功!');
  fetchData();
};

const handleUploadBOM = (record: DataItem) => {
  console.log('Uploading BOM for record:', record);
  message.info(`上传/下载BOM for ${record.productionBatch}`);
  // Implement BOM upload/download logic here
};

const handleDownloadBOM = (record: DataItem) => {
  console.log('Downloading BOM for record:', record);
  message.info(`下载BOM for ${record.productionBatch}`);
  // Implement BOM upload/download logic here
};

const handleApplyFilters = () => {
  fetchData();
};

watch([filterDeviceModel, filterManufacturer, searchText, () => pagination.current, () => pagination.pageSize], () => {
  pagination.current = 1;
  nextTick(() => fetchData());
});

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.movement-production-container {
  padding: 14px;
  width: 100%;
  height: auto;
  font-size: 12px;
  background-color: #FFFFFF;
}
</style> 