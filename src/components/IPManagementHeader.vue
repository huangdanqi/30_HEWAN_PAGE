<template>
  <div class="ip-management-header">
    <div class="action-section">
      <a-input-search
        :value="searchText"
        placeholder="请输入关键字搜索"
        style="width: 200px; margin-right: 8px;"
        @search="(value: string) => $emit('search', value)"
        @input="(e: Event) => $emit('update:searchText', (e.target as HTMLInputElement).value)"
      />
      <a-button type="primary" @click="$emit('create-ip')" style="margin-right: 8px;">新建IP</a-button>
      <a-button @click="$emit('refresh')" style="margin-right: 8px;">
        <template #icon><ReloadOutlined /></template>
      </a-button>
      <a-button @click="$emit('show-info')" style="margin-right: 8px;">
        <template #icon><InfoCircleOutlined /></template>
      </a-button>
      <a-button @click="$emit('configure-columns')">
        <template #icon><SettingOutlined /></template>
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { SettingOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'

defineProps({
  searchText: String,
});

const emits = defineEmits([
  'update:searchText',
  'search',
  'refresh',
  'create-ip',
  'show-info',
  'configure-columns',
]);
</script>

<style scoped>
.ip-management-header {
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
  .ip-management-header {
    flex-direction: column;
    align-items: stretch;
  }

  .action-section {
    justify-content: center;
  }
}
</style> 