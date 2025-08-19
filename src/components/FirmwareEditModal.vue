<template>
  <a-modal
    :visible="visible"
    title="版本编辑"
    :footer="null"
    @cancel="handleCancel"
    width="700px"
    :maskClosable="false"
  >
    <!-- Progress Steps -->
    <a-steps :current="currentStep" style="margin-bottom: 24px;">
      <a-step title="版本选择" />
      <a-step title="文件上传" />
    </a-steps>

    <div class="steps-content">
      <!-- Step 1: Version Selection -->
      <div v-if="currentStep === 0">
        <a-form :model="formState" :rules="rules" ref="step1Form" layout="vertical">
          <a-form-item label="设备型号" name="deviceModel">
            <a-input
              v-model:value="formState.deviceModel"
              placeholder="设备型号"
              :disabled="isRestricted"
            />
          </a-form-item>

          <a-form-item label="发布版本" name="releaseType">
            <a-radio-group v-model:value="formState.releaseType" :disabled="isRestricted">
              <a-radio value="major">主版本</a-radio>
              <a-radio value="minor">子版本</a-radio>
              <a-radio value="revision">修订版</a-radio>
            </a-radio-group>
            <div style="margin-top: 8px; color: #1890ff; font-weight: bold;">
              本次发布版本为 {{ generatedVersion }} 版本
            </div>
          </a-form-item>

          <a-form-item label="内容描述" name="contentDescription">
            <a-textarea
              v-model:value="formState.contentDescription"
              placeholder="请输入本次发布的功能变化"
              :rows="4"
              :maxlength="2000"
              show-count
            />
          </a-form-item>
          
          <!-- Display current username -->
          <a-form-item label="更新人">
            <a-input
              :value="props.currentUsername"
              disabled
              placeholder="当前用户"
            />
            <div style="font-size: 12px; color: #666; margin-top: 4px;">
              将使用当前登录用户作为更新人
            </div>
          </a-form-item>
        </a-form>
      </div>

      <!-- Step 2: File Upload -->
      <div v-if="currentStep === 1">
        <a-upload-dragger
          name="file"
          :multiple="false"
          :action="uploadAction"
          :headers="uploadHeaders"
          :data="uploadData"
          :before-upload="beforeUpload"
          @change="handleUploadChange"
          @drop="handleDrop"
          :disabled="isRestricted"
          :file-list="fileList"
          class="upload-dragger-centered"
        >
          <p class="ant-upload-drag-icon">
            <inbox-outlined />
          </p>
          <p class="ant-upload-text">点击或拖拽文件到此区域</p>
          <p class="ant-upload-hint">
            请将固件包上传至服务器，支持文件格式：.xls, .xlsx
          </p>
        </a-upload-dragger>

        <!-- File Progress - Only show when upload is completed -->
        <div v-if="fileList.length > 0 && fileList[0].status === 'done'" style="margin-top: 16px;">
          <div v-for="file in fileList" :key="file.uid" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border: 1px solid #d9d9d9; border-radius: 6px; margin-bottom: 8px; background-color: #fafafa;">
            <div style="flex: 1;">
              <div style="font-weight: bold; display: flex; align-items: center; margin-bottom: 8px;">
                <paper-clip-outlined style="margin-right: 8px; color: #1890ff;" />
                {{ file.name }}
              </div>
              <a-progress 
                :percent="100" 
                size="small" 
                status="success"
                :show-info="false"
              />
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <a-button 
                type="text" 
                danger 
                @click="removeFile(file.uid)"
                :disabled="isRestricted"
                size="small"
              >
                <delete-outlined />
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="steps-action">
      <a-button @click="handleCancel">取消</a-button>
      <a-button v-if="currentStep > 0" style="margin-left: 8px" @click="prevStep">上一步</a-button>
      <a-button 
        v-if="currentStep < 1" 
        type="primary" 
        style="margin-left: 8px" 
        @click="nextStep"
        :loading="loading"
      >
        下一步
      </a-button>
      <a-button
        v-if="currentStep === 1"
        type="primary"
        @click="handleSubmit"
        style="margin-left: 8px"
        :loading="loading"
        :disabled="fileList.length === 0"
      >
        发布
      </a-button>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { message } from 'ant-design-vue';
