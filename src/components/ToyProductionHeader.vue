<template>
  <div class="toy-production-header">
    <div class="filter-section">
      <div class="select-container">
        <span class="select-always-placeholder">玩具类型:</span>
        <a-select
          :value="filterToyType"
          @change="(newValue: string) => $emit('update:filterToyType', newValue)"
          style="width: 120px;"
        >
          <a-select-option value="all">全部</a-select-option>
          <!-- Options will be dynamically populated from props -->
          <a-select-option v-for="type in uniqueToyTypes" :key="type" :value="type">{{ type }}</a-select-option>
        </a-select>
      </div>
      <div class="select-container">
        <span class="select-always-placeholder">材料:</span>
        <a-select
          :value="filterMaterial"
          @change="(newValue: string) => $emit('update:filterMaterial', newValue)"
          style="width: 120px;"
        >
          <a-select-option value="all">全部</a-select-option>
          <!-- Options will be dynamically populated from props -->
          <a-select-option v-for="material in uniqueMaterials" :key="material" :value="material">{{ material }}</a-select-option>
        </a-select>
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
      <a-button type="primary" @click="$emit('create-toy-production')" style="margin-right: 8px;">新建玩具生产</a-button>
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
import { defineProps, defineEmits } from 'vue'
import { SettingOutlined, ReloadOutlined } from '@ant-design/icons-vue'

defineProps({
  searchText: String,
  filterToyType: String,
  filterMaterial: String,
  uniqueToyTypes: { type: Array as () => string[], default: () => [] },
  uniqueMaterials: { type: Array as () => string[], default: () => [] },
});

const emits = defineEmits([
  'update:searchText',
  'update:filterToyType',
  'update:filterMaterial',
  'search',
  'refresh',
  'create-toy-production',
  'configure-columns',
]);
</script>

<style scoped>
.toy-production-header {
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
  .toy-production-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-section,
  .action-section {
    justify-content: center;
  }
}
</style> 