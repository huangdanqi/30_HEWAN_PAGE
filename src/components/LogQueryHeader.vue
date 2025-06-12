<template>
  <div class="log-query-header">
    <div class="filter-section">
      <div class="select-container">
        <span class="select-always-placeholder">操作类型:</span>
        <a-select
          :value="filterOperationType"
          @change="(newValue: string) => $emit('update:filterOperationType', newValue)"
          style="width: 120px;"
        >
          <a-select-option value="all">全部</a-select-option>
          <!-- Options will be dynamically populated from props -->
          <a-select-option v-for="type in uniqueOperationTypes" :key="type" :value="type">{{ type }}</a-select-option>
        </a-select>
      </div>
      <div class="select-container">
        <span class="select-always-placeholder">用户:</span>
        <a-select
          :value="filterUser"
          @change="(newValue: string) => $emit('update:filterUser', newValue)"
          style="width: 120px;"
        >
          <a-select-option value="all">全部</a-select-option>
          <!-- Options will be dynamically populated from props -->
          <a-select-option v-for="user in uniqueUsers" :key="user" :value="user">{{ user }}</a-select-option>
        </a-select>
      </div>
      <div class="select-container">
        <span class="select-always-placeholder">日期范围:</span>
        <a-range-picker
          :value="dateRange"
          @change="(dateStrings: [string, string]) => $emit('update:dateRange', dateStrings)"
          style="width: 240px;"
        />
      </div>
    </div>

    <div class="action-section">
      <a-input-search
        :value="searchText"
        placeholder="请输入关键字搜索"
        style="width: 200px; margin-right: 8px;"
        @search="(value: string) => $emit('search', value)"
        @input="(e: Event) => $emit('update:searchText', (e.target as HTMLInputElement).value)"
      />
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
import { defineProps, defineEmits, withDefaults } from 'vue'
import { SettingOutlined, ReloadOutlined } from '@ant-design/icons-vue'

interface LogQueryHeaderProps {
  searchText?: string;
  filterOperationType?: string;
  filterUser?: string;
  dateRange?: [string, string];
  uniqueOperationTypes?: string[];
  uniqueUsers?: string[];
}

const props = withDefaults(defineProps<LogQueryHeaderProps>(), {
  searchText: '',
  filterOperationType: 'all',
  filterUser: 'all',
  dateRange: () => ['', ''],
  uniqueOperationTypes: () => [],
  uniqueUsers: () => [],
});

// Explicitly use props to satisfy the linter
console.log(props);

const emits = defineEmits([
  'update:searchText',
  'update:filterOperationType',
  'update:filterUser',
  'update:dateRange',
  'search',
  'refresh',
  'configure-columns',
]);
</script>

<style scoped>
.log-query-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 16px 24px;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.select-container {
  position: relative;
  display: inline-block;
}

.select-always-placeholder {
  position: absolute;
  top: 50%;
  left: 7px;
  transform: translateY(-50%);
  color: rgba(0, 0, 0, 0.45);
  pointer-events: none;
  z-index: 1;
  font-size: 12px;
}

:deep(.ant-select-selector) {
  padding-left: 60px !important; /* Adjusted to make space for placeholder */
}

.action-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .log-query-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-section,
  .action-section {
    justify-content: center;
  }
}
</style> 