import type { UploadChangeParam } from 'ant-design-vue';
import { InboxOutlined, DeleteOutlined, PaperClipOutlined } from '@ant-design/icons-vue';
import type { FormInstance } from 'ant-design-vue';
import axios from 'axios';
import { constructApiUrl } from '../utils/api';

const props = defineProps({
  visible: { type: Boolean, default: false },
  record: { type: Object, default: null },
  currentUsername: { type: String, default: '管理员' }, // Add current username prop
});

const emits = defineEmits(['update:visible', 'submit']);

const currentStep = ref(0);
const step1Form = ref<FormInstance | null>(null);
const fileList = ref<any[]>([]);
const loading = ref(false);

// Form state
const formState = reactive({
  deviceModel: '',
  releaseType: 'major',
  contentDescription: '',
});

// Validation rules
const rules = {
  deviceModel: [{ required: true, message: '请选择设备型号' }],
  releaseType: [{ required: true, message: '请选择发布版本' }],
  contentDescription: [{ required: true, message: '请输入内容描述' }],
};

// Check if editing is restricted (firmware is factory burning or latest updatable version)
const isRestricted = computed(() => {
  if (!props.record) return false;
  return props.record.isFactoryBurning || props.record.isLatestUpdatable;
});

// Upload configuration
const uploadAction = computed(() => {
  // Use constructApiUrl to avoid double /api/ issue
  const url = constructApiUrl('firmware/upload');
  console.log('Upload action URL:', url);
  return url;
});
const uploadHeaders = {
  // Add any required headers for authentication
};
const uploadData = computed(() => ({
  deviceModel: formState.deviceModel,
  releaseType: formState.releaseType,
}));

// Generate version number
const generatedVersion = computed(() => {
  if (!formState.deviceModel) return '';
  
  const baseVersion = '1.0.0';
  const parts = baseVersion.split('.').map(Number);
  
  switch (formState.releaseType) {
    case 'major':
      return `${formState.deviceModel} V ${parts[0] + 1}.0.0`;
    case 'minor':
      return `${formState.deviceModel} V ${parts[0]}.${parts[1] + 1}.0`;
    case 'revision':
      return `${formState.deviceModel} V ${parts[0]}.${parts[1]}.${parts[2] + 1}`;
    default:
      return `${formState.deviceModel} V ${baseVersion}`;
  }
});

// Watch for record changes
watch(() => props.record, (newRecord) => {
  if (newRecord) {
    formState.deviceModel = newRecord.deviceModel || '';
    formState.releaseType = newRecord.releaseType || 'major';
    formState.contentDescription = newRecord.description || newRecord.contentDescription || '';
    
    // Pre-fill file list if editing
    if (newRecord.fileAddress) {
      fileList.value = [{
        uid: '-1',
        name: newRecord.fileAddress.split('/').pop() || 'firmware.bin',
        status: 'done',
        url: newRecord.fileAddress,
        percent: 100
      }];
    }
  }
}, { immediate: true });

// Navigation methods
const nextStep = async () => {
  try {
    await step1Form.value?.validateFields();
    currentStep.value++;
  } catch (error) {
    console.error('Validation Failed:', error);
    message.error('请完成必填项');
  }
};

const prevStep = () => {
  currentStep.value--;
};

// File upload methods
const beforeUpload = (file: File) => {
  const isValidFormat = /\.(xls|xlsx)$/i.test(file.name);
  if (!isValidFormat) {
    message.error('只支持 .xls, .xlsx 格式的文件!');
    return false;
  }
  
  const isLt100M = file.size / 1024 / 1024 < 100;
  if (!isLt100M) {
    message.error('文件大小不能超过 100MB!');
    return false;
  }
  
  return true;
};

