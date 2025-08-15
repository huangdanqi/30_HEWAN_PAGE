<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>产品型号</h2>
    </div>

    <!-- Control Bar -->
    <div class="top-controls-wrapper">
      <div class="left-aligned-section">
        <div class="select-container device-model-select" style="margin-right: 16px;">
          <span class="select-always-placeholder">设备型号:</span>
          <a-tooltip :title="deviceModelValue.label">
            <a-select
              v-model:value="deviceModelValue"
              style="width: 130px;"
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
        <div class="select-container product-type-select" style="margin-right: 16px;">
          <span class="select-always-placeholder">产品类型:</span>
          <a-tooltip :title="productTypeValue.label">
            <a-select
              v-model:value="productTypeValue"
              style="width: 120px;"
              :options="productTypeOptions"
              @change="handleProductTypeChange"
              :allowClear="true"
              label-in-value
              placeholder="请选择产品类型"
            >
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div>
        <div class="select-container ip-name-select" style="margin-right: 16px;">
          <span class="select-always-placeholder">IP名称:</span>
          <a-tooltip :title="ipNameValue.label">
            <a-select
              v-model:value="ipNameValue"
              style="width: 100px;"
              :options="ipNameOptions"
              @change="handleIpNameChange"
              :allowClear="true"
              label-in-value
              placeholder="请选择IP名称"
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
          placeholder="请输入关键字搜索"
          style="width: 200px; margin-right: 16px;"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
        <a-button type="primary" @click="handleCreateProduct" style="margin-right: 16px;">
          新建产品
        </a-button>
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
        <!-- <ExportOutlined @click="handleExport" /> -->
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
        :scroll="{ x: 1500 }"
        @change="handleTableChange"
        :showSorterTooltip="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'deviceModel'">
            <a class="link-text" @click="handleDeviceModelClick(record)">{{ record.deviceModel }}</a>
          </template>
          <template v-if="column.key === 'ipRoleName'">
            <a class="link-text" @click="handleIpNameClick(record)">{{ record.ipRoleName }}</a>
          </template>
          <template v-if="column.key === 'creator'">
            <span>{{ record.creator }}</span>
          </template>
          <template v-if="column.key === 'operation'">
            <a-space class="action-cell" direction="horizontal">
              <a class="view-link" @click="handleView(record)">查看</a>
              <a-divider type="vertical" />
              <a class="edit-link" @click="handleEdit(record)">编辑</a>
              <a-divider type="vertical" />
              <a class="danger-link" @click="handleDelete(record)">删除</a>
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
          <div class="no-data-actions">
            <a-button type="primary" @click="clearSearch" v-if="searchInputValue">清除搜索</a-button>
            <a-button @click="clearAllFilters" v-if="deviceModelValue.value !== 'all' || productTypeValue.value !== 'all' || ipNameValue.value !== 'all'">清除筛选</a-button>
            <a-button @click="onRefresh" v-if="!searchInputValue && deviceModelValue.value === 'all' && productTypeValue.value === 'all' && ipNameValue.value === 'all'">刷新数据</a-button>
          </div>
        </a-empty>
      </div>
    </div>

    <!-- Create Product Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新增产品</h3>
          <button class="close-btn" @click="closeCreateModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 设备型号</label>
            <a-select
              v-model:value="createForm.deviceModel"
              placeholder="请选择"
              class="form-select"
              :loading="deviceModelLoading"
              @change="handleDeviceModelChangeInForm"
            >
              <a-select-option value="">请选择</a-select-option>
              <a-select-option v-for="option in deviceModelOptionsForForm" :key="option.value" :value="option.value">{{ option.label }}</a-select-option>
            </a-select>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 产品型号</label>
            <a-input
              v-model:value="createForm.productModel"
              class="form-input"
              placeholder="自动生成"
              disabled
            />
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 产品名称</label>
            <a-input
              v-model:value="createForm.productName"
              class="form-input"
              placeholder="请输入"
              :maxlength="10"
              show-count
            />
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 产品类型</label>
            <a-auto-complete
              v-model:value="createForm.productType"
              class="form-input"
              placeholder="请输入"
              :maxlength="10"
              show-count
              :options="productTypeSuggestions"
            />
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 颜色</label>
            <a-auto-complete
              v-model:value="createForm.color"
              class="form-input"
              placeholder="请输入"
              :maxlength="10"
              show-count
              :options="colorSuggestions"
            />
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 产品详情</label>
            <a-textarea
              v-model:value="createForm.productDetails"
              class="form-textarea"
              placeholder="请输入"
              :maxlength="2000"
              show-count
              :rows="3"
            />
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> IP角色名称</label>
            <a-select
              v-model:value="createForm.ipRoleName"
              class="form-select"
              placeholder="请选择"
              :loading="ipRoleLoading"
            >
              <a-select-option value="">请选择</a-select-option>
              <a-select-option v-for="option in ipRoleOptionsForForm" :key="option.value" :value="option.value">{{ option.label }}</a-select-option>
            </a-select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeCreateModal">取消</button>
          <button class="btn btn-primary" @click="handleCreateConfirm">确定</button>
        </div>
      </div>
    </div>

    <!-- Edit Product Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑产品</h3>
          <button class="close-btn" @click="closeEditModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 设备型号</label>
            <a-select
              v-model:value="editForm.deviceModel"
              class="form-select"
              placeholder="请选择"
              :loading="deviceModelLoading"
            >
              <a-select-option value="">请选择</a-select-option>
              <a-select-option v-for="option in deviceModelOptionsForForm" :key="option.value" :value="option.value">{{ option.label }}</a-select-option>
            </a-select>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 产品型号</label>
            <a-input
              v-model:value="editForm.productModel"
              class="form-input"
              placeholder="请输入"
            />
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 产品名称</label>
            <a-input
              v-model:value="editForm.productName"
              class="form-input"
              placeholder="请输入"
            />
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 产品类型</label>
            <a-auto-complete
              v-model:value="editForm.productType"
              class="form-input"
              placeholder="请输入"
              :maxlength="10"
              show-count
              :options="productTypeSuggestions"
            />
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 颜色</label>
            <a-auto-complete
              v-model:value="editForm.color"
              class="form-input"
              placeholder="请输入"
              :maxlength="10"
              show-count
              :options="colorSuggestions"
            />
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 产品详情</label>
            <a-textarea
              v-model:value="editForm.productDetails"
              class="form-textarea"
              placeholder="请输入"
              :rows="3"
            />
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> IP角色名称</label>
            <a-select
              v-model:value="editForm.ipRoleName"
              class="form-select"
              placeholder="请选择"
              :loading="ipRoleLoading"
            >
              <a-select-option value="">请选择</a-select-option>
              <a-select-option v-for="option in ipRoleOptionsForForm" :key="option.value" :value="option.value">{{ option.label }}</a-select-option>
            </a-select>
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
import { ref, computed, onMounted } from 'vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme } from 'ant-design-vue';
import { ReloadOutlined, ColumnHeightOutlined ,SettingOutlined, SearchOutlined, ExportOutlined } from '@ant-design/icons-vue';
import draggable from 'vuedraggable';
import { useRouter } from 'vue-router';
import { Empty } from 'ant-design-vue';
import { 
  createColumnConfigs, 
  useTableColumns, 
  createColumn,
  type ColumnDefinition 
} from '../utils/tableConfig';
import { constructApiUrl } from '../utils/api';
import axios from 'axios';
import { message } from 'ant-design-vue';

