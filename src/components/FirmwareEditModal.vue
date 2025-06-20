<template>
  <a-modal
    :visible="visible"
    title="编辑固件信息"
    :footer="null"
    @cancel="handleCancel"
    width="600px"
  >
    <a-steps :current="currentStep">
      <a-step title="信息编辑" />
      <a-step title="固件上传" />
    </a-steps>

    <div class="steps-content">
      <div v-if="currentStep === 0">
        <a-form :model="formState" :rules="rules" ref="step1Form" layout="vertical">
          <a-form-item label="首版发布" name="isFirstRelease">
            <a-radio-group v-model:value="formState.isFirstRelease">
              <a-radio :value="true">是</a-radio>
              <a-radio :value="false">否</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="设备型号" name="deviceModel">
            <a-input
              v-model:value="formState.deviceModel"
              :placeholder="`请输入（最多15个字符，不含空格）`"
              v-if="formState.isFirstRelease"
              :maxlength="30"
            />
            <a-select v-model:value="formState.deviceModel" placeholder="请选择" v-else>
              <a-select-option v-for="model in uniqueDeviceModels" :key="model" :value="model">{{ model }}</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="发布版本" name="releaseType" v-if="!formState.isFirstRelease">
            <a-radio-group v-model:value="formState.releaseType">
              <a-radio value="major">主版本</a-radio>
              <a-radio value="minor">子版本</a-radio>
              <a-radio value="revision">修订版</a-radio>
            </a-radio-group>
            <p style="margin-top: 8px;">本次将发布为 {{ generatedVersion }} 版本</p>
          </a-form-item>

          <a-form-item label="内容描述" name="contentDescription">
            <a-textarea
              v-model:value="formState.contentDescription"
              :placeholder="'请输入（最多10000个字符，不含空格）'"
              :rows="4"
              :maxlength="10020"
            />
          </a-form-item>
        </a-form>
      </div>

      <div v-if="currentStep === 1">
        <a-upload-dragger
          name="file"
          :multiple="false"
          action="/upload.do"
          @change="handleUploadChange"
          @drop="handleDrop"
        >
          <p class="ant-upload-drag-icon">
            <inbox-outlined />
          </p>
          <p class="ant-upload-text">点击或拖拽文件到此区域</p>
          <p class="ant-upload-hint">
            请按照模板上传文件进行设备导入。支持文件格式: .xls, .xlsx。
          </p>
        </a-upload-dragger>

        <div v-if="fileList.length > 0" style="margin-top: 16px;">
          <div v-for="file in fileList" :key="file.uid">
            <a-progress :percent="file.percent || 0" />
            <span>{{ file.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="steps-action">
      <a-button v-if="currentStep < 1" type="primary" @click="nextStep">下一步</a-button>
      <a-button v-if="currentStep > 0" style="margin-left: 8px" @click="prevStep">上一步</a-button>
      <a-button
        v-if="currentStep === 1"
        type="primary"
        @click="handleSubmit"
        style="margin-left: 8px"
      >
        确定
      </a-button>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { message } from 'ant-design-vue';
import type { UploadChangeParam } from 'ant-design-vue';
import { InboxOutlined } from '@ant-design/icons-vue';
import type { FormInstance } from 'ant-design-vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  record: { type: Object, default: null },
  uniqueDeviceModels: { type: Array as () => string[], default: () => [] },
});

const emits = defineEmits(['update:visible', 'submit']);

const currentStep = ref(0);
const step1Form = ref<FormInstance | null>(null);
const fileList = ref<any[]>([]);

const formState = reactive({
  isFirstRelease: true,
  deviceModel: '',
  releaseType: 'major',
  contentDescription: '',
});

const rules = {
  deviceModel: [{ required: true, message: '请选择设备型号' }],
  contentDescription: [{ required: true, message: '请输入内容描述' }],
  isFirstRelease: [{ required: true, message: '请选择是否首版发布' }],
  releaseType: [{ required: true, message: '请选择发布版本' }],
};

