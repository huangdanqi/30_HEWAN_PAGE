<template>
  <div class="table-header">
    <h2>生产信息</h2>
    <div class="table-operations">
      <a-space>
        <!-- Filter options -->
        <a-select
          :value="filterDeviceModel"
          placeholder="设备型号: 全部"
          style="width: 150px"
          @change="(value: string) => $emit('update:filterDeviceModel', value)"
        >
          <a-select-option value="all">全部</a-select-option>
          <!-- Add more options as needed -->
        </a-select>
        <a-select
          :value="filterManufacturer"
          placeholder="生产厂家: 全部"
          style="width: 150px"
          @change="(value: string) => $emit('update:filterManufacturer', value)"
        >
          <a-select-option value="all">全部</a-select-option>
          <!-- Add more options as needed -->
        </a-select>
        <a-input-search
          :value="searchText"
          placeholder="请输入关键字搜索"
          style="width: 200px"
          @search="(value: string) => $emit('search', value)"
        />
         <!-- Buttons and icons -->
         <a-button type="primary">新增批次</a-button>
         <a-tooltip title="刷新"><reload-outlined @click="$emit('refresh')"/></a-tooltip>
         <a-tooltip title="导出"><download-outlined @click="$emit('export')"/></a-tooltip>
         <a-tooltip title="设置"><setting-outlined @click="$emit('settings')"/></a-tooltip>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { ReloadOutlined, DownloadOutlined, SettingOutlined } from '@ant-design/icons-vue'

defineProps({
  filterDeviceModel: String,
  filterManufacturer: String,
  searchText: String,
})

const emits = defineEmits(['update:filterDeviceModel', 'update:filterManufacturer', 'search', 'refresh', 'export', 'settings'])

</script>

<style scoped>
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-header h2 {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.table-operations {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.ant-space > .ant-space-item:last-child {
  margin-right: 0 !important;
}
</style> 