const handleUploadChange = (info: UploadChangeParam) => {
  console.log('=== UPLOAD CHANGE START ===');
  console.log('Upload change info:', info);
  console.log('File status:', info.file.status);
  console.log('File name:', info.file.name);
  console.log('File response:', info.file.response);
  
  let resFileList = [...info.fileList];
  resFileList = resFileList.slice(-1); // Only allow one file
  
  resFileList = resFileList.map(file => {
    console.log('Processing file:', file);
    if (file.response) {
      console.log('File response:', file.response);
      // Handle successful response
      if (file.response && file.response.success) {
        file.url = file.response.url;
        file.status = 'done';
        file.percent = 100;
        console.log('File upload successful, URL:', file.response.url);
      } else {
        // Handle error response
        file.status = 'error';
        file.error = file.response?.error || '上传失败';
        console.log('File upload failed:', file.response?.error);
      }
    }
    return file;
  });
  
  fileList.value = resFileList;
  
  if (info.file.status === 'done') {
    message.success(`${info.file.name} 文件上传成功`);
    console.log('Upload completed successfully');
  } else if (info.file.status === 'error') {
    const errorMsg = info.file.error || info.file.response?.error || '未知错误';
    message.error(`${info.file.name} 文件上传失败: ${errorMsg}`);
    console.error('Upload error:', info.file.response || info.file.error);
  }
  console.log('=== UPLOAD CHANGE END ===');
};

const handleDrop = (e: DragEvent) => {
  console.log('Dropped files', e);
};

const removeFile = (uid: string) => {
  if (isRestricted.value) {
    message.warning('当前固件版本已被选为出厂烧录版本或最新可更新版本，无法删除文件');
    return;
  }
  fileList.value = fileList.value.filter(file => file.uid !== uid);
};

// Submit method
const handleSubmit = async () => {
  if (fileList.value.length === 0) {
    message.error('请上传固件文件');
    return;
  }
  
  loading.value = true;
  try {
    const uploadedFile = fileList.value[0];
    if (!uploadedFile.url && !uploadedFile.response?.url) {
      message.error('文件上传未完成，请等待上传完成后再提交');
      return;
    }
    
    const releaseVersionMap: Record<string, string> = {
      'major': '主版本',
      'minor': '子版本',
      'revision': '修订版'
    };
    
    const fileAddress = uploadedFile.url || uploadedFile.response?.url;
    
    const submitData = {
      deviceModel: formState.deviceModel,
      releaseType: formState.releaseType,
      releaseVersion: releaseVersionMap[formState.releaseType] || formState.releaseType,
      contentDescription: formState.contentDescription,
      versionNumber: generatedVersion.value,
      fileAddress: fileAddress,
      creator: props.currentUsername, // Use current username
      isEdit: true,
      originalRecord: props.record
    };
    
    console.log('=== EDIT SUBMIT DEBUG ===');
    console.log('Submitting edit data:', submitData);
    console.log('File address:', fileAddress);
    console.log('Current username:', props.currentUsername);
    console.log('=== END EDIT SUBMIT DEBUG ===');
    
    // Call API to update firmware
    const response = await axios.put(constructApiUrl(`firmware/${props.record?.id}`), submitData);
    
    console.log('Edit API response:', response.data);
    message.success('固件编辑成功!');
    emits('submit', submitData);
    handleCancel();
  } catch (error: any) {
    console.error('Edit submit failed:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      message.error(`编辑失败: ${error.response.data?.error || '未知错误'}`);
    } else {
      message.error('操作失败，请重试');
    }
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  currentStep.value = 0;
  formState.deviceModel = '';
  formState.releaseType = 'major';
  formState.contentDescription = '';
  fileList.value = [];
  emits('update:visible', false);
};
</script>

<style scoped>
.steps-content {
  margin-top: 24px;
  border: 1px dashed #e9e9e9;
  border-radius: 6px;
  background-color: #fafafa;
  min-height: 300px;
  text-align: left;
  padding: 20px;
  font-family: 'PingFang SC', sans-serif;
}

.steps-action {
  margin-top: 24px;
  text-align: right;
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

/* Center upload content */
:deep(.upload-dragger-centered) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
  height: 100%;
  padding: 40px 20px;
}

:deep(.upload-dragger-centered .ant-upload-drag-icon) {
  margin-bottom: 16px;
  font-size: 48px;
  color: #1890ff;
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.upload-dragger-centered .ant-upload-text) {
  margin-bottom: 8px;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.85);
  text-align: center;
}

:deep(.upload-dragger-centered .ant-upload-hint) {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  text-align: center;
}

:deep(.upload-dragger-centered .ant-upload) {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

:deep(.upload-dragger-centered .ant-upload-drag) {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

:deep(.upload-dragger-centered .ant-upload-btn) {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style> 