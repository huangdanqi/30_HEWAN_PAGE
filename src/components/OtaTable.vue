<template>
  <a-table
    :columns="columns"
    :data-source="data"
    :loading="loading"
    :pagination="pagination"
    @change="(pag: TablePaginationConfig) => $emit('change', pag)"
    <!-- Add horizontal scroll if needed -->
    :scroll="{ x: 1800 }"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'operations'">
        <a-space>
          <a-button type="link" @click="$emit('upgrade', record)">升级</a-button>
          <a-button type="link" @click="$emit('details', record)">详情</a-button>
          <a-button type="link" danger @click="$emit('delete', record)">删除</a-button>
        </a-space>
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import type { TablePaginationConfig } from 'ant-design-vue';

interface DataItem {
  key: string;
  serialNumber: number; // 序号
  deviceModel: string; // 设备型号
  deviceId: string; // 设备ID
  onlineStatus: string; // 在线状态
  deviceStatus: string; // 设备状态
  softwareVersion: string; // 软件版本
  lastOnlineTime: string; // 最后一次在线时间
  lastOfflineTime: string; // 最后一次离线时间
  creationTime: string; // 创建时间
  otaCompletionTime: string; // OTA完成时间
  operations?: string; // Placeholder for operations column
}

defineProps({
  columns: { // Define columns prop with a more specific type if possible
    type: Array,
    required: true,
  },
  data: {
    type: Array as () => DataItem[],
    required: true,
  },
  loading: Boolean,
  pagination: {
    type: Object as () => TablePaginationConfig,
    required: true,
  },
});

const emits = defineEmits(['change', 'upgrade', 'details', 'delete']);

</script>

<style scoped>
.danger-link {
  color: #ff4d4f;
}
.danger-link:hover {
  color: #ff7875;
}
</style>