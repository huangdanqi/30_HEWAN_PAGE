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
          <a-button type="primary" @click="showDeviceImportModal = true">设备导入</a-button>
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
      <template v-else-if="column.key === 'deviceModel_4'">
        <a class="device-model-link">{{ record.deviceModel }}</a>
      </template>
      <template v-else-if="column.key === 'initialFirmware_7'">
        <a class="firmware-link">{{ record.initialFirmware }}</a>
      </template>
      <template v-else-if="column.key === 'latestFirmware_8'">
        <a class="firmware-link">{{ record.latestFirmware }}</a>
      </template>
      <template v-else-if="column.key === 'currentFirmwareVersion_9'">
        <a class="firmware-link">{{ record.currentFirmwareVersion }}</a>
      </template>
      <template v-else-if="column.key === 'creator_18'">
        <div class="creator-cell">
          <a-avatar size="small" style="background-color: #1890ff;">33</a-avatar>
        </div>
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
            <div class="step active">
              <div class="step-number">1</div>
              <span>首次选择</span>
            </div>
            <div class="step-line"></div>
            <div class="step">
              <div class="step-number">2</div>
              <span>文件导入</span>
            </div>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>导入方式:</label>
              <div class="radio-group">
                <label class="radio-item">
                  <input type="radio" v-model="importMethod" value="excel" checked>
                  <span>Excel导入</span>
                </label>
                <label class="radio-item">
                  <input type="radio" v-model="importMethod" value="csv">
                  <span>CSV导入</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="required-field">设备型号: <span class="asterisk">*</span></label>
              <select v-model="selectedDeviceModel" class="form-select">
                <option value="">请选择设备型号</option>
                <option value="HW2001">HW2001</option>
              </select>
            </div>

            <div class="form-group">
              <label class="required-field">生产厂家: <span class="asterisk">*</span></label>
              <select v-model="selectedManufacturer" class="form-select">
                <option value="">请选择生产厂家</option>
                <option value="深圳天德胜科技有限公司">深圳天德胜科技有限公司</option>
              </select>
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
              <span>首次选择</span>
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
                <div class="upload-icon">📦</div>
                <div class="upload-text">点击或拖拽文件到此处上传</div>
                <div class="upload-hint">支持.xls, .xlsx, .csv格式文件，文件大小不超过50MB，最多可导入10000条数据。</div>
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
            <button class="btn btn-primary" @click="nextStep" :disabled="!selectedFile">开始导入</button>
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
              <span>首次选择</span>
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
            <h3>导入成功</h3>
            <button class="close-btn" @click="closeDeviceImportModal">×</button>
          </div>

          <div class="modal-body success">
            <div class="success-icon">✓</div>
            <div class="success-text">已成功导入 {{ importedCount }} 条设备数据！</div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-primary" @click="closeDeviceImportModal">确定</button>
          </div>
        </div>

        <!-- Failure State -->
        <div v-if="importStep === 'failure'" class="import-modal">
          <div class="modal-header">
            <h3>导入失败</h3>
            <button class="close-btn" @click="closeDeviceImportModal">×</button>
          </div>

          <div class="modal-body failure">
            <div class="failure-icon">✗</div>
            <div class="failure-text">{{ failureMessage }}</div>
            <div v-if="failureMessage.includes('参照国际标准')" class="download-link">
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
                <option value="HWSZ001">HWSZ001</option>
                <option value="HW2001">HW2001</option>
              </select>
            </div>

            <div class="form-group">
              <label class="required-field"><span class="asterisk">*</span> 生产批次</label>
              <input 
                type="date" 
                v-model="editForm.productionBatch" 
                class="form-input"
                @change="handleEditProductionBatchChange"
              >
            </div>

            <div class="form-group">
              <label class="required-field"><span class="asterisk">*</span> 生产厂家</label>
              <select v-model="editForm.manufacturer" class="form-select">
                <option value="深圳天德胜技术有限公司">深圳天德胜技术有限公司</option>
                <option value="深圳天德胜科技有限公司">深圳天德胜科技有限公司</option>
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
import { ref, computed, onMounted, watch } from 'vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme } from 'ant-design-vue';
import { ReloadOutlined, ColumnHeightOutlined ,SettingOutlined, SearchOutlined} from '@ant-design/icons-vue';
import draggable from 'vuedraggable';
import { useRoute } from 'vue-router';
import { Empty } from 'ant-design-vue';
import axios from 'axios';

const route = useRoute();

