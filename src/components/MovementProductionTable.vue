<template>
  <a-table
    :columns="columns"
    :data-source="data"
    :loading="loading"
    :pagination="pagination"
    @change="handleChange"
    bordered
    :scroll="{ x: 1500 }"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'operation'">
        <a-button type="link" size="small" @click="emitEditRecord(record)">编辑</a-button>
        <a-popconfirm
          title="确定删除吗?"
          @confirm="emitDeleteRecord(record)"
          ok-text="是"
          cancel-text="否"
        >
          <a-button type="link" size="small">删除</a-button>
        </a-popconfirm>
        <a-button type="link" size="small" @click="emitUploadBOM(record)">上传BOM</a-button>
        <a-button type="link" size="small" @click="emitDownloadBOM(record)">下载BOM</a-button>
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import type { TableColumnType, TablePaginationConfig } from 'ant-design-vue';

interface DataItem {
  key: string;
  serialNumber: number;
  deviceModel: string;
  productionBatch: string;
  manufacturer: string;
  burnedFirmware: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  creator: string;
  creationTime: string;
  updateTime: string;
}

const props = defineProps({
  columns: { type: Array as () => TableColumnType[], required: true },
  data: { type: Array as () => DataItem[], required: true },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as () => TablePaginationConfig, required: true },
});

const emit = defineEmits([
  'change',
  'edit-record',
  'delete-record',
  'upload-bom',
  'download-bom',
]);

const handleChange = (pag: TablePaginationConfig) => {
  emit('change', pag);
};

const emitEditRecord = (record: DataItem) => {
  emit('edit-record', record);
};

const emitDeleteRecord = (record: DataItem) => {
  emit('delete-record', record);
};

const emitUploadBOM = (record: DataItem) => {
  emit('upload-bom', record);
};

const emitDownloadBOM = (record: DataItem) => {
  emit('download-bom', record);
};
</script>

<style scoped>
/* Add any specific styles for the table here */
</style> 