const router = useRouter();

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '',
  },
}));

// Define your data interface
interface DataItem {
  id?: number;
  key?: number;
  productId: string; // 产品ID
  productModel: string; // 产品型号
  productName: string; // 产品名称
  productType: string; // 产品类型
  color: string; // 颜色
  productDetails: string; // 产品详情
  deviceModel: string; // 设备型号
  ipRoleName: string; // IP角色名称
  creator: string; // 创建人
  createTime: string; // 创建时间
  updateTime: string; // 更新时间
}

// Define column definitions - this is where you add/remove columns
const columnDefinitions: ColumnDefinition[] = [
  createColumn('rowIndex', '序号', 'rowIndex', 60, { fixed: 'left', sortable: true, sortType: 'number' }),
  createColumn('productId', '产品ID', 'productId', 150, { sortable: true, sortType: 'string' }),
  createColumn('productModel', '产品型号', 'productModel', 150, { sortable: true, sortType: 'string' }),
  createColumn('productName', '产品名称', 'productName', 200, { sortable: true, sortType: 'string' }),
  createColumn('productType', '产品类型', 'productType', 120, { sortable: true, sortType: 'string' }),
  createColumn('color', '颜色', 'color', 100, { sortable: true, sortType: 'string' }),
  createColumn('productDetails', '产品详情', 'productDetails', 250, { sortable: true, sortType: 'string' }),
  createColumn('deviceModel', '设备型号', 'deviceModel', 120, { sortable: true, sortType: 'string' }),
  createColumn('ipRoleName', 'IP名称', 'ipRoleName', 100, { sortable: true, sortType: 'string' }),
  createColumn('creator', '创建人', 'creator', 120, { sortable: true, sortType: 'string' }),
  createColumn('createTime', '创建时间', 'createTime', 180, { sortable: true, sortType: 'date' }),
  createColumn('updateTime', '更新时间', 'updateTime', 180, { sortable: true, sortType: 'date' }),
  createColumn('operation', '操作', 'operation', 200, { fixed: 'right' }),
];