// API base URL
const API_BASE_URL = 'http://localhost:2829/api';

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
  { key: 'rowIndex', title: '序号', dataIndex: 'rowIndex', width: 60, fixed: 'left', customRender: ({ index }) => (currentPage.value - 1) * pageSize.value + index + 1 },
  { key: 'deviceId_2', title: '设备ID', dataIndex: 'deviceId', width: 200 },
  { key: 'boundSubAccount_3', title: '绑定子账户', dataIndex: 'boundSubAccount', width: 120 },
  { key: 'deviceModel_4', title: '设备型号', dataIndex: 'deviceModel', width: 120 },
  { key: 'productionBatch_5', title: '生产批次', dataIndex: 'productionBatch', width: 120, sorter: (a, b) => new Date(a.productionBatch).getTime() - new Date(b.productionBatch).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'manufacturer_6', title: '生产厂家', dataIndex: 'manufacturer', width: 200 },
  { key: 'initialFirmware_7', title: '初始烧录固件', dataIndex: 'initialFirmware', width: 150 },
  { key: 'latestFirmware_8', title: '最新可更新固件', dataIndex: 'latestFirmware', width: 150 },
  { key: 'currentFirmwareVersion_9', title: '当前固件版本', dataIndex: 'currentFirmwareVersion', width: 150 },
  { key: 'serialNumberCode_10', title: 'SN码', dataIndex: 'serialNumberCode', width: 150 },
  { key: 'chipId_11', title: '芯片ID', dataIndex: 'chipId', width: 150 },
  { key: 'wifiMacAddress_12', title: 'Wi-Fi MAC 地址', dataIndex: 'wifiMacAddress', width: 150 },
  { key: 'bluetoothMacAddress_13', title: '蓝牙MAC地址', dataIndex: 'bluetoothMacAddress', width: 150 },
  { key: 'bluetoothName_14', title: '蓝牙名称', dataIndex: 'bluetoothName', width: 150 },
  { key: 'cellularNetworkId_15', title: '蜂窝网络识别码', dataIndex: 'cellularNetworkId', width: 150 },
  { key: 'fourGCardNumber_16', title: '4G卡号', dataIndex: 'fourGCardNumber', width: 120 },
  { key: 'cpuSerialNumber_17', title: 'CPU序列号', dataIndex: 'cpuSerialNumber', width: 150 },
  { key: 'creator_18', title: '创建人', dataIndex: 'creator', width: 100 },
  { key: 'createTime_19', title: '创建时间', dataIndex: 'createTime', width: 150, sorter: (a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'updateTime_20', title: '更新时间', dataIndex: 'updateTime', width: 150, sorter: (a, b) => new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'operation_21', title: '操作', dataIndex: '', width: 150, fixed: 'right' },
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
      : ({ text }) => (text === undefined || text === null || text === '' ? '-' : text),
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
    
    const response = await axios.get(`${API_BASE_URL}/device-management`);
    
    if (response.data && Array.isArray(response.data)) {
      // Transform the data to match the DataItem interface
      rawData.value = response.data.map((item: any, index: number) => ({
        id: item.id,
        key: index + 1,
        deviceId: item.deviceId || item.device_id || '-',
        boundSubAccount: item.boundSubAccount || item.bound_sub_account || '-',
        deviceModel: item.deviceModel || item.device_model || '-',
        productionBatch: item.productionBatch || item.production_batch || '-',
        manufacturer: item.manufacturer || '-',
        initialFirmware: item.initialFirmware || item.initial_firmware || '-',
        latestFirmware: item.latestFirmware || item.latest_firmware || '-',
        currentFirmwareVersion: item.currentFirmwareVersion || item.current_firmware_version || '-',
        serialNumberCode: item.serialNumberCode || item.serial_number_code || '-',
        chipId: item.chipId || item.chip_id || '-',
        wifiMacAddress: item.wifiMacAddress || item.wifi_mac_address || '-',
        bluetoothMacAddress: item.bluetoothMacAddress || item.bluetooth_mac_address || '-',
        bluetoothName: item.bluetoothName || item.bluetooth_name || '-',
        cellularNetworkId: item.cellularNetworkId || item.cellular_network_id || '-',
        fourGCardNumber: item.fourGCardNumber || item.four_g_card_number || '-',
        cpuSerialNumber: item.cpuSerialNumber || item.cpu_serial_number || '-',
        creator: item.creator || '-',
        createTime: item.createTime || item.create_time || '-',
        updateTime: item.updateTime || item.update_time || '-'
      }));
      
      console.log('Device management data loaded:', rawData.value.length, 'records');
    } else {
      console.error('Invalid response format:', response.data);
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
  } catch (error) {
    console.error('Error fetching device management:', error);
    // Fallback to static data if API fails
    const fallbackData: DataItem[] = [
      { key: 1, deviceId: '0075A1B2SZTDS25061982X01', boundSubAccount: '183****7953', deviceModel: 'HW2001', productionBatch: '2025-06-30', manufacturer: '深圳天德胜科技有限公司', initialFirmware: 'HW2001 V 1.0.1', latestFirmware: 'HW2001 V 2.0.1', currentFirmwareVersion: 'HW2001 V 1.3.0', serialNumberCode: 'SZTDS25061982X01', chipId: 'ESP32-0075A1B01', wifiMacAddress: 'DC:54:75:62:01:70', bluetoothMacAddress: 'DC:54:75:62:01:70', bluetoothName: 'ZBMU 001 250619X01', cellularNetworkId: '353801003000174', fourGCardNumber: '14776294300136', cpuSerialNumber: '0xFFFFFF6B', creator: '33', createTime: '2025-07-13 10:25:11', updateTime: '2025-07-13 10:25:11' },
      { key: 2, deviceId: '0075A1B2SZTDS25061982X02', boundSubAccount: '-', deviceModel: 'HW2001', productionBatch: '2025-06-30', manufacturer: '深圳天德胜科技有限公司', initialFirmware: 'HW2001 V 1.0.1', latestFirmware: 'HW2001 V 2.0.1', currentFirmwareVersion: 'HW2001 V 1.3.0', serialNumberCode: 'SZTDS25061982X02', chipId: 'ESP32-0075A1B02', wifiMacAddress: 'DC:54:75:62:02:70', bluetoothMacAddress: 'DC:54:75:62:02:70', bluetoothName: 'ZBMU 001 250619X02', cellularNetworkId: '353801003000274', fourGCardNumber: '14776294300236', cpuSerialNumber: '0xFFFFFF6A', creator: '33', createTime: '2025-07-14 11:25:12', updateTime: '2025-07-14 11:25:12' },
      { key: 3, deviceId: '0075A1B2SZTDS25061982X03', boundSubAccount: '183****7953', deviceModel: 'HW2001', productionBatch: '2025-06-30', manufacturer: '深圳天德胜科技有限公司', initialFirmware: 'HW2001 V 1.0.1', latestFirmware: 'HW2001 V 2.0.1', currentFirmwareVersion: 'HW2001 V 1.3.0', serialNumberCode: 'SZTDS25061982X03', chipId: 'ESP32-0075A1B03', wifiMacAddress: 'DC:54:75:62:03:70', bluetoothMacAddress: 'DC:54:75:62:03:70', bluetoothName: 'ZBMU 001 250619X03', cellularNetworkId: '353801003000374', fourGCardNumber: '14776294300336', cpuSerialNumber: '0xFFFFFF69', creator: '33', createTime: '2025-07-15 12:25:13', updateTime: '2025-07-15 12:25:13' },
      { key: 4, deviceId: '0075A1B2SZTDS25061982X04', boundSubAccount: '-', deviceModel: 'HW2001', productionBatch: '2025-06-30', manufacturer: '深圳天德胜科技有限公司', initialFirmware: 'HW2001 V 1.0.1', latestFirmware: 'HW2001 V 2.0.1', currentFirmwareVersion: 'HW2001 V 1.3.0', serialNumberCode: 'SZTDS25061982X04', chipId: 'ESP32-0075A1B04', wifiMacAddress: 'DC:54:75:62:04:70', bluetoothMacAddress: 'DC:54:75:62:04:70', bluetoothName: 'ZBMU 001 250619X04', cellularNetworkId: '353801003000474', fourGCardNumber: '14776294300436', cpuSerialNumber: '0xFFFFFF68', creator: '33', createTime: '2025-07-16 13:25:14', updateTime: '2025-07-16 13:25:14' },
      { key: 5, deviceId: '0075A1B2SZTDS25061982X05', boundSubAccount: '183****7953', deviceModel: 'HW2001', productionBatch: '2025-06-30', manufacturer: '深圳天德胜科技有限公司', initialFirmware: 'HW2001 V 1.0.1', latestFirmware: 'HW2001 V 2.0.1', currentFirmwareVersion: 'HW2001 V 1.3.0', serialNumberCode: 'SZTDS25061982X05', chipId: 'ESP32-0075A1B05', wifiMacAddress: 'DC:54:75:62:05:70', bluetoothMacAddress: 'DC:54:75:62:05:70', bluetoothName: 'ZBMU 001 250619X05', cellularNetworkId: '353801003000574', fourGCardNumber: '14776294300536', cpuSerialNumber: '0xFFFFFF67', creator: '33', createTime: '2025-07-17 14:25:15', updateTime: '2025-07-17 14:25:15' },
    ];
    rawData.value = fallbackData;
  } finally {
    loading.value = false;
  }
};

