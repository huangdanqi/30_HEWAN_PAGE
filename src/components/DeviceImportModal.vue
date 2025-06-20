<template>
  <a-modal
    :visible="modalVisible"
    :title="modalTitle"
    :footer="null"
    :width="540"
    @cancel="handleCancel"
    class="device-import-modal"
  >
    <template v-if="step === 0">
      <a-steps :current="0" size="small" style="margin-bottom: 24px;">
        <a-step title="设备录入" />
        <a-step title="文件导入" />
      </a-steps>
      <a-form :model="formState" :rules="rules" ref="formRef" layout="vertical">
        <a-form-item label="设备型号" name="deviceModel" required>
          <a-select v-model:value="formState.deviceModel" :options="deviceModelOptions" placeholder="请选择" allow-clear />
        </a-form-item>
        <a-form-item label="生产批次" name="productionBatch" required>
          <a-select v-model:value="formState.productionBatch" :options="productionBatchOptions" placeholder="请选择" allow-clear />
        </a-form-item>
        <a-form-item label="生产厂家" name="manufacturer" required>
          <a-select v-model:value="formState.manufacturer" :options="manufacturerOptions" placeholder="请选择" allow-clear />
        </a-form-item>
        <a-form-item label="烧录固件" name="burnedFirmware" required>
          <a-input v-model:value="formState.burnedFirmware" placeholder="请输入" />
        </a-form-item>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px;">
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" @click="nextStep">下一步</a-button>
        </div>
      </a-form>
    </template>
    <template v-else-if="step === 1">
      <a-steps :current="1" size="small" style="margin-bottom: 24px;">
        <a-step title="设备录入" />
        <a-step title="文件导入" />
      </a-steps>
      <div class="upload-area">
        <a-upload-dragger
          :file-list="fileList"
          :before-upload="beforeUpload"
          :custom-request="customRequest"
          :show-upload-list="false"
        >
          <div class="upload-icon">
            <inbox-outlined style="font-size: 48px; color: #1677ff; margin-bottom: 8px;" />
          </div>
          <div class="upload-text">点击或拖拽文件到此区域上传</div>
          <div class="upload-hint">请上传设备导入文件，支持格式：xls、xlsx。</div>
        </a-upload-dragger>
        <div v-if="fileName" class="file-progress">
          <a-progress :percent="uploadPercent" :show-info="true" style="width: 90%; margin: 0 auto;" />
          <div class="file-name-row">
            <span><a-file-excel-outlined style="color: #52c41a; margin-right: 4px;" />{{ fileName }}</span>
            <span>{{ uploadPercent }}%</span>
          </div>
        </div>
        <div class="upload-actions">
          <a-button @click="prevStep">上一步</a-button>
          <a-button type="primary" :disabled="!fileName || uploadPercent < 100" @click="handleImport">确定</a-button>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="result-area">
        <template v-if="resultType === 'success'">
          <div class="result-icon success"><check-circle-outlined /></div>
          <div class="result-title">导入成功</div>
          <div class="result-desc">已成功导入XX条设备信息数据</div>
        </template>
        <template v-else-if="resultType === 'duplicate'">
          <div class="result-icon warning"><exclamation-circle-outlined /></div>
          <div class="result-title">导入数据重复</div>
          <div class="result-desc">发现XX条数据重复，设备ID不可重复，如继续导入，等重复数据跳过。请确认，下载重复文件。</div>
          <a-button type="link" @click="downloadDuplicate">下载重复文件</a-button>
        </template>
        <template v-else>
          <div class="result-icon error"><close-circle-outlined /></div>
          <div class="result-title">导入失败</div>
          <div class="result-desc">导入失败，部分数据格式或数据类型不正确，部分必填字段未填写，且部分数据重复。请下载异常文件。</div>
          <a-button type="link" @click="downloadError">下载异常文件</a-button>
        </template>
        <div class="result-actions">
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" @click="handleFinish">确定</a-button>
        </div>
      </div>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch, computed } from 'vue';