// Create column configs from definitions
const columnConfigs = createColumnConfigs(columnDefinitions);

// Add custom render for rowIndex column
const updatedColumnConfigs = columnConfigs.map(config => {
  if (config.key === 'rowIndex') {
    return {
      ...config,
      customRender: ({ index }: { index: number }) => (currentPage.value - 1) * pageSize.value + index + 1
    };
  }
  return config;
});

// Use the table columns composable
const {
  columns,
  columnOrder,
  selectedColumnKeys,
  sorterInfo,
  resetColumns,
  onColumnOrderChange,
  handleColumnVisibilityChange,
  handleTableChange: baseHandleTableChange,
} = useTableColumns(updatedColumnConfigs);

// Custom handleTableChange function to handle pagination and sorting
const handleTableChange = (
  paginationData: any,
  filters: any,
  sorter: any,
) => {
  console.log('Table change:', paginationData, filters, sorter);
  
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
    // When sorting is cleared, reset to default
    sorterInfo.value = {
      columnKey: '',
      order: undefined,
    };
  }
};

// Replace static data with reactive data
const rawData = ref<DataItem[]>([]);
const loading = ref(false);

// API functions
const fetchProductTypes = async () => {
  try {
    loading.value = true;
    const response = await axios.get(constructApiUrl('product-type'));
    
    console.log('=== FETCH PRODUCT TYPES DEBUG ===');
    console.log('Raw API response:', response);
    console.log('Response data:', response.data);
    console.log('Response data type:', typeof response.data);
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      console.log('First existing product item:', response.data[0]);
      console.log('First item keys:', Object.keys(response.data[0]));
      console.log('First item values:', Object.values(response.data[0]));
      console.log('First item types:', Object.entries(response.data[0]).map(([key, value]) => `${key}: ${typeof value}`));
    }
    
    // Transform the data to ensure all required fields are present
    rawData.value = response.data.map((item: any, index: number) => ({
      id: item.id,
      key: index + 1, // Ensure key is always a number
      productId: item.productId || item.product_id || '',
      productModel: item.productModel || item.product_model || '',
      productName: item.productName || item.product_name || '',
      productType: item.productType || item.product_type || '',
      color: item.color || '',
      productDetails: item.productDetails || item.product_details || '',
      deviceModel: item.deviceModel || item.device_model || '',
      // ipRoleName: item.ipRoleName || item.ip_role_name || item.ip_name||'',
      ipRoleName:item.ipName,   creator: item.creator || '',
      createTime: item.createTime || item.create_time || '',
      updateTime: item.updateTime || item.update_time || ''
    }));
  } catch (error) {
    console.error('Error fetching product types:', error);
    // Show error message to user instead of falling back to static data
    message.error('获取产品类型数据失败，请检查网络连接');
    rawData.value = [];
  } finally {
    loading.value = false;
  }
};