const createDeviceManagement = async (deviceManagementData: Omit<DataItem, 'key' | 'id' | 'createTime' | 'updateTime'>) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/device-management`, deviceManagementData);
    await fetchDeviceManagement(); // Refresh data
    return response.data;
  } catch (error) {
    console.error('Error creating device management:', error);
    throw error;
  }
};

const updateDeviceManagement = async (id: number, deviceManagementData: Partial<DataItem>) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/device-management/${id}`, deviceManagementData);
    await fetchDeviceManagement(); // Refresh data
    return response.data;
  } catch (error) {
    console.error('Error updating device management:', error);
    throw error;
  }
};

const deleteDeviceManagement = async (id: number) => {
  try {
    await axios.delete(`${API_BASE_URL}/device-management/${id}`);
    await fetchDeviceManagement(); // Refresh data
  } catch (error) {
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
  if (route.query.search) {
    searchInputValue.value = route.query.search as string;
  }
  fetchDeviceManagement(); // Fetch data on component mount
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
const selectedDeviceModel = ref('HW2001'); // Set default value
const selectedManufacturer = ref('深圳天德胜科技有限公司'); // Set default value
const selectedFile = ref<File | null>(null);
const progressPercent = ref(0);
const importedCount = ref(0);
const failureMessage = ref('');
const fileInput = ref<HTMLInputElement>();
const uploadedFileName = ref('');

const canProceedToStep2 = computed(() => {
  // In Step 1, we only need device model and manufacturer to be selected
  // File upload happens in Step 2
  const canProceed = selectedDeviceModel.value && selectedManufacturer.value;
  console.log('Can proceed to step 2:', canProceed, {
    deviceModel: selectedDeviceModel.value,
    manufacturer: selectedManufacturer.value
  });
  return canProceed;
});

const closeDeviceImportModal = () => {
  showDeviceImportModal.value = false;
  // Reset all values
  importStep.value = '1';
  importMethod.value = 'excel';
  selectedDeviceModel.value = '';
  selectedManufacturer.value = '';
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
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
    uploadedFileName.value = target.files[0].name;
  }
};

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    selectedFile.value = event.dataTransfer.files[0];
    uploadedFileName.value = event.dataTransfer.files[0].name;
  }
};

