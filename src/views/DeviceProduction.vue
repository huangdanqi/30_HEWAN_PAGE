<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>设备生产</h2>
    </div>

    <!-- Control Bar -->
    <div class="top-controls-wrapper">
      <div class="left-aligned-section">
        <div class="select-container device-model-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">设备型号:</span>
          <a-tooltip :title="deviceModelValue.label">
          <a-select
            v-model:value="deviceModelValue"
              style="width: 120px;"
            :options="deviceModelOptions"
            @change="handleDeviceModelChange"
            :allowClear="true" 
            label-in-value
          >
            <a-select-option value="all">全部</a-select-option>
            <!-- If you have dynamic options, add them here -->
          </a-select>
          </a-tooltip>
        </div>
        <div class="select-container manufacturer-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">生产厂家:</span>
          <a-tooltip :title="manufacturerValue.label">
            <a-select
              v-model:value="manufacturerValue"
              style="width: 150px;"
              :options="manufacturerOptions"
              @change="handleManufacturerChange"
              :allowClear="true"
              label-in-value
            >
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div>
      </div>
      <!-- icon area -->
      <div class="right-aligned-icons">
          <!-- search area  -->
          <a-input
            v-model:value="searchInputValue"
            placeholder="请输入"
            style="width: 200px"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
          <a-button type="primary" @click="handleCreateDevice">新建设备</a-button>
          <!-- <a-button @click="handleBomCleanup" style="margin-left: 8px;">清理BOM</a-button> -->
          <ReloadOutlined @click="onRefresh" />
          <a-dropdown>
            <ColumnHeightOutlined @click.prevent />
            <template #overlay>
              <a-menu @click="handleMenuClick">
                <a-menu-item key="large">宽松</a-menu-item>
                <a-menu-item key="middle">中等</a-menu-item>
                <a-menu-item key="small">紧凑</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          <a-popover trigger="click" placement="bottomRight">
  <template #content>
    <div class="column-setting-panel" style="max-height: 300px; overflow-y: auto;">
      <div class="setting-section">
        <div class="section-header" style="display: flex; justify-content: space-between;">
          <span>列展示</span>
          <a-button type="link" @click="resetColumns">重置</a-button>
        </div>

        <draggable
          v-model="columnOrder"
          item-key="key"
          @end="onColumnOrderChange"
          class="column-checkbox-group"
        >
          <template #item="{ element: colKey }">
            <div class="column-checkbox-item" style="padding: 4px 0;">
              <a-checkbox
                :checked="selectedColumnKeys.includes(colKey)"
                @change="(event: Event) => handleColumnVisibilityChange(colKey, (event.target as HTMLInputElement).checked)"
              >
                {{ columnConfigs.find(config => config.key === colKey)?.title }}
              </a-checkbox>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </template>
  <SettingOutlined @click="onSettingClick" />
</a-popover>


      </div>
    </div>
      
    <!-- table area -->
    <div class="table-container">
      <a-table
        :columns="columns"
        :data-source="filteredData"
        :pagination="filteredData.length === 0 ? false : pagination"
        :loading="loading"
        :size="tableSize"
        :scroll="{ x: 1000 }"
        @change="handleTableChange"
        :showSorterTooltip="false"
      >
      <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'operation_12'">
        <a-space class="action-cell" direction="horizontal">
          <a class="view-link" @click="$emit('view-record', record)">查看</a>
          <a-divider type="vertical" />
          <a class="edit-link" @click="handleEditBatch(record)">编辑</a>
          <a-divider type="vertical" />
          <a class="upload-link" @click="handleUploadBom(record)">上传BOM</a>
          <a-divider type="vertical" />
          <a class="download-link" @click="handleDownloadBom(record)">下载</a>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定要删除该设备吗?"
            @confirm="$emit('delete-record', record)"
          >
            <a class="danger-link">删除</a>
          </a-popconfirm>
        </a-space>
      </template>
    </template>
      </a-table>
    </div>

    <!-- 新建设备 Modal -->
    <a-modal
      v-model:open="showCreateBatchModal"
      title="新建设备"
      :width="600"
      @cancel="handleCreateBatchModalCancel"
    >
      <a-form
        :model="createBatchForm"
        :rules="createBatchFormRules"
        layout="vertical"
        ref="createBatchFormRef"
      >
        <a-form-item label="设备型号" name="deviceModel" required>
          <a-select 
            v-model:value="createBatchForm.deviceModel" 
            placeholder="请选择"
            @change="handleDeviceModelChangeInForm"
            style="width: 100%"
          >
            <a-select-option 
              v-for="deviceModel in deviceModelOptionsForForm" 
              :key="deviceModel.value" 
              :value="deviceModel.value"
            >
              {{ deviceModel.label }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="生产批次" name="productionBatch" required>
          <a-date-picker
            v-model:value="createBatchForm.productionBatch" 
            placeholder="请选择生产批次"
            :disabled="!createBatchForm.deviceModel"
            style="width: 100%"
            allowClear
            format="YYYY-MM-DD"
            valueFormat="YYYY-MM-DD"
          />
        </a-form-item>

        <a-form-item label="生产厂家" name="manufacturer" required>
          <a-input 
            v-model:value="createBatchForm.manufacturer" 
            placeholder="请输入"
            @blur="handleManufacturerBlur"
          />
        </a-form-item>

        <a-form-item label="烧录固件" name="burnFirmware" required>
          <a-select 
            v-model:value="createBatchForm.burnFirmware" 
            placeholder="请选择"
            :disabled="!createBatchForm.deviceModel"
            style="width: 100%"
          >
            <a-select-option 
              v-for="firmware in firmwareOptionsForForm" 
              :key="firmware.value" 
              :value="firmware.value"
            >
              {{ firmware.label }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="单价" name="unitPrice" required>
          <a-input-number 
            v-model:value="createBatchForm.unitPrice" 
            placeholder="请输入" 
            style="width: 100%"
            :min="0"
            :precision="2"
            suffix="元"
          />
        </a-form-item>

        <a-form-item label="数量" name="quantity" required>
          <a-input-number 
            v-model:value="createBatchForm.quantity" 
            placeholder="请输入" 
            style="width: 100%"
            :min="1"
            :precision="0"
            suffix="个"
          />
        </a-form-item>
      </a-form>
      
      <template #footer>
        <div style="text-align: right; padding: 10px 0;">
          <a-button @click="handleCreateBatchModalCancel">取消</a-button>
          <a-button type="primary" @click="handleCreateBatchModalConfirm" style="margin-left: 8px;">确定</a-button>
        </div>
      </template>
    </a-modal>

    <!-- 编辑批次 Modal -->
    <div v-if="showEditBatchModal" class="modal-overlay" @click="showEditBatchModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑批次</h3>
          <button class="close-button" @click="showEditBatchModal = false">×</button>
        </div>
        
        <div class="modal-body">
          <a-form
            :model="editBatchForm"
            :rules="editBatchFormRules"
            layout="vertical"
            ref="editBatchFormRef"
          >
            <a-form-item label="设备型号" name="deviceModel" required>
              <a-select 
                v-model:value="editBatchForm.deviceModel" 
                placeholder="请选择设备型号"
                @change="handleEditDeviceModelChange"
                style="width: 100%"
                :disabled="true"
                class="disabled-field"
              >
                <a-select-option 
                  v-for="deviceModel in deviceModelOptionsForEdit" 
                  :key="deviceModel.value" 
                  :value="deviceModel.value"
                >
                  {{ deviceModel.label }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="生产批次" name="productionBatch" required>
              <a-date-picker
                v-model:value="editBatchForm.productionBatch"
                placeholder="请选择生产批次"
                style="width: 100%"
                allowClear
                format="YYYY-MM-DD"
                valueFormat="YYYY-MM-DD"
                @change="handleEditProductionBatchDateChange"
                :disabled="true"
                class="disabled-field"
              />
            </a-form-item>

            <a-form-item label="生产厂家" name="manufacturer" required>
              <a-input 
                v-model:value="editBatchForm.manufacturer" 
                placeholder="请输入生产厂家"
                @blur="handleManufacturerBlur"
                :disabled="true"
                class="disabled-field"
              />
            </a-form-item>

            <a-form-item label="烧录固件" name="burnFirmware" required>
              <a-select 
                v-model:value="editBatchForm.burnFirmware" 
                placeholder="请选择烧录固件"
                :disabled="true"
                style="width: 100%"
                class="disabled-field"
              >
                <a-select-option 
                  v-for="firmware in firmwareOptionsForEdit" 
                  :key="firmware.value" 
                  :value="firmware.label"
                >
                {{ firmware.label }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="单价" name="unitPrice" required>
              <a-input-number 
                v-model:value="editBatchForm.unitPrice" 
                placeholder="请输入" 
                style="width: 100%"
                :min="0"
                :precision="2"
                suffix="元"
              />
            </a-form-item>

            <a-form-item label="数量" name="quantity" required>
              <a-input-number 
                v-model:value="editBatchForm.quantity" 
                placeholder="请输入" 
                style="width: 100%"
                :min="1"
                :precision="0"
                suffix="个"
              />
            </a-form-item>
          </a-form>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showEditBatchModal = false">取消</button>
          <button class="btn btn-primary" @click="() => { console.log('Edit confirm button clicked!'); handleEditBatchModalConfirm(); }">确定</button>
        </div>
      </div>
    </div>

    <!-- 上传BOM Modal -->
    <div v-if="showUploadBomModal" class="modal-overlay" @click="handleUploadBomModalCancel">
      <div class="modal-content upload-modal" @click.stop>
        <div class="modal-header">
          <h3>上传BOM</h3>
          <button class="close-button" @click="handleUploadBomModalCancel">×</button>
        </div>
        
        <div class="modal-body">
          <div class="upload-area" @click="triggerFileInput" @drop="handleFileDrop" @dragover.prevent @dragenter.prevent>
            <div class="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#1890ff"/>
                <path d="M14 2V8H20" fill="#1890ff"/>
                <path d="M16 13H8V11H16V13Z" fill="white"/>
                <path d="M16 17H8V15H16V17Z" fill="white"/>
                <path d="M10 9H8V7H10V9Z" fill="white"/>
              </svg>
            </div>
            <div class="upload-text">
              <p>点击或拖拽文件到此区域</p>
              <p class="upload-hint">支持文件格式: xls, xlsx</p>
            </div>
            <input 
              ref="fileInput" 
              type="file" 
              accept=".xls,.xlsx" 
              style="display: none;" 
              @change="handleFileSelect"
            />
          </div>

          <div v-if="uploadedFile" class="file-status">
            <div class="file-info">
              <span class="file-name">{{ uploadedFile.name }}</span>
              <button class="delete-btn" @click="removeFile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#ff4d4f"/>
                </svg>
              </button>
            </div>
            <!-- <div class="progress-container">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
              </div>
              <span class="progress-text">{{ uploadProgress }}%</span>
            </div> -->
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="handleUploadBomModalCancel">取消</button>
          <button class="btn btn-primary" @click="handleUploadConfirm" :disabled="!uploadedFile">确定</button>
        </div>
      </div>
    </div>

  </a-config-provider>
</template>
<script lang="ts" setup>
import type { ColumnsType } from 'ant-design-vue/es/table';
import { ref, computed, onMounted, nextTick, h, watch } from 'vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme, message } from 'ant-design-vue';
import { ReloadOutlined, ColumnHeightOutlined ,SettingOutlined, SearchOutlined} from '@ant-design/icons-vue';
import draggable from 'vuedraggable';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { constructApiUrl } from '@/utils/api';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Get current username from auth store
const currentUsername = computed(() => {
  return authStore.user?.name || authStore.user?.username || '管理员';
});

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '', // Override the '页' suffix for quick jumper
  },
}));

