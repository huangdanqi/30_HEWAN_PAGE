<template>
  <a-layout-sider width="200" style="background: #fff">
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
        <a-menu-item key="1" disabled>BI分析</a-menu-item>
      </a-sub-menu>
      <a-sub-menu key="sub2">
        <template #title>
          <span>
            <user-outlined />
            账户信息
          </span>
        </template>
        <a-menu-item key="2">账户信息</a-menu-item>
        <a-menu-item key="3" disabled>日志查询</a-menu-item>
      </a-sub-menu>
       <a-sub-menu key="sub3">
        <template #title>
          <span>
            <laptop-outlined />
            设备管理
          </span>
        </template>
        <a-menu-item key="4">固件管理</a-menu-item>
        <a-menu-item key="4">机芯生产</a-menu-item>
        <a-menu-item key="5">设备OTA</a-menu-item>
      </a-sub-menu>
       <a-sub-menu key="sub4">
        <template #title>
          <span>
            <setting-outlined />
            商品管理
          </span>
        </template>
        <a-menu-item key="6" disabled>产品管理</a-menu-item>
        <a-menu-item key="7" disabled>玩具生产</a-menu-item>
        <a-menu-item key="8" disabled>商品列表</a-menu-item>
      </a-sub-menu>

    <a-sub-menu key="sub5">
        <template #title>
          <span>
            <setting-outlined />
            IP信息
          </span>
        </template>
        <a-menu-item key="9" disabled>IP管理</a-menu-item>

      </a-sub-menu>

      <a-sub-menu key="sub5">
        <template #title>
          <span>
            <setting-outlined />
            权限管理
          </span>
        </template>
        <a-menu-item key="9" disabled>成员管理</a-menu-item>

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

const handleMenuClick = (e: any) => {
  console.log('click', e);
  // Implement navigation based on selected menu item key
  if (e.key === '2') router.push('/account');
  else if (e.key === '4') {}
  else if (e.key === '5') router.push('/ota');
  else if (e.key === '1') { /* BI Analysis clicked - do nothing for now */ }
  else if (e.key === '3') { /* Log Query clicked - do nothing for now */ }
  else if (e.key === '6') router.push('/products');
  // TODO: Add navigation for other menu items (BI Analysis, Logs, Members)
};

// TODO: Add logic to set selectedKeys and openKeys based on the current route

</script>

<style scoped>
/* Add sidebar specific styles here if needed */
</style> 