import { InboxOutlined, FileExcelOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  visible: Boolean,
  deviceModelOptions: { type: Array, default: () => [] },
  productionBatchOptions: { type: Array, default: () => [] },
  manufacturerOptions: { type: Array, default: () => [] },
});
const emits = defineEmits(['update:visible', 'finish']);

const modalVisible = ref(props.visible);
watch(() => props.visible, (val) => {
  modalVisible.value = val;
});
watch(modalVisible, (val) => {
  if (!val) emits('update:visible', false);
});

const step = ref(0);
const formRef = ref();
const formState = reactive({
  deviceModel: '',
  productionBatch: '',
  manufacturer: '',
  burnedFirmware: '',
});
const rules = {
  deviceModel: [{ required: true, message: '请选择设备型号' }],
  productionBatch: [{ required: true, message: '请选择生产批次' }],
  manufacturer: [{ required: true, message: '请选择生产厂家' }],
  burnedFirmware: [{ required: true, message: '请输入烧录固件' }],
};

const fileList = ref([]);
const fileName = ref('');
const uploadPercent = ref(0);
const resultType = ref('success'); // 'success' | 'duplicate' | 'error'

const modalTitle = computed(() => {
  if (step.value === 0) return '设备导入-第一步';
  if (step.value === 1) return '设备导入-第二步';
  return '';
});

function nextStep() {
  formRef.value.validate().then(() => {
    step.value = 1;
  });
}
function prevStep() {
  step.value = 0;
}
function handleCancel() {
  emits('update:visible', false);
  reset();
}
function handleFinish() {
  emits('finish');
  reset();
}
function beforeUpload(file: any) {
  fileName.value = file.name;
  uploadPercent.value = 0;
  return false; // prevent auto upload
}
function customRequest(option: any) {
  // Simulate upload
  uploadPercent.value = 0;
  fileName.value = option.file.name;
  const timer = setInterval(() => {
    if (uploadPercent.value < 100) {
      uploadPercent.value += 10;
    } else {
      clearInterval(timer);
    }
  }, 100);
}
function handleImport() {
  // Simulate result
  // resultType.value = 'success';
  // resultType.value = 'duplicate';
  // resultType.value = 'error';
  // For demo, cycle through results
  if (resultType.value === 'success') resultType.value = 'duplicate';
  else if (resultType.value === 'duplicate') resultType.value = 'error';
  else resultType.value = 'success';
  step.value = 2;
}
function downloadDuplicate() {
  // Simulate download
  alert('下载重复文件');
}
function downloadError() {
  // Simulate download
  alert('下载异常文件');
}
function reset() {
  step.value = 0;
  fileName.value = '';
  uploadPercent.value = 0;
  resultType.value = 'success';
  formState.deviceModel = '';
  formState.productionBatch = '';
  formState.manufacturer = '';
  formState.burnedFirmware = '';
}
</script>

<style scoped>
.device-import-modal .step-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
}
.upload-area {
  background: #fafbfc;
  border-radius: 8px;
  padding: 24px 16px 16px 16px;
  margin-bottom: 16px;
  text-align: center;
}
.upload-icon {
  margin-bottom: 8px;
}
.upload-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}
.upload-hint {
  font-size: 12px;
  color: #888;
  margin-bottom: 12px;
}
.file-progress {
  margin: 16px 0 8px 0;
}
.file-name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #333;
  margin-top: 4px;
}
.upload-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
.result-area {
  text-align: center;
  padding: 32px 0 16px 0;
}
.result-icon {
  font-size: 48px;
  margin-bottom: 12px;
}
.result-icon.success {
  color: #52c41a;
}
.result-icon.warning {
  color: #faad14;
}
.result-icon.error {
  color: #ff4d4f;
}
.result-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}
.result-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}
.result-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
}
</style> 