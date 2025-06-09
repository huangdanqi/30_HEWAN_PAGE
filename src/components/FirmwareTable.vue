<template>
  <a-table
    :columns="columns"
    :data-source="data"
    :loading="loading"
    :pagination="pagination"
    @change="(pag: TablePaginationConfig) => $emit('change', pag)"
    :scroll="{ x: 1310 }"
    row-key="key"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'operation'">
        <a-space>
          <a @click="$emit('edit-record', record)">编辑</a>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定要删除该固件信息吗?"
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
import { defineProps, defineEmits } from 'vue';
import type { TablePaginationConfig, TableColumnType } from 'ant-design-vue';

interface DataItem {
  key: string;
  serialNumber: number; // 序号
  deviceModel: string; // 设备型号
  releaseVersion: string; // 发布版本
  versionNumber: string; // 版本号
  contentDescription: string; // 内容描述
  creator: string; // 创建人
  releaseTime: string; // 发布时间
  updateTime: string; // 更新时间
}

const props = defineProps({
  columns: {
    type: Array as () => TableColumnType[],
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

const emits = defineEmits(['change', 'edit-record', 'delete-record']);
</script>

<style scoped>
.danger-link {
  color: #ff4d4f;
}

.danger-link:hover {
  color: #ff7875;
}
</style> 