interface DataItem {
  id?: number;
  key?: number;
  productionDeviceId: string; // 生产设备ID
  deviceModel: string; // 设备型号
  productionBatch: string; // 生产批次
  manufacturer: string; // 生产厂家
  firmwareVersion: string; // 固件版本
  burnFirmware: string; // 烧录固件
  unitPrice: number; // 单价 (元)
  quantity: number; // 数量 (个)
  totalPrice: number; // 总价 (元)
  updater?: string; // 更新人
  creator?: string; // 创建人
  createTime?: string; // 创建时间
  updateTime?: string; // 更新时间
}

// Define column configuration separately from the table columns
interface ColumnConfig {
  key: string;
  title: string;
  dataIndex: string;
  width: number;
  fixed?: 'left' | 'right' | boolean;
  sorter?: (a: any, b: any) => number;
  sortDirections?: ('ascend' | 'descend')[];
  sortOrder?: 'ascend' | 'descend';
  defaultSortOrder?: 'ascend' | 'descend';
  customRender?: ({ text, record, index }: { text?: any; record?: any; index?: number }) => any;
  customCell?: (record: any) => { children: any; props: any };
  className?: string;
}

const columnConfigs: ColumnConfig[] = [
  { key: 'rowIndex', title: '序号', dataIndex: 'rowIndex', width: 60, fixed: 'left', customRender: ({ index }) => (currentPage.value - 1) * pageSize.value + (index || 0) + 1 },
  { key: 'productionDeviceId_1', title: '生成批次ID', dataIndex: 'productionDeviceId', width: 150, sorter: (a, b) => a.productionDeviceId.localeCompare(b.productionDeviceId), sortDirections: ['ascend', 'descend'] },
  { key: 'deviceModel_2', title: '设备型号', dataIndex: 'deviceModel', width: 120, sorter: (a, b) => a.deviceModel.localeCompare(b.deviceModel), sortDirections: ['ascend', 'descend'] },
  { key: 'productionBatch_3', title: '生产批次', dataIndex: 'productionBatch', width: 120, sorter: (a, b) => new Date(a.productionBatch).getTime() - new Date(b.productionBatch).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'manufacturer_4', title: '生产厂家', dataIndex: 'manufacturer', width: 200, sorter: (a, b) => a.manufacturer.localeCompare(b.manufacturer), sortDirections: ['ascend', 'descend'] },
  { key: 'firmwareVersion_5', title: '固件版本', dataIndex: 'firmwareVersion', width: 150, sorter: (a, b) => a.firmwareVersion.localeCompare(b.firmwareVersion), sortDirections: ['ascend', 'descend'] },
  { key: 'unitPrice_6', title: '单价 (元)', dataIndex: 'unitPrice', width: 120, sorter: (a, b) => a.unitPrice - b.unitPrice, sortDirections: ['ascend', 'descend'] },
  { key: 'quantity_7', title: '数量 (个)', dataIndex: 'quantity', width: 120, sorter: (a, b) => a.quantity - b.quantity, sortDirections: ['ascend', 'descend'] },
  { key: 'totalPrice_8', title: '总价 (元)', dataIndex: 'totalPrice', width: 120, sorter: (a, b) => a.totalPrice - b.totalPrice, sortDirections: ['ascend', 'descend'] },
  { key: 'updater_9', title: '更新人', dataIndex: 'creator', width: 120, sorter: (a, b) => (a.creator || '').localeCompare(b.creator || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'createTime_10', title: '创建时间', dataIndex: 'createTime', width: 180, sorter: (a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'updateTime_11', title: '更新时间', dataIndex: 'updateTime', width: 180, sorter: (a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'operation_12', title: '操作', dataIndex: '', width: 330, fixed: 'right' },
];

// Store column order and visibility separately
const columnOrder = ref<string[]>(columnConfigs.map(config => config.key));
const selectedColumnKeys = ref<string[]>(columnConfigs.map(config => config.key));

// Create columns from configs
const createColumnsFromConfigs = (configs: ColumnConfig[]): ColumnsType => {
  return configs.map(config => ({
    title: config.title,
    dataIndex: config.dataIndex,
    key: config.key,
    width: config.width,
    fixed: config.fixed,
    sorter: config.sorter,
    sortDirections: config.sortDirections,
    sortOrder: undefined, // No default sort order - we use plain JavaScript for default sorting
        customRender: config.customRender,
    customCell: !config.customRender ? (record: any) => {
      // Handle hyperlinks for specific columns
      if (config.key === 'deviceModel_2') {
        return {
          children: h('a', {
          style: { cursor: 'pointer' },
          onClick: () => {
              router.push({ name: 'device-type', query: { search: record.deviceModel } }).catch(() => {
                message.warning(`未找到设备型号 "${record.deviceModel}" 的相关信息`);
              });
            }
          }, record.deviceModel || '-'),
          props: {}
        };
      }
      if (config.key === 'updater_9') {
        // Special handling for 更新人 column - show creator or fallback
        const creatorValue = record.creator;
        return {
          children: creatorValue && creatorValue !== '' ? creatorValue : '未设置',
          props: {}
        };
      }
      // Default rendering for other columns
      return {
        children: record[config.dataIndex] === undefined || record[config.dataIndex] === null || record[config.dataIndex] === '' ? '-' : record[config.dataIndex],
        props: {}
      };
    } : undefined,
    className: config.className,
  })) as ColumnsType;
};

// Computed property for visible columns
const columns = computed<ColumnsType>(() => {
  // Get visible configs based on selected keys and order
  const visibleConfigs = columnOrder.value
    .filter(key => selectedColumnKeys.value.includes(key))
    .map(key => columnConfigs.find(config => config.key === key))
    .filter(Boolean) as ColumnConfig[];

  // Create columns from visible configs
  const visibleColumns = createColumnsFromConfigs(visibleConfigs);

  // Sort columns: fixed left, then unfixed, then fixed right
  return visibleColumns.sort((a, b) => {
    const fixedOrder = { 'left': 1, undefined: 2, 'right': 3 };
    const aFixed = fixedOrder[a.fixed as keyof typeof fixedOrder] || 2;
    const bFixed = fixedOrder[b.fixed as keyof typeof fixedOrder] || 2;
    return aFixed - bFixed;
  });
});

// Replace static data with reactive data
const rawData = ref<DataItem[]>([]);
const loading = ref(false);
const total = ref(0); // New total for pagination

// API functions
const fetchDeviceProduction = async () => {
  try {
    loading.value = true;
    console.log('Fetching device production with page:', currentPage.value, 'pageSize:', pageSize.value);
    
    const response = await axios.get(constructApiUrl('device-production'), {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value
      }
    });
    
    if (response.data && response.data.data) {
      // Server-side pagination response (single page)
      console.log('Raw API response data:', response.data.data);
      rawData.value = response.data.data.map((item: any, index: number) => {
        console.log(`Item ${index}:`, item);
        return {
        ...item,
        key: index + 1
        };
      });

      // Apply plain JavaScript descending sort by updateTime
      console.log('Before sorting - First few updateTime values:', rawData.value.slice(0, 3).map(item => item.updateTime));
      rawData.value.sort((a, b) => {
        const timeA = a.updateTime ? new Date(a.updateTime).getTime() : 0;
        const timeB = b.updateTime ? new Date(b.updateTime).getTime() : 0;
        return timeB - timeA; // Descending order (newest first)
      });
      console.log('After sorting - First few updateTime values:', rawData.value.slice(0, 3).map(item => item.updateTime));
      
      // Update pagination info from server
      if (response.data.pagination) {
        currentPage.value = response.data.pagination.current;
        pageSize.value = response.data.pagination.pageSize;
        total.value = response.data.pagination.total;
        
        console.log('Updated pagination - current:', currentPage.value, 'pageSize:', pageSize.value, 'total:', total.value);
      }
    } else {
      // Fallback to static data if API fails
      const fallbackData: DataItem[] = [
        { key: 1, productionDeviceId: 'hjhwrn632q2f', deviceModel: 'HWZ001', productionBatch: '2025-06-30', manufacturer: '第一天德科技有限公司', firmwareVersion: '2001 V 1.0.0', burnFirmware: '2001 V 1.0.0', unitPrice: 86.75, quantity: 500, totalPrice: 43375, updater: '张三', creator: '张三', createTime: '2025-06-30 10:00:00', updateTime: '2025-06-30 10:00:00' },
        { key: 2, productionDeviceId: 'hjhwrn632q2f', deviceModel: 'HWZ002', productionBatch: '2025-07-01', manufacturer: '深圳市华为技术有限公司', firmwareVersion: '2001 V 1.1.0', burnFirmware: '2001 V 1.1.0', unitPrice: 87.75, quantity: 550, totalPrice: 48262.5, updater: '李四', creator: '李四', createTime: '2025-07-01 11:00:00', updateTime: '2025-07-01 11:00:00' },
        { key: 3, productionDeviceId: 'hjhwrn632q2f', deviceModel: 'HWZ003', productionBatch: '2025-07-02', manufacturer: '深圳市中兴通讯股份有限公司', firmwareVersion: '2001 V 1.2.0', burnFirmware: '2001 V 1.2.0', unitPrice: 88.75, quantity: 600, totalPrice: 53250, updater: '王五', creator: '王五', createTime: '2025-07-02 12:00:00', updateTime: '2025-07-02 12:00:00' },
        { key: 4, productionDeviceId: 'hjhwrn632q2f', deviceModel: 'HWZ004', productionBatch: '2025-07-03', manufacturer: '深圳市大疆创新科技有限公司', firmwareVersion: '2001 V 2.0.0', burnFirmware: '2001 V 2.0.0', unitPrice: 89.75, quantity: 650, totalPrice: 58337.5, updater: '赵六', creator: '赵六', createTime: '2025-07-03 13:00:00', updateTime: '2025-07-03 13:00:00' },
      ];
      rawData.value = fallbackData;
      total.value = fallbackData.length;
      
      // Apply plain JavaScript descending sort by updateTime for fallback data
      rawData.value.sort((a, b) => {
        const timeA = a.updateTime ? new Date(a.updateTime).getTime() : 0;
        const timeB = b.updateTime ? new Date(b.updateTime).getTime() : 0;
        return timeB - timeA; // Descending order (newest first)
      });
    }
  } catch (error) {
    console.error('Error fetching device production:', error);
    // Fallback to static data if API fails
    const fallbackData: DataItem[] = [
      { key: 1, productionDeviceId: 'hjhwrn632q2f', deviceModel: 'HWZ001', productionBatch: '2025-06-30', manufacturer: '第一天德科技有限公司', firmwareVersion: '2001 V 1.0.0', burnFirmware: '2001 V 1.0.0', unitPrice: 86.75, quantity: 500, totalPrice: 43375, updater: '张三', creator: '张三', createTime: '2025-06-30 10:00:00', updateTime: '2025-06-30 10:00:00' },
      { key: 2, productionDeviceId: 'hjhwrn632q2f', deviceModel: 'HWZ002', productionBatch: '2025-07-01', manufacturer: '深圳市华为技术有限公司', firmwareVersion: '2001 V 1.1.0', burnFirmware: '2001 V 1.1.0', unitPrice: 87.75, quantity: 550, totalPrice: 48262.5, updater: '李四', creator: '李四', createTime: '2025-07-01 11:00:00', updateTime: '2025-07-01 11:00:00' },
      { key: 3, productionDeviceId: 'hjhwrn632q2f', deviceModel: 'HWZ003', productionBatch: '2025-07-02', manufacturer: '深圳市中兴通讯股份有限公司', firmwareVersion: '2001 V 1.2.0', burnFirmware: '2001 V 1.2.0', unitPrice: 88.75, quantity: 600, totalPrice: 53250, updater: '王五', creator: '王五', createTime: '2025-07-02 12:00:00', updateTime: '2025-07-02 12:00:00' },
      { key: 4, productionDeviceId: 'hjhwrn632q2f', deviceModel: 'HWZ004', productionBatch: '2025-07-03', manufacturer: '深圳市大疆创新科技有限公司', firmwareVersion: '2001 V 2.0.0', burnFirmware: '2001 V 2.0.0', unitPrice: 89.75, quantity: 650, totalPrice: 58337.5, updater: '赵六', creator: '赵六', createTime: '2025-07-03 13:00:00', updateTime: '2025-07-03 13:00:00' },
    ];
    rawData.value = fallbackData;
    total.value = fallbackData.length;
    
    // Apply plain JavaScript descending sort by updateTime for error fallback data
    rawData.value.sort((a, b) => {
      const timeA = a.updateTime ? new Date(a.updateTime).getTime() : 0;
      const timeB = b.updateTime ? new Date(b.updateTime).getTime() : 0;
      return timeB - timeA; // Descending order (newest first)
    });
  } finally {
    loading.value = false;
  }
};

const createDeviceProduction = async (deviceProductionData: Omit<DataItem, 'key' | 'id' | 'totalPrice'>) => {
  try {
    const payload = {
      production_device_id: deviceProductionData.productionDeviceId,
      device_model: deviceProductionData.deviceModel,
      production_batch: deviceProductionData.productionBatch,
      manufacturer: deviceProductionData.manufacturer,
      firmware_version: deviceProductionData.firmwareVersion,
      burn_firmware: deviceProductionData.burnFirmware,
      unit_price: typeof deviceProductionData.unitPrice === 'number' ? deviceProductionData.unitPrice : parseFloat(String(deviceProductionData.unitPrice || 0)),
      quantity: typeof deviceProductionData.quantity === 'number' ? deviceProductionData.quantity : parseInt(String(deviceProductionData.quantity || 0), 10),
      updater: deviceProductionData.updater,
      creator: deviceProductionData.creator
    };
    console.log('POST /device-production payload:', payload);
    const response = await axios.post(constructApiUrl('/device-production'), payload);
    await fetchDeviceProduction(); // Refresh data
    return response.data;
  } catch (error) {
    console.error('Error creating device production:', error);
    throw error;
  }
};

const updateDeviceProduction = async (id: number, deviceProductionData: Partial<DataItem>) => {
  try {
    console.log('=== updateDeviceProduction called ===');
    console.log('ID:', id);
    console.log('Device production data:', deviceProductionData);
    
    const payload = {
      production_device_id: deviceProductionData.productionDeviceId,
      device_model: deviceProductionData.deviceModel,
      production_batch: deviceProductionData.productionBatch,
      manufacturer: deviceProductionData.manufacturer,
      firmware_version: deviceProductionData.firmwareVersion,
      burn_firmware: deviceProductionData.burnFirmware,
      unit_price: typeof deviceProductionData.unitPrice === 'number' ? deviceProductionData.unitPrice : (deviceProductionData.unitPrice != null ? parseFloat(String(deviceProductionData.unitPrice)) : undefined),
      quantity: typeof deviceProductionData.quantity === 'number' ? deviceProductionData.quantity : (deviceProductionData.quantity != null ? parseInt(String(deviceProductionData.quantity), 10) : undefined),
      updater: deviceProductionData.updater,
      creator: deviceProductionData.creator
    };
    
    console.log('PUT /device-production payload:', payload);
    console.log('Making PUT request to:', constructApiUrl(`/device-production/${id}`));
    
    const response = await axios.put(constructApiUrl(`/device-production/${id}`), payload);
    console.log('PUT response received:', response);
    console.log('Response data:', response.data);
    
    // Don't call fetchDeviceProduction here as it's called by the caller
    return response.data;
  } catch (error) {
    console.error('=== Error in updateDeviceProduction ===');
    console.error('Error details:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const errorResponse = error as any;
      console.error('Error response status:', errorResponse.response?.status);
      console.error('Error response data:', errorResponse.response?.data);
    }
    throw error;
  }
};

const deleteDeviceProduction = async (id: number) => {
  try {
    await axios.delete(constructApiUrl(`device-production/${id}`));
    await fetchDeviceProduction(); // Refresh data
  } catch (error) {
    console.error('Error deleting device production:', error);
    throw error;
  }
};

const deviceModelValue = ref({ key: 'all', label: '全部', value: 'all' });

const deviceModelOptions = computed(() => {
  const uniqueDeviceModels = Array.from(new Set(rawData.value.map(item => item.deviceModel)));
  const options = uniqueDeviceModels.map(model => ({
    key: model,
    value: model,
    label: model,
  }));
  return [
    { key: 'all', value: 'all', label: '全部' },
    ...options
  ];
});

const handleDeviceModelChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    deviceModelValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    deviceModelValue.value = val;
  }
};

