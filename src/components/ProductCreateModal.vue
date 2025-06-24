<template>
  <a-modal
    :visible="visible"
    title="新建产品"
    @cancel="handleCancel"
    :footer="null"
    width="500px"
  >
    <a-form :model="formState" :rules="rules" ref="formRef" layout="vertical">
      <a-form-item label="产品名称" name="productName" required>
        <a-input v-model:value="formState.productName" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="产品类型" name="productType" required>
        <a-input v-model:value="formState.productType" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="颜色" name="color" required>
        <a-input v-model:value="formState.color" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="产品详情" name="productDetails" required>
        <a-textarea v-model:value="formState.productDetails" placeholder="请输入" :rows="4" />
      </a-form-item>
      <a-form-item label="设备型号" name="deviceModel" required>
        <a-select v-model:value="formState.deviceModel" placeholder="请选择">
          <a-select-option v-for="opt in deviceModelOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="IP名称" name="ipName" required>
        <a-select v-model:value="formState.ipName" placeholder="请选择">
          <a-select-option v-for="opt in ipNameOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</a-select-option>
        </a-select>
      </a-form-item>
      <div style="display: flex; justify-content: center; gap: 16px; margin-top: 24px;">
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" @click="handleOk">确定</a-button>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { FormInstance } from 'ant-design-vue';

defineProps({
  visible: Boolean,
  deviceModelOptions: { type: Array as () => Array<{ value: string; label: string }>, default: () => [] },
  ipNameOptions: { type: Array as () => Array<{ value: string; label: string }>, default: () => [] },
});
const emits = defineEmits(['update:visible', 'submit']);
const formRef = ref<FormInstance | null>(null);
const formState = reactive({
  productName: '',
  productType: '',
  color: '',
  productDetails: '',
  deviceModel: '',
  ipName: '',
});
const rules = {
  productName: [{ required: true, message: '请输入产品名称' }],
  productType: [{ required: true, message: '请输入产品类型' }],
  color: [{ required: true, message: '请输入颜色' }],
  productDetails: [{ required: true, message: '请输入产品详情' }],
  deviceModel: [{ required: true, message: '请选择设备型号' }],
  ipName: [{ required: true, message: '请选择IP名称' }],
};
function handleCancel() {
  emits('update:visible', false);
}
async function handleOk() {
  try {
    await formRef.value?.validateFields();
    emits('submit', { ...formState });
    emits('update:visible', false);
  } catch (e) {
    // Validation failed
  }
}
</script> 