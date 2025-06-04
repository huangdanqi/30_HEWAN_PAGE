<template>
  <div class="production-container">
    <!-- Use the new ProductionHeader component -->
    <ProductionHeader
      v-model:filterDeviceModel="filterDeviceModel"
      v-model:filterManufacturer="filterManufacturer"
      v-model:searchText="searchText"
      @search="onSearch"
      @refresh="fetchData"
      @export="handleExport"
      @settings="handleSettings"
    />

    <!-- Use the new ProductionTable component -->
    <ProductionTable
      :columns="columns"
      :data="data"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      @edit-record="editRecord"
      @toggle-bom-status="toggleBOMStatus"
      @delete-record="deleteRecord"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'

// Import the new components
import ProductionHeader from '../components/ProductionHeader.vue'
import ProductionTable from '../components/ProductionTable.vue'

interface DataItem {
  key: string
  serialNumber: number // 序号
  deviceModel: string // 设备型号
  productionBatch: string // 生产批次
  manufacturer: string // 生产厂家
  unitPrice: number // 单价 (元)
  quantity: number // 数量 (个)
  totalPrice: number // 总价 (元)
  creator: string // 创建人
  creationTime: string // 创建时间
  updateTime: string // 更新时间
}

const columns = [
  { title: '序号', dataIndex: 'serialNumber', key: 'serialNumber', fixed: 'left', width: 70 },
  { title: '设备型号', dataIndex: 'deviceModel', key: 'deviceModel' },
  { title: '生产批次', dataIndex: 'productionBatch', key: 'productionBatch' },
  { title: '生产厂家', dataIndex: 'manufacturer', key: 'manufacturer' },
  { title: '单价 (元)', dataIndex: 'unitPrice', key: 'unitPrice' },
  { title: '数量 (个)', dataIndex: 'quantity', key: 'quantity' },
  { title: '总价 (元)', dataIndex: 'totalPrice', key: 'totalPrice' },
  { title: '创建人', dataIndex: 'creator', key: 'creator' },
  { title: '创建时间', dataIndex: 'creationTime', key: 'creationTime' },
  { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime' },
  { title: '操作', key: 'operation', fixed: 'right', width: 180 },
]

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
    data.value = [
      {
        key: '1',
        serialNumber: 1,
        deviceModel: 'HWSZ001',
        productionBatch: '2025-06-30',
        manufacturer: '深圳天德胜科技有限公司',
        unitPrice: 86.75,
        quantity: 500,
        totalPrice: 43375,
        creator: '33',
        creationTime: '2025-7-13 19:25:11',
        updateTime: '2025-7-13 19:25:11',
      },
      {
        key: '2',
        serialNumber: 2,
        deviceModel: 'HWSZ001',
        productionBatch: '2025-06-30',
        manufacturer: '深圳天德胜科技有限公司',
        unitPrice: 86.75,
        quantity: 500,
        totalPrice: 43375,
        creator: '33',
        creationTime: '2025-7-13 19:25:11',
        updateTime: '2025-7-13 19:25:11',
      },
      // Add more simulated data items as needed to match the screenshot
    ]
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

onMounted(() => {
  fetchData()
})

</script>

<style scoped>
.production-container {
  padding: 24px; /* Keep padding for content within the page */
}
</style> 