const manufacturerValue = ref({ key: 'all', label: '全部', value: 'all' });

const manufacturerOptions = computed(() => {
  const uniqueManufacturers = Array.from(new Set(rawData.value.map(item => item.manufacturer)));
  const options = uniqueManufacturers.map(manufacturer => ({
    key: manufacturer,
    value: manufacturer,
    label: manufacturer,
  }));
  return [
    { key: 'all', value: 'all', label: '全部' },
    ...options
  ];
});

const handleManufacturerChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    manufacturerValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    manufacturerValue.value = val;
  }
};

const currentPage = ref(1);
const pageSize = ref(10);

// No default sorterInfo - we'll use plain JavaScript for default sorting
const sorterInfo = ref<any>(null);

const pagination = computed(() => ({
  total: total.value, 
  current: currentPage.value,
  pageSize: pageSize.value,
  showSizeChanger: true, 
  pageSizeOptions: ['10', '20', '50'], 
  showTotal: (total: number, range: [number, number]) => `第${range[0]}-${range[1]}条/共${total}条`, 
  showQuickJumper: { goButton: '页' }, 
  onShowSizeChange: (current: number, size: number) => {
    console.log('onShowSizeChange', current, size);
    currentPage.value = current;
    pageSize.value = size;
    fetchDeviceProduction(); // Fetch fresh data when page size changes
  },
  onChange: (page: number, size: number) => {
    console.log('onChange', page, size);
    currentPage.value = page;
    pageSize.value = size;
    fetchDeviceProduction(); // Fetch fresh data when page changes
  },
}));

