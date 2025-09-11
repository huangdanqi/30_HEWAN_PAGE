<template>
  <a-modal
    :open="visible"
    title="上传BOM"
    @ok="handleOk"
    @cancel="handleCancel"
    :footer="null"
    width="480px"
  >
    <a-upload-dragger
      :file-list="fileList"
      :before-upload="beforeUpload"
      :on-remove="handleRemove"
      :custom-request="customRequest"
      accept=".xls,.xlsx"
      style="margin-bottom: 16px;"
    >
      <p class="ant-upload-drag-icon">
        <upload-outlined style="font-size: 48px; color: #1677ff;" />
      </p>
      <p class="ant-upload-text">点击或拖拽文件到此区域</p>
      <p class="ant-upload-hint">支持文件格式：.xls, .xlsx</p>
    </a-upload-dragger>
    <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px;">
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" :disabled="fileList.length === 0" @click="handleOk">确定</a-button>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';
import { UploadOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
});
const emits = defineEmits(['update:open', 'submit']);

const fileList = ref<any[]>([]);

function beforeUpload(file: any) {
  fileList.value = [file];
  return false; // Prevent auto upload
}
function handleRemove(_file: any) {
  fileList.value = [];
}
function customRequest({ onSuccess }: any) {
  setTimeout(() => {
    onSuccess && onSuccess();
  }, 1000);
}
function handleOk() {
  emits('submit', fileList.value[0]);
  emits('update:open', false);
  fileList.value = [];
}
function handleCancel() {
  emits('update:open', false);
  fileList.value = [];
}
watch(() => props.visible, (val) => {
  if (!val) fileList.value = [];
});
</script>

<style scoped>
:deep(.ant-upload-drag-icon) {
  margin-bottom: 8px;
}
:deep(.ant-upload-text) {
  color: #222;
  font-size: 18px;
  font-weight: 500;
}
:deep(.ant-upload-hint) {
  color: #888;
}
</style> 