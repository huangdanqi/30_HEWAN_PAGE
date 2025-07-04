<template>
  <div class="table-header">
    <AccountTitle />

    <div class="filter-group-left">
      <a-space :size="12">
        <!-- IP Role Filter -->
        <div class="select-container">
          <span class="select-always-placeholder">IP角色</span>
          <a-select
            :value="filterRole"
            @change="(newValue: string) => { console.log('AccountHeader: IP角色 dropdown changed to:', newValue); $emit('update:filterRole', newValue); }"
            style="width: 108px"
          >
            <a-select-option value="all">全部</a-select-option>
            <a-select-option v-for="role in uniqueRoles" :key="role" :value="role">{{ role }}</a-select-option>
          </a-select>
        </div>
        
        <!-- Membership Type Filter -->
        <div class="select-container">
          <span class="select-always-placeholder">会员类型</span>
          <a-select
            :value="filterMembershipType"
            @change="(newValue: string) => { console.log('AccountHeader: 会员类型 dropdown changed to:', newValue); $emit('update:filterMembershipType', newValue); }"
            style="width: 108px"
          >
            <a-select-option value="all">全部</a-select-option>
            <a-select-option v-for="type in uniqueMembershipTypes" :key="type" :value="type">{{ type }}</a-select-option>
          </a-select>
        </div>
     
        <!-- Membership Payment Filter -->
        <div class="select-container">
          <span class="select-always-placeholder">会员付费</span>
          <a-select
            :value="filterMembershipPayment"
            @change="(newValue: string) => { console.log('AccountHeader: 会员付费 dropdown changed to:', newValue); $emit('update:filterMembershipPayment', newValue); }"
            style="width: 180px"
          >
            <a-select-option value="all">全部</a-select-option>
            <a-select-option v-for="payment in uniqueMembershipPayments" :key="payment" :value="payment">{{ payment }}</a-select-option>
          </a-select>
        </div>
      </a-space>
    </div>

    <div class="filter-group-right">
      <a-space :size="12">
        <!-- 4G Plan Filter -->
        <div class="select-container">
          <span class="select-always-placeholder">4G套餐</span>
          <a-select
            :value="filter4GPlan"
            @change="(newValue: string) => { console.log('AccountHeader: 4G套餐 dropdown changed to:', newValue); $emit('update:filter4GPlan', newValue); }"
            style="width: 108px"
          >
            <a-select-option value="all">全部</a-select-option>
            <a-select-option v-for="plan in uniqueFourGPlans" :key="plan" :value="plan">{{ plan }}</a-select-option>
          </a-select>
        </div>
        <!-- 4G Payment Filter -->
        <div class="select-container">
          <span class="select-always-placeholder">4G付费</span>
          <a-select
            :value="filter4GPayment"
            @change="(newValue: string) => { console.log('AccountHeader: 4G付费 dropdown changed to:', newValue); $emit('update:filter4GPayment', newValue); }"
            style="width: 108px"
          >
            <a-select-option value="all">全部</a-select-option>
            <a-select-option v-for="payment in uniqueFourGPayments" :key="payment" :value="payment">{{ payment }}</a-select-option>
          </a-select>
        </div>

        <!-- Device Status Filter -->
        <div class="select-container">
          <span class="select-always-placeholder">设备状态</span>
          <a-select
            :value="filterDeviceStatus"
            @change="(newValue: string) => { console.log('AccountHeader: 设备状态 dropdown changed to:', newValue); $emit('update:filterDeviceStatus', newValue); }"
            style="width: 108px"
          >
            <a-select-option value="all">全部</a-select-option>
            <a-select-option v-for="status in uniqueDeviceStatuses" :key="status" :value="status">{{ status }}</a-select-option>
          </a-select>
        </div>

        <!-- Search Input -->
        <a-input-search
          v-model:value="searchTextLocal"
          placeholder="请输入关键字搜索"
          style="width: 120px"
          @search="onSearch"
        />
        
  
        <!-- Configure Columns Button -->
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
import { defineProps, defineEmits, ref, watch } from 'vue'
import { SettingOutlined } from '@ant-design/icons-vue'
import AccountTitle from './AccountTitle.vue'

// Define component props received from the parent component (Account.vue)
const props = defineProps({
  filterRole: String, // Current value for IP Role filter
  filterMembershipType: String, // Current value for Membership Type filter
  filterMembershipPayment: String, // Current value for Membership Payment filter
  filter4GPlan: String, // Current value for 4G Plan filter
  filter4GPayment: String, // Current value for 4G Payment filter
  filterDeviceStatus: String, // Current value for Device Status filter
  searchText: String, // Current value for search text
  uniqueRoles: { type: Array as () => string[], default: () => [] }, // Unique IP roles for dropdown options
  uniqueMembershipTypes: { type: Array as () => string[], default: () => [] }, // Unique membership types for dropdown options
  uniqueMembershipPayments: { type: Array as () => string[], default: () => [] }, // Unique membership payment statuses
  uniqueFourGPlans: { type: Array as () => string[], default: () => [] }, // Unique 4G plans
  uniqueFourGPayments: { type: Array as () => string[], default: () => [] }, // Unique 4G payment statuses
  uniqueDeviceStatuses: { type: Array as () => string[], default: () => [] }, // Unique device statuses
})

console.log('AccountHeader Props:', props.filter4GPlan, props.filter4GPayment);

// Define component emits to communicate changes back to the parent component
const emits = defineEmits([
  'update:filterRole',
  'update:filterMembershipType',
  'update:filterMembershipPayment',
  'update:filter4GPlan',
  'update:filter4GPayment',
  'update:filterDeviceStatus',
  'update:searchText',
  'search',
  'refresh',
  'configure-columns',
  'show-info',
  'apply-filters',
])

const searchTextLocal = ref(props.searchText);

watch(
  () => props.searchText,
  (newValue) => {
    searchTextLocal.value = newValue;
  }
);

const onSearch = (value: string) => {
  emits("update:searchText", value);
};

</script>

<style scoped>
/* Scoped styles for the AccountHeader component */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px; /* Adjusted from 16px * 0.60 */
  background-image: none;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-group-right {
  margin-left: auto;
}

.table-header h2 {
  font-size: 12px; /* Adjusted to 12px */
  font-weight: bold;
  margin: 0;
}

.ant-space > .ant-space-item {
  margin-right: 0 !important;
}

:deep(.ant-select-selection-item) {
  font-size: 12px; /* Adjusted to 12px */
}

/* Styling for the custom always-visible placeholder */
.select-container {
  position: relative; /* Needed for absolute positioning of placeholder */
  display: inline-block; /* Ensures container wraps content and allows side-by-side display */
}

.select-always-placeholder {
  position: absolute;
  top: 50%;
  left: 7px; /* Adjusted from 12px * 0.60 */
  transform: translateY(-50%);
  color: rgba(0, 0, 0, 0.45); /* Ant Design standard placeholder color */
  pointer-events: none; /* Allow clicks to pass through to the select input */
  z-index: 1; /* Ensure it's above the select input content */
}

/* Adjust padding for Ant Design select to accommodate the custom placeholder */
:deep(.ant-select-selector) {
  padding-left: 48px !important; /* Adjusted from 80px * 0.60 */
}

/* Adjust padding for the selected item text if necessary */
:deep(.ant-select-selection-item) {
   padding-left: 0 !important; /* Reset or adjust selected item text padding */
}
</style> 