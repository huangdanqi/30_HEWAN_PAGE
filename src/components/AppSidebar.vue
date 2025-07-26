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
            IP信息
          </span>
        </template>
        <a-menu-item key="9">
          <template #icon><apartment-outlined /></template>
          IP管理
        </a-menu-item>
      </a-sub-menu>
      
      <a-sub-menu key="sub4">
        <template #title>
          <span>
            素材管理
          </span>
        </template>
        <a-menu-item key="14" :disabled="isMenuItemDisabled('14')">
          <template #icon><play-circle-outlined /></template>
          IP音频
        </a-menu-item>
        <a-menu-item key="15" :disabled="isMenuItemDisabled('15')">
          <template #icon><picture-outlined /></template>
          IP图片
        </a-menu-item>
        <a-menu-item key="16" :disabled="isMenuItemDisabled('16')">
          <template #icon><video-camera-outlined /></template>
          IP视频
        </a-menu-item>
        <a-menu-item key="17" :disabled="isMenuItemDisabled('17')">
          <template #icon><sound-outlined /></template>
          音乐素材
        </a-menu-item>
        <a-menu-item key="18" :disabled="isMenuItemDisabled('18')">
          <template #icon><bell-outlined /></template>
          预置闹铃
        </a-menu-item>
        <a-menu-item key="19" :disabled="isMenuItemDisabled('19')">
          <template #icon><file-text-outlined /></template>
          文档素材
        </a-menu-item>
      </a-sub-menu>
      
      <a-sub-menu key="sub5">
        <template #title>
          <span>
            资源管理
          </span>
        </template>
        <a-menu-item key="20" @click="handleMenuClick">
          <template #icon><setting-outlined /></template>
          模型配置
        </a-menu-item>
        <a-menu-item key="21" :disabled="isMenuItemDisabled('21')">
          <template #icon><appstore-outlined /></template>
          Agent配置
        </a-menu-item>
        <a-menu-item key="22" :disabled="isMenuItemDisabled('22')">
          <template #icon><tool-outlined /></template>
          工具配置
        </a-menu-item>
      </a-sub-menu>
      
      <a-sub-menu key="sub6">
        <template #title>
          <span>
            设备管理
          </span>
        </template>
        <a-menu-item key="23" :disabled="isMenuItemDisabled('23')">
          <template #icon><file-text-outlined /></template>
          设备型号
        </a-menu-item>
        <a-menu-item key="26" @click="() => $router.push('/firmware')">
          <template #icon>
            <BoxPlotOutlined />
          </template>
          固件管理
        </a-menu-item>
        <a-menu-item key="24" @click="() => $router.push('/device-production')">
          <template #icon>
            <DesktopOutlined />
          </template>
          设备生产
        </a-menu-item>
        <a-menu-item key="28" @click="() => $router.push('/device-management')">
          <template #icon>
            <FileTextOutlined />
          </template>
          设备管理
        </a-menu-item>
      </a-sub-menu>
      
      <a-sub-menu key="sub7">
        <template #title>
          <span>
            商品管理
          </span>
        </template>
        <a-menu-item key="27" :disabled="isMenuItemDisabled('27')">
          <template #icon><box-plot-outlined /></template>
          产品型号
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

      <a-sub-menu key="sub8">
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

      <a-sub-menu key="sub9">
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
  TeamOutlined,
  PlayCircleOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  SoundOutlined,
  BellOutlined,
  SettingOutlined,
  DesktopOutlined
} from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import { h } from 'vue';

const selectedKeys = ref<string[]>([]);
const openKeys = ref<string[]>([]);

const router = useRouter();

// Only keep the existing enabled keys, disable all new content
const navigableKeys = new Set(['2', '4', '7', '8', '9', '12', '13', '14', '15', '16', '17', '18', '20', '21', '22', '23', '24', '26', '27', '28']);

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
  else if (e.key === '7') router.push('/toy-production');
  else if (e.key === '8') router.push('/product-list');
  else if (e.key === '9') router.push('/ip-management');
  else if (e.key === '12') router.push('/demo-page');
  else if (e.key === '13') router.push('/demo-page-2');
  else if (e.key === '14') router.push('/ip-audio');
  else if (e.key === '15') router.push('/ip-image');
  else if (e.key === '16') router.push('/ip-video');
  else if (e.key === '17') router.push('/music-resources');
  else if (e.key === '18') router.push('/built-in-alarm');
  else if (e.key === '20') router.push('/model-configuration');
  else if (e.key === '21') router.push('/agent-configuration');
  else if (e.key === '22') router.push('/tool-configuration');
  else if (e.key === '23') router.push('/device-type');
  else if (e.key === '24') router.push('/device-production');
  else if (e.key === '26') router.push('/firmware');
  else if (e.key === '27') router.push('/product-type');
  else if (e.key === '28') router.push('/device-management');
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