// Fetch device model options from DeviceType API
const deviceModelOptionsForForm = ref<Array<{ value: string; label: string }>>([]);
const deviceModelLoading = ref(false);

const fetchDeviceModelOptions = async () => {
  try {
    deviceModelLoading.value = true;
    console.log('Fetching device model options...');
    console.log('API URL:', constructApiUrl('device-type'));
    
    const response = await axios.get(constructApiUrl('device-type'));
    console.log('Device type API response:', response);
    console.log('Response data:', response.data);
    console.log('Response data type:', typeof response.data);
    console.log('Response data length:', Array.isArray(response.data) ? response.data.length : 'Not an array');
    
    // Handle paginated response structure
    const dataArray = response.data.data || response.data;
    console.log('Data array to process:', dataArray);
    
    if (dataArray && Array.isArray(dataArray)) {
      // Debug: Show the first few items to see actual field names
      if (dataArray.length > 0) {
        console.log('First item structure:', dataArray[0]);
        console.log('First item keys:', Object.keys(dataArray[0]));
      }
      
      // Extract device model IDs from the response
      const options = dataArray
        .filter((item: any) => {
          console.log('Checking item:', item);
          const hasDeviceModel = item.deviceModelId || item.device_model_id;
          console.log('Has device model:', hasDeviceModel);
          return hasDeviceModel;
        })
        .map((item: any) => {
          const value = item.deviceModelId || item.device_model_id;
          console.log('Mapping device model:', value);
          return {
            value: value,
            label: value
          };
        });
      
      console.log('Extracted device model options:', options);
      deviceModelOptionsForForm.value = options;
    } else {
      console.log('No valid data in device type response');
      console.log('Response structure:', response.data);
      deviceModelOptionsForForm.value = [];
    }
  } catch (error: any) {
    console.error('Error fetching device model options:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    deviceModelOptionsForForm.value = [];
  } finally {
    deviceModelLoading.value = false;
  }
};

// Fetch IP role options from IP Management API
const ipRoleOptionsForForm = ref<Array<{ value: string; label: string }>>([]);
const ipRoleLoading = ref(false);

const fetchIpRoleOptions = async () => {
  try {
    ipRoleLoading.value = true;
    console.log('Fetching IP role options...');
    console.log('API URL:', constructApiUrl('ip-management'));
    
    const response = await axios.get(constructApiUrl('ip-management'));
    console.log('IP management API response:', response);
    console.log('Response data:', response.data);
    console.log('Response data type:', typeof response.data);
    console.log('Response data length:', Array.isArray(response.data) ? response.data.length : 'Not an array');
    
    // Handle paginated response structure
    const dataArray = response.data.data || response.data;
    console.log('Data array to process:', dataArray);
    
    if (dataArray && Array.isArray(dataArray)) {
      // Debug: Show the first few items to see actual field names
      if (dataArray.length > 0) {
        console.log('First IP item structure:', dataArray[0]);
        console.log('First IP item keys:', Object.keys(dataArray[0]));
      }
      
      // Extract IP role names from the response
      const options = dataArray
        .filter((item: any) => {
          console.log('Checking IP item:', item);
          const hasIpRole = item.ipName; // Use ipName field from IPManagement.vue
          console.log('Has IP role:', hasIpRole);
          return hasIpRole;
        })
        .map((item: any) => {
          const value = item.ipName; // Use ipName field from IPManagement.vue
          console.log('Mapping IP role:', value);
          return {
            value: value,
            label: value
          };
        });
      
      console.log('Extracted IP role options:', options);
      ipRoleOptionsForForm.value = options;
    } else {
      console.log('No valid data in IP management response');
      console.log('Response structure:', response.data);
      ipRoleOptionsForForm.value = [];
    }
  } catch (error: any) {
    console.error('Error fetching IP role options:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    ipRoleOptionsForForm.value = [];
  } finally {
    ipRoleLoading.value = false;
  }
};

const createProductType = async (productTypeData: {
  product_id: string;
  device_model: string;
  product_model: string;
  product_name: string;
  product_type: string;
  color: string;
  product_details: string;
  ip_name: string;
  creator: string;
  create_time: string;
  update_time: string;
}) => {
  try {
    console.log('=== CREATE PRODUCT DEBUG ===');
    console.log('API URL:', constructApiUrl('product-type'));
    console.log('Request data being sent:', productTypeData);
    console.log('Request data type:', typeof productTypeData);
    console.log('Request data keys:', Object.keys(productTypeData));
    
    const response = await axios.post(constructApiUrl('product-type'), productTypeData);
    console.log('Success response:', response);
    await fetchProductTypes(); // Refresh data
    return response.data;
  } catch (error: any) {
    console.error('=== CREATE PRODUCT ERROR ===');
    console.error('Error object:', error);
    console.error('Error response:', error.response);
    console.error('Error status:', error.response?.status);
    console.error('Error statusText:', error.response?.statusText);
    console.error('Error data:', error.response?.data);
    console.error('Error message:', error.message);
    console.error('Error config:', error.config);
    throw error;
  }
};

const updateProductType = async (id: number, productTypeData: Partial<DataItem>) => {
  try {
    const response = await axios.put(constructApiUrl(`product-type/${id}`), productTypeData);
    await fetchProductTypes(); // Refresh data
    return response.data;
  } catch (error) {
    console.error('Error updating product type:', error);
    throw error;
  }
};

const deleteProductType = async (id: number) => {
  try {
    await axios.delete(constructApiUrl(`product-type/${id}`));
    await fetchProductTypes(); // Refresh data
  } catch (error) {
    console.error('Error deleting product type:', error);
    throw error;
  }
};

// Filter and search logic
const searchInputValue = ref('');

// Handle search parameter from URL
onMounted(() => {
  if (router.currentRoute.value.query.search) {
    searchInputValue.value = router.currentRoute.value.query.search as string;
  }
  fetchProductTypes(); // Fetch data on component mount
  fetchDeviceModelOptions(); // Fetch device model options on component mount
  fetchIpRoleOptions(); // Fetch IP role options on component mount
});

// Computed property to show no data message
const showNoDataMessage = computed(() => {
  return filteredData.value.length === 0;
});

// Computed property for no data message
const noDataMessage = computed(() => {
  if (searchInputValue.value && filteredData.value.length === 0) {
    return `未找到包含 "${searchInputValue.value}" 的数据`;
  }
  if (deviceModelValue.value.value !== 'all' || productTypeValue.value.value !== 'all' || ipNameValue.value.value !== 'all') {
    return '当前筛选条件下没有找到匹配的数据';
  }
  if (rawData.value.length === 0 && !loading.value) {
    return '暂无数据';
  }
  return '没有找到匹配的数据';
});

const clearSearch = () => {
  searchInputValue.value = '';
};

const clearAllFilters = () => {
  deviceModelValue.value = { key: 'all', label: '全部', value: 'all' };
  productTypeValue.value = { key: 'all', label: '全部', value: 'all' };
  ipNameValue.value = { key: 'all', label: '全部', value: 'all' };
  searchInputValue.value = ''; // Clear search input as well
};

const deviceModelValue = ref({ key: 'all', label: '全部', value: 'all' });
const productTypeValue = ref({ key: 'all', label: '全部', value: 'all' });
const ipNameValue = ref({ key: 'all', label: '全部', value: 'all' });
const tableSize = ref('middle');
const currentPage = ref(1);
const pageSize = ref(10);

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

const productTypeOptions = computed(() => {
  const uniqueProductTypes = Array.from(new Set(rawData.value.map(item => item.productType)));
  const options = uniqueProductTypes.map(type => ({
    key: type,
    value: type,
    label: type,
  }));
  return [
    { key: 'all', value: 'all', label: '全部' },
    ...options
  ];
});

const ipNameOptions = computed(() => {
  // Mock IP role options since not in the data
  return [
    { key: 'all', value: 'all', label: '全部' },
    { key: 'ip1', value: 'IP1', label: 'IP1' },
    { key: 'ip2', value: 'IP2', label: 'IP2' },
    { key: 'ip3', value: 'IP3', label: 'IP3' },
  ];
});

const handleDeviceModelChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    deviceModelValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    deviceModelValue.value = val;
  }
};

const handleProductTypeChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    productTypeValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    productTypeValue.value = val;
  }
};

const handleIpNameChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    ipNameValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    ipNameValue.value = val;
  }
};

const filteredData = computed(() => {
  let dataToFilter = rawData.value;

  // Search filter
  if (searchInputValue.value) {
    const searchTerm = searchInputValue.value.toLowerCase();
    dataToFilter = dataToFilter.filter((item: DataItem) => {
      return Object.values(item).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(searchTerm)
      );
    });
  }

  // Device model filter
  if (deviceModelValue.value && deviceModelValue.value.value !== 'all') {
    dataToFilter = dataToFilter.filter(item => item.deviceModel === deviceModelValue.value.value);
  }

  // Product type filter
  if (productTypeValue.value && productTypeValue.value.value !== 'all') {
    dataToFilter = dataToFilter.filter(item => item.productType === productTypeValue.value.value);
  }

  // IP role filter (mock implementation)
  if (ipNameValue.value && ipNameValue.value.value !== 'all') {
    // Since IP role is not in the data, we'll filter by some other criteria
    dataToFilter = dataToFilter.filter(item => item.productId.includes(ipNameValue.value.value));
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

// Paginated data for display
const paginatedData = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filteredData.value.slice(startIndex, endIndex);
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
    currentPage.value = current;
    pageSize.value = size;
  },
  onChange: (page: number, size: number) => {
    currentPage.value = page;
    pageSize.value = size;
  },
}));

