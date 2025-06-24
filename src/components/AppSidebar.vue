<template>
  <a-layout-sider width="200" style="background: #fff; overflow-y: auto;">
    <a-menu
      mode="inline"
      :style="{ height: '100%', borderRight: 0 }"
      v-model:selectedKeys="selectedKeys"
      v-model:openKeys="openKeys"
      @click="handleMenuClick"
    >
      <a-sub-menu key="sub1">
        <template #title>
          <span>
            数据透视
          </span>
        </template>
        <a-menu-item key="1" :disabled="isMenuItemDisabled('1')">
          <template #icon><bar-chart-outlined /></template>
          BI分析
        </a-menu-item>
      </a-sub-menu>
      <a-sub-menu key="sub2">
        <template #title>
          <span>
            账户信息
          </span>
        </template>
        <a-menu-item key="2">
          <template #icon><idcard-outlined /></template>
          账户信息
        </a-menu-item>
        <a-menu-item key="3" :disabled="isMenuItemDisabled('3')">
          <template #icon><file-text-outlined /></template>
          日志查询
        </a-menu-item>
      </a-sub-menu>
       <a-sub-menu key="sub3">
        <template #title>
          <span>
            设备管理
          </span>
        </template>
        <a-menu-item key="4">
          <template #icon><hdd-outlined /></template>
          固件管理
        </a-menu-item>
        <a-menu-item key="10">
          <template #icon><tool-outlined /></template>
          机芯生产
        </a-menu-item>
        <a-menu-item key="5">
          <template #icon><swap-outlined /></template>
          设备OTA
        </a-menu-item>
      </a-sub-menu>
       <a-sub-menu key="sub4">
        <template #title>
          <span>
            商品管理
          </span>
        </template>
        <a-menu-item key="6">
          <template #icon><box-plot-outlined /></template>
          产品管理
        </a-menu-item>
        <a-menu-item key="7">
          <template #icon><gift-outlined /></template>
          玩具生产
        </a-menu-item>
        <a-menu-item key="8">
          <template #icon><unordered-list-outlined /></template>
          商品列表
        </a-menu-item>
      </a-sub-menu>

    <a-sub-menu key="sub5">
        <template #title>
          <span>
            IP信息
          </span>
        </template>
        <a-menu-item key="9">
          <template #icon><apartment-outlined /></template>
          IP管理
        </a-menu-item>

      </a-sub-menu>

      <a-sub-menu key="sub6">
        <template #title>
          <span>
            权限管理
          </span>
        </template>
        <a-menu-item key="11" :disabled="isMenuItemDisabled('11')">
          <template #icon><team-outlined /></template>
          成员管理
        </a-menu-item>

      </a-sub-menu>

      <a-sub-menu key="sub7">
        <template #title>
          <span>
            <appstore-outlined />
            开发工具
          </span>
        </template>
        <a-menu-item key="12">Demo Page</a-menu-item>
        <a-menu-item key="13">Demo Page 2</a-menu-item>
      </a-sub-menu>

    </a-menu>
    
  </a-layout-sider>

  
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  AppstoreOutlined,
  BarChartOutlined,
  IdcardOutlined,
  FileTextOutlined,
  HddOutlined,
  ToolOutlined,
  SwapOutlined,
  BoxPlotOutlined,
  GiftOutlined,
  UnorderedListOutlined,
  ApartmentOutlined,
  TeamOutlined
} from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';

const selectedKeys = ref<string[]>([]);
const openKeys = ref<string[]>([]);

const router = useRouter();

const navigableKeys = new Set(['2', '4', '10', '5', '6', '7', '8', '9', '12', '13']);

const isMenuItemDisabled = (key: string) => !navigableKeys.has(key);

const handleMenuClick = (e: any) => {
  console.log('click', e);
  
  // Check if the menu item has proper navigation
  const hasNavigation = navigableKeys.has(e.key);
  
  if (!hasNavigation) {
    return;
  }
  
  // Implement navigation based on selected menu item key
  if (e.key === '2') router.push('/account');
  else if (e.key === '4') router.push('/firmware');
  else if (e.key === '10') router.push('/movement-production');
  else if (e.key === '5') router.push('/ota');
  else if (e.key === '6') router.push('/product-management');
  else if (e.key === '7') router.push('/toy-production');
  else if (e.key === '8') router.push('/product-list');
  else if (e.key === '9') router.push('/ip-management');
  else if (e.key === '12') router.push('/demo-page');
  else if (e.key === '13') router.push('/demo-page-2');
};

// TODO: Add logic to set selectedKeys and openKeys based on the current route

</script>

<style scoped>
/* Add sidebar specific styles here if needed */
:deep(.ant-menu-item-disabled) {
  color: #bfbfbf !important;
  background: #f5f5f5 !important;
  cursor: not-allowed !important;
}
:deep(.ant-menu-item-disabled):hover,
:deep(.ant-menu-item-disabled):active,
:deep(.ant-menu-item-disabled):focus {
  color: #bfbfbf !important;
  background: #f5f5f5 !important;
}
</style> 