const generatedVersion = computed(() => {
  const baseVersion = '1.0.0';
  const parts = baseVersion.split('.').map(Number);
  if (formState.isFirstRelease) {
    return `V ${parts[0]}.0.0`;
  } else {
    switch (formState.releaseType) {
      case 'major':
        return `V ${parts[0] + 1}.0.0`;
      case 'minor':
        return `V ${parts[0]}.${parts[1] + 1}.0`;
      case 'revision':
        return `V ${parts[0]}.${parts[1]}.${parts[2] + 1}`;
      default:
        return `V ${baseVersion}`;
    }
  }
});

const deviceModelMaxLength = 15;
const deviceModelInputLength = computed(() => formState.deviceModel.replace(/\s/g, '').length);

watch(() => formState.deviceModel, (val) => {
  let raw = val.replace(/\s/g, '');
  if (raw.length > deviceModelMaxLength) {
    let count = 0;
    let result = '';
    for (let c of val) {
      if (c !== ' ') count++;
      if (count > deviceModelMaxLength) break;
      result += c;
    }
    formState.deviceModel = result;
  }
});

watch(() => formState.isFirstRelease, (newVal) => {
  if (newVal) {
    formState.releaseType = 'major';
  }
  formState.deviceModel = '';
});

watch(() => formState.contentDescription, (val) => {
  let raw = val.replace(/\s/g, '');
  if (raw.length > 10000) {
    let count = 0;
    let result = '';
    for (let c of val) {
      if (c !== ' ') count++;
      if (count > 10000) break;
      result += c;
    }
    formState.contentDescription = result;
  }
});

watch(() => props.record, (newRecord) => {
  if (newRecord) {
    // Pre-fill form fields from record
    formState.isFirstRelease = newRecord.isFirstRelease ?? true;
    formState.deviceModel = newRecord.deviceModel ?? '';
    formState.releaseType = newRecord.releaseType ?? 'major';
    formState.contentDescription = newRecord.contentDescription ?? '';
    // Optionally handle fileList if you want to pre-fill uploads
  }
}, { immediate: true });

const nextStep = async () => {
  try {
    await step1Form.value?.validateFields();
    currentStep.value++;
  } catch (error) {
    console.error('Validation Failed:', error);
  }
};

const prevStep = () => {
  currentStep.value--;
};

const handleSubmit = () => {
  message.success('固件信息编辑成功!');
  emits('submit', { formState: { ...formState }, files: fileList.value });
  handleCancel();
};

const handleCancel = () => {
  currentStep.value = 0;
  formState.isFirstRelease = true;
  formState.deviceModel = '';
  formState.releaseType = 'major';
  formState.contentDescription = '';
  fileList.value = [];
  emits('update:visible', false);
};

const handleUploadChange = (info: UploadChangeParam) => {
  let resFileList = [...info.fileList];
  resFileList = resFileList.slice(-1);
  resFileList = resFileList.map(file => {
    if (file.response) {
      file.url = file.response.url;
    }
    return file;
  });
  fileList.value = resFileList;
  if (info.file.status === 'done') {
    message.success(`${info.file.name} 文件上传成功.`);
  } else if (info.file.status === 'error') {
    message.error(`${info.file.name} 文件上传失败.`);
  }
};

const handleDrop = (e: DragEvent) => {
  console.log(e);
};
</script>

<style scoped>
.steps-content {
  margin-top: 24px;
  border: 1px dashed #e9e9e9;
  border-radius: 6px;
  background-color: #fafafa;
  min-height: 200px;
  text-align: left;
  padding: 20px;
  font-family: 'PingFang SC', sans-serif;
}

.steps-action {
  margin-top: 24px;
  text-align: left;
  font-family: 'PingFang SC', sans-serif;
}

:deep(.ant-modal-title),
:deep(.ant-modal),
:deep(.ant-form),
:deep(.ant-form-item-label > label),
:deep(.ant-form-item),
:deep(.ant-radio-group),
:deep(.ant-input),
:deep(.ant-select),
:deep(.ant-btn),
:deep(.ant-steps),
:deep(.ant-upload),
:deep(.ant-upload-text),
:deep(.ant-upload-hint),
:deep(.ant-upload-drag-icon),
:deep(.ant-progress),
:deep(.ant-modal-close-x) {
  font-family: 'PingFang SC', sans-serif !important;
  text-align: left !important;
}

:deep(.ant-form-item-label > label) {
  text-align: left !important;
}

:deep(.ant-modal-body) {
  text-align: left !important;
}
</style> 