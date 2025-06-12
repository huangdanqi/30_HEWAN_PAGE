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
            <appstore-outlined />
            数据透视
          </span>
        </template>
        <a-menu-item key="1" :disabled="isMenuItemDisabled('1')">BI分析</a-menu-item>
      </a-sub-menu>
      <a-sub-menu key="sub2">
        <template #title>
          <span>
            <user-outlined />
            账户信息
          </span>
        </template>
        <a-menu-item key="2">账户信息</a-menu-item>
        <a-menu-item key="3" :disabled="isMenuItemDisabled('3')">日志查询</a-menu-item>
      </a-sub-menu>
       <a-sub-menu key="sub3">
        <template #title>
          <span>
            <laptop-outlined />
            设备管理
          </span>
        </template>
        <a-menu-item key="4">固件管理</a-menu-item>
        <a-menu-item key="10">机芯生产</a-menu-item>
        <a-menu-item key="5">设备OTA</a-menu-item>
      </a-sub-menu>
       <a-sub-menu key="sub4">
        <template #title>
          <span>
            <setting-outlined />
            商品管理
          </span>
        </template>
        <a-menu-item key="6">产品管理</a-menu-item>
        <a-menu-item key="7">玩具生产</a-menu-item>
        <a-menu-item key="8">商品列表</a-menu-item>
      </a-sub-menu>

    <a-sub-menu key="sub5">
        <template #title>
          <span>
            <setting-outlined />
            IP信息
          </span>
        </template>
        <a-menu-item key="9">IP管理</a-menu-item>

      </a-sub-menu>

      <a-sub-menu key="sub6">
        <template #title>
          <span>
            <setting-outlined />
            权限管理
          </span>
        </template>
        <a-menu-item key="11">成员管理</a-menu-item>

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
import { AppstoreOutlined, UserOutlined, LaptopOutlined, SettingOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';

const selectedKeys = ref<string[]>([]);
const openKeys = ref<string[]>([]);

const router = useRouter();

const navigableKeys = new Set(['2', '4', '10', '5', '6', '7', '8', '9', '11', '12', '13']);

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
  else if (e.key === '11') router.push('/account-management');
  else if (e.key === '12') router.push('/demo-page');
  else if (e.key === '13') router.push('/demo-page-2');
};

// TODO: Add logic to set selectedKeys and openKeys based on the current route

</script>

<style scoped>
/* Add sidebar specific styles here if needed */
</style> 