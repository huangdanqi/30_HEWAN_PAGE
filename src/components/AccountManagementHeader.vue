<template>
  <div class="account-management-header">
    <div class="action-section">
      <a-input-search
        v-model:value="searchQueryLocal"
        placeholder="请输入搜索内容"
        style="width: 200px; margin-right: 8px;"
        @search="onSearch"
      />
      <a-select
        v-model:value="packageTypeLocal"
        placeholder="4G套餐"
        style="width: 120px; margin-right: 8px;"
        @change="onPackageTypeChange"
      >
        <a-select-option value="all">全部</a-select-option>
        <a-select-option value="unlimited">Unlimited</a-select-option>
        <a-select-option value="limited">Limited</a-select-option>
      </a-select>
      <a-button type="primary" @click="$emit('create-member')" style="margin-right: 8px;">新建成员</a-button>
      <a-button @click="$emit('refresh')" style="margin-right: 8px;">
        <template #icon><ReloadOutlined /></template>
      </a-button>
      <a-button @click="$emit('configure-columns')">
        <template #icon><SettingOutlined /></template>
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue'
import { SettingOutlined, ReloadOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  packageType: string;
  searchQuery: string;
}>();

const emit = defineEmits([
  "update:packageType",
  "update:searchQuery",
  "create-member",
  "refresh",
  "configure-columns",
]);

const packageTypeLocal = ref(props.packageType);
const searchQueryLocal = ref(props.searchQuery);

watch(
  () => props.packageType,
  (newValue) => {
    packageTypeLocal.value = newValue;
  }
);

watch(
  () => props.searchQuery,
  (newValue) => {
    searchQueryLocal.value = newValue;
  }
);

const onSearch = (value: string) => {
  emit("update:searchQuery", value);
};

const onPackageTypeChange = (value: string) => {
  emit("update:packageType", value);
};
</script>

<style scoped>
.account-management-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: #fff;
  padding: 16px 24px;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
}

.action-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .account-management-header {
    flex-direction: column;
    align-items: stretch;
  }

  .action-section {
    justify-content: center;
  }
}
</style> 