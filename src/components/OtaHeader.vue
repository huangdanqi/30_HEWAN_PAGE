<template>
  <div class="ota-header">
    <h2>OTA Listing Information</h2>
    <div class="ota-operations">
      <a-space>
        <!-- Filter options based on screenshot -->
        <a-select
          v-model:value="filterOnlineStatus"
          placeholder="在线状态: 全部"
          style="width: 120px"
          @change="(value: string) => $emit('filter-change', { type: 'onlineStatus', value })"
        >
          <a-select-option value="all">全部</a-select-option>
          <a-select-option value="online">在线</a-select-option>
          <a-select-option value="offline">离线</a-select-option>
          <!-- Add more options if needed -->
        </a-select>
        <a-select
          v-model:value="filterDeviceStatus"
          placeholder="设备状态: 全部"
          style="width: 120px"
          @change="(value: string) => $emit('filter-change', { type: 'deviceStatus', value })"
        >
          <a-select-option value="all">全部</a-select-option>
          <a-select-option value="active">活跃</a-select-option>
          <a-select-option value="inactive">不活跃</a-select-option>
          <!-- Add more options if needed -->
        </a-select>
        <a-input-search
          v-model:value="searchText"
          placeholder="请输入关键字搜索"
          style="width: 200px"
          @search="(value: string) => $emit('search', value)"
        />
        <!-- Buttons/Icons -->
        <a-button type="primary" @click="$emit('refresh')">刷新</a-button>
        <a-button @click="$emit('export')">导出</a-button>
        <!-- Assuming a settings icon button -->
        <a-tooltip title="Settings">
          <a-button type="default" shape="circle" @click="$emit('settings')">
            <template #icon><SettingOutlined /></template>
          </a-button>
        </a-tooltip>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { SettingOutlined } from '@ant-design/icons-vue';

const filterOnlineStatus = ref('all');
const filterDeviceStatus = ref('all');
const searchText = ref('');

const emits = defineEmits(['filter-change', 'search', 'refresh', 'export', 'settings']);

</script>

<style scoped>
.ota-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.ota-operations {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style> 