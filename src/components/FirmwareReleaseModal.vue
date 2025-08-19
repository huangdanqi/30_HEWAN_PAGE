<template>
  <a-modal
    :visible="visible"
    title="版本发布"
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
            <a-select
              v-model:value="formState.deviceModel"
              placeholder="请选择设备型号"
              :disabled="isEditMode && isRestricted"
              :options="deviceModelOptions.length > 0 ? deviceModelOptions : uniqueDeviceModels.map(model => ({ key: model, value: model, label: model }))"
            >
            </a-select>
          </a-form-item>

          <a-form-item label="发布版本" name="releaseType">
            <a-radio-group v-model:value="formState.releaseType" :disabled="isEditMode && isRestricted">
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
          :disabled="isEditMode && isRestricted"
          :file-list="fileList"
          class="upload-dragger-centered"
          :show-upload-list="false"
          accept=".xls,.xlsx"
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
                :disabled="isEditMode && isRestricted"
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
          <a-button @click="testVersionGeneration" style="margin-left: 8px;">
          测试版本生成
        </a-button>
        <a-button @click="testUploadEndpoint" style="margin-left: 8px;">
          测试上传端点
        </a-button>
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
import { ref, reactive, watch, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import type { UploadChangeParam, UploadProps } from 'ant-design-vue';
import { InboxOutlined, DeleteOutlined, PaperClipOutlined } from '@ant-design/icons-vue';
import type { FormInstance } from 'ant-design-vue';
import axios from 'axios';
import { constructApiUrl } from '../utils/api';

// Define component props
const props = defineProps({
  visible: { type: Boolean, default: false },
  uniqueDeviceModels: { type: Array as () => string[], default: () => [] },
  deviceModelOptions: { type: Array as () => Array<{ key: string; value: string; label: string }>, default: () => [] },
  editRecord: { type: Object, default: null }, // For edit mode
  generatedVersion: { type: String, default: '' }, // Generated version from parent
  firmwareData: { type: Array as () => any[], default: () => [] }, // Firmware data for version calculation
});

const emits = defineEmits(['update:visible', 'submit']);

const currentStep = ref(0);
const step1Form = ref<FormInstance | null>(null);
const fileList = ref<any[]>([]);
const loading = ref(false);

// Form state
const formState = reactive({
  deviceModel: '',
  releaseType: 'major', // major, minor, revision
  contentDescription: '',
});

// Validation rules
const rules = {
  deviceModel: [{ required: true, message: '请选择设备型号' }],
  releaseType: [{ required: true, message: '请选择发布版本' }],
  contentDescription: [{ required: true, message: '请输入内容描述' }],
};

// Check if in edit mode
const isEditMode = computed(() => !!props.editRecord);

// Check if editing is restricted (firmware is factory burning or latest updatable version)
const isRestricted = computed(() => {
  if (!props.editRecord) return false;
  return props.editRecord.isFactoryBurning || props.editRecord.isLatestUpdatable;
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

const uploadData = computed(() => {
  const data = {
    deviceModel: formState.deviceModel,
    releaseType: formState.releaseType,
  };
  console.log('Upload data:', data);
  return data;
});

// Generate version number based on current firmware versions
const generatedVersion = computed(() => {
  if (!formState.deviceModel) return '';
  
  // Use the version passed from parent component if available
  if (props.generatedVersion) {
    return props.generatedVersion;
  }
  
  // Fallback: calculate version based on firmware data
  const deviceVersions = props.firmwareData.filter((item: any) => item.deviceModel === formState.deviceModel);
  
  // If no versions exist for this device model, start from 1.0.0
  if (deviceVersions.length === 0) {
    const releaseTypeMap = {
      'major': '主版本',
      'minor': '子版本', 
      'revision': '修订版'
    };
    const releaseTypeLabel = releaseTypeMap[formState.releaseType as keyof typeof releaseTypeMap] || '主版本';
    return `${formState.deviceModel} V 1.0.0`;
  }
  
  // Parse existing version numbers - handle formats like "t V 1.0.0 (主版本)" or "t V 1.0.0"
  const versions = deviceVersions
    .map((item: any) => item.versionNumber)
    .map((v: string) => {
      const vStr = v.trim();
      // Support multiple version formats: "t V 1.0.0 (主版本)", "t V 1.0.0", "V 1.0.0", "V1.0.0", "1.0.0", etc.
      // Look for version numbers after the device model and "V"
      const match = vStr.match(/(?:.*?V\s*)?(\d+)\.(\d+)\.(\d+)/);
      if (match) {
        return {
          x: parseInt(match[1]),
          y: parseInt(match[2]),
          z: parseInt(match[3]),
        };
      }
      return null;
    })
    .filter(Boolean);
  
  if (versions.length === 0) {
    // If parsing failed, start from 1.0.0
    const releaseTypeMap = {
      'major': '主版本',
      'minor': '子版本', 
      'revision': '修订版'
    };
    const releaseTypeLabel = releaseTypeMap[formState.releaseType as keyof typeof releaseTypeMap] || '主版本';
    return `${formState.deviceModel} V 1.0.0`;
  }
  
  // Find the highest version numbers
  let maxX = Math.max(...versions.map((v: any) => v.x));
  let maxY = Math.max(...versions.filter((v: any) => v.x === maxX).map((v: any) => v.y));
  let maxZ = Math.max(...versions.filter((v: any) => v.x === maxX && v.y === maxY).map((v: any) => v.z));
  
  // Generate next version based on release type - NO CHINESE LABELS
  let nextVersion = '';
  const releaseTypeMap = {
    'major': '主版本',
    'minor': '子版本', 
    'revision': '修订版'
  };
  const releaseTypeLabel = releaseTypeMap[formState.releaseType as keyof typeof releaseTypeMap] || '主版本';
  
  if (formState.releaseType === 'major') {
    // Increment major version (X.0.0)
    nextVersion = `${formState.deviceModel} V ${maxX + 1}.0.0`;
  } else if (formState.releaseType === 'minor') {
    // Increment minor version (X.Y.0)
    nextVersion = `${formState.deviceModel} V ${maxX}.${maxY + 1}.0`;
  } else if (formState.releaseType === 'revision') {
    // Increment revision version (X.Y.Z)
    nextVersion = `${formState.deviceModel} V ${maxX}.${maxY}.${maxZ + 1}`;
  }
  
  return nextVersion;
});

// Watch for edit record changes
watch(() => props.editRecord, (newRecord) => {
  if (newRecord) {
    formState.deviceModel = newRecord.deviceModel || '';
    formState.releaseType = newRecord.releaseType || 'major';
    formState.contentDescription = newRecord.description || '';
    
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

// Watch for version generation changes
watch(() => generatedVersion.value, (newVersion) => {
  console.log('=== VERSION GENERATION CHANGE ===');
  console.log('Device Model:', formState.deviceModel);
  console.log('Release Type:', formState.releaseType);
  console.log('Generated Version:', newVersion);
  console.log('Firmware Data Count:', props.firmwareData.length);
  console.log('Device Versions:', props.firmwareData.filter((item: any) => item.deviceModel === formState.deviceModel));
  console.log('=== END VERSION GENERATION CHANGE ===');
}, { immediate: true });

// Watch for form changes to trigger version recalculation
watch([() => formState.deviceModel, () => formState.releaseType], ([newDeviceModel, newReleaseType]) => {
  console.log('=== FORM CHANGE DETECTED ===');
  console.log('Device Model changed to:', newDeviceModel);
  console.log('Release Type changed to:', newReleaseType);
  console.log('This will trigger version recalculation');
  console.log('=== END FORM CHANGE ===');
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
  console.log('=== BEFORE UPLOAD START ===');
  console.log('Before upload called for file:', file.name, file.size);
  console.log('File type:', file.type);
  console.log('File lastModified:', file.lastModified);
  
  const isValidFormat = /\.(xls|xlsx)$/i.test(file.name);
  if (!isValidFormat) {
    console.log('File format rejected:', file.name);
    message.error('只支持 .xls, .xlsx 格式的文件!');
    return false;
  }
  
  const isLt100M = file.size / 1024 / 1024 < 100;
  if (!isLt100M) {
    console.log('File size too large:', file.size);
    message.error('文件大小不能超过 100MB!');
    return false;
  }
  
  console.log('File validation passed');
  console.log('=== BEFORE UPLOAD END ===');
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
  fileList.value = fileList.value.filter(file => file.uid !== uid);
};

// Test upload endpoint
const testUploadEndpoint = async () => {
  try {
    console.log('Testing upload endpoint...');
    const response = await axios.get(constructApiUrl('firmware/test'));
    console.log('Upload endpoint test response:', response.data);
    message.success('上传端点测试成功');
    
    // Also test the upload endpoint directly
    console.log('Testing upload endpoint with POST...');
    const uploadTestResponse = await axios.post(constructApiUrl('firmware/upload'), {}, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log('Upload endpoint POST test response:', uploadTestResponse.data);
  } catch (error: any) {
    console.error('Upload endpoint test failed:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    message.error('上传端点测试失败');
  }
};

// Test version generation
const testVersionGeneration = () => {
  console.log('=== TESTING VERSION GENERATION IN MODAL ===');
  console.log('Form state:', formState);
  console.log('Generated version:', generatedVersion.value);
  console.log('Props firmware data count:', props.firmwareData.length);
  console.log('Props generated version:', props.generatedVersion);
  
  // Test with current form values
  if (formState.deviceModel) {
    const deviceVersions = props.firmwareData.filter((item: any) => item.deviceModel === formState.deviceModel);
    console.log('Device versions for', formState.deviceModel, ':', deviceVersions);
    console.log('Version numbers:', deviceVersions.map((item: any) => item.versionNumber));
  }
  
  message.info('版本生成测试完成，请查看控制台输出');
};

// Submit method
const handleSubmit = async () => {
  if (loading.value) {
    console.log('Form submission already in progress, ignoring duplicate submit');
    return;
  }
  
  loading.value = true;
  const requestId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  console.log('=== SUBMIT START ===');
  console.log('Submit timestamp:', new Date().toISOString());
  console.log('Request ID:', requestId);
  
  try {
    // Validate form
    if (!formState.deviceModel) {
      message.error('请选择设备型号');
      return;
    }
    
    if (!formState.contentDescription) {
      message.error('请输入内容描述');
      return;
    }
    
    if (fileList.value.length === 0) {
      message.error('请选择要上传的文件');
      return;
    }
    
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
    
    // Keep the full generated version format (like "q V 2.0.1")
    const fullVersionNumber = generatedVersion.value;
    
    const submitData = {
      deviceModel: formState.deviceModel,
      releaseType: formState.releaseType, // Send the English value (major, minor, revision)
      releaseVersion: releaseVersionMap[formState.releaseType] || formState.releaseType, // Send Chinese mapping
      description: formState.contentDescription, // Map to 'description' as backend expects
      versionNumber: fullVersionNumber, // Keep the full format like "q V 2.0.1"
      fileAddress: fileAddress,
      creator: '管理员' // Add creator field that backend expects
    };
    
    console.log('=== SUBMIT DEBUG INFO ===');
    console.log('Submit timestamp:', new Date().toISOString());
    console.log('File list:', fileList.value);
    console.log('Uploaded file:', uploadedFile);
    console.log('File URL:', uploadedFile.url);
    console.log('File response:', uploadedFile.response);
    console.log('File address being sent:', fileAddress);
    console.log('Generated version from parent:', props.generatedVersion);
    console.log('Local generated version:', generatedVersion.value);
    console.log('Form state:', formState);
    console.log('Submitting firmware data:', submitData);
    console.log('=== END SUBMIT DEBUG ===');
    
    // Call API to save firmware
    console.log('Making API call to:', constructApiUrl('firmware'));
    console.log('Request ID for this call:', requestId);
    const response = await axios.post(constructApiUrl('firmware'), submitData);
    
    console.log('API response received at:', new Date().toISOString());
    console.log('Request ID for response:', requestId);
    console.log('API response:', response.data);
    message.success(isEditMode.value ? '固件编辑成功!' : '固件发布成功!');
    
    // Emit the API response data, not the form data
    emits('submit', {
      success: true,
      data: response.data,
      isEdit: isEditMode.value,
      timestamp: new Date().toISOString(),
      requestId: requestId
    });
    
    handleCancel();
  } catch (error: any) {
    console.error('Submit failed at:', new Date().toISOString());
    console.error('Request ID for failed submit:', requestId);
    console.error('Submit failed:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      message.error(`提交失败: ${error.response.data?.error || '未知错误'}`);
    } else {
      message.error('操作失败，请重试');
    }
  } finally {
    loading.value = false;
    console.log('=== SUBMIT END ===');
    console.log('Request ID completed:', requestId);
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