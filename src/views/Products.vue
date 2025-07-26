<template>
  <div class="production-container">
    <ProductionTitle/>
    <!-- Use the new ProductionHeader component -->
    <ProductionHeader
      v-model:filterDeviceModel="filterDeviceModel"
      v-model:filterManufacturer="filterManufacturer"
      v-model:searchText="searchText"
      @search="onSearch"
      @refresh="fetchData"
      @export="handleExport"
      @settings="handleSettings"
      @apply-filters="handleApplyFilters"
      @configure-columns="showConfigModal"     
    />

    <!-- Use the new ProductsTable component -->
    <ProductsTable
      :columns="columns"
      :data="data"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      @edit-record="editRecord"
      @toggle-bom-status="toggleBOMStatus"
      @delete-record="deleteRecord"
    />

    <!-- Column Configuration Modal -->
    <a-modal
      title="Configure Table Columns"
      v-model:visible="isConfigModalVisible"
      @ok="handleConfigModalOk"
    >
      <!-- Add your modal content here -->
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig, TableColumnType } from 'ant-design-vue'

// Import the new components
import ProductionHeader from '../components/ProductionHeader.vue'
import ProductsTable from '../components/ProductsTable.vue'
import ProductionTitle from '../components/ProductionTitle.vue'

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
}

const columns: TableColumnType[] = [
  { title: '序号', dataIndex: 'serialNumber', key: 'serialNumber', fixed: 'left', width: 70 },
  { title: '设备型号', dataIndex: 'deviceModel', key: 'deviceModel', width: 120 },
  { title: '发布版本', dataIndex: 'releaseVersion', key: 'releaseVersion', width: 120 },
  { title: '版本号', dataIndex: 'versionNumber', key: 'versionNumber', sorter: true, width: 120 },
  { title: '内容描述', dataIndex: 'contentDescription', key: 'contentDescription', width: 300 },
  { title: '创建人', dataIndex: 'creator', key: 'creator', width: 100 },
  { title: '发布时间', dataIndex: 'releaseTime', key: 'releaseTime', sorter: true, width: 150 },
  { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', sorter: true, width: 150 },
  {
    title: '操作',
    key: 'operation',
    fixed: 'right',
    width: 180,
  },
];

const loading = ref(false)
const data = ref<DataItem[]>([])
const searchText = ref('')
const filterDeviceModel = ref('all')
const filterManufacturer = ref('all')

const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 3,
  showSizeChanger: true,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  showTotal: (total: number) => `第 ${pagination.current as number}-${Math.min((pagination.current as number) * (pagination.pageSize as number), total)} 条/共 ${total} 条`, // Updated total text to Chinese with type assertions
})

const isConfigModalVisible = ref(false);

const fetchData = async () => {
  loading.value = true
  try {
    // TODO: Replace with actual API call to fetch production data
    // const response = await fetchProductionData({
    //   page: pagination.current,
    //   pageSize: pagination.pageSize,
    //   search: searchText.value,
    //   deviceModel: filterDeviceModel.value,
    //   manufacturer: filterManufacturer.value,
    // })

    // Simulated API response with new data structure from screenshot
    await new Promise(resolve => setTimeout(resolve, 1000))
    data.value = Array.from({ length: 10 }).map((_, i) => ({
      key: `${i + 1}`,
      serialNumber: i + 1,
      deviceModel: 'HWSZ001',
      releaseVersion: '首版',
      versionNumber: 'Z001 V 1.0.0',
      contentDescription: '1.修改压力传感器间隔采样时间，改为300ms。2.增加复合事件类型：压力+触摸。',
      creator: '33',
      releaseTime: '2025-7-13 19:25:11',
      updateTime: '2025-7-13 19:25:11',
    }));
    pagination.total = 43 // Updated total based on screenshot
  } catch (error) {
    message.error('Failed to fetch production data')
  } finally {
    loading.value = false
  }
}

const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.current = pag.current || 1
  pagination.pageSize = pag.pageSize || 10
  fetchData()
}

// Placeholder functions for operations
const editRecord = (record: DataItem) => {
  console.log('Editing record:', record)
  message.info('编辑 functionality to be implemented')
  // TODO: Implement edit logic
}

const toggleBOMStatus = (record: DataItem) => {
  console.log('Toggling BOM status for:', record)
   message.info('上市/下市BOM functionality to be implemented')
   // TODO: Implement toggle BOM status logic
}

const deleteRecord = async (record: DataItem) => {
  console.log('Deleting record:', record)
  // TODO: Replace with actual API call to delete production data
  // try {
  //   await deleteProductionData(record.key)
  //   message.success('删除 successfully')
  //   fetchData()
  // } catch (error) {
  //   message.error('删除 failed')
  // }
  message.info('删除 functionality to be implemented')
}

const onSearch = (value: string) => {
  searchText.value = value
  pagination.current = 1
  fetchData()
}

// Placeholder functions for header buttons (Implement these in Products.vue)
const handleExport = () => {
  message.info('导出 functionality to be implemented');
  // TODO: Implement export logic
}

const handleSettings = () => {
    message.info('设置 functionality to be implemented');
    // TODO: Implement settings logic
}

// TODO: Implement Add Batch button logic

// Handle apply filters
const handleApplyFilters = () => {
  // Implement apply filters logic
}

// Handle show config modal
const showConfigModal = () => {
  // Implement show config modal logic
}

// Handle config modal ok
const handleConfigModalOk = () => {
  // Implement config modal ok logic
}

onMounted(() => {
  fetchData()
})

</script>

<style scoped>
.production-container {
  padding: 24px; /* Keep padding for content within the page */
}
</style> 