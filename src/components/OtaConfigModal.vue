<template>
  <a-modal
    :visible="visible"
    title="OTA配置"
    :footer="null"
    :width="500"
    @cancel="handleCancel"
    class="ota-config-modal"
  >
    <a-form layout="vertical">
      <a-form-item label="设备型号" required>
        <a-select 
          :options="deviceModelOptions"
          v-model:value="localDeviceModelValue"
          placeholder="请选择"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item label="最新固件" required>
        <a-select 
          :options="latestFirmwareOptions"
          v-model:value="localLatestFirmwareValue"
          placeholder="请选择"
          style="width: 100%"
        />
      </a-form-item>
      <div style="display: flex; justify-content: center; gap: 16px; margin-top: 24px;">
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" @click="handleOk">确定</a-button>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue';

const props = defineProps({
  visible: Boolean,
  deviceModelOptions: Array,
  latestFirmwareOptions: Array,
  deviceModelValue: [String, Number, Object],
  latestFirmwareValue: [String, Number, Object],
});

const emits = defineEmits(['update:visible', 'ok', 'update:deviceModelValue', 'update:latestFirmwareValue']);

// Local refs for v-model
const localDeviceModelValue = ref(props.deviceModelValue);
const localLatestFirmwareValue = ref(props.latestFirmwareValue);

// Watch for prop changes and update local refs
watch(() => props.deviceModelValue, (val) => {
  localDeviceModelValue.value = val;
});

watch(() => props.latestFirmwareValue, (val) => {
  localLatestFirmwareValue.value = val;
});

// Emit updates when local values change
watch(localDeviceModelValue, (val) => {
  emits('update:deviceModelValue', val);
});

watch(localLatestFirmwareValue, (val) => {
  emits('update:latestFirmwareValue', val);
});

function handleCancel() {
  emits('update:visible', false);
}

function handleOk() {
  emits('ok', {
    deviceModelValue: localDeviceModelValue.value,
    latestFirmwareValue: localLatestFirmwareValue.value
  });
}
</script>

<style scoped>
.ota-config-modal .ant-modal-body {
  padding: 32px 24px 24px 24px;
  background: #fff;
  border-radius: 8px;
}
.ota-config-modal .ant-modal-title {
  font-weight: bold;
  font-size: 16px;
}
</style> 