const onRefresh = () => {
  console.log('Refresh button clicked!');
  searchInputValue.value = '';
  currentPage.value = 1;
  resetColumns(); // Reset column order and visibility
  fetchProductTypes(); // Fetch fresh data from API
};

const handleMenuClick = ({ key }: { key: string }) => {
  tableSize.value = key;
};

const onSettingClick = () => {
  console.log('Setting clicked');
};

// Action handlers
const handleCreateProduct = () => {
  console.log('Create product clicked');
  showCreateModal.value = true;
};

const handleExport = () => {
  console.log('Export clicked');
};

const handleView = (record: DataItem) => {
  console.log('View:', record);
};

const handleEdit = (record: DataItem) => {
  console.log('Edit:', record);
  editForm.value = { ...record }; // Pre-fill edit form
  showEditModal.value = true;
};

const handleDelete = (record: DataItem) => {
  console.log('Delete:', record);
};

const handleDeviceModelClick = (record: DataItem) => {
  console.log('Device model clicked:', record.deviceModel);
  router.push({ name: 'device-type', query: { search: record.deviceModel } });
};

const handleIpNameClick = (record: DataItem) => {
  console.log('IP name clicked:', record.ipRoleName);
  router.push({ name: 'ip-management', query: { search: record.ipRoleName } });
};

