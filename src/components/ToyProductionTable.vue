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
          <a-button type="link" size="small" @click="emitEditRecord(record)">编辑</a-button>
          <a-popconfirm
            title="确定删除吗?"
            @confirm="emitDeleteRecord(record)"
            ok-text="是"
            cancel-text="否"
          >
            <a-button type="link" size="small">删除</a-button>
          </a-popconfirm>
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
  toyID: string; // 玩具ID
  toyName: string; // 玩具名称
  toyType: string; // 玩具类型
  material: string; // 材料
  productionDate: string; // 生产日期
  batchNumber: string; // 批次号
  quantity: number; // 数量
  creator: string; // 创建人
  creationTime: string; // 创建时间
  updateTime: string; // 更新时间
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
  'edit-record',
  'delete-record',
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