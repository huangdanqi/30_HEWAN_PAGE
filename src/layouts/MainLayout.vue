<template>
  <a-layout class="layout">
    <a-layout>
      <a-layout-content
        :style="{ margin: '0px 0', padding: '0 0', background: '#fff', minHeight: '280px' }"
      >
        <router-view></router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">



</script>

<style scoped>

/* Add this rule to remove horizontal padding and margin from content */
.ant-layout-content {
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}
</style> 