// Handle delete record
const handleDeleteRecord = async (record: DataItem) => {
  try {
    if (record.id) {
      await deleteProductType(record.id);
    }
  } catch (error) {
    console.error('Error deleting record:', error);
  }
};

// Modal state and form
const showCreateModal = ref(false);
const createForm = ref({
  deviceModel: '',
  productModel: '',
  productName: '',
  productType: '',
  color: '',
  productDetails: '',
  ipRoleName: ''
});

// Suggestions for autocomplete fields
const productTypeSuggestions = ref([
  { value: '蓝牙配件' },
  { value: '智能玩具' },
  { value: '教育设备' },
  { value: '盲盒配件' }
]);

const colorSuggestions = ref([
  { value: '红色' },
  { value: '蓝色' },
  { value: '绿色' },
  { value: '黄色' },
  { value: '黑色' },
  { value: '白色' }
]);

// Handle device model change in create form to auto-generate product model
const handleDeviceModelChangeInForm = (value: string) => {
  if (value) {
    // Auto-generate product model based on device model
    createForm.value.productModel = `${value}001`;
  } else {
    createForm.value.productModel = '';
  }
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  // Reset form
  createForm.value = {
    deviceModel: '',
    productModel: '',
    productName: '',
    productType: '',
    color: '',
    productDetails: '',
    ipRoleName: ''
  };
};

const handleCreateConfirm = async () => {
  try {
    // Validate required fields
    if (!createForm.value.deviceModel) {
      message.error('请选择设备型号');
      return;
    }
    if (!createForm.value.productName) {
      message.error('请输入产品名称');
      return;
    }
    if (!createForm.value.productType) {
      message.error('请输入产品类型');
      return;
    }
    if (!createForm.value.color) {
      message.error('请输入颜色');
      return;
    }
    if (!createForm.value.productDetails) {
      message.error('请输入产品详情');
      return;
    }
    if (!createForm.value.ipRoleName) {
      message.error('请选择IP角色名称');
      return;
    }

    // Prepare data for API - use correct field names that match database schema
    const newProductData = {
      product_id: `${createForm.value.deviceModel}_${Date.now()}`,
      device_model: createForm.value.deviceModel,
      product_model: createForm.value.productModel,
      product_name: createForm.value.productName,
      product_type: createForm.value.productType,
      color: createForm.value.color,
      product_details: createForm.value.productDetails,
      ip_name: createForm.value.ipRoleName, // Fixed: use ip_name to match database column
      creator: '管理员', // Required field
      create_time: new Date().toISOString(), // Required field
      update_time: new Date().toISOString() // Required field
    };

    console.log('Creating new product with corrected data:', newProductData);

    // Call API to create product
    await createProductType(newProductData);
    
    // Show success message
    message.success('产品创建成功！');
    
    // Close modal and reset form
    closeCreateModal();
    
    // Refresh the table data
    await fetchProductTypes();
    
  } catch (error: any) {
    console.error('Error creating product:', error);
    
    // Show specific error message
    if (error.response?.data?.error) {
      message.error(`创建失败: ${error.response.data.error}`);
    } else if (error.response?.data?.message) {
      message.error(`创建失败: ${error.response.data.message}`);
    } else if (error.message) {
      message.error(`创建失败: ${error.message}`);
    } else {
      message.error('产品创建失败，请检查网络连接');
    }
  }
};

const showEditModal = ref(false);
const editForm = ref<Partial<DataItem>>({
  key: 0, // Ensure key is always a number
  deviceModel: '',
  productModel: '',
  productName: '',
  productType: '',
  color: '',
  productDetails: '',
  ipRoleName: ''
});

const closeEditModal = () => {
  showEditModal.value = false;
  // Reset form
  editForm.value = {
    key: 0, // Ensure key is always a number
    deviceModel: '',
    productModel: '',
    productName: '',
    productType: '',
    color: '',
    productDetails: '',
    ipRoleName: ''
  };
};

