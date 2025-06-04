<template>
  <a-table
    :columns="columns"
    :data-source="data"
    :loading="loading"
    :pagination="pagination"
    @change="(pag: TablePaginationConfig) => $emit('change', pag)"
    :scroll="{ x: 1500 }"
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
import type { TablePaginationConfig } from 'ant-design-vue'

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

const props = defineProps({
  columns: { // Define columns prop with a more specific type if possible
    type: Array,
    required: true,
  },
  data: { // Define data prop with a more specific type if possible
    type: Array as () => DataItem[],
    required: true,
  },
  loading: Boolean,
  pagination: { // Define pagination prop with a more specific type if possible
    type: Object as () => TablePaginationConfig,
    required: true,
  },
})

const emits = defineEmits(['change', 'edit-record', 'toggle-bom-status', 'delete-record'])

</script>

<style scoped>
.danger-link {
  color: #ff4d4f;
}

.danger-link:hover {
  color: #ff7875;
}
</style> 