const deleteUploadedFile = () => {
  selectedFile.value = null;
  uploadedFileName.value = '';
};

const nextStep = async () => {
  if (importStep.value === '1') {
    // Move to step 2 (file upload)
    importStep.value = '2';
  } else if (importStep.value === '2') {
    // Start processing
    importStep.value = 'processing';
    progressPercent.value = 0;
    
    // Simulate processing
    const interval = setInterval(() => {
      progressPercent.value += Math.random() * 20;
      if (progressPercent.value >= 100) {
        progressPercent.value = 100;
        clearInterval(interval);
        
        // Simulate success or failure
        setTimeout(() => {
          const success = Math.random() > 0.3; // 70% success rate
          if (success) {
            importStep.value = 'success';
            importedCount.value = Math.floor(Math.random() * 100) + 50; // 50-150 records
          } else {
            importStep.value = 'failure';
            const errorTypes = [
              '发现 15 条重复数据，导入失败！',
              '导入失败，请参照国际标准检查数据是否正确，请确保必填项不为空，以及数据格式；且导入数据中不得存在重复的设备ID。'
            ];
            failureMessage.value = errorTypes[Math.floor(Math.random() * errorTypes.length)];
          }
        }, 1000);
      }
    }, 200);
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

const openEditModal = (record: DataItem) => {
  console.log('Opening edit modal with record:', record);
  
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
  // When device model changes, clear production batch and manufacturer
  if (editForm.value.deviceModel !== originalEditData.value.deviceModel) {
    editForm.value.productionBatch = '';
    editForm.value.manufacturer = '';
  }
};

const handleEditProductionBatchChange = () => {
  // When production batch changes, clear manufacturer
  if (editForm.value.productionBatch !== originalEditData.value.productionBatch) {
    editForm.value.manufacturer = '';
  }
};

const handleEditConfirm = async () => {
  // Validate form
  if (!editForm.value.deviceModel || !editForm.value.productionBatch || !editForm.value.manufacturer) {
    alert('请填写所有必填字段');
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
</style> 