<template>
  <div class="ota-header-container">
    <div class="filter-section">
      <div class="select-container">
        <span class="select-always-placeholder">设备型号:</span>
        <a-select
          :value="filterDeviceModel"
          @change="(newValue: string) => $emit('update:filterDeviceModel', newValue)"
          style="width: 120px;"
        >
          <a-select-option value="all">全部</a-select-option>
          <!-- Add more options if needed -->
        </a-select>
      </div>
      <div class="select-container">
        <span class="select-always-placeholder">生产厂家:</span>
        <a-select
          :value="filterManufacturer"
          @change="(newValue: string) => $emit('update:filterManufacturer', newValue)"
          style="width: 120px;"
        >
          <a-select-option value="all">全部</a-select-option>
          <!-- Add more options if needed -->
        </a-select>
      </div>
    </div>
    <div class="action-section">
      <a-input-search
        :value="searchText"
        placeholder="请输入关键字搜索"
        style="width: 200px; margin-right: 8px;"
        @search="(value: string) => $emit('search', value)"
        @input="(e: Event) => $emit('update:searchText', (e.target as HTMLInputElement).value)"
      />
      <a-button type="primary" @click="$emit('device-import')" style="margin-right: 8px;">设备导入</a-button>
      <a-button type="primary" @click="$emit('ota-config')" style="margin-right: 8px;">OTA配置</a-button>
      <a-button @click="$emit('refresh')" style="margin-right: 8px;">
        <template #icon><ReloadOutlined /></template>
      </a-button>
      <a-button @click="$emit('configure-columns')">
        <template #icon><SettingOutlined /></template>
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { SettingOutlined, ReloadOutlined } from '@ant-design/icons-vue'

defineProps({
  searchText: String,
  filterDeviceModel: String,
  filterManufacturer: String,
});

const emits = defineEmits([
  'update:searchText',
  'update:filterDeviceModel',
  'update:filterManufacturer',
  'search',
  'refresh',
  'device-import',
  'ota-config',
  'configure-columns',
]);
</script>

<style scoped>
.ota-header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 16px 24px;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.select-container {
  position: relative;
  display: inline-block;
}

.select-always-placeholder {
  position: absolute;
  top: 50%;
  left: 7px;
  transform: translateY(-50%);
  color: rgba(0, 0, 0, 0.45);
  pointer-events: none;
  z-index: 1;
  font-size: 12px;
}

:deep(.ant-select-selector) {
  padding-left: 60px !important; /* Adjusted to make space for placeholder */
}

.action-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .ota-header-container {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-section,
  .action-section {
    justify-content: center;
  }
}
</style> 