const onRefresh = () => {
  console.log('Refresh button clicked!');
  searchInputValue.value = '';
  currentPage.value = 1;
  resetColumns(); // Reset column order and visibility

  // Clear sorterInfo to use plain JavaScript default sorting
  sorterInfo.value = null;

  // Reset all selector values to '全部'
  deviceModelValue.value = { key: 'all', label: '全部', value: 'all' };
  manufacturerValue.value = { key: 'all', label: '全部', value: 'all' };

  fetchDeviceProduction(); // Fetch fresh data from API
};

const filteredData = computed(() => {
  let dataToFilter = rawData.value;
  console.log('filteredData computed - rawData length:', rawData.value.length);
  console.log('filteredData computed - first few updateTime values:', rawData.value.slice(0, 3).map(item => item.updateTime));

  if (searchInputValue.value) {
    const searchTerm = searchInputValue.value.toLowerCase();
    dataToFilter = dataToFilter.filter((item: DataItem) => {
      return Object.values(item).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(searchTerm)
      );
    });
  }

  // Filter by Device Model
  if (
    deviceModelValue.value &&
    deviceModelValue.value.value !== 'all' &&
    deviceModelValue.value.value !== ''
  ) {
    const selectedDeviceModel = deviceModelValue.value.value;
    dataToFilter = dataToFilter.filter(item => item.deviceModel === selectedDeviceModel);
  }

  // Filter by Manufacturer
  if (
    manufacturerValue.value &&
    manufacturerValue.value.value !== 'all' &&
    manufacturerValue.value.value !== ''
  ) {
    const selectedManufacturer = manufacturerValue.value.value;
    dataToFilter = dataToFilter.filter(item => item.manufacturer === selectedManufacturer);
  }

  // Default sorting: Always use plain JavaScript for updateTime descending
  // Only use Ant Design sorter when user explicitly interacts with it
  if (sorterInfo.value && sorterInfo.value.order && sorterInfo.value.columnKey === 'updateTime_11') {
    // User has explicitly clicked the updateTime column header
    const { order } = sorterInfo.value;
    console.log('User clicked updateTime column, applying Ant Design sorter with order:', order);
    
    if (order === 'ascend') {
      // User wants ascending (oldest first)
      dataToFilter.sort((a, b) => {
        const timeA = a.updateTime ? new Date(a.updateTime).getTime() : 0;
        const timeB = b.updateTime ? new Date(b.updateTime).getTime() : 0;
        return timeA - timeB; // Ascending order (oldest first)
      });
    } else {
      // User wants descending (newest first) - same as default
      dataToFilter.sort((a, b) => {
        const timeA = a.updateTime ? new Date(a.updateTime).getTime() : 0;
        const timeB = b.updateTime ? new Date(b.updateTime).getTime() : 0;
        return timeB - timeA; // Descending order (newest first)
      });
    }
  } else {
    // Default behavior: Use plain JavaScript for updateTime descending sort
    console.log('Using default plain JavaScript descending sort for updateTime');
    dataToFilter.sort((a, b) => {
      const timeA = a.updateTime ? new Date(a.updateTime).getTime() : 0;
      const timeB = b.updateTime ? new Date(b.updateTime).getTime() : 0;
      return timeB - timeA; // Always descending for updateTime by default
    });
  }

  console.log('filteredData final - first few updateTime values:', dataToFilter.slice(0, 3).map(item => item.updateTime));
  return dataToFilter;
});

const searchInputValue = ref('');

const handleTableChange = (
  paginationData: any,
  filters: any,
  sorter: any,
) => {
  console.log('Table change:', paginationData, filters, sorter);
  const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;

  if (currentSorter && currentSorter.order) {
    // User has explicitly clicked a column header
    sorterInfo.value = {
      columnKey: currentSorter.columnKey,
      order: currentSorter.order,
    };
    console.log('User clicked column header, setting sorterInfo:', sorterInfo.value);
  } else {
    // When sorting is cleared, revert to plain JavaScript default sorting
    sorterInfo.value = null;
    console.log('Sorting cleared, reverting to plain JavaScript default sorting');
  }
  
  // When table changes, we should probably go back to the first page
  currentPage.value = 1;
};

const onSettingClick = () => {
  console.log('Setting clicked');
};

const tableSize = ref('middle'); // Default table size

const handleMenuClick = ({ key }: { key: string }) => {
  tableSize.value = key;
};

const resetColumns = () => {
  selectedColumnKeys.value = columnConfigs.map(config => config.key);
  columnOrder.value = columnConfigs.map(config => config.key);
};

const onColumnOrderChange = (event: { newIndex: number; oldIndex: number }) => {
  const { newIndex, oldIndex } = event;
  const movedColumn = columnOrder.value[oldIndex];
  const newOrder = [...columnOrder.value];
  newOrder.splice(oldIndex, 1);
  newOrder.splice(newIndex, 0, movedColumn);
  columnOrder.value = newOrder;

  // The selectedColumnKeys should not be altered here, as it maintains visibility state.
  // Its order is implicitly handled by the 'columns' computed property based on columnOrder.
};

const handleColumnVisibilityChange = (key: string, checked: boolean) => {
  if (checked) {
    if (!selectedColumnKeys.value.includes(key)) {
      selectedColumnKeys.value.push(key);
    }
  } else {
    selectedColumnKeys.value = selectedColumnKeys.value.filter(k => k !== key);
  }
};

// Create batch modal state variables
const showCreateBatchModal = ref(false);
const createBatchForm = ref({
  deviceModel: '',
  productionBatch: '' as string | null,
  manufacturer: '',
  burnFirmware: '',
  unitPrice: null as number | null,
  quantity: null as number | null
});

// Reactive references for form options
const deviceModelsFromAPI = ref<any[]>([]);
const firmwareVersionsFromAPI = ref<any[]>([]);

// Computed properties for form options
const deviceModelOptionsForForm = computed(() => {
  // Use API data if available, otherwise fall back to existing data
  if (deviceModelsFromAPI.value.length > 0) {
    return deviceModelsFromAPI.value;
  }
  
  // Fallback to existing data
  const uniqueDeviceModels = Array.from(new Set(rawData.value.map(item => item.deviceModel)));
  return uniqueDeviceModels.map(model => ({
    key: model,
    value: model,
    label: model,
  }));
});

