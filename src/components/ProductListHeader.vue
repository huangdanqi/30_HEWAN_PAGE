<template>
  <div class="product-list-header">
    <div class="filter-section">
      <div class="select-container">
        <span class="a">产品类型:</span>
        <a-select
          :value="filterProductType"
          @change="(newValue: string) => $emit('update:filterProductType', newValue)"
          style="width: 120px;"
        >
          <a-select-option value="all">全部</a-select-option>
          <!-- Options will be dynamically populated from props -->
          <a-select-option v-for="type in uniqueProductTypes" :key="type" :value="type">{{ type }}</a-select-option>
        </a-select>
      </div>
      <div class="select-container">
        <span class="select-always-placeholder">产品名称:</span>
        <a-select
          :value="filterProductName"
          @change="(newValue: string) => $emit('update:filterProductName', newValue)"
          style="width: 120px;"
        >
          <a-select-option value="all">全部</a-select-option>
          <!-- Options will be dynamically populated from props -->
          <a-select-option v-for="name in uniqueProductNames" :key="name" :value="name">{{ name }}</a-select-option>
        </a-select>
      </div>
      <div class="select-container">
        <span class="select-always-placeholder">颜色:</span>
        <a-select
          :value="filterColor"
          @change="(newValue: string) => $emit('update:filterColor', newValue)"
          style="width: 120px;"
        >
          <a-select-option value="all">全部</a-select-option>
          <!-- Options will be dynamically populated from props -->
          <a-select-option v-for="color in uniqueColors" :key="color" :value="color">{{ color }}</a-select-option>
        </a-select>
      </div>
      <div class="select-container">
        <span class="select-always-placeholder">初始会员:</span>
        <a-select
          :value="filterInitialMember"
          @change="(newValue: string) => $emit('update:filterInitialMember', newValue)"
          style="width: 120px;"
        >
          <a-select-option value="all">全部</a-select-option>
          <!-- Options will be dynamically populated from props -->
          <a-select-option v-for="member in uniqueInitialMembers" :key="member" :value="member">{{ member }}</a-select-option>
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
  filterProductType: String,
  filterProductName: String,
  filterColor: String,
  filterInitialMember: String,
  uniqueProductTypes: { type: Array as () => string[], default: () => [] },
  uniqueProductNames: { type: Array as () => string[], default: () => [] },
  uniqueColors: { type: Array as () => string[], default: () => [] },
  uniqueInitialMembers: { type: Array as () => string[], default: () => [] },
});

const emits = defineEmits([
  'update:searchText',
  'update:filterProductType',
  'update:filterProductName',
  'update:filterColor',
  'update:filterInitialMember',
  'search',
  'refresh',
  'show-info',
  'configure-columns',
]);
</script>

<style scoped>
.product-list-header {
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
  .product-list-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-section,
  .action-section {
    justify-content: center;
  }
}
</style> 