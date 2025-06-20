<template>
  <a-modal
    :open="open"
    :title="title"
    @ok="handleOk"
    @cancel="handleCancel"
    :footer="null"
    width="480px"
  >
    <a-form :model="formState" :rules="rules" ref="formRef" layout="vertical">
      <a-form-item label="设备型号" name="deviceModel" required>
        <a-select v-model:value="formState.deviceModel" :options="deviceModelOptions" placeholder="请选择" allow-clear size="large" />
      </a-form-item>
      <a-form-item label="生产批次" name="productionBatch" required>
        <a-date-picker v-model:value="formState.productionBatch" style="width: 100%" placeholder="请选择" size="large" />
      </a-form-item>
      <a-form-item label="生产厂家" name="manufacturer" required>
        <a-select v-model:value="formState.manufacturer" :options="manufacturerOptions" placeholder="请选择" allow-clear size="large" />
      </a-form-item>
      <a-form-item label="烧录固件" name="burnedFirmware" required>
        <a-input v-model:value="formState.burnedFirmware" placeholder="请输入" size="large" />
      </a-form-item>
      <a-form-item label="单价" name="unitPrice" required>
        <a-input-number v-model:value="formState.unitPrice" style="width: 100%" min="0" addon-after="元" placeholder="请输入" size="large" />
      </a-form-item>
      <a-form-item label="数量" name="quantity" required>
        <a-input-number v-model:value="formState.quantity" style="width: 100%" min="0" addon-after="个" placeholder="请输入" size="large" />
      </a-form-item>
      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px;">
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" @click="handleOk">确定</a-button>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, defineProps, defineEmits } from 'vue';
import type { FormInstance } from 'ant-design-vue';
import dayjs from 'dayjs';

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '新增批次' },
  deviceModelOptions: { type: Array as () => { label: string; value: string }[], default: () => [] },
  manufacturerOptions: { type: Array as () => { label: string; value: string }[], default: () => [] },
  initialValues: { type: Object as () => any, default: () => ({}) },
});

const emits = defineEmits(['update:open', 'submit']);

const formRef = ref<FormInstance | null>(null);
const formState = reactive({
  deviceModel: '',
  productionBatch: null as any,
  manufacturer: '',
  burnedFirmware: '',
  unitPrice: null,
  quantity: null,
});

const rules = {
  deviceModel: [{ required: true, message: '请选择设备型号' }],
  productionBatch: [{ required: true, message: '请选择生产批次' }],
  manufacturer: [{ required: true, message: '请选择生产厂家' }],
  burnedFirmware: [{ required: true, message: '请输入烧录固件' }],
  unitPrice: [{ required: true, type: 'number', message: '请输入单价' }],
  quantity: [{ required: true, type: 'number', message: '请输入数量' }],
};

watch(() => props.open, (val) => {
  if (val && props.initialValues && Object.keys(props.initialValues).length > 0) {
    Object.assign(formState, props.initialValues);
    // Convert productionBatch to dayjs if it's a string
    if (typeof formState.productionBatch === 'string' && formState.productionBatch) {
      formState.productionBatch = dayjs(formState.productionBatch);
    }
  } else if (!val) {
    resetForm();
  }
});

function resetForm() {
  formState.deviceModel = '';
  formState.productionBatch = null;
  formState.manufacturer = '';
  formState.burnedFirmware = '';
  formState.unitPrice = null;
  formState.quantity = null;
  formRef.value?.resetFields?.();
}

async function handleOk() {
  try {
    await formRef.value?.validate();
    emits('submit', { ...formState });
    emits('update:open', false);
    resetForm();
  } catch (e) {
    // Validation error
  }
}

function handleCancel() {
  emits('update:open', false);
  resetForm();
}
</script>

<style scoped>
:deep(.ant-modal-body) {
  padding-bottom: 0;
}
</style> 