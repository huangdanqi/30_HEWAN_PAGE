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
      <template v-else-if="column.key === 'creator'">
        <img :src="record.creatorAvatar" alt="Creator Avatar" style="width: 24px; height: 24px; border-radius: 50%; margin-right: 8px; vertical-align: middle;" />
        {{ record.creator }}
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
  productID: string; // 产品ID
  productName: string; // 产品名称
  productType: string; // 产品类型
  color: string; // 颜色
  productDetails: string; // 产品详情
  deviceModel: string; // 设备型号
  ipName: string; // IP名称
  creator: string; // 创建人
  creatorAvatar: string; // 创建人头像
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