const handleEditConfirm = () => {
  console.log('Edit product form submitted:', editForm.value);
  // Here you would typically send the data to your API
  closeEditModal();
};

onMounted(() => {
  selectedColumnKeys.value = columnConfigs.map(config => config.key);
});

defineExpose({
  handleTableChange,
});
</script>

<style scoped>
/* Reuse the same styles from Account.vue */
.title-container {
  padding: 10px 14px;
  margin-bottom: 10px;
  background-color: #fff;
  border-radius: 4px;
}

.title-container h2 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.85);
  text-align: left;
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

.right-aligned-icons {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-right: 60px;
}

.right-aligned-icons > .anticon {
  padding: 6px 8px;
  border: 1px solid #d9d9d9;
  background-color: #f0f0f0;
  border-radius: 4px;
  transition: all 0.3s;
  cursor: pointer;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.65);
}

.right-aligned-icons > .anticon:hover {
  border-color: #4096ff;
  color: #4096ff;
  background-color: #e6f7ff;
}

.table-container {
  padding: 10px;
  padding-right: 50px;
}

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
  padding-left: 10px;
}

:deep(.ant-select-selector) {
  padding-left: 60px !important;
}

:deep(.device-model-select .ant-select-selector) {
  padding-left: 80px !important;
}

:deep(.product-type-select .ant-select-selector) {
  padding-left: 80px !important;
}

:deep(.ip-name-select .ant-select-selector) {
  padding-left: 50px !important;
}

:deep(.ant-select-selector),
:deep(.ant-select-dropdown),
:deep(.ant-select-item),
:deep(.ant-select-selection-item),
:deep(.ant-select-item-option-content) {
  font-size: 12px !important;
}

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

:deep(.ant-table-cell .action-cell) {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 150px;
}

:deep(.ant-table-cell .action-cell .view-link) {
  color: #1890ff !important;
  font-weight: bold;
}

:deep(.ant-table-cell .action-cell .edit-link) {
  color: #1890ff !important;
  font-weight: bold;
}

:deep(.ant-table-cell .action-cell .danger-link) {
  color: #ff4d4f !important;
  font-weight: bold;
}

:deep(.link-text) {
  color: #1890ff !important;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.3s ease;
}

:deep(.link-text:hover) {
  color: #40a9ff !important;
  text-decoration: underline;
}

:deep(.link-text:active) {
  color: #096dd9 !important;
}

/* Hyperlink styling for table cells */
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

:deep(.creator-cell) {
  display: flex;
  align-items: center;
}

:deep(.nowrap-header) {
  white-space: nowrap !important;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  font-size: 18px;
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

.modal-body {
  padding: 24px 0 24px 0; /* Remove left and right padding */
}

.form-group {
  margin-bottom: 16px;
  padding: 0 24px; /* Add padding only to form groups */
}

.required-field {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
}

.asterisk {
  color: #ff4d4f;
  font-size: 14px;
  font-weight: bold;
}

/* Override Ant Design component styles to remove left padding */
:deep(.ant-select),
:deep(.ant-input),
:deep(.ant-input-affix-wrapper),
:deep(.ant-select-selector) {
  padding-left: 8px !important; /* Reduce left padding */
}

:deep(.ant-select-selection-placeholder),
:deep(.ant-input::placeholder) {
  padding-left: 0 !important; /* Remove placeholder left padding */
}

:deep(.ant-select-selection-item) {
  padding-left: 0 !important; /* Remove selected item left padding */
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  /* padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  background-color: white;
  transition: border-color 0.3s; */
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(0, 0, 0, 0.25);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
}

.btn {
  padding: 4px 15px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.3s;
}

.btn-secondary {
  background-color: white;
  border-color: #d9d9d9;
  color: rgba(0, 0, 0, 0.85);
}

.btn-secondary:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.btn-primary {
  background-color: #1890ff;
  border-color: #1890ff;
  color: white;
}

.btn-primary:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
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

.no-data-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>
