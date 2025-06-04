<template>
  <div class="table-header">
    <h2>账户信息</h2>
    <div class="table-operations">
      <a-space>
        <!-- Filter options -->
        <a-select
          :value="filterRole"
          placeholder="IP角色: 全部"
          style="width: 120px"
          @change="(value: string) => $emit('update:filterRole', value)"
        >
          <a-select-option value="all">全部</a-select-option>
          <a-select-option v-for="role in uniqueRoles" :key="role" :value="role">{{ role }}</a-select-option>
        </a-select>
        <a-select
          :value="filterMembershipType"
          placeholder="会员类型: 全部"
          style="width: 120px"
          @change="(value: string) => $emit('update:filterMembershipType', value)"
        >
          <a-select-option value="all">全部</a-select-option>
          <a-select-option v-for="type in uniqueMembershipTypes" :key="type" :value="type">{{ type }}</a-select-option>
        </a-select>
        <a-select
          :value="filterMembershipPayment"
          placeholder="会员付费: 全部"
          style="width: 120px"
          @change="(value: string) => $emit('update:filterMembershipPayment', value)"
        >
          <a-select-option value="all">全部</a-select-option>
          <a-select-option v-for="payment in uniqueMembershipPayments" :key="payment" :value="payment">{{ payment }}</a-select-option>
        </a-select>
        <a-select
          :value="filter4GPlan"
          placeholder="4G套餐: 全部"
          style="width: 120px"
          @change="(value: string) => $emit('update:filter4GPlan', value)"
        >
          <a-select-option value="all">全部</a-select-option>
          <a-select-option v-for="plan in uniqueFourGPlans" :key="plan" :value="plan">{{ plan }}</a-select-option>
        </a-select>
        <a-select
          :value="filter4GPayment"
          placeholder="4G付费: 全部"
          style="width: 120px"
          @change="(value: string) => $emit('update:filter4GPayment', value)"
        >
          <a-select-option value="all">全部</a-select-option>
          <a-select-option v-for="payment in uniqueFourGPayments" :key="payment" :value="payment">{{ payment }}</a-select-option>
        </a-select>
        <a-input-search
          :value="searchText"
          placeholder="请输入关键字搜索"
          style="width: 200px"
          @search="(value: string) => $emit('search', value)"
        />
        <a-button type="primary" @click="$emit('apply-filters')">筛选</a-button>
  
        <a-tooltip title="Configure Columns">
          <a-button @click="$emit('configure-columns')">
            <template #icon><SettingOutlined /></template>
          </a-button>
        </a-tooltip>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { SettingOutlined, BorderOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  filterRole: String,
  filterMembershipType: String,
  filterMembershipPayment: String,
  filter4GPlan: String,
  filter4GPayment: String,
  searchText: String,
  uniqueRoles: { type: Array as () => string[], default: () => [] },
  uniqueMembershipTypes: { type: Array as () => string[], default: () => [] },
  uniqueMembershipPayments: { type: Array as () => string[], default: () => [] },
  uniqueFourGPlans: { type: Array as () => string[], default: () => [] },
  uniqueFourGPayments: { type: Array as () => string[], default: () => [] },
})

const emits = defineEmits([
  'update:filterRole',
  'update:filterMembershipType',
  'update:filterMembershipPayment',
  'update:filter4GPlan',
  'update:filter4GPayment',
  'search',
  'refresh',
  'configure-columns',
  'show-info',
  'apply-filters',
])

</script>

<style scoped>
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-header h2 {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.table-operations {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.ant-space > .ant-space-item:last-child {
  margin-right: 0 !important;
}
</style> 