// Computed property for device model options in the edit form
const deviceModelOptionsForEdit = computed(() => {
  // Use API data if available, otherwise fall back to existing data
  if (deviceModelsFromAPI.value.length > 0) {
    return deviceModelsFromAPI.value;
  }
  
  // Fallback to existing data
  const uniqueDeviceModels = Array.from(new Set(rawData.value.map(item => item.deviceModel)));
  return uniqueDeviceModels.map(model => ({
    key: model,
    value: model,
    label: model,
  }));
});

// Computed property for firmware options in the edit form
const firmwareOptionsForEdit = computed(() => {
  if (!editBatchForm.value.deviceModel || !editBatchForm.value.manufacturer) {
    return [];
  }
  
  // Use API data if available for the selected device model
  if (firmwareVersionsFromAPI.value.length > 0) {
    return firmwareVersionsFromAPI.value;
  }
  
  // Fallback to existing data - filter by device model and manufacturer
  const firmwareVersions = rawData.value
    .filter(item => 
      item.deviceModel === editBatchForm.value.deviceModel && 
      item.manufacturer === editBatchForm.value.manufacturer
    )
    .map(item => item.firmwareVersion)
    .filter((value, index, self) => self.indexOf(value) === index && value); // Remove duplicates and empty values
    
  return firmwareVersions.map(version => ({
    key: version,
    value: version,
    label: version,
  }));
});

// Computed property for firmware options in the create form
const firmwareOptionsForForm = computed(() => {
  if (!createBatchForm.value.deviceModel) {
    return [];
  }
  
  // Use API data if available for the selected device model
  if (firmwareVersionsFromAPI.value.length > 0) {
    return firmwareVersionsFromAPI.value;
  }
  
  // Fallback to existing data
  const firmwareVersions = rawData.value
    .filter(item => item.deviceModel === createBatchForm.value.deviceModel)
    .map(item => item.firmwareVersion)
    .filter((value, index, self) => self.indexOf(value) === index && value); // Remove duplicates and empty values
    
  return firmwareVersions.map(version => ({
    key: version,
    value: version,
    label: version,
  }));
});

// Computed property for production batch options in the edit form
const productionBatchOptionsForEdit = computed(() => {
  if (!editBatchForm.value.deviceModel) {
    return [];
  }
  
  // Use API data if available for the selected device model
  if (rawData.value.length > 0) {
    const batches = rawData.value
      .filter(item => item.deviceModel === editBatchForm.value.deviceModel)
      .map(item => item.productionBatch)
      .filter((value, index, self) => self.indexOf(value) === index && value); // Remove duplicates and empty values
    
    return batches.map(batch => ({
      key: batch,
      value: batch,
      label: batch,
    }));
  }
  
  // Fallback to existing data
  const uniqueBatches = Array.from(new Set(rawData.value.map(item => item.productionBatch)));
  return uniqueBatches.map(batch => ({
    key: batch,
    value: batch,
    label: batch,
  }));
});

// Computed property for manufacturer options in the edit form
const manufacturerOptionsForEdit = computed(() => {
  if (!editBatchForm.value.deviceModel || !editBatchForm.value.productionBatch) {
    return [];
  }
  
  // Get manufacturers for the selected device model and production batch
  if (rawData.value.length > 0) {
    const manufacturers = rawData.value
      .filter(item => 
        item.deviceModel === editBatchForm.value.deviceModel && 
        item.productionBatch === editBatchForm.value.productionBatch
      )
      .map(item => item.manufacturer)
      .filter((value, index, self) => self.indexOf(value) === index && value); // Remove duplicates and empty values
    
    return manufacturers.map(manufacturer => ({
      key: manufacturer,
      value: manufacturer,
      label: manufacturer,
    }));
  }
  
  return [];
});

// Function to fetch device models from API (aggregate all pages)
const fetchDeviceModels = async () => {
  try {
    // First page
    const first = await axios.get(constructApiUrl('device-type'), { params: { page: 1, pageSize: 10 } });
    const pagination = first.data?.pagination;
    let combined = first.data?.data || [];
    if (pagination && pagination.total && pagination.pageSize) {
      const totalPages = Math.ceil(pagination.total / pagination.pageSize);
      if (totalPages > 1) {
        const promises: Promise<any>[] = [];
        for (let p = 2; p <= totalPages; p++) {
          promises.push(axios.get(constructApiUrl('device-type'), { params: { page: p, pageSize: pagination.pageSize } }));
        }
        const rest = await Promise.all(promises);
        rest.forEach(r => {
          if (r.data?.data) combined = combined.concat(r.data.data);
        });
      }
    }
    // Map unique names as options
    const names = combined
      .map((item: any) => item.deviceModelName || item.deviceModelId)
      .filter((v: any) => !!v);
    const unique = Array.from(new Set(names));
    return unique.map((name: string) => ({ key: name, value: name, label: name }));
  } catch (error) {
    console.error('Error fetching device models:', error);
  }
  return [];
};

// Function to fetch firmware versions for a specific device model
const fetchFirmwareVersions = async (deviceModel: string) => {
  try {
    const url = constructApiUrl(`firmware/device/${encodeURIComponent(deviceModel)}`);
    const response = await axios.get(url);
    const list = Array.isArray(response.data) ? response.data : (response.data?.data || []);
    const versions = list
      .map((item: any) => item.versionNumber)
      .filter((v: any) => !!v);
    const unique = Array.from(new Set(versions));
    return unique.map((v: string) => ({ key: v, value: v, label: v }));
  } catch (error) {
    console.error('Error fetching firmware versions:', error);
  }
  return [];
};

// Form handlers
const handleDeviceModelChangeInForm = async (value: string) => {
  createBatchForm.value.deviceModel = value;
  // Clear firmware selection when device model changes
  createBatchForm.value.burnFirmware = '';
  
  // Fetch firmware versions for the selected device model
  if (value) {
    try {
      const firmwareVersions = await fetchFirmwareVersions(value);
      firmwareVersionsFromAPI.value = firmwareVersions;
    } catch (error) {
      console.error('Error fetching firmware versions:', error);
      firmwareVersionsFromAPI.value = [];
    }
  } else {
    firmwareVersionsFromAPI.value = [];
  }
};

// Handler for device model change in edit form
const handleEditDeviceModelChange = async (value: string) => {
  editBatchForm.value.deviceModel = value;
  // Clear firmware selection and production batch when device model changes
  editBatchForm.value.burnFirmware = '';
  editBatchForm.value.productionBatch = '';
  
  // Fetch firmware versions for the selected device model
  if (value) {
    try {
      const firmwareVersions = await fetchFirmwareVersions(value);
      firmwareVersionsFromAPI.value = firmwareVersions;
    } catch (error) {
      console.error('Error fetching firmware versions for edit:', error);
      firmwareVersionsFromAPI.value = [];
    }
  } else {
    firmwareVersionsFromAPI.value = [];
  }
};

// Handler for production batch change in edit form (DatePicker)
const handleEditProductionBatchDateChange = (_date: any, dateString: string) => {
  editBatchForm.value.productionBatch = dateString || '';
  // Clear manufacturer when production batch changes
  editBatchForm.value.manufacturer = '';
};

// Handler for manufacturer change in edit form (no longer needed since we use input)
// const handleEditManufacturerChange = (event: Event) => {
//   const target = event.target as HTMLSelectElement;
//   const value = target.value;
//   editBatchForm.value.manufacturer = value;
//   // Clear firmware when manufacturer changes
//   editBatchForm.value.burnFirmware = '';
// };

const handleManufacturerBlur = () => {
  // This function can be used to save manufacturer as an option for future selection
  // For now, it's just a placeholder
  console.log('Manufacturer blur:', createBatchForm.value.manufacturer);
};

// Update the handleCreateDevice function to fetch device models when modal opens
const handleCreateDevice = async () => {
  console.log('Create device button clicked');
  showCreateBatchModal.value = true;
  
  // Fetch device models from API when modal opens
  try {
    const deviceModels = await fetchDeviceModels();
    deviceModelsFromAPI.value = deviceModels;
    
    // Also ensure we have the latest table data for production batch options
    await fetchDeviceProduction();
  } catch (error) {
    console.error('Error fetching data for create modal:', error);
    deviceModelsFromAPI.value = [];
  }
};

const createBatchFormRules = {
  deviceModel: [{ required: true, message: '请选择设备型号', trigger: 'change' }],
  productionBatch: [{ required: true, message: '请选择生产批次', trigger: 'change' }],
  manufacturer: [{ required: true, message: '请输入生产厂家', trigger: 'blur' }],
  burnFirmware: [{ required: true, message: '请选择烧录固件', trigger: 'change' }],
  unitPrice: [{ required: true, message: '请输入单价', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }]
};

const createBatchFormRef = ref();

// Create batch modal handlers
const handleCreateBatchModalCancel = () => {
  showCreateBatchModal.value = false;
  createBatchFormRef.value?.resetFields();
  // Reset form data
  createBatchForm.value = {
    deviceModel: '',
    productionBatch: '' as string | null,
    manufacturer: '',
    burnFirmware: '',
    unitPrice: null as number | null,
    quantity: null as number | null
  };
};

const handleCreateBatchModalConfirm = async () => {
  try {
    await createBatchFormRef.value?.validate();
    
    // productionBatch comes from a date picker with valueFormat, so it's a string (YYYY-MM-DD)
    const productionBatch = createBatchForm.value.productionBatch;
    
    if (!productionBatch) {
      message.error('请选择生产批次');
      return;
    }
    
    // Check for unique constraint: device model + production batch + manufacturer
    const existingRecord = rawData.value.find(item => 
      item.deviceModel === createBatchForm.value.deviceModel &&
      item.productionBatch === productionBatch &&
      item.manufacturer === createBatchForm.value.manufacturer
    );
    
    if (existingRecord) {
      message.error('该设备型号、生产批次和生产厂家的组合已存在，请检查后重新输入');
      return;
    }
    
    console.log('Create batch form data:', createBatchForm.value);
    
    // Prepare data for API
    const formData = {
      productionDeviceId: 'hjhwrn632q2f',
      deviceModel: createBatchForm.value.deviceModel,
      productionBatch: productionBatch,
      manufacturer: createBatchForm.value.manufacturer,
      firmwareVersion: createBatchForm.value.burnFirmware,
      burnFirmware: createBatchForm.value.burnFirmware,
      unitPrice: Number(createBatchForm.value.unitPrice || 0),
      quantity: Number(createBatchForm.value.quantity || 0),
      updater: currentUsername.value,
      creator: currentUsername.value
    };
    
    // Send data to API
    await createDeviceProduction(formData);
    
    message.success('设备创建成功！');
    showCreateBatchModal.value = false;
    createBatchFormRef.value?.resetFields();
    
    // Reset form data
    createBatchForm.value = {
      deviceModel: '',
      productionBatch: '' as string | null,
      manufacturer: '',
      burnFirmware: '',
      unitPrice: null as number | null,
      quantity: null as number | null
    };
    
    // Refresh the data
    await fetchDeviceProduction();
    
  } catch (error: unknown) {
    console.error('Form validation failed:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const errorResponse = error as any;
      if (errorResponse.response?.data?.error) {
        message.error(errorResponse.response.data.error);
      } else if (errorResponse.message) {
        message.error(errorResponse.message);
      } else {
        message.error('创建设备失败，请重试');
      }
    } else if (error && typeof error === 'object' && 'message' in error) {
      const errorObj = error as { message: string };
      message.error(errorObj.message);
    } else {
      message.error('创建设备失败，请重试');
    }
  }
};

// Edit batch modal state variables
const showEditBatchModal = ref(false);
const editBatchForm = ref({
  deviceModel: '',
  productionBatch: '',
  manufacturer: '',
  burnFirmware: '',
  unitPrice: 0,
  quantity: 0
});
const currentEditingRecord = ref<DataItem | null>(null);

const editBatchFormRules = {
  deviceModel: [{ required: true, message: '请选择设备型号', trigger: 'change' }],
  productionBatch: [{ required: true, message: '请选择生产批次', trigger: 'change' }],
  manufacturer: [{ required: true, message: '请输入生产厂家', trigger: 'blur' }],
  burnFirmware: [{ required: true, message: '请选择烧录固件', trigger: 'change' }],
  unitPrice: [{ required: true, message: '请输入单价', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }]
};

const editBatchFormRef = ref();

// Edit batch modal handlers
const handleEditBatchModalCancel = () => {
  console.log('Cancel button clicked');
  showEditBatchModal.value = false;
  editBatchFormRef.value?.resetFields();
  // Reset form data
  editBatchForm.value = {
    deviceModel: '',
    productionBatch: '',
    manufacturer: '',
    burnFirmware: '',
    unitPrice: 0,
    quantity: 0
  };
  // Reset stored record and API data
  currentEditingRecord.value = null;
  deviceModelsFromAPI.value = [];
  firmwareVersionsFromAPI.value = [];
  console.log('Modal closed, form reset');
};

const handleEditBatchModalConfirm = async () => {
  console.log('🚀 handleEditBatchModalConfirm function called!');
  console.log('Step 1: Function entered');
  
  try {
    console.log('Step 2: Try block entered');
    console.log('=== Starting edit batch modal confirm ===');
    console.log('Current editing record:', currentEditingRecord.value);
    console.log('Edit batch form data:', editBatchForm.value);
    
    // Validate form
    console.log('Step 3: About to validate form');
    console.log('Form ref value:', editBatchFormRef.value);
    
    if (!editBatchFormRef.value) {
      console.error('ERROR: Form ref is null!');
      message.error('表单引用错误，请重试');
      return;
    }
    
    console.log('Step 4: Form ref exists, validating...');
    
    try {
      await editBatchFormRef.value.validate();
      console.log('Step 5: Form validation passed');
    } catch (validationError) {
      console.error('ERROR: Form validation failed:', validationError);
      message.error('表单验证失败，请检查输入');
      return;
    }
    
    // Get the record ID from the stored editing record
    console.log('Step 6: Checking current editing record');
    if (!currentEditingRecord.value || !currentEditingRecord.value.id) {
      console.error('ERROR: No current editing record found');
      message.error('无法找到要更新的记录');
      return;
    }
    
    const currentRecord = currentEditingRecord.value;
    console.log('Step 7: Current record found:', currentRecord);
    
    // Prepare data for API update
    console.log('Step 8: Preparing update data');
    console.log('Current username from AppTopbar:', currentUsername.value);
    const updateData = {
      productionDeviceId: currentRecord.productionDeviceId,
      deviceModel: editBatchForm.value.deviceModel,
      productionBatch: editBatchForm.value.productionBatch,
      manufacturer: editBatchForm.value.manufacturer,
      firmwareVersion: editBatchForm.value.burnFirmware,
      burnFirmware: editBatchForm.value.burnFirmware,
      unitPrice: Number(editBatchForm.value.unitPrice || 0),
      quantity: Number(editBatchForm.value.quantity || 0),
      updater: currentUsername.value,
      creator: currentUsername.value  // Always use current dynamic username for updates
    };
    
    console.log('Step 9: Update data prepared:', updateData);
    console.log('Step 9a: Creator field value:', updateData.creator);
    console.log('Step 9b: Current username source:', currentUsername.value);
    console.log('Step 10: About to call updateDeviceProduction with ID:', currentRecord.id);
    
    // Send update to API
    console.log('Step 11: Calling updateDeviceProduction...');
    const result = await updateDeviceProduction(currentRecord.id!, updateData);
    console.log('Step 12: Update API call successful:', result);
    
    console.log('Step 13: Update successful, showing success message');
    message.success('设备更新成功！');
    
    console.log('Step 14: Closing modal');
    showEditBatchModal.value = false;
    
    console.log('Step 15: Resetting form');
    editBatchFormRef.value?.resetFields();
    
    // Reset form data and stored record
    console.log('Step 16: Resetting form data');
    editBatchForm.value = {
      deviceModel: '',
      productionBatch: '',
      manufacturer: '',
      burnFirmware: '',
      unitPrice: 0,
      quantity: 0
    };
    
    console.log('Step 17: Clearing current editing record');
    currentEditingRecord.value = null;
    
    // Refresh the data
    console.log('Step 18: Refreshing device production data...');
    await fetchDeviceProduction();
    console.log('Step 19: Data refresh completed');
    console.log('✅ Edit batch modal confirm completed successfully!');
    
  } catch (error: unknown) {
    console.error('=== Edit batch modal confirm failed ===');
    console.error('Error details:', error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const errorResponse = error as any;
      console.error('Error response:', errorResponse.response);
      
      if (errorResponse.response?.data?.error) {
        message.error(errorResponse.response.data.error);
      } else if (errorResponse.response?.data?.message) {
        message.error(errorResponse.response.data.message);
      } else if (errorResponse.message) {
        message.error(errorResponse.message);
      } else {
        message.error('更新设备失败，请重试');
      }
    } else if (error && typeof error === 'object' && 'message' in error) {
      const errorObj = error as { message: string };
      message.error(errorObj.message);
    } else {
      message.error('更新设备失败，请重试');
    }
  }
};

const handleEditBatch = async (record: DataItem) => {
  console.log('Edit batch clicked for record:', record);
  
  // Store the current record being edited
  currentEditingRecord.value = record;
  
  // Pre-fill the form with data from the selected row
  editBatchForm.value = {
    deviceModel: record.deviceModel || 'HWSZ001',
    productionBatch: record.productionBatch || '2025-07-25',
    manufacturer: record.manufacturer || '深圳天德胜技术有限公司',
    burnFirmware: record.burnFirmware || 'Z001 V 1.0.0',
    unitPrice: record.unitPrice || 86.15,
    quantity: record.quantity || 500
  };
  
  console.log('Form pre-filled:', editBatchForm.value);
  
  // Fetch fresh device models when the edit modal opens
  try {
    const deviceModels = await fetchDeviceModels();
    deviceModelsFromAPI.value = deviceModels;
    
    // Also fetch firmware versions for the selected device model
    if (editBatchForm.value.deviceModel) {
      const firmwareVersions = await fetchFirmwareVersions(editBatchForm.value.deviceModel);
      firmwareVersionsFromAPI.value = firmwareVersions;
    }
    
    // Fetch production batches for the selected device model from the current table data
    // This will populate the productionBatchOptionsForEdit computed property
    await fetchDeviceProduction();
  } catch (error) {
    console.error('Error fetching data for edit:', error);
    deviceModelsFromAPI.value = [];
    firmwareVersionsFromAPI.value = [];
  }
  
  // Open the modal
  showEditBatchModal.value = true;
  console.log('Modal opened:', showEditBatchModal.value);
};

// Upload BOM modal state variables
const showUploadBomModal = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const uploadedFile = ref<File | null>(null);
const uploadProgress = ref(0);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel') {
      uploadedFile.value = file;
      uploadProgress.value = 0;
      console.log('File dropped:', file.name);
    } else {
      message.error('请选择Excel文件 (xls, xlsx)');
      uploadedFile.value = null;
    }
  }
};

const handleFileSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel') {
      uploadedFile.value = file;
      uploadProgress.value = 0;
      console.log('File selected:', file.name);
    } else {
      message.error('请选择Excel文件 (xls, xlsx)');
      uploadedFile.value = null;
    }
  }
};

const removeFile = () => {
  uploadedFile.value = null;
  uploadProgress.value = 0;
  console.log('File removed');
};

const handleUploadConfirm = async () => {
  if (!uploadedFile.value) {
    message.error('请选择要上传的文件');
    return;
  }

  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('bomFile', uploadedFile.value);
    
    if (!bomUploadRecord.value) {
      message.error('无法获取设备信息，请重新选择设备');
      return;
    }
    
    formData.append('deviceModel', bomUploadRecord.value.deviceModel || '');
    formData.append('productionBatch', bomUploadRecord.value.productionBatch || '');
    formData.append('manufacturer', bomUploadRecord.value.manufacturer || '');
    formData.append('uploader', currentUsername.value);

    // Upload file to server
    const response = await axios.post(`${API_BASE_URL}/upload-bom`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        }
      },
    });

    if (response.data.success) {
      message.success('BOM文件上传成功！');
      showUploadBomModal.value = false;
      uploadedFile.value = null;
      uploadProgress.value = 0;
      bomUploadRecord.value = null; // Clear the upload record
      
      // Refresh data to show the uploaded file
      await fetchDeviceProduction();
    } else {
      message.error(response.data.message || '上传失败');
    }
  } catch (error) {
    console.error('Error uploading BOM file:', error);
    message.error('文件上传失败，请重试');
    uploadProgress.value = 0;
  }
};

const handleUploadBom = (record: DataItem) => {
  console.log('Upload BOM clicked for record:', record);
  // Store the record specifically for BOM upload context
  bomUploadRecord.value = record;
  // Pre-fill the form with data from the selected row
  showUploadBomModal.value = true;
  // You might want to set uploadedFile.value here if you want to pre-select a file
  // For now, it will be empty until a file is dropped or selected.
};

const handleUploadBomModalCancel = () => {
  showUploadBomModal.value = false;
  uploadedFile.value = null;
  uploadProgress.value = 0;
  bomUploadRecord.value = null; // Clear the upload record
};

const handleBomCleanup = async () => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/bom-cleanup`);
    
    if (response.data.success) {
      message.success(`BOM清理完成！删除了 ${response.data.deletedCount} 个旧文件`);
      console.log('BOM cleanup result:', response.data);
    } else {
      message.error(response.data.message || 'BOM清理失败');
    }
  } catch (error) {
    console.error('Error during BOM cleanup:', error);
    message.error('BOM清理失败，请重试');
  }
};

// Store the record for BOM upload context
const bomUploadRecord = ref<DataItem | null>(null);

const handleDownloadBom = async (record: DataItem) => {
  console.log('Download BOM clicked for record:', record);
  
  try {
    // Create download URL for the BOM file
    const downloadUrl = `${API_BASE_URL}/download-bom?deviceModel=${encodeURIComponent(record.deviceModel)}&productionBatch=${encodeURIComponent(record.productionBatch)}&manufacturer=${encodeURIComponent(record.manufacturer)}`;
    
    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `BOM_${record.deviceModel}_${record.productionBatch}_${record.manufacturer}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('BOM文件下载开始');
  } catch (error) {
    console.error('Error downloading BOM file:', error);
    message.error('下载失败，请重试');
  }
};

onMounted(() => {
  selectedColumnKeys.value = columnConfigs.map(config => config.key);
  fetchDeviceProduction(); // Fetch data on component mount
  
  // Handle search parameter from URL
  if (route.query.search) {
    searchInputValue.value = route.query.search as string;
  }
});

defineExpose({
  handleTableChange, // Explicitly expose handleTableChange
});

// Handle delete record
const handleDeleteRecord = async (record: DataItem) => {
  try {
    if (record.id) {
      await deleteDeviceProduction(record.id);
    }
  } catch (error) {
    console.error('Error deleting record:', error);
  }
};

// Computed property for production batch options in the create form
const productionBatchOptionsForForm = computed(() => {
  console.log('=== Computing productionBatchOptionsForForm ===');
  console.log('Device Model:', createBatchForm.value.deviceModel);
  console.log('Raw Data Length:', rawData.value.length);
  console.log('Raw Data:', rawData.value);
  console.log('Device Models from API:', deviceModelsFromAPI.value);
  
  if (!createBatchForm.value.deviceModel) {
    console.log('❌ No device model selected, returning empty array');
    return [];
  }
  
  // Get production batches for the selected device model
  if (rawData.value.length > 0) {
    const filteredData = rawData.value.filter(item => item.deviceModel === createBatchForm.value.deviceModel);
    console.log('Filtered data for device model:', filteredData);
    
    const batches = filteredData
      .map(item => item.productionBatch)
      .filter((value, index, self) => self.indexOf(value) === index && value); // Remove duplicates and empty values
    
    console.log('✅ Found batches for device model:', batches);
    
    const options = batches.map(batch => ({
      key: batch,
      value: batch,
      label: batch,
    }));
    
    console.log('✅ Returning options:', options);
    return options;
  }
  
  console.log('❌ No raw data available, returning empty array');
  return [];
});

// Watch for changes in production batch options
watch(productionBatchOptionsForForm, (newOptions) => {
  console.log('Production batch options changed:', newOptions);
}, { immediate: true });

// Watch for modal opening to ensure data is fetched
watch(showCreateBatchModal, (isOpen) => {
  if (isOpen) {
    console.log('Create modal opened, current state:', {
      deviceModelsFromAPI: deviceModelsFromAPI.value.length,
      rawDataLength: rawData.value.length,
      createBatchForm: createBatchForm.value
    });
  }
});

// Watch for changes in createBatchForm to debug
watch(createBatchForm, (newForm) => {
  console.log('CreateBatchForm changed:', newForm);
}, { deep: true });
</script>
<style scoped>
#components-table-demo-summary tfoot th,
#components-table-demo-summary tfoot td {
  background: #fafafa;
}
[data-theme='dark'] #components-table-demo-summary tfoot th,
[data-theme='dark'] #components-table-demo-summary tfoot td {
  background: #1d1d1d;
}

/* Custom style to adjust row height and font size based on table size */
.ant-table-tbody > tr > td,
.ant-table-thead > tr > th {
  font-family: 'PingFang SC', sans-serif; /* Keep font family consistent */
  white-space: nowrap; /* Prevent text from stacking */
  text-align: left; /* Ensure left alignment for headers */
}

.ant-table-wrapper-small .ant-table-tbody > tr > td,
.ant-table-wrapper-small .ant-table-thead > tr > th {
  padding: 2px 2px; /* Very compact */
  font-size: 10px;
  line-height: 1.2;
}

.ant-table-wrapper-middle .ant-table-tbody > tr > td,
.ant-table-wrapper-middle .ant-table-thead > tr > th {
  padding: 8px 8px; /* Medium density */
  font-size: 12px;
  line-height: 1.5;
}

.ant-table-wrapper-large .ant-table-tbody > tr > td,
.ant-table-wrapper-large .ant-table-thead > tr > th {
  padding: 16px 16px; /* Larger, more spacious */
  font-size: 14px;
  line-height: 1.8;
}

/* title like demo page */
.title-container {
   /* Light grey border */
  padding: 10px 14px; /* Adjusted from 16px 24px * 0.60 */
  margin-bottom: 10px; /* Adjusted from 16px * 0.60 */
  background-color: #fff; /* White background */
  border-radius: 4px; /* Slightly rounded corners */
}

.title-container h2 {
  margin: 0; /* Remove default margin from h2 */
  font-size: 16px; /* Adjusted to 12px */
  font-weight: 500; /* Adjust font weight if needed */
  color: rgba(0, 0, 0, 0.85); /* Standard Ant Design text color */
  text-align: left;
  font-weight: bold; /* Center the text horizontally */
}

.top-controls-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.left-aligned-section {
  display: flex;
  align-items: center;
}

.right-aligned-section {
  display: none;
}

.right-aligned-icons {
  display: flex;
  align-items: center;
  gap: 10px; /* Add space between icons */
  padding-right: 30px;
}

