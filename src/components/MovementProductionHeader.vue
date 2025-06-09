<template>
  <div class="movement-production-header">
    <div class="header-content">
      <div class="search-section">
        <a-input-search
          v-model:value="searchText"
          placeholder="搜索设备型号、生产批次、生产厂家..."
          style="width: 300px"
          @search="handleSearch"
          allow-clear
        />
      </div>

      <div class="filter-section">
        <a-select
          v-model:value="filterDeviceModel"
          placeholder="设备型号"
          style="width: 150px; margin-right: 8px"
          allow-clear
        >
          <a-select-option value="all">全部型号</a-select-option>
          <a-select-option v-for="model in uniqueDeviceModels" :key="model" :value="model">
            {{ model }}
          </a-select-option>
        </a-select>

        <a-select
          v-model:value="filterManufacturer"
          placeholder="生产厂家"
          style="width: 150px; margin-right: 8px"
          allow-clear
        >
          <a-select-option value="all">全部厂家</a-select-option>
          <a-select-option v-for="manufacturer in uniqueManufacturers" :key="manufacturer" :value="manufacturer">
            {{ manufacturer }}
          </a-select-option>
        </a-select>

        <a-button type="primary" @click="handleApplyFilters">应用筛选</a-button>
      </div>

      <div class="action-section">
        <a-button @click="handleRefresh" style="margin-right: 8px">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
        <a-button type="primary" @click="handleAddBatch" style="margin-right: 8px">
          <template #icon><PlusOutlined /></template>
          新增批次
        </a-button>
        <a-button @click="handleConfigureColumns">
          <template #icon><SettingOutlined /></template>
          列配置
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import { ReloadOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  searchText: { type: String, default: '' },
  filterDeviceModel: { type: String, default: 'all' },
  filterManufacturer: { type: String, default: 'all' },
  uniqueDeviceModels: { type: Array as () => string[], default: () => [] },
  uniqueManufacturers: { type: Array as () => string[], default: () => [] },
})

const emit = defineEmits([
  'update:searchText',
  'update:filterDeviceModel',
  'update:filterManufacturer',
  'refresh',
  'add-batch',
  'configure-columns',
  'apply-filters'
])

const searchText = ref(props.searchText)
const filterDeviceModel = ref(props.filterDeviceModel)
const filterManufacturer = ref(props.filterManufacturer)

const handleSearch = (value: string) => {
  searchText.value = value
  emit('update:searchText', value)
}

const handleRefresh = () => {
  emit('refresh')
}

const handleAddBatch = () => {
  emit('add-batch')
}

const handleConfigureColumns = () => {
  emit('configure-columns')
}

const handleApplyFilters = () => {
  emit('update:filterDeviceModel', filterDeviceModel.value)
  emit('update:filterManufacturer', filterManufacturer.value)
  emit('apply-filters')
}
</script>

<style scoped>
.movement-production-header {
  background: #fff;
  padding: 16px 24px;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  margin-bottom: 16px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.search-section {
  flex: 1;
  min-width: 300px;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-section {
    min-width: auto;
  }
  
  .filter-section,
  .action-section {
    justify-content: center;
  }
}
</style> 