<template>
  <a-table
    :columns="columns"
    :data-source="data"
    :loading="loading"
    :pagination="pagination"
    @change="handleChange"
    bordered
    :scroll="{ x: 1800 }"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'operation'">
        <a-space>
          <a-button type="link" size="small" @click="emitViewDetails(record)">查看详情</a-button>
        </a-space>
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import type { TableColumnType, TablePaginationConfig } from 'ant-design-vue';

interface DataItem {
  key: string;
  serialNumber: number; // 序号
  operationType: string; // 操作类型
  operationContent: string; // 操作内容
  operator: string; // 操作人
  operationTime: string; // 操作时间
  ipAddress: string; // IP地址
}

// Define component props
defineProps({
  columns: { type: Array as () => TableColumnType[], required: true },
  data: { type: Array as () => DataItem[], required: true },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as () => TablePaginationConfig, required: true },
});

const emit = defineEmits([
  'change',
  'view-details',
]);

const handleChange = (pag: TablePaginationConfig) => {
  emit('change', pag);
};

const emitViewDetails = (record: DataItem) => {
  emit('view-details', record);
};

</script>

<style scoped>
/* Add any specific styles for the table here */
.danger-link {
  color: #ff4d4f;
}

.danger-link:hover {
  color: #ff7875;
}
</style> 