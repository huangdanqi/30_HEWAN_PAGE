<template>
  <a-table
    :columns="columns"
    :data-source="data"
    :loading="loading"
    :pagination="pagination"
    @change="(pag: TablePaginationConfig) => $emit('change', pag)"
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
import type { TablePaginationConfig, TableColumnType } from 'ant-design-vue';

interface DataItem {
  key: string;
  serialNumber: number; // 序号
  deviceId: string; // 设备ID
  boundSubAccount: string; // 绑定子账户
  deviceModel: string; // 设备型号
  productionBatch: string; // 生产批次
  manufacturer: string; // 生产厂家
  initialFirmware: string; // 初始固件
  latestFirmware: string; // 最新固件
  currentFirmwareVersion: string; // 当前固件版本
  snCode: string; // SN码
  eFuseId: string; // eFuse ID
  macAddress: string; // MAC地址
  bluetoothName: string; // 蓝牙名称
  imei: string; // IMEI
  fourGCardNumber: string; // 4G卡号
  cpuSerial: string; // CPU序列
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

const emit = defineEmits(['change', 'upgrade', 'details', 'delete']);

</script>

<style scoped>
.danger-link {
  color: #ff4d4f;
}
.danger-link:hover {
  color: #ff7875;
}
</style>