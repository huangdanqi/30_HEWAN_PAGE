<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>产品型号</h2>
    </div>
    
    <!-- Simple test content -->
    <div style="padding: 20px; background: #f0f0f0; margin: 20px;">
      <h3>Component is Loading!</h3>
      <p>If you see this, the component is working.</p>
    </div>
  </a-config-provider>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme } from 'ant-design-vue';

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '',
  },
}));
</script>

<style scoped>
/* Basic styling for the simplified component */
.title-container {
  padding: 10px 14px;
  margin-bottom: 10px;
  background-color: #fff;
  border-radius: 4px;
}

.title-container h2 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.85);
  text-align: left;
}
</style>
