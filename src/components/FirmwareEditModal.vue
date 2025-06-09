<template>
  <a-modal
    :visible="visible"
    title="编辑固件信息"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form :model="editableRecord" layout="vertical">
      <a-form-item label="设备型号">
        <a-input v-model:value="editableRecord.deviceModel" />
      </a-form-item>
      <a-form-item label="发布版本">
        <a-input v-model:value="editableRecord.releaseVersion" />
      </a-form-item>
      <a-form-item label="版本号">
        <a-input v-model:value="editableRecord.versionNumber" />
      </a-form-item>
      <a-form-item label="内容描述">
        <a-textarea v-model:value="editableRecord.contentDescription" :rows="4" />
      </a-form-item>
      <a-form-item label="创建人">
        <a-input v-model:value="editableRecord.creator" />
      </a-form-item>
      <a-form-item label="设备状态">
        <a-input v-model:value="editableRecord.deviceStatus" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue';
import type { DataItem } from '../views/Firmware.vue'; // Assuming DataItem is defined here

const props = defineProps({
  visible: { type: Boolean, default: false },
  record: { type: Object as () => DataItem | null, default: null },
});

const emits = defineEmits(['update:visible', 'submit']);

const editableRecord = reactive<DataItem>({
  key: '',
  serialNumber: 0,
  deviceModel: '',
  releaseVersion: '',
  versionNumber: '',
  contentDescription: '',
  creator: '',
  releaseTime: '',
  updateTime: '',
  deviceStatus: '',
});

watch(() => props.record, (newRecord) => {
  if (newRecord) {
    Object.assign(editableRecord, newRecord);
  }
}, { immediate: true });

const handleSubmit = () => {
  emits('submit', editableRecord);
  emits('update:visible', false);
};

const handleCancel = () => {
  emits('update:visible', false);
};
</script> 