<template>
  <a-table
    :columns="columns"
    :data-source="data"
    :loading="loading"
    :pagination="pagination"
    @change="(pag: TablePaginationConfig) => $emit('change', pag)"
    :scroll="{ x: 1800 }"
  >
    <!-- No custom bodyCell template needed for Account table based on image -->
  </a-table>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { TablePaginationConfig } from 'ant-design-vue'

interface DataItem {
  key: string;
  serialNumber: number; // 序号
  accountId: string; // 账户ID
  phoneNumber: string; // 手机号
  deviceModel: string; // 设备型号
  deviceId: string; // 设备ID
  ipRole: string; // IP角色
  productModel: string; // 产品型号
  membershipType: string; // 会员类型
  membershipPaymentStatus: string; // 会员付费
  membershipActivationTime: string; // 会员激活时间
  membershipExpirationTime: string; // 会员到期时间
  fourGPlan: string; // 4G套餐
  remainingData: string; // 当月剩余流量
  fourGPaymentStatus: string; // 4G付费
  annualServiceFee: number; // 服务年费用 (元)
  asrAnnualUsage: string; // ASR年用量
  llmAnnualUsage: string; // LLM年用量
  ttsAnnualUsage: string; // TTS年用量
  voiceCloningAnnualUsage: string; // 音色克隆年用量
  creationTime: string; // 创建时间
}

const props = defineProps({
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
})

const emits = defineEmits(['change'])

</script>

<style scoped>
/* Add any table specific styles here if needed */
</style> 