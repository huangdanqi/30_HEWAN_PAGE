<template>
  <a-table
    :columns="columns"
    :data-source="data"
    :loading="loading"
    :pagination="pagination"
    @change="(pag: TablePaginationConfig) => $emit('change', pag)"
    :scroll="{ x: 1310 }"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'operation'">
        <a-space>
          <a @click="$emit('edit-record', record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="$emit('toggle-bom-status', record)">上市/下市BOM</a>
           <a-divider type="vertical" />
          <a-popconfirm
            title="确定要删除该生产信息吗?"
            @confirm="$emit('delete-record', record)"
          >
            <a class="danger-link">删除</a>
          </a-popconfirm>
        </a-space>
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { TablePaginationConfig, TableColumnType } from 'ant-design-vue'

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

// Define component props
defineProps({
  columns: { type: Array as () => TableColumnType[], required: true },
  data: { type: Array as () => DataItem[], required: true },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as () => TablePaginationConfig, required: true },
})

const emit = defineEmits(['change', 'edit-record', 'toggle-bom-status', 'delete-record'])

</script>

<style scoped>
.danger-link {
  color: #ff4d4f;
}

.danger-link:hover {
  color: #ff7875;
}

/* Style for the draggable row */
/* Removed drag-sort styles */
/* .draggable-table-row .ant-table-tbody > tr {
  cursor: grab;
}

.draggable-table-row .ant-table-tbody > tr:active {
    cursor: grabbing;
} */
</style> 