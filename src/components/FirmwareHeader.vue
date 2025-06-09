<template>
  <div class="firmware-header-container">
    <a-row justify="space-between" align="middle">
      <a-col>
        <a-space>
          <div class="select-container">
            <span class="select-always-placeholder">设备型号: </span>
            <a-select
              v-model:value="filterDeviceModel"
              style="width: 150px"
              @change="emits('update:filterDeviceModel', $event)"
            >
              <a-select-option value="all">全部</a-select-option>
              <a-select-option v-for="model in uniqueDeviceModels" :key="model" :value="model">{{ model }}</a-select-option>
            </a-select>
          </div>
          
          <a-input-search
            v-model:value="searchText"
            placeholder="输入关键字搜索"
            style="width: 200px"
            allowClear
          />
        </a-space>
      </a-col>
      <a-col>
        <a-space>
          <a-button type="primary" @click="handleReleaseVersion">版本发布</a-button>
          <a-button @click="onRefresh">
            <template #icon><ReloadOutlined /></template>
          </a-button>
          <a-button @click="onConfigureColumns">
            <template #icon><SettingOutlined /></template>
          </a-button>
        </a-space>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  searchText: String,
  filterDeviceModel: String,
  uniqueDeviceModels: { type: Array as () => string[], default: () => [] },
  filterDeviceStatus: String,
  uniqueDeviceStatuses: { type: Array as () => string[], default: () => [] },
});

const emits = defineEmits([
  'update:searchText',
  'refresh',
  'release-version',
  'configure-columns',
  'update:filterDeviceModel',
  'update:filterDeviceStatus',
]);

const searchText = ref(props.searchText);
const filterDeviceModel = ref(props.filterDeviceModel);
const filterDeviceStatus = ref(props.filterDeviceStatus);

watch(() => props.searchText, (newValue) => {
  searchText.value = newValue;
});

watch(() => props.filterDeviceModel, (newValue) => {
  filterDeviceModel.value = newValue;
});

watch(() => props.filterDeviceStatus, (newValue) => {
  filterDeviceStatus.value = newValue;
});

watch(searchText, (newValue) => {
  emits('update:searchText', newValue);
});

const onSearch = (searchValue: string) => {
  emits('update:searchText', searchValue);
  emits('refresh');
};

const onRefresh = () => {
  emits('refresh');
};

const handleReleaseVersion = () => {
  emits('release-version');
};

const onConfigureColumns = () => {
  emits('configure-columns');
};
</script>

<style scoped>
.firmware-header-container {
  padding: 16px 0;
  background: #fff;
  margin-bottom: 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.select-container {
  display: flex;
  align-items: left;
  margin-right: 16px;
}

.select-always-placeholder {
  position: absolute;
  top: 50%;
  left: 7px; /* Adjusted from 12px * 0.60 */
  transform: translateY(-50%);
  color: rgba(0, 0, 0, 0.45); /* Ant Design standard placeholder color */
  pointer-events: none; /* Allow clicks to pass through to the select input */
  z-index: 1; /* Ensure it's above the select input content */
}
</style> 