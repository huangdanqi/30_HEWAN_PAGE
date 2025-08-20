<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>设备管理</h2>
    </div>

    <!-- Control Bar -->
    <div class="top-controls-wrapper">
      <div class="left-aligned-section">
        <div class="select-container device-model-select" style="margin-right: 16px;">
          <span class="select-always-placeholder">设备型号:</span>
          <a-tooltip :title="deviceModelValue.label">
          <a-select
            v-model:value="deviceModelValue"
            style="width: 150px;"
            :options="deviceModelOptions"
            @change="handleDeviceModelChange"
            :allowClear="true" 
            label-in-value
            placeholder="请选择设备型号"
          >
            <a-select-option value="all">全部</a-select-option>
          </a-select>
          </a-tooltip>
        </div>
        <div class="select-container manufacturer-select">
          <span class="select-always-placeholder">生产厂家:</span>
          <a-tooltip :title="manufacturerValue.label">
            <a-select
              v-model:value="manufacturerValue"
              style="width: 180px;"
              :options="manufacturerOptions"
              @change="handleManufacturerChange"
              :allowClear="true"
              label-in-value
              placeholder="请选择生产厂家"
            >
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div>
      </div>
      <!-- icon area -->
      <div class="right-aligned-icons">
          <a-input
            v-model:value="searchInputValue"
            placeholder="请输入"
            style="width: 200px; margin-right: 16px;"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
          <a-button type="primary" @click="handleDeviceImportClick">设备导入</a-button>
          <ReloadOutlined @click="onRefresh" />
          <!-- <a-button type="default" @click="debugApiCall" style="margin-left: 8px;">调试API</a-button>
          <a-button type="default" @click="healthCheck" style="margin-left: 8px;">健康检查</a-button> -->
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
        :data-source="paginatedData"
        :pagination="filteredData.length === 0 ? false : pagination"
        :loading="loading"
        :size="tableSize"
        :scroll="{ x: 2000 }"
        @change="handleTableChange"
        :showSorterTooltip="false"
      >
      <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'operation_21'">
        <a-space class="action-cell" direction="horizontal">
          <a class="view-link" @click="$emit('view-record', record)">查看</a>
          <a-divider type="vertical" />
          <a class="edit-link" @click="openEditModal(record)">编辑</a>
          <a-divider type="vertical" />
          <a class="danger-link" @click="handleDeleteRecord(record)">删除</a>
        </a-space>
      </template>
    </template>
      </a-table>
      
      <!-- No data message -->
      <div v-if="showNoDataMessage" class="no-data-message">
        <a-empty 
          :description="noDataMessage"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
        >
          <a-button type="primary" @click="clearSearch">清除搜索</a-button>
        </a-empty>
      </div>
    </div>

    <!-- Device Import Modal -->
    <div v-if="showDeviceImportModal" class="modal-overlay" @click="closeDeviceImportModal">
      <div class="modal-content" @click.stop>
        <!-- Step 1: Initial Form -->
        <div v-if="importStep === '1'" class="import-modal">
          <div class="modal-header">
            <h3>设备导入-第一步</h3>
            <button class="close-btn" @click="closeDeviceImportModal">×</button>
          </div>
          
          <div class="step-indicator">
            <div class="step completed">
              <div class="step-number">✓</div>
              <span>批次选择</span>
            </div>
            <div class="step-line"></div>
            <div class="step active">
              <div class="step-number">2</div>
              <span>文件导入</span>
            </div>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="required-field">设备型号: <span class="asterisk">*</span></label>
              <select v-model="selectedDeviceModel" class="form-select" @change="handleImportDeviceModelChange">
                <option value="">请选择设备型号</option>
                <option v-for="model in deviceModelOptionsForForm" :key="model.value" :value="model.value">
                  {{ model.label }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="required-field">生产批次: <span class="asterisk">*</span></label>
              <select v-model="selectedProductionBatch" class="form-select" @change="handleImportProductionBatchChange">
                <option value="">请选择生产批次</option>
                <option v-for="batch in productionBatchOptionsForForm" :key="batch.value" :value="batch.value">
                  {{ batch.label }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="required-field">生产厂家: <span class="asterisk">*</span></label>
              <select v-model="selectedManufacturer" class="form-select">
                <option value="">请选择生产厂家</option>
                <option v-for="manufacturer in manufacturerOptionsForForm" :key="manufacturer.value" :value="manufacturer.value">
                  {{ manufacturer.label }}
                </option>
              </select>
            </div>

            <div v-if="importMethod === 'csv'" class="form-group">
              <label class="required-field">选择文件夹: <span class="asterisk">*</span></label>
              <div class="folder-selector">
                <input 
                  type="text" 
                  v-model="selectedFolderPath" 
                  class="form-input folder-input" 
                  placeholder="请选择包含CSV文件的文件夹"
                  readonly
                >
                <button type="button" class="btn btn-secondary folder-btn" @click="selectFolder">
                  选择文件夹
                </button>
              </div>
              <div class="folder-hint">请选择包含CSV文件的文件夹，系统将自动识别并导入所有CSV文件</div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeDeviceImportModal">取消</button>
            <button class="btn btn-primary" @click="nextStep" :disabled="!canProceedToStep2">下一步</button>
          </div>
        </div>

        <!-- Step 2: File Upload -->
        <div v-if="importStep === '2'" class="import-modal">
          <div class="modal-header">
            <h3>设备导入-第二步</h3>
            <button class="close-btn" @click="closeDeviceImportModal">×</button>
          </div>
          
          <div class="step-indicator">
            <div class="step completed">
              <div class="step-number">✓</div>
              <span>批量选择</span>
            </div>
            <div class="step-line"></div>
            <div class="step active">
              <div class="step-number">2</div>
              <span>文件导入</span>
            </div>
          </div>

          <div class="modal-body">
            <div class="file-upload-section">
              <div class="file-upload-area" @click="triggerFileUpload" @drop="handleFileDrop" @dragover.prevent>
                <input ref="fileInput" type="file" @change="handleFileSelect" accept=".xls,.xlsx,.csv" style="display: none;">
                <div class="upload-icon">📁</div>
                <div class="upload-text">点击或拖拽文件到此区域</div>
                <div class="upload-hint">支持导入Excel文件，文件大小不超过50M，支持文件格式：xls, xlsx。文件应包含设备ID、绑定子账户、初始烧录固件等列。</div>
              </div>
              
              <div v-if="uploadedFileName" class="uploaded-file">
                <div class="file-info">
                  <span class="file-name">{{ uploadedFileName }}</span>
                  <div class="file-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
                    </div>
                    <span class="progress-text">{{ progressPercent }}%</span>
                    <button class="delete-btn" @click="deleteUploadedFile">🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeDeviceImportModal">取消</button>
            <button class="btn btn-secondary" @click="prevStep">上一步</button>
            <button class="btn btn-primary" @click="nextStep" :disabled="!selectedFile">导入</button>
          </div>
        </div>

        <!-- Processing State -->
        <div v-if="importStep === 'processing'" class="import-modal">
          <div class="modal-header">
            <h3>设备导入-第二步</h3>
            <button class="close-btn" @click="closeDeviceImportModal">×</button>
          </div>
          
          <div class="step-indicator">
            <div class="step completed">
              <div class="step-number">✓</div>
              <span>批次选择</span>
            </div>
            <div class="step-line"></div>
            <div class="step active">
              <div class="step-number">2</div>
              <span>文件导入</span>
            </div>
          </div>

          <div class="modal-body processing">
            <div class="processing-icon">📁</div>
            <div class="processing-text">正在处理导入文件...</div>
            <div class="processing-hint">请稍候，系统正在解析文件内容</div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
            <div class="progress-text">{{ progressPercent }}%</div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeDeviceImportModal">取消</button>
          </div>
        </div>

        <!-- Success State -->
        <div v-if="importStep === 'success'" class="import-modal">
          <div class="modal-header">
            <h3>设备导入</h3>
            <button class="close-btn" @click="closeDeviceImportModal">×</button>
          </div>

          <div class="modal-body success">
            <div class="success-icon">✓</div>
            <div class="success-text">已成功导入 {{ importedCount }} 条设备信息数据</div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-primary" @click="closeDeviceImportModal">确定</button>
          </div>
        </div>

        <!-- Failure State -->
        <div v-if="importStep === 'failure'" class="import-modal">
          <div class="modal-header">
            <h3>设备导入</h3>
            <button class="close-btn" @click="closeDeviceImportModal">×</button>
          </div>

          <div class="modal-body failure">
            <div class="failure-icon">✗</div>
            <div class="failure-text">{{ failureMessage }}</div>
            <div class="download-link">
              <a href="#" class="error-download-link">下载错误文件</a>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-primary" @click="closeDeviceImportModal">确定</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Device Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content edit-modal" @click.stop>
        <div class="modal-header">
          <h3>编辑设备</h3>
          <button class="close-btn" @click="closeEditModal">×</button>
        </div>

        <div class="modal-body edit-body">
          <div class="edit-form-section">
            <div class="form-group">
              <label class="required-field"><span class="asterisk">*</span> 设备型号</label>
              <select v-model="editForm.deviceModel" class="form-select" @change="handleEditDeviceModelChange">
                <option value="">请选择设备型号</option>
                <option v-for="model in deviceModelOptionsForForm" :key="model.value" :value="model.value">
                  {{ model.label }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="required-field"><span class="asterisk">*</span> 生产批次</label>
              <select v-model="editForm.productionBatch" class="form-select" @change="handleEditProductionBatchChange">
                <option value="">请选择生产批次</option>
                <option v-for="batch in productionBatchOptionsForEdit" :key="batch.value" :value="batch.value">
                  {{ batch.label }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="required-field"><span class="asterisk">*</span> 生产厂家</label>
              <select v-model="editForm.manufacturer" class="form-select">
                <option value="">请选择生产厂家</option>
                <option v-for="manufacturer in manufacturerOptionsForEdit" :key="manufacturer.value" :value="manufacturer.value">
                  {{ manufacturer.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeEditModal">取消</button>
          <button class="btn btn-primary" @click="handleEditConfirm">确定</button>
        </div>
      </div>
    </div>

  </a-config-provider>
</template>
<script lang="ts" setup>
import type { ColumnsType } from 'ant-design-vue/es/table';
import { ref, computed, onMounted, watch, h, inject } from 'vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme } from 'ant-design-vue';
import { ReloadOutlined, ColumnHeightOutlined ,SettingOutlined, SearchOutlined, ExportOutlined} from '@ant-design/icons-vue';
import draggable from 'vuedraggable';
import { useRouter } from 'vue-router';
import { Empty } from 'ant-design-vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { 
  createColumnConfigs, 
  useTableColumns, 
  createColumn,
  type ColumnDefinition 
} from '../utils/tableConfig';
import { constructApiUrl } from '../utils/api';

const router = useRouter();

// Inject userName from AppTopbar
const userName = inject('userName', computed(() => '管理员'));

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
  deviceId: string; // 设备ID
  boundSubAccount: string; // 绑定子账户
  deviceModel: string; // 设备型号
  productionBatch: string; // 生产批次
  manufacturer: string; // 生产厂家
  initialFirmware: string; // 初始烧录固件
  latestFirmware: string; // 最新可更新固件
  currentFirmwareVersion: string; // 当前固件版本
  serialNumberCode: string; // SN码
  chipId: string; // 芯片ID
  wifiMacAddress: string; // Wi-Fi MAC 地址
  bluetoothMacAddress: string; // 蓝牙MAC地址
  bluetoothName: string; // 蓝牙名称
  cellularNetworkId: string; // 蜂窝网络识别码
  fourGCardNumber: string; // 4G卡号
  cpuSerialNumber: string; // CPU序列号
  creator: string; // 创建人
  createTime: string; // 创建时间
  updateTime: string; // 更新时间
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
  customRender?: (record: any) => string | number;
  className?: string;
}

const columnConfigs: ColumnConfig[] = [
  { key: 'rowIndex', title: '序号', dataIndex: 'rowIndex', width: 60, fixed: 'left', customRender: ({ index }) => (currentPage.value - 1) * pageSize.value + index + 1, sorter: (a, b) => a.rowIndex - b.rowIndex, sortDirections: ['ascend', 'descend'] },
  { key: 'deviceId_2', title: '设备ID', dataIndex: 'deviceId', width: 200, sorter: (a, b) => (a.deviceId || '').localeCompare(b.deviceId || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'boundSubAccount_3', title: '绑定子账户', dataIndex: 'boundSubAccount', width: 120, sorter: (a, b) => (a.boundSubAccount || '').localeCompare(b.boundSubAccount || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'deviceModel_4', title: '设备型号', dataIndex: 'deviceModel', width: 120, sorter: (a, b) => (a.deviceModel || '').localeCompare(b.deviceModel || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'productionBatch_5', title: '生产批次', dataIndex: 'productionBatch', width: 120, sorter: (a, b) => new Date(a.productionBatch).getTime() - new Date(b.productionBatch).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'manufacturer_6', title: '生产厂家', dataIndex: 'manufacturer', width: 200, sorter: (a, b) => (a.manufacturer || '').localeCompare(b.manufacturer || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'initialFirmware_7', title: '初始烧录固件', dataIndex: 'initialFirmware', width: 150, sorter: (a, b) => (a.initialFirmware || '').localeCompare(b.initialFirmware || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'latestFirmware_8', title: '最新可更新固件', dataIndex: 'latestFirmware', width: 150, sorter: (a, b) => (a.latestFirmware || '').localeCompare(b.latestFirmware || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'currentFirmwareVersion_9', title: '当前固件版本', dataIndex: 'currentFirmwareVersion', width: 150, sorter: (a, b) => (a.currentFirmwareVersion || '').localeCompare(b.currentFirmwareVersion || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'serialNumberCode_10', title: 'SN码', dataIndex: 'serialNumberCode', width: 150, sorter: (a, b) => (a.serialNumberCode || '').localeCompare(b.serialNumberCode || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'chipId_11', title: '芯片ID', dataIndex: 'chipId', width: 150, sorter: (a, b) => (a.chipId || '').localeCompare(b.chipId || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'wifiMacAddress_12', title: 'Wi-Fi MAC 地址', dataIndex: 'wifiMacAddress', width: 150, sorter: (a, b) => (a.wifiMacAddress || '').localeCompare(b.wifiMacAddress || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'bluetoothMacAddress_13', title: '蓝牙MAC地址', dataIndex: 'bluetoothMacAddress', width: 150, sorter: (a, b) => (a.bluetoothMacAddress || '').localeCompare(b.bluetoothMacAddress || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'bluetoothName_14', title: '蓝牙名称', dataIndex: 'bluetoothName', width: 150, sorter: (a, b) => (a.bluetoothName || '').localeCompare(b.bluetoothName || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'cellularNetworkId_15', title: '蜂窝网络识别码', dataIndex: 'cellularNetworkId', width: 150, sorter: (a, b) => (a.cellularNetworkId || '').localeCompare(b.cellularNetworkId || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'fourGCardNumber_16', title: '4G卡号', dataIndex: 'fourGCardNumber', width: 120, sorter: (a, b) => (a.fourGCardNumber || '').localeCompare(b.fourGCardNumber || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'cpuSerialNumber_17', title: 'CPU序列号', dataIndex: 'cpuSerialNumber', width: 150, sorter: (a, b) => (a.cpuSerialNumber || '').localeCompare(b.cpuSerialNumber || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'creator_18', title: '创建人', dataIndex: 'creator', width: 100, sorter: (a, b) => (a.creator || '').localeCompare(b.creator || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'createTime_19', title: '创建时间', dataIndex: 'createTime', width: 150, sorter: (a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'updateTime_20', title: '更新时间', dataIndex: 'updateTime', width: 150, sorter: (a, b) => new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'operation_21', title: '操作', dataIndex: '', width: 200, fixed: 'right' },
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
    sortOrder: sorterInfo.value && config.key === sorterInfo.value.columnKey ? sorterInfo.value.order : undefined,
    customRender: config.customRender
      ? config.customRender
      : ({ text, record }) => {
          // Handle hyperlinks for specific columns based on requirements
          if (config.key === 'boundSubAccount_3') {
            // 绑定帐号 - Jump to Account Information Page filtered by sub-account ID
            return text && text !== '-' ? h('a', {
              style: { cursor: 'pointer', textDecoration: 'none' },
              class: 'hyperlink',
              onClick: () => handleBoundAccountClick(text)
            }, text) : h('span', { class: 'no-data-notice' }, '-');
          }
          if (config.key === 'deviceModel_4') {
            // 设备型号 - Jump to Device Model Page filtered by device model name
            return text && text !== '-' ? h('a', {
              style: { cursor: 'pointer', textDecoration: 'none' },
              class: 'hyperlink',
              onClick: () => handleDeviceModelClick(text)
            }, text) : '-';
          }
          if (config.key === 'productionBatch_5') {
            // 生产批次 - Jump to Production Information Page filtered by production batch
            return text && text !== '-' ? h('a', {
              style: { cursor: 'pointer', textDecoration: 'none' },
              class: 'hyperlink',
              onClick: () => handleProductionBatchClick(text)
            }, text) : '-';
          }
          if (config.key === 'initialFirmware_7') {
            // 初始烧录固件版本 - Jump to Firmware Management Page
            return text && text !== '-' ? h('a', {
              style: { cursor: 'pointer', textDecoration: 'none' },
              class: 'hyperlink',
              onClick: () => handleInitialFirmwareClick(record)
            }, text) : '-';
          }
          if (config.key === 'latestFirmware_8') {
            // 最新可更新的固件版本 - Jump to Firmware Management Page
            return text && text !== '-' ? h('a', {
              style: { cursor: 'pointer', textDecoration: 'none' },
              class: 'hyperlink',
              onClick: () => handleLatestFirmwareClick(record)
            }, text) : '-';
          }
          if (config.key === 'currentFirmwareVersion_9') {
            // 当前固件版本 - Jump to Firmware Management Page
            return text && text !== '-' ? h('a', {
              style: { cursor: 'pointer', textDecoration: 'none' },
              class: 'hyperlink',
              onClick: () => handleCurrentFirmwareClick(record)
            }, text) : '-';
          }
          // Default rendering for other columns
          return text === undefined || text === null || text === '' ? '-' : text;
        },
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

// API functions
const fetchDeviceManagement = async () => {
  try {
    loading.value = true;
    console.log('Fetching device management data...');
    
    const response = await axios.get(constructApiUrl('device-management'));
    console.log('Raw API response:', response);
    console.log('Response data:', response.data);
    console.log('Response data type:', typeof response.data);
    console.log('Response data is array:', Array.isArray(response.data));
    
    if (response.data && Array.isArray(response.data)) {
      console.log('Processing array data with', response.data.length, 'items');
      
      // Transform the data to match the DataItem interface
      rawData.value = response.data.map((item: any, index: number) => {
        console.log(`Processing item ${index}:`, item);
        
        const transformedItem = {
          id: item.id || item.ID || item.Id || null,
          key: index + 1,
          deviceId: item.deviceId || item.device_id || item.deviceId || item.DEVICE_ID || item.DeviceId || item.deviceid || '-',
          boundSubAccount: item.boundSubAccount || item.bound_sub_account || item.boundSubaccount || item.BOUND_SUB_ACCOUNT || item.BoundSubAccount || item.boundsubaccount || '-',
          deviceModel: item.deviceModel || item.device_model || item.devicemodel || item.DEVICE_MODEL || item.DeviceModel || '-',
          productionBatch: item.productionBatch || item.production_batch || item.productionbatch || item.PRODUCTION_BATCH || item.ProductionBatch || '-',
          manufacturer: item.manufacturer || item.MANUFACTURER || item.Manufacturer || '-',
          initialFirmware: item.initialFirmware || item.initial_firmware || item.initialfirmware || item.INITIAL_FIRMWARE || item.InitialFirmware || '-',
          latestFirmware: item.latestFirmware || item.latest_firmware || item.latestfirmware || item.LATEST_FIRMWARE || item.LatestFirmware || '-',
          currentFirmwareVersion: item.currentFirmwareVersion || item.current_firmware_version || item.currentfirmwareversion || item.CURRENT_FIRMWARE_VERSION || item.CurrentFirmwareVersion || '-',
          serialNumberCode: item.serialNumberCode || item.serial_number_code || item.serialnumbercode || item.SERIAL_NUMBER_CODE || item.SerialNumberCode || '-',
          chipId: item.chipId || item.chip_id || item.chipid || item.CHIP_ID || item.ChipId || '-',
          wifiMacAddress: item.wifiMacAddress || item.wifi_mac_address || item.wifimacaddress || item.WIFI_MAC_ADDRESS || item.WifiMacAddress || '-',
          bluetoothMacAddress: item.bluetoothMacAddress || item.bluetooth_mac_address || item.bluetoothmacaddress || item.BLUETOOTH_MAC_ADDRESS || item.BluetoothMacAddress || '-',
          bluetoothName: item.bluetoothName || item.bluetooth_name || item.bluetoothname || item.BLUETOOTH_NAME || item.BluetoothName || '-',
          cellularNetworkId: item.cellularNetworkId || item.cellular_network_id || item.cellularnetworkid || item.CELLULAR_NETWORK_ID || item.CellularNetworkId || '-',
          fourGCardNumber: item.fourGCardNumber || item.four_g_card_number || item.fourgcardnumber || item.FOUR_G_CARD_NUMBER || item.FourGCardNumber || '-',
          cpuSerialNumber: item.cpuSerialNumber || item.cpu_serial_number || item.cpuserialnumber || item.CPU_SERIAL_NUMBER || item.CpuSerialNumber || '-',
          creator: item.creator || item.CREATOR || item.Creator || '-',
          createTime: item.createTime || item.create_time || item.createtime || item.CREATE_TIME || item.CreateTime || '-',
          updateTime: item.updateTime || item.update_time || item.updatetime || item.UPDATE_TIME || item.UpdateTime || '-'
        };
        
        console.log(`Transformed item ${index}:`, transformedItem);
        return transformedItem;
      });
      
      console.log('Device management data loaded:', rawData.value.length, 'records');
      console.log('Final transformed data:', rawData.value);
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      // Handle case where API returns { data: [...], total: number } format
      console.log('Processing nested data format with', response.data.data.length, 'items');
      
      rawData.value = response.data.data.map((item: any, index: number) => {
        console.log(`Processing nested item ${index}:`, item);
        
        const transformedItem = {
          id: item.id || item.ID || item.Id || null,
          key: index + 1,
          deviceId: item.deviceId || item.device_id || item.deviceId || item.DEVICE_ID || item.DeviceId || item.deviceid || '-',
          boundSubAccount: item.boundSubAccount || item.bound_sub_account || item.boundSubaccount || item.BOUND_SUB_ACCOUNT || item.BoundSubAccount || item.boundsubaccount || '-',
          deviceModel: item.deviceModel || item.device_model || item.devicemodel || item.DEVICE_MODEL || item.DeviceModel || '-',
          productionBatch: item.productionBatch || item.production_batch || item.productionbatch || item.PRODUCTION_BATCH || item.ProductionBatch || '-',
          manufacturer: item.manufacturer || item.MANUFACTURER || item.Manufacturer || '-',
          initialFirmware: item.initialFirmware || item.initial_firmware || item.initialfirmware || item.INITIAL_FIRMWARE || item.InitialFirmware || '-',
          latestFirmware: item.latestFirmware || item.latest_firmware || item.latestfirmware || item.LATEST_FIRMWARE || item.LatestFirmware || '-',
          currentFirmwareVersion: item.currentFirmwareVersion || item.current_firmware_version || item.currentfirmwareversion || item.CURRENT_FIRMWARE_VERSION || item.CurrentFirmwareVersion || '-',
          serialNumberCode: item.serialNumberCode || item.serial_number_code || item.serialnumbercode || item.SERIAL_NUMBER_CODE || item.SerialNumberCode || '-',
          chipId: item.chipId || item.chip_id || item.chipid || item.CHIP_ID || item.ChipId || '-',
          wifiMacAddress: item.wifiMacAddress || item.wifi_mac_address || item.wifimacaddress || item.WIFI_MAC_ADDRESS || item.WifiMacAddress || '-',
          bluetoothMacAddress: item.bluetoothMacAddress || item.bluetooth_mac_address || item.bluetoothmacaddress || item.BLUETOOTH_MAC_ADDRESS || item.BluetoothMacAddress || '-',
          bluetoothName: item.bluetoothName || item.bluetooth_name || item.bluetoothname || item.BLUETOOTH_NAME || item.BluetoothName || '-',
          cellularNetworkId: item.cellularNetworkId || item.cellular_network_id || item.cellularnetworkid || item.CELLULAR_NETWORK_ID || item.CellularNetworkId || '-',
          fourGCardNumber: item.fourGCardNumber || item.four_g_card_number || item.fourgcardnumber || item.FOUR_G_CARD_NUMBER || item.FourGCardNumber || '-',
          cpuSerialNumber: item.cpuSerialNumber || item.cpu_serial_number || item.cpuserialnumber || item.CPU_SERIAL_NUMBER || item.CpuSerialNumber || '-',
          creator: item.creator || item.CREATOR || item.Creator || '-',
          createTime: item.createTime || item.create_time || item.createtime || item.CREATE_TIME || item.CreateTime || '-',
          updateTime: item.updateTime || item.update_time || item.updatetime || item.UPDATE_TIME || item.UpdateTime || '-'
        };
        
        console.log(`Transformed nested item ${index}:`, transformedItem);
        return transformedItem;
      });
      
      console.log('Device management data loaded from nested format:', rawData.value.length, 'records');
    } else {
      console.error('Invalid response format:', response.data);
      console.log('Response structure:', JSON.stringify(response.data, null, 2));
      
      // Only fallback to static data if we have no data at all
      if (!rawData.value || rawData.value.length === 0) {
        console.log('No data available, using fallback data');
        // Fallback to static data if API fails
        const fallbackData: DataItem[] = [
          { key: 1, deviceId: '0075A1B2SZTDS25061982X01', boundSubAccount: '183****7953', deviceModel: 'HW2001', productionBatch: '2025-06-30', manufacturer: '深圳天德胜科技有限公司', initialFirmware: 'HW2001 V 1.0.1', latestFirmware: 'HW2001 V 2.0.1', currentFirmwareVersion: 'HW2001 V 1.3.0', serialNumberCode: 'SZTDS25061982X01', chipId: 'ESP32-0075A1B01', wifiMacAddress: 'DC:54:75:62:01:70', bluetoothMacAddress: 'DC:54:75:62:01:70', bluetoothName: 'ZBMU 001 250619X01', cellularNetworkId: '353801003000174', fourGCardNumber: '14776294300136', cpuSerialNumber: '0xFFFFFF6B', creator: '33', createTime: '2025-07-13 10:25:11', updateTime: '2025-07-13 10:25:11' },
          { key: 2, deviceId: '0075A1B2SZTDS25061982X02', boundSubAccount: '-', deviceModel: 'HW2001', productionBatch: '2025-06-30', manufacturer: '深圳天德胜科技有限公司', initialFirmware: 'HW2001 V 1.0.1', latestFirmware: 'HW2001 V 2.0.1', currentFirmwareVersion: 'HW2001 V 1.3.0', serialNumberCode: 'SZTDS25061982X02', chipId: 'ESP32-0075A1B02', wifiMacAddress: 'DC:54:75:62:02:70', bluetoothMacAddress: 'DC:54:75:62:02:70', bluetoothName: 'ZBMU 001 250619X02', cellularNetworkId: '353801003000274', fourGCardNumber: '14776294300236', cpuSerialNumber: '0xFFFFFF6A', creator: '33', createTime: '2025-07-14 11:25:12', updateTime: '2025-07-14 11:25:12' },
          { key: 3, deviceId: '0075A1B2SZTDS25061982X03', boundSubAccount: '183****7953', deviceModel: 'HW2001', productionBatch: '2025-06-30', manufacturer: '深圳天德胜科技有限公司', initialFirmware: 'HW2001 V 1.0.1', latestFirmware: 'HW2001 V 2.0.1', currentFirmwareVersion: 'HW2001 V 1.3.0', serialNumberCode: 'SZTDS25061982X03', chipId: 'ESP32-0075A1B03', wifiMacAddress: 'DC:54:75:62:03:70', bluetoothMacAddress: 'DC:54:75:62:03:70', bluetoothName: 'ZBMU 001 250619X03', cellularNetworkId: '353801003000374', fourGCardNumber: '14776294300336', cpuSerialNumber: '0xFFFFFF69', creator: '33', createTime: '2025-07-15 12:25:13', updateTime: '2025-07-15 12:25:13' },
          { key: 4, deviceId: '0075A1B2SZTDS25061982X04', boundSubAccount: '-', deviceModel: 'HW2001', productionBatch: '2025-06-30', manufacturer: '深圳天德胜科技有限公司', initialFirmware: 'HW2001 V 1.0.1', latestFirmware: 'HW2001 V 2.0.1', currentFirmwareVersion: 'HW2001 V 1.3.0', serialNumberCode: 'SZTDS25061982X04', chipId: 'ESP32-0075A1B04', wifiMacAddress: 'DC:54:75:62:04:70', bluetoothMacAddress: 'DC:54:75:62:04:70', bluetoothName: 'ZBMU 001 250619X04', cellularNetworkId: '353801003000474', fourGCardNumber: '14776294300436', cpuSerialNumber: '0xFFFFFF68', creator: '33', createTime: '2025-07-16 13:25:14', updateTime: '2025-07-16 13:25:14' },
          { key: 5, deviceId: '0075A1B2SZTDS25061982X05', boundSubAccount: '183****7953', deviceModel: 'HW2001', productionBatch: '2025-06-30', manufacturer: '深圳天德胜科技有限公司', initialFirmware: 'HW2001 V 1.0.1', latestFirmware: 'HW2001 V 2.0.1', currentFirmwareVersion: 'HW2001 V 1.3.0', serialNumberCode: 'SZTDS25061982X05', chipId: 'ESP32-0075A1B05', wifiMacAddress: 'DC:54:75:62:05:70', bluetoothMacAddress: 'DC:54:75:62:05:70', bluetoothName: 'ZBMU 001 250619X05', cellularNetworkId: '353801003000574', fourGCardNumber: '14776294300536', cpuSerialNumber: '0xFFFFFF67', creator: '33', createTime: '2025-07-17 14:25:15', updateTime: '2025-07-17 14:25:15' },
        ];
        rawData.value = fallbackData;
      }
    }
  } catch (error: any) {
    console.error('Error fetching device management:', error);
    console.error('Error details:', error.response?.data || error.message);
    
    // Only fallback to static data if we have no data at all
    if (!rawData.value || rawData.value.length === 0) {
      console.log('No data available after error, using fallback data');
      // Fallback to static data if API fails
      const fallbackData: DataItem[] = [
        { key: 1, deviceId: '0075A1B2SZTDS25061982X01', boundSubAccount: '183****7953', deviceModel: 'HW2001', productionBatch: '2025-06-30', manufacturer: '深圳天德胜科技有限公司', initialFirmware: 'HW2001 V 1.0.1', latestFirmware: 'HW2001 V 2.0.1', currentFirmwareVersion: 'HW2001 V 1.3.0', serialNumberCode: 'SZTDS25061982X01', chipId: 'ESP32-0075A1B01', wifiMacAddress: 'DC:54:75:62:01:70', bluetoothMacAddress: 'DC:54:75:62:01:70', bluetoothName: 'ZBMU 001 250619X01', cellularNetworkId: '353801003000174', fourGCardNumber: '14776294300136', cpuSerialNumber: '0xFFFFFF6B', creator: '33', createTime: '2025-07-13 10:25:11', updateTime: '2025-07-13 10:25:11' },
        { key: 2, deviceId: '0075A1B2SZTDS25061982X02', boundSubAccount: '-', deviceModel: 'HW2001', productionBatch: '2025-06-30', manufacturer: '深圳天德胜科技有限公司', initialFirmware: 'HW2001 V 1.0.1', latestFirmware: 'HW2001 V 2.0.1', currentFirmwareVersion: 'HW2001 V 1.3.0', serialNumberCode: 'SZTDS25061982X02', chipId: 'ESP32-0075A1B02', wifiMacAddress: 'DC:54:75:62:02:70', bluetoothMacAddress: 'DC:54:75:62:02:70', bluetoothName: 'ZBMU 001 250619X02', cellularNetworkId: '353801003000274', fourGCardNumber: '14776294300236', cpuSerialNumber: '0xFFFFFF6A', creator: '33', createTime: '2025-07-14 11:25:12', updateTime: '2025-07-14 11:25:12' },
        { key: 3, deviceId: '0075A1B2SZTDS25061982X03', boundSubAccount: '183****7953', deviceModel: 'HW2001', productionBatch: '2025-06-30', manufacturer: '深圳天德胜科技有限公司', initialFirmware: 'HW2001 V 1.0.1', latestFirmware: 'HW2001 V 2.0.1', currentFirmwareVersion: 'HW2001 V 1.3.0', serialNumberCode: 'SZTDS25061982X03', chipId: 'ESP32-0075A1B03', wifiMacAddress: 'DC:54:75:62:03:70', bluetoothMacAddress: 'DC:54:75:62:03:70', bluetoothName: 'ZBMU 001 250619X03', cellularNetworkId: '353801003000374', fourGCardNumber: '14776294300336', cpuSerialNumber: '0xFFFFFF69', creator: '33', createTime: '2025-07-15 12:25:13', updateTime: '2025-07-15 12:25:13' },
        { key: 4, deviceId: '0075A1B2SZTDS25061982X04', boundSubAccount: '-', deviceModel: 'HW2001', productionBatch: '2025-06-30', manufacturer: '深圳天德胜科技有限公司', initialFirmware: 'HW2001 V 1.0.1', latestFirmware: 'HW2001 V 2.0.1', currentFirmwareVersion: 'HW2001 V 1.3.0', serialNumberCode: 'SZTDS25061982X04', chipId: 'ESP32-0075A1B04', wifiMacAddress: 'DC:54:75:62:04:70', bluetoothMacAddress: 'DC:54:75:62:04:70', bluetoothName: 'ZBMU 001 250619X04', cellularNetworkId: '353801003000474', fourGCardNumber: '14776294300436', cpuSerialNumber: '0xFFFFFF68', creator: '33', createTime: '2025-07-16 13:25:14', updateTime: '2025-07-16 13:25:14' },
        { key: 5, deviceId: '0075A1B2SZTDS25061982X05', boundSubAccount: '183****7953', deviceModel: 'HW2001', productionBatch: '2025-06-30', manufacturer: '深圳天德胜科技有限公司', initialFirmware: 'HW2001 V 1.0.1', latestFirmware: 'HW2001 V 2.0.1', currentFirmwareVersion: 'HW2001 V 1.3.0', serialNumberCode: 'SZTDS25061982X05', chipId: 'ESP32-0075A1B05', wifiMacAddress: 'DC:54:75:62:05:70', bluetoothMacAddress: 'DC:54:75:62:05:70', bluetoothName: 'ZBMU 001 250619X05', cellularNetworkId: '353801003000574', fourGCardNumber: '14776294300536', cpuSerialNumber: '0xFFFFFF67', creator: '33', createTime: '2025-07-17 14:25:15', updateTime: '2025-07-17 14:25:15' },
      ];
      rawData.value = fallbackData;
    }
  } finally {
    loading.value = false;
  }
};

const createDeviceManagement = async (deviceManagementData: Omit<DataItem, 'key' | 'id' | 'createTime' | 'updateTime'>) => {
  try {
    const response = await axios.post('http://121.43.196.106:2829/api/device-management', deviceManagementData);
    await fetchDeviceManagement(); // Refresh data
    return response.data;
  } catch (error: any) {
    console.error('Error creating device management:', error);
    throw error;
  }
};

const updateDeviceManagement = async (id: number, deviceManagementData: Partial<DataItem>) => {
  try {
    const response = await axios.put(`http://121.43.196.106:2829/api/device-management/${id}`, deviceManagementData);
    await fetchDeviceManagement(); // Refresh data
    return response.data;
  } catch (error: any) {
    console.error('Error updating device management:', error);
    throw error;
  }
};

const deleteDeviceManagement = async (id: number) => {
  try {
    await axios.delete(constructApiUrl(`device-management/${id}`));
    await fetchDeviceManagement(); // Refresh data
  } catch (error: any) {
    console.error('Error deleting device management:', error);
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
  // Reset to first page when filter changes
  currentPage.value = 1;
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
  // Reset to first page when filter changes
  currentPage.value = 1;
};

const currentPage = ref(1);
const pageSize = ref(10);

const sorterInfo = ref<any>({
  columnKey: 'createTime',
  order: 'descend',
});

const pagination = computed(() => ({
  total: filteredData.value.length, 
  current: currentPage.value,
  pageSize: pageSize.value,
  showSizeChanger: true, 
  pageSizeOptions: ['10', '20', '50'], 
  showTotal: (total: number, range: [number, number]) => `第${range[0]}-${range[1]}条/共${total}条`, 
  showQuickJumper: { goButton: '页' }, 
  onShowSizeChange: (current: number, size: number) => {
    console.log('onShowSizeChange', current, size);
    currentPage.value = 1; // Reset to first page when changing page size
    pageSize.value = size;
  },
  onChange: (page: number, size: number) => {
    console.log('onChange', page, size);
    currentPage.value = page;
    pageSize.value = size;
  },
}));

const onRefresh = () => {
  console.log('Refresh button clicked!');
  searchInputValue.value = '';
  currentPage.value = 1;
  resetColumns(); // Reset column order and visibility
  fetchDeviceManagement(); // Fetch fresh data from API
};

const debugApiCall = async () => {
  console.log('=== DEBUG API CALL ===');
  console.log('Current API base URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('Constructed API URL:', constructApiUrl('device-management'));
  
  try {
    const response = await axios.get(constructApiUrl('device-management'));
    console.log('=== API RESPONSE ===');
    console.log('Full response:', response);
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data:', response.data);
    console.log('Response data type:', typeof response.data);
    console.log('Response data is array:', Array.isArray(response.data));
    
    if (response.data && typeof response.data === 'object') {
      console.log('Response data keys:', Object.keys(response.data));
      if (response.data.data) {
        console.log('Nested data keys:', Object.keys(response.data.data));
        console.log('Nested data is array:', Array.isArray(response.data.data));
        if (Array.isArray(response.data.data)) {
          console.log('First item in nested data:', response.data.data[0]);
        }
      }
    }
    
    // Try to parse as JSON if it's a string
    if (typeof response.data === 'string') {
      try {
        const parsed = JSON.parse(response.data);
        console.log('Parsed JSON data:', parsed);
      } catch (e) {
        console.log('Could not parse as JSON:', e);
      }
    }
    
  } catch (error: any) {
    console.error('=== API ERROR ===');
    console.error('Error:', error);
    console.error('Error response:', error.response);
    console.error('Error message:', error.message);
  }
  
  console.log('=== END DEBUG ===');
};

const healthCheck = async () => {
  console.log('=== HEALTH CHECK ===');
  try {
    const response = await axios.get(constructApiUrl('health'));
    console.log('Health check response:', response);
    alert(`服务器健康状态: ${response.status === 200 ? '正常' : '异常'}`);
  } catch (error: any) {
    console.error('Health check failed:', error);
    alert(`服务器连接失败: ${error.message}`);
  }
  console.log('=== END HEALTH CHECK ===');
};

const filteredData = computed(() => {
  let dataToFilter = rawData.value;

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

  // Sorting logic
  if (sorterInfo.value && sorterInfo.value.order) {
    const { columnKey, order } = sorterInfo.value;
    const sorterFn = columnConfigs.find(c => c.key === columnKey)?.sorter;
    if (sorterFn) {
      dataToFilter.sort((a, b) => {
        const result = sorterFn(a, b);
        return order === 'ascend' ? result : -result;
      });
    }
  }

  return dataToFilter;
});

// Computed property for paginated data
const paginatedData = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filteredData.value.slice(startIndex, endIndex);
});

const searchInputValue = ref('');

// Handle search parameter from URL
onMounted(() => {
  if (router.currentRoute.value.query.search) {
    searchInputValue.value = router.currentRoute.value.query.search as string;
  }
  fetchDeviceManagement(); // Fetch data on component mount
  fetchDeviceModels(); // Fetch device models from DeviceProduction API
  fetchManufacturers(); // Fetch manufacturers from DeviceProduction API
  selectedColumnKeys.value = columnConfigs.map(config => config.key);
});

// Computed property to show no data message
const showNoDataMessage = computed(() => {
  return searchInputValue.value && filteredData.value.length === 0;
});

// Computed property for no data message
const noDataMessage = computed(() => {
  if (searchInputValue.value && filteredData.value.length === 0) {
    return `未找到包含 "${searchInputValue.value}" 的数据`;
  }
  return '';
});

const clearSearch = () => {
  searchInputValue.value = '';
  currentPage.value = 1; // Reset to first page when clearing search
};

// Watch for search input changes to reset pagination
watch(searchInputValue, () => {
  currentPage.value = 1; // Reset to first page when search changes
});

const handleTableChange = (
  paginationData: any,
  _filters: any,
  sorter: any,
) => {
  console.log('Table change:', paginationData, _filters, sorter);
  
  // Handle pagination changes
  if (paginationData) {
    currentPage.value = paginationData.current || 1;
    pageSize.value = paginationData.pageSize || 10;
  }
  
  // Handle sorting changes
  const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;
  if (currentSorter && currentSorter.order) {
    sorterInfo.value = {
      columnKey: currentSorter.columnKey,
      order: currentSorter.order,
    };
  } else {
    // When sorting is cleared, revert to default
    sorterInfo.value = {
      columnKey: 'createTime',
      order: 'descend',
    };
  }
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

const showDeviceImportModal = ref(false);

// Device Import Modal Logic
const importStep = ref<'1' | '2' | 'processing' | 'success' | 'failure'>('1');
const importMethod = ref('excel');
const selectedDeviceModel = ref(''); // Set default value to empty
const selectedProductionBatch = ref(''); // Add production batch
const selectedManufacturer = ref('深圳天德胜科技有限公司'); // Set default value
const selectedFile = ref<File | null>(null);
const selectedFolderPath = ref(''); // Add folder path
const progressPercent = ref(0);
const importedCount = ref(0);
const failureMessage = ref('');
const fileInput = ref<HTMLInputElement>();
const uploadedFileName = ref('');

// Device model options for the import form
const deviceModelsFromAPI = ref<any[]>([]);

// Manufacturer options for the import form
const manufacturersFromAPI = ref<any[]>([]);

// Computed property for device model options in the import form
const deviceModelOptionsForForm = computed(() => {
  // Use API data if available, otherwise fall back to existing data
  if (deviceModelsFromAPI.value.length > 0) {
    // Extract unique device models from the API data
    const uniqueDeviceModels = Array.from(new Set(deviceModelsFromAPI.value.map((item: any) => item.deviceModel)));
    return uniqueDeviceModels.map(model => ({
      key: model,
      value: model,
      label: model,
    }));
  }
  
  // Fallback to existing data
  const uniqueDeviceModels = Array.from(new Set(rawData.value.map(item => item.deviceModel)));
  return uniqueDeviceModels.map(model => ({
    key: model,
    value: model,
    label: model,
  }));
});

// Computed property for manufacturer options in the import form
const manufacturerOptionsForForm = computed(() => {
  // Need both device model and production batch to be selected
  if (!selectedDeviceModel.value || !selectedProductionBatch.value) {
    return [];
  }
  
  // Use API data if available for the selected device model and production batch
  if (deviceModelsFromAPI.value.length > 0) {
    // Filter manufacturers based on selected device model AND production batch
    const manufacturers = deviceModelsFromAPI.value
      .filter(item => 
        item.deviceModel === selectedDeviceModel.value && 
        item.productionBatch === selectedProductionBatch.value
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

// Computed property for production batch options in the import form
const productionBatchOptionsForForm = computed(() => {
  if (!selectedDeviceModel.value) {
    return [];
  }
  
  // Use API data if available for the selected device model
  if (deviceModelsFromAPI.value.length > 0) {
    // Filter production batches based on selected device model
    const batches = deviceModelsFromAPI.value
      .filter(item => item.deviceModel === selectedDeviceModel.value)
      .map(item => item.productionBatch)
      .filter((value, index, self) => self.indexOf(value) === index && value); // Remove duplicates and empty values
    
    return batches.map(batch => ({
      key: batch,
      value: batch,
      label: batch,
    }));
  }
  
  return [];
});

// Function to fetch device models from DeviceProduction API
const fetchDeviceModels = async () => {
  try {
    const response = await axios.get(constructApiUrl('device-production'));
    if (response.data && response.data.data) {
      // Store the full response data to access production batches
      deviceModelsFromAPI.value = response.data.data;
      console.log('Device production data fetched from API:', deviceModelsFromAPI.value);
    }
  } catch (error) {
    console.error('Error fetching device models:', error);
    deviceModelsFromAPI.value = [];
  }
};

// Function to fetch manufacturers from DeviceProduction API
const fetchManufacturers = async () => {
  try {
    const response = await axios.get(constructApiUrl('device-production'));
    if (response.data && response.data.data) {
      // Extract unique manufacturers from the response
      const uniqueManufacturers = Array.from(new Set(response.data.data.map((item: any) => item.manufacturer)));
      manufacturersFromAPI.value = uniqueManufacturers.map(manufacturer => ({
        key: manufacturer,
        value: manufacturer,
        label: manufacturer,
      }));
      console.log('Manufacturers fetched from API:', manufacturersFromAPI.value);
    }
  } catch (error) {
    console.error('Error fetching manufacturers:', error);
    manufacturersFromAPI.value = [];
  }
};

const canProceedToStep2 = computed(() => {
  // In Step 1, we need device model, production batch, and manufacturer to be selected
  let canProceed = selectedDeviceModel.value && selectedProductionBatch.value && selectedManufacturer.value;
  
  console.log('Can proceed to step 2:', canProceed, {
    deviceModel: selectedDeviceModel.value,
    productionBatch: selectedProductionBatch.value,
    manufacturer: selectedManufacturer.value
  });
  return canProceed;
});

const selectFolder = () => {
  // In a real application, this would open a folder picker
  // For now, we'll simulate folder selection
  const mockFolderPath = 'C:\\Users\\Documents\\DeviceData';
  selectedFolderPath.value = mockFolderPath;
  console.log('Selected folder:', mockFolderPath);
};

const closeDeviceImportModal = () => {
  showDeviceImportModal.value = false;
  // Reset all values
  importStep.value = '1';
  importMethod.value = 'excel';
  selectedDeviceModel.value = ''; // Reset to empty
  selectedProductionBatch.value = ''; // Reset production batch
  selectedManufacturer.value = ''; // Reset manufacturer
  selectedFolderPath.value = '';
  selectedFile.value = null;
  progressPercent.value = 0;
  importedCount.value = 0;
  failureMessage.value = '';
  uploadedFileName.value = '';
};

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  console.log('File selection event:', event);
  console.log('Target files:', target.files);
  
  if (target.files && target.files[0]) {
    const file = target.files[0];
    console.log('Selected file details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified)
    });
    
    selectedFile.value = file;
    uploadedFileName.value = file.name;
    
    console.log('File selected successfully:', {
      selectedFile: selectedFile.value,
      uploadedFileName: uploadedFileName.value
    });
  } else {
    console.log('No file selected');
  }
};

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault();
  console.log('File drop event:', event);
  console.log('Data transfer files:', event.dataTransfer?.files);
  
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const file = event.dataTransfer.files[0];
    console.log('Dropped file details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified)
    });
    
    selectedFile.value = file;
    uploadedFileName.value = file.name;
    
    console.log('File dropped successfully:', {
      selectedFile: selectedFile.value,
      uploadedFileName: uploadedFileName.value
    });
  } else {
    console.log('No file dropped');
  }
};

const deleteUploadedFile = () => {
  selectedFile.value = null;
  uploadedFileName.value = '';
};

const nextStep = async () => {
  console.log('nextStep called, current step:', importStep.value);
  console.log('Form values:', {
    deviceModel: selectedDeviceModel.value,
    productionBatch: selectedProductionBatch.value,
    manufacturer: selectedManufacturer.value,
    selectedFile: selectedFile.value
  });
  
  if (importStep.value === '1') {
    console.log('Moving from step 1 to step 2');
    // Move to step 2 (file upload)
    importStep.value = '2';
  } else if (importStep.value === '2') {
    console.log('Starting import process from step 2');
    
    // Validate that we have all required data
    if (!selectedDeviceModel.value) {
      console.error('Device model is required');
      alert('请选择设备型号');
      return;
    }
    if (!selectedProductionBatch.value) {
      console.error('Production batch is required');
      alert('请选择生产批次');
      return;
    }
    if (!selectedManufacturer.value) {
      console.error('Manufacturer is required');
      alert('请选择生产厂家');
      return;
    }
    if (!selectedFile.value) {
      console.error('File is required');
      alert('请选择要导入的文件');
      return;
    }
    
    console.log('All validations passed, starting processing...');
    
    // Start processing
    importStep.value = 'processing';
    progressPercent.value = 0;
    
    try {
      console.log('Calling processSingleFile...');
      await processSingleFile();
    } catch (error: any) {
      console.error('Import processing error:', error);
      importStep.value = 'failure';
      failureMessage.value = `文件处理失败: ${error.message}`;
    }
  }
};

const processSingleFile = async () => {
  try {
    console.log('Starting file processing...');
    console.log('Selected file:', selectedFile.value);
    console.log('File name:', selectedFile.value?.name);
    console.log('File size:', selectedFile.value?.size);
    console.log('File type:', selectedFile.value?.type);
    console.log('Current userName:', userName.value);
    
    if (!selectedFile.value) {
      throw new Error('No file selected');
    }
    
    // Check file type
    const fileName = selectedFile.value.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      throw new Error('Invalid file format. Please upload an Excel file (.xlsx or .xls)');
    }
    
    // Check file size (50MB limit)
    if (selectedFile.value.size > 50 * 1024 * 1024) {
      throw new Error('File size exceeds 50MB limit');
    }
    
    // Check if required form fields are selected
    if (!selectedDeviceModel.value) {
      throw new Error('请选择设备型号');
    }
    if (!selectedProductionBatch.value) {
      throw new Error('请选择生产批次');
    }
    if (!selectedManufacturer.value) {
      throw new Error('请选择生产厂家');
    }
    
    console.log('File validation passed, starting processing...');
    
    // Simulate progress
    const interval = setInterval(() => {
      progressPercent.value += Math.random() * 20;
      if (progressPercent.value >= 100) {
        progressPercent.value = 100;
        clearInterval(interval);
        
        // Process the Excel file
        setTimeout(async () => {
          try {
            console.log('Reading Excel file...');
            
            // Read the Excel file
            const arrayBuffer = await selectedFile.value!.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert to JSON with header row
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            console.log('Excel data:', jsonData);
            
            if (jsonData.length < 2) {
              throw new Error('Excel file must contain at least a header row and one data row');
            }
            
            // Extract headers (first row)
            const headers = jsonData[0] as string[];
            console.log('Raw headers from Excel:', headers);
            console.log('Headers after processing:', headers.map(h => h ? h.toString().trim() : 'null'));
            
            // Extract data rows (skip header row)
            const dataRows = jsonData.slice(1);
            console.log('Data rows count:', dataRows.length);
            
            // Validate headers match expected structure
            const expectedHeaders = [
              '设备ID', '绑定子账户', '初始烧录固件', '最新可更新固件', '当前固件版本',
              'SN码', '芯片ID', 'Wi-Fi MAC地址', '蓝牙MAC地址', '蓝牙名称',
              '蜂窝网络识别码', '4G卡号', 'CPU序列号'
            ];
            
            // More robust header matching - check for exact matches or contains
            const missingHeaders = expectedHeaders.filter(expectedHeader => {
              return !headers.some(header => {
                if (!header) return false;
                const headerStr = header.toString().trim();
                
                // Check for exact match or contains
                if (headerStr === expectedHeader || headerStr.includes(expectedHeader)) {
                  return true;
                }
                
                // Handle special cases with slight variations
                if (expectedHeader === 'Wi-Fi MAC地址' && (headerStr.includes('Wi-Fi MAC') || headerStr.includes('WiFi MAC'))) {
                  return true;
                }
                
                return false;
              });
            });
            
            if (missingHeaders.length > 0) {
              console.error('Expected headers:', expectedHeaders);
              console.error('Actual headers:', headers);
              console.error('Missing headers:', missingHeaders);
              throw new Error(`Excel文件缺少必需的列: ${missingHeaders.join(', ')}`);
            }
            
            // Validate that we have at least one data row
            if (dataRows.length === 0) {
              throw new Error('Excel文件中没有数据行');
            }
            
            // Transform data rows to device objects
            const devices = dataRows.map((row: unknown, index: number) => {
              const rowArray = row as any[];
              const device: any = {};
              
              // Map Excel columns to device properties
              headers.forEach((header: string, colIndex: number) => {
                if (header && rowArray[colIndex] !== undefined) {
                  const value = rowArray[colIndex];
                  const headerStr = header.toString().trim();
                  
                  // Map Chinese headers to English properties with more robust matching
                  if (headerStr.includes('设备ID')) device.deviceId = value;
                  else if (headerStr.includes('绑定子账户')) device.boundSubAccount = value;
                  else if (headerStr.includes('初始烧录固件')) device.initialFirmware = value;
                  else if (headerStr.includes('最新可更新固件')) device.latestFirmware = value;
                  else if (headerStr.includes('当前固件版本')) device.currentFirmwareVersion = value;
                  else if (headerStr.includes('SN码')) device.serialNumberCode = value;
                  else if (headerStr.includes('芯片ID')) device.chipId = value;
                  else if (headerStr.includes('Wi-Fi MAC地址') || headerStr.includes('Wi-Fi MAC 地址')) device.wifiMacAddress = value;
                  else if (headerStr.includes('蓝牙MAC地址')) device.bluetoothMacAddress = value;
                  else if (headerStr.includes('蓝牙名称')) device.bluetoothName = value;
                  else if (headerStr.includes('蜂窝网络识别码')) device.cellularNetworkId = value;
                  else if (headerStr.includes('4G卡号')) device.fourGCardNumber = value;
                  else if (headerStr.includes('CPU序列号')) device.cpuSerialNumber = value;
                }
              });
              
              // Add form-selected values
              device.deviceModel = selectedDeviceModel.value;
              device.productionBatch = selectedProductionBatch.value;
              device.manufacturer = selectedManufacturer.value;
              
              // Add dynamic creation time and creator
              device.createTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
              device.creator = userName.value;
              
              return device;
            }).filter(device => device.deviceId); // Filter out rows without device ID
            
            console.log('Transformed devices:', devices);
            
            if (devices.length === 0) {
              throw new Error('Excel文件中没有找到有效的设备数据，请确保每行都包含设备ID');
            }
            
            // Validate device data
            const validationErrors: string[] = [];
            devices.forEach((device, index) => {
              if (!device.deviceId || device.deviceId.toString().trim() === '') {
                validationErrors.push(`第${index + 2}行: 设备ID不能为空`);
              }
              // Add more validation as needed
            });
            
            if (validationErrors.length > 0) {
              throw new Error(`数据验证失败:\n${validationErrors.join('\n')}`);
            }
            
            // Send data to server
            console.log('Sending data to server...');
            console.log('Creator (创建人):', userName.value);
            console.log('Sample device data with creator and creation time:', devices[0]);
            
            const response = await axios.post(constructApiUrl('device-management/bulk-import'), {
              devices,
              deviceModel: selectedDeviceModel.value,
              productionBatch: selectedProductionBatch.value,
              manufacturer: selectedManufacturer.value,
              creator: userName.value
            });
            
            console.log('Server response:', response.data);
            
            // Import successful
            importStep.value = 'success';
            importedCount.value = devices.length;
            
            // Refresh the device list
            await fetchDeviceManagement();
            
            // Auto-close after 2 seconds
            setTimeout(() => {
              closeDeviceImportModal();
            }, 2000);
            
          } catch (error: any) {
            console.error('Error during file processing:', error);
            importStep.value = 'failure';
            failureMessage.value = `文件处理失败: ${error.message}`;
            
            // Auto-close after 2 seconds
            setTimeout(() => {
              closeDeviceImportModal();
            }, 2000);
          }
        }, 1000);
      }
    }, 200);
    
  } catch (error: any) {
    console.error('File processing error:', error);
    importStep.value = 'failure';
    failureMessage.value = error.message || '文件处理失败，请检查文件格式是否正确';
    
    // Auto-close after 2 seconds
    setTimeout(() => {
      closeDeviceImportModal();
    }, 2000);
  }
};



const prevStep = () => {
  if (importStep.value === '2') {
    importStep.value = '1';
  }
};

// Edit Device Modal Logic
const showEditModal = ref(false);
const editForm = ref({
  deviceModel: '',
  productionBatch: '',
  manufacturer: ''
});
const originalEditData = ref({
  deviceModel: '',
  productionBatch: '',
  manufacturer: ''
});

const openEditModal = async (record: DataItem) => {
  console.log('Opening edit modal with record:', record);
  
  // Fetch fresh device production data when modal opens
  await fetchDeviceModels();
  
  // Pre-fill form with record data
  editForm.value = {
    deviceModel: record.deviceModel,
    productionBatch: record.productionBatch,
    manufacturer: record.manufacturer
  };
  originalEditData.value = {
    deviceModel: record.deviceModel,
    productionBatch: record.productionBatch,
    manufacturer: record.manufacturer
  };
  
  console.log('Form pre-filled with:', editForm.value);
  console.log('Original data stored as:', originalEditData.value);
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editForm.value = {
    deviceModel: '',
    productionBatch: '',
    manufacturer: ''
  };
  originalEditData.value = {
    deviceModel: '',
    productionBatch: '',
    manufacturer: ''
  };
};

const handleEditDeviceModelChange = () => {
  // When device model changes, clear production batch and manufacturer (same logic as import form)
  if (editForm.value.deviceModel !== originalEditData.value.deviceModel) {
    editForm.value.productionBatch = '';
    editForm.value.manufacturer = '';
    console.log('Device model changed, cleared production batch and manufacturer');
  }
};

const handleEditProductionBatchChange = () => {
  // When production batch changes, clear manufacturer (same logic as import form)
  if (editForm.value.productionBatch !== originalEditData.value.productionBatch) {
    editForm.value.manufacturer = '';
    console.log('Production batch changed, cleared manufacturer');
  }
};

const handleEditConfirm = async () => {
  // Validate form
  if (!editForm.value.deviceModel) {
    alert('请选择设备型号');
    return;
  }
  if (!editForm.value.productionBatch) {
    alert('请选择生产批次');
    return;
  }
  if (!editForm.value.manufacturer) {
    alert('请选择生产厂家');
    return;
  }
  
  // Here you would typically update the data
  console.log('Edit confirmed:', editForm.value);
  
  // Close modal
  closeEditModal();
};

onMounted(() => {
  selectedColumnKeys.value = columnConfigs.map(config => config.key);
});

defineExpose({
  handleTableChange, // Explicitly expose handleTableChange
});

// Handle delete record
const handleDeleteRecord = async (record: DataItem) => {
  try {
    if (record.id) {
      await deleteDeviceManagement(record.id);
    }
  } catch (error) {
    console.error('Error deleting record:', error);
  }
};

// Hyperlink click handlers
const handleBoundAccountClick = (subAccountId: string) => {
  console.log('Bound account clicked:', subAccountId);
  if (subAccountId && subAccountId !== '-') {
    router.push({ 
      path: '/account', 
      query: { search: subAccountId }
    });
  } else {
    // Show notice instead of alert
    console.log('该设备未绑定子账户，无法查看账户信息');
  }
};

const handleDeviceModelClick = (deviceModel: string) => {
  console.log('Device model clicked:', deviceModel);
  if (deviceModel && deviceModel !== '-') {
    router.push({ 
      path: '/device-type', 
      query: { search: deviceModel }
    });
  } else {
    console.log('设备型号信息不存在');
  }
};

const handleProductionBatchClick = (productionBatch: string) => {
  console.log('Production batch clicked:', productionBatch);
  if (productionBatch && productionBatch !== '-') {
    router.push({ 
      path: '/device-production', 
      query: { search: productionBatch }
    });
  } else {
    console.log('生产批次信息不存在');
  }
};

const handleInitialFirmwareClick = (record: DataItem) => {
  console.log('Initial firmware clicked:', record);
  if (record.deviceModel && record.productionBatch && record.manufacturer && 
      record.deviceModel !== '-' && record.productionBatch !== '-' && record.manufacturer !== '-') {
    // Query device production information table with concatenated value
    const searchTerm = `${record.deviceModel}+${record.productionBatch}+${record.manufacturer}`;
    router.push({ 
      path: '/firmware', 
      query: { search: searchTerm, type: 'initial' }
    });
  } else {
    console.log('设备信息不完整，无法查看初始固件信息');
  }
};

const handleLatestFirmwareClick = (record: DataItem) => {
  console.log('Latest firmware clicked:', record);
  if (record.deviceModel && record.deviceModel !== '-') {
    // Query device model table for latest firmware
    router.push({ 
      path: '/firmware', 
      query: { search: record.deviceModel, type: 'latest' }
    });
  } else {
    console.log('设备型号信息不存在，无法查看最新固件信息');
  }
};

const handleCurrentFirmwareClick = (record: DataItem) => {
  console.log('Current firmware clicked:', record);
  if (record.deviceId && record.deviceId !== '-') {
    // Query device table for current firmware
    router.push({ 
      path: '/firmware', 
      query: { search: record.deviceId, type: 'current' }
    });
  } else {
    console.log('设备ID信息不存在，无法查看当前固件信息');
  }
};

const handleDeviceImportClick = async () => {
  showDeviceImportModal.value = true;
  // Fetch fresh device models and manufacturers when the modal opens
  await Promise.all([
    fetchDeviceModels(),
    fetchManufacturers()
  ]);
};

// Handler for device model change in import form
const handleImportDeviceModelChange = () => {
  // Clear production batch and manufacturer when device model changes
  selectedProductionBatch.value = '';
  selectedManufacturer.value = '';
};

// Handler for production batch change in import form
const handleImportProductionBatchChange = () => {
  // Clear manufacturer when production batch changes
  selectedManufacturer.value = '';
};

// Computed properties for edit form options
const deviceModelOptionsForEdit = computed(() => {
  // Use API data if available, otherwise fall back to existing data
  if (deviceModelsFromAPI.value.length > 0) {
    // Extract unique device models from the API data
    const uniqueDeviceModels = Array.from(new Set(deviceModelsFromAPI.value.map((item: any) => item.deviceModel)));
    return uniqueDeviceModels.map(model => ({
      key: model,
      value: model,
      label: model,
    }));
  }
  
  // Fallback to existing data
  const uniqueDeviceModels = Array.from(new Set(rawData.value.map(item => item.deviceModel)));
  return uniqueDeviceModels.map(model => ({
    key: model,
    value: model,
    label: model,
  }));
});

const productionBatchOptionsForEdit = computed(() => {
  if (!editForm.value.deviceModel) {
    return [];
  }
  
  // Use API data if available for the selected device model
  if (deviceModelsFromAPI.value.length > 0) {
    // Filter production batches based on selected device model
    const batches = deviceModelsFromAPI.value
      .filter(item => item.deviceModel === editForm.value.deviceModel)
      .map(item => item.productionBatch)
      .filter((value, index, self) => self.indexOf(value) === index && value); // Remove duplicates and empty values
    
    return batches.map(batch => ({
      key: batch,
      value: batch,
      label: batch,
    }));
  }
  
  return [];
});

const manufacturerOptionsForEdit = computed(() => {
  // Need both device model and production batch to be selected
  if (!editForm.value.deviceModel || !editForm.value.productionBatch) {
    return [];
  }
  
  // Use API data if available for the selected device model and production batch
  if (deviceModelsFromAPI.value.length > 0) {
    // Filter manufacturers based on selected device model AND production batch
    const manufacturers = deviceModelsFromAPI.value
      .filter(item => 
        item.deviceModel === editForm.value.deviceModel && 
        item.productionBatch === editForm.value.productionBatch
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
  min-width: 150px;
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

:deep(.creator-cell) {
  display: flex;
  align-items: center;
  gap: 8px;
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

/* Device Import Modal Styles */
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
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.import-modal {
  padding: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.45);
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: rgba(0, 0, 0, 0.85);
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  background-color: #fafafa;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  color: white;
  background-color: #d9d9d9;
}

.step.active .step-number {
  background-color: #1890ff;
}

.step.completed .step-number {
  background-color: #52c41a;
}

.step span {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
}

.step.active span {
  color: #1890ff;
}

.step.completed span {
  color: #52c41a;
}

.step-line {
  width: 60px;
  height: 1px;
  background-color: #d9d9d9;
  margin: 0 16px;
}

.modal-body {
  padding: 24px;
}

.modal-body.processing {
  text-align: center;
  padding: 40px 24px;
}

.processing-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.processing-text {
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 8px;
}

.processing-hint {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 24px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background-color: #1890ff;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: #1890ff;
  font-weight: 500;
}

.modal-body.success {
  text-align: center;
  padding: 40px 24px;
}

.success-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #52c41a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 16px;
}

.success-text {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.85);
}

.modal-body.failure {
  text-align: center;
  padding: 40px 24px;
}

.failure-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #ff4d4f;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 16px;
}

.failure-text {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  line-height: 1.5;
  max-width: 400px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
}

.radio-group {
  display: flex;
  gap: 24px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.radio-item input[type="radio"] {
  margin: 0;
  accent-color: #1890ff;
}

.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
}

.form-select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.file-upload-section {
  width: 100%;
}

.file-upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  padding: 32px 16px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
  background-color: #fafafa;
}

.file-upload-area:hover {
  border-color: #1890ff;
  background-color: #f0f8ff;
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 8px;
  color: #1890ff;
}

.upload-text {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 4px;
  font-weight: 500;
}

.upload-hint {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  line-height: 1.4;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.3s;
  font-weight: 500;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.btn-primary:hover:not(:disabled) {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.btn-primary:disabled {
  background-color: #d9d9d9;
  border-color: #d9d9d9;
  color: rgba(0, 0, 0, 0.25);
  cursor: not-allowed;
}

.btn-secondary {
  background-color: white;
  color: rgba(0, 0, 0, 0.65);
  border-color: #d9d9d9;
}

.btn-secondary:hover {
  color: #1890ff;
  border-color: #1890ff;
}

/* New styles for required field asterisks */
.required-field {
  display: flex;
  align-items: center;
  gap: 4px;
}

.required-field .asterisk {
  color: #ff4d4f; /* Ant Design red */
  font-size: 14px;
  font-weight: bold;
}

/* New styles for uploaded file display */
.uploaded-file {
  margin-top: 20px;
  padding: 12px;
  background-color: #f6f6f6;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-name {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.file-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-grow: 1;
}

.progress-bar {
  flex-grow: 1;
  height: 6px;
  background-color: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #1890ff;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #1890ff;
  font-weight: 500;
  min-width: 30px;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.45);
  padding: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.delete-btn:hover {
  background-color: #ff4d4f;
  color: white;
}

/* New styles for download link in failure state */
.download-link {
  margin-top: 15px;
  text-align: center;
}

.error-download-link {
  color: #1890ff;
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
}

.error-download-link:hover {
  color: #40a9ff;
}

/* Edit Modal Styles */
.edit-modal {
  max-width: 800px;
  width: 90%;
}

.edit-body {
  display: flex;
  gap: 24px;
  padding: 24px;
}

.edit-form-section {
  flex: 1;
}

.interaction-guidelines {
  flex: 1;
  background-color: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 16px;
  max-width: 300px;
}

.guidelines-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 12px;
}

.guidelines-content {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.5;
}

.guidelines-content p {
  margin: 0 0 8px 0;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  color: rgba(0, 0, 0, 0.85);
}

.form-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-input[type="date"] {
  padding: 7px 12px;
}

/* Updated required field styling */
.required-field {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
}

.required-field .asterisk {
  color: #ff4d4f;
  font-size: 14px;
  font-weight: bold;
}

/* Updated form select styling */
.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  color: rgba(0, 0, 0, 0.85);
}

.form-select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* No data message styling */
.no-data-message {
  text-align: center;
  padding: 40px 20px;
  background: #fafafa;
  border-radius: 6px;
  margin: 20px 0;
}

.no-data-message .ant-empty {
  margin: 0;
}

.no-data-message .ant-empty-description {
  color: #666;
  font-size: 14px;
}

/* Hyperlink styling */
:deep(.hyperlink) {
  color: #1890ff !important;
  text-decoration: none !important;
  transition: all 0.3s ease;
}

:deep(.hyperlink:hover) {
  color: #40a9ff !important;
  text-decoration: underline !important;
}

/* No data notice styling */
:deep(.no-data-notice) {
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
  font-style: italic;
}

/* Folder selector styles */
.folder-selector {
  display: flex;
  gap: 8px;
  align-items: center;
}

.folder-input {
  flex: 1;
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.folder-btn {
  white-space: nowrap;
  min-width: 80px;
}

.folder-hint {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  margin-top: 4px;
  line-height: 1.4;
}
</style> 