.right-aligned-icons > .anticon {
  padding: 6px 8px; /* Add padding to make them look like buttons */
  border: 1px solid #d9d9d9; /* Add a subtle border */
  background-color: #f0f0f0; /* Add a light background */
  border-radius: 4px; /* Slightly rounded corners */
  transition: all 0.3s; /* Smooth transition for hover effects */
  cursor: pointer;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.65);
   /* Slightly darker grey for better visibility */
}

.right-aligned-icons > .anticon:hover {
  border-color: #4096ff; /* Ant Design primary color on hover */
  color: #4096ff; /* Change icon color on hover */
  background-color: #e6f7ff; /* Lighter background on hover */
}

.right-aligned-icons > .anticon:last-child,
.right-aligned-icons > .ant-btn:last-child,
.right-aligned-icons > .ant-dropdown:last-child,
.right-aligned-icons > .ant-popover:last-child {
  margin-right: 28px; /* Adjust this value for a bigger gap */
}

html, body {
  overflow-x: hidden;
}

.table-container {
  padding: 10px ;
  padding-right: 50px;
}

/* Styling for the custom always-visible placeholder */
.select-container {
  position: relative;
  display: inline-block;
}
.select-always-placeholder {
  position: absolute;
  top: 50%;
  left: 7px;
  transform: translateY(-50%);
  color: rgba(0, 0, 0, 0.45);
  pointer-events: none;
  z-index: 1;
  font-size: 13px;
}
:deep(.ant-select-selector) {
  padding-left: 100px !important;
}

:deep(.ant-select-selector),
:deep(.ant-select-dropdown),
:deep(.ant-select-item),
:deep(.ant-select-selection-item),
:deep(.ant-select-item-option-content) {
  font-size: 12px !important;
}

/* Add custom style for pagination font size */
:deep(.ant-pagination) {
  font-size: 12px !important;
}

:deep(.ant-input),
:deep(.ant-btn-primary) {
  font-size: 13px !important;
}

:deep(.ant-input::placeholder) {
  font-size: 13px !important;
}

:deep(.ant-pagination-options) .ant-select-selector {
  min-width: unset !important;
  width: auto !important;
  padding-left: 4px !important;
  padding-right: 18px !important; /* keep space for arrow */
}

/* Make the action buttons horizontal and style links */
:deep(.ant-table-cell .action-cell) {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 180px;
  white-space: nowrap;
  flex-wrap: nowrap;
}

:deep(.ant-table-cell .action-cell .view-link) {
  color: #1890ff !important; /* Ant Design blue */
  font-weight: bold;
  white-space: nowrap;
}

:deep(.ant-table-cell .action-cell .edit-link) {
  color: #1890ff !important; /* Ant Design blue */
  font-weight: bold;
  white-space: nowrap;
}

:deep(.ant-table-cell .action-cell .upload-link) {
  color: #1890ff !important; /* Ant Design blue */
  font-weight: bold;
  white-space: nowrap;
}

:deep(.ant-table-cell .action-cell .download-link) {
  color: #1890ff !important; /* Ant Design blue */
  font-weight: bold;
  white-space: nowrap;
}

:deep(.ant-table-cell .action-cell .danger-link) {
  color: #ff4d4f !important; /* Ant Design red */
  font-weight: bold;
  white-space: nowrap;
}

:deep(.device-model-link) {
  color: #1890ff !important; /* Ant Design blue */
  text-decoration: underline;
  cursor: pointer;
}

:deep(.firmware-link) {
  color: #1890ff !important; /* Ant Design blue */
  text-decoration: underline;
  cursor: pointer;
}

:deep(.device-model-select .ant-select-selector) {
  padding-left: 70px !important;
}

:deep(.manufacturer-select .ant-select-selector) {
  padding-left: 80px !important;
}

:deep(.nowrap-header) {
  white-space: nowrap !important;
}

/* Remove all padding and ensure text is flush left for form inputs */
:deep(.ant-input) {
  padding-left: 0 !important;
  text-align: left !important;
}

:deep(.ant-input::placeholder) {
  padding-left: 0 !important;
  text-align: left !important;
}

/* Remove all padding and ensure text is flush left for select dropdowns */
:deep(.ant-select-selection-item) {
  padding: 0 !important;
  margin: 0 !important;
  text-align: left !important;
}

:deep(.ant-select-selection-item > span) {
  padding-left: 0 !important;
  margin-left: 0 !important;
}

:deep(.ant-select-selector) {
  padding-left: 8px !important;
}

:deep(.ant-select-selection-search) {
  padding-left: 0 !important;
}

:deep(.ant-select-selection-placeholder) {
  padding-left: 0 !important;
}

:deep(.ant-select-selection-overflow) {
  padding-left: 0 !important;
}

:deep(.ant-select-selection-overflow-item) {
  padding-left: 0 !important;
}

/* Override any remaining padding */
:deep(.ant-select-selection-item) {
  padding: 0 !important;
  margin: 0 !important;
  text-align: left !important;
}

/* Additional override for modal forms */
:deep(.ant-modal .ant-select-selection-item) {
  padding: 0 !important;
  margin: 0 !important;
  text-align: left !important;
}

:deep(.ant-modal .ant-select-selection-item > span) {
  padding-left: 0 !important;
  margin-left: 0 !important;
}

:deep(.ant-modal .ant-input) {
  padding-left: 0 !important;
  text-align: left !important;
}

/* Input number fields */
:deep(.ant-input-number-input) {
  padding-left: 0 !important;
  text-align: left !important;
}

:deep(.ant-input-number-input::placeholder) {
  padding-left: 0 !important;
  text-align: left !important;
}

/* Ensure modal is visible */
:deep(.ant-modal) {
  z-index: 1000 !important;
}

:deep(.ant-modal-mask) {
  z-index: 999 !important;
}

/* Modal overlay and content styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Ensure it's above other content */
}

.modal-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
  background-color: #f8f8f8;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  flex: 1;
  text-align: left;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #888;
  transition: color 0.3s;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex-grow: 1;
}

.modal-body .form-group {
  margin-bottom: 20px;
}

.modal-body .form-group:last-child {
  margin-bottom: 0;
}

.modal-body .form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
  line-height: 1.4;
}

.modal-body .form-group label::before {
  content: "* ";
  color: #ff4d4f;
  font-weight: bold;
}

.modal-body .form-group .form-input {
  width: 100%;
  padding: 8px 0 8px 0; /* Remove left and right padding, keep top/bottom */
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
  text-align: left;
  text-indent: 0; /* Remove any text indentation */
}

.modal-body .form-group .form-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.modal-body .form-group .input-with-suffix {
  position: relative;
  display: flex;
  align-items: center;
}

.modal-body .form-group .input-with-suffix .form-input {
  flex: 1;
  padding-right: 30px; /* Make space for suffix */
}

.modal-body .form-group .suffix {
  position: absolute;
  right: 8px;
  color: #666;
  font-size: 14px;
  pointer-events: none;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid #eee;
  background-color: #f8f8f8;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary {
  background-color: #fff;
  color: #333;
}

.btn-secondary:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.btn-primary {
  background-color: #1890ff;
  color: #fff;
  border-color: #1890ff;
}

.btn-primary:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

/* Upload BOM Modal Specific Styles */
.upload-modal .modal-content {
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.upload-area {
  width: 100%;
  height: 200px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
  margin-bottom: 20px;
  position: relative;
}

.upload-area:hover {
  border-color: #4096ff;
  background-color: #e6f7ff;
}

.upload-area.drag-over {
  border-color: #4096ff;
  background-color: #e6f7ff;
}

.upload-icon {
  margin-bottom: 10px;
}

.upload-text {
  text-align: center;
  color: #555;
  font-size: 14px;
}

.upload-hint {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
}

.file-status {
  width: 100%;
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #ff4d4f;
  font-size: 18px;
  transition: color 0.3s;
}

.delete-btn:hover {
  color: #ff7875;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 300px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #1890ff;
  border-radius: 4px;
  transition: width 0.3s ease-in-out;
}

.progress-text {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* Hyperlink styling for device model and firmware version */
:deep(.ant-table-tbody .ant-table-cell a) {
  color: #1890ff;
  text-decoration: none;
  transition: color 0.3s ease;
}

:deep(.ant-table-tbody .ant-table-cell a:hover) {
  color: #40a9ff;
  text-decoration: underline;
}

:deep(.ant-table-tbody .ant-table-cell a:active) {
  color: #096dd9;
}

/* Disabled field styling for edit form */
:deep(.disabled-field .ant-select-selector) {
  background-color: #f5f5f5 !important;
  color: #999 !important;
  cursor: not-allowed !important;
}

:deep(.disabled-field .ant-input) {
  background-color: #f5f5f5 !important;
  color: #999 !important;
  cursor: not-allowed !important;
}

:deep(.disabled-field .ant-picker-input > input) {
  background-color: #f5f5f5 !important;
  color: #999 !important;
  cursor: not-allowed !important;
}

:deep(.disabled-field .ant-select-arrow) {
  color: #ccc !important;
}

:deep(.disabled-field .ant-picker-suffix) {
  color: #ccc !important;
}
</style> 