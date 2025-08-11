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
              style="width: 120px;"
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
        <div class="select-container pbm-select" style="margin-right: 16px;">
          <span class="select-always-placeholder">PBM:</span>
          <a-tooltip :title="pbmValue.label">
            <a-select
              v-model:value="pbmValue"
              style="width: 100px;"
              :options="pbmOptions"
              @change="handlePbmChange"
              :allowClear="true"
              label-in-value
              placeholder="请选择PBM"
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
        <ExportOutlined @click="handleExport" />
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
          <template v-if="column.key === 'ipName'">
            <a class="link-text" @click="handleIpNameClick(record)">{{ record.ipName }}</a>
          </template>
          <template v-if="column.key === 'creator'">
            <div class="creator-cell">
              <a-avatar size="small" style="margin-right: 8px;">{{ record.creator.charAt(0) }}</a-avatar>
              <span>{{ record.creator }}</span>
            </div>
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
          <a-button type="primary" @click="clearSearch">清除搜索</a-button>
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
            <select v-model="createForm.deviceModel" class="form-select">
              <option value="">请选择</option>
              <option value="HWSZ001">HWSZ001</option>
              <option value="HWSZ002">HWSZ002</option>
            </select>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 产品型号</label>
            <input type="text" v-model="createForm.productModel" class="form-input" placeholder="请输入">
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 产品名称</label>
            <input type="text" v-model="createForm.productName" class="form-input" placeholder="请输入">
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 产品类型</label>
            <select v-model="createForm.productType" class="form-select">
              <option value="">请选择</option>
              <option value="蓝牙配件">蓝牙配件</option>
              <option value="智能玩具">智能玩具</option>
              <option value="教育设备">教育设备</option>
            </select>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 颜色</label>
            <input type="text" v-model="createForm.color" class="form-input" placeholder="请输入">
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 产品详情</label>
            <textarea v-model="createForm.productDetails" class="form-textarea" placeholder="请输入" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> IP名称</label>
            <select v-model="createForm.ipName" class="form-select">
              <option value="">请选择</option>
              <option value="IP001">IP001</option>
              <option value="IP002">IP002</option>
              <option value="IP003">IP003</option>
            </select>
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
            <select v-model="editForm.deviceModel" class="form-select">
              <option value="">请选择</option>
              <option value="HWSZ001">HWSZ001</option>
              <option value="HWSZ002">HWSZ002</option>
            </select>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 产品型号</label>
            <input type="text" v-model="editForm.productModel" class="form-input" placeholder="请输入">
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 产品名称</label>
            <input type="text" v-model="editForm.productName" class="form-input" placeholder="请输入">
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 产品类型</label>
            <select v-model="editForm.productType" class="form-select">
              <option value="">请选择</option>
              <option value="蓝牙配件">蓝牙配件</option>
              <option value="智能玩具">智能玩具</option>
              <option value="教育设备">教育设备</option>
              <option value="盲盒配件">盲盒配件</option>
            </select>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 颜色</label>
            <input type="text" v-model="editForm.color" class="form-input" placeholder="请输入">
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> 产品信息</label>
            <textarea v-model="editForm.productDetails" class="form-textarea" placeholder="请输入" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label class="required-field"><span class="asterisk">*</span> IP名称</label>
            <select v-model="editForm.ipName" class="form-select">
              <option value="">请选择</option>
              <option value="IP001">IP001</option>
              <option value="IP002">IP002</option>
              <option value="IP003">IP003</option>
              <option value="蝴蝶">蝴蝶</option>
            </select>
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
import { message, Modal } from 'ant-design-vue';

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
  ipName: string; // IP名称
  creator: string; // 创建人
  createTime: string; // 创建时间
  updateTime: string; // 更新时间
}

// Define column definitions - this is where you add/remove columns
const columnDefinitions: ColumnDefinition[] = [
  createColumn('rowIndex', '序号', 'rowIndex', 60, { fixed: 'left' }),
  createColumn('productId', '产品ID', 'productId', 150, { sortable: true, sortType: 'string' }),
  createColumn('productModel', '产品型号', 'productModel', 150, { sortable: true, sortType: 'string' }),
  createColumn('productName', '产品名称', 'productName', 200, { sortable: true, sortType: 'string' }),
  createColumn('productType', '产品类型', 'productType', 120, { sortable: true, sortType: 'string' }),
  createColumn('color', '颜色', 'color', 100, { sortable: true, sortType: 'string' }),
  createColumn('productDetails', '产品详情', 'productDetails', 250),
  createColumn('deviceModel', '设备型号', 'deviceModel', 120),
  createColumn('ipName', 'IP名称', 'ipName', 100),
  createColumn('creator', '创建人', 'creator', 120),
  createColumn('createTime', '创建时间', 'createTime', 180, { sortable: true, sortType: 'date' }),
  createColumn('updateTime', '更新时间', 'updateTime', 180, { sortable: true, sortType: 'date' }),
  createColumn('operation', '操作', 'operation', 150, { fixed: 'right' }),
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
    
    // Transform the data to ensure all required fields are present
    rawData.value = response.data.map((item: any, index: number) => ({
      id: item.id || item.ID || index + 1,
      key: index + 1, // Ensure key is always a number
      productId: item.productId || item.product_id || item.productId || '',
      productModel: item.productModel || item.product_model || item.productModel || '',
      productName: item.productName || item.product_name || item.productName || '',
      productType: item.productType || item.product_type || item.productType || '',
      color: item.color || item.Color || '',
      productDetails: item.productDetails || item.product_details || item.productDetails || '',
      deviceModel: item.deviceModel || item.device_model || item.deviceModel || '',
      ipName: item.ipName || item.ip_name || item.ipName || '',
      creator: item.creator || item.Creator || item.creator || '未知',
      createTime: item.createTime || item.create_time || item.CreateTime || '',
      updateTime: item.updateTime || item.update_time || item.UpdateTime || ''
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

const createProductType = async (productTypeData: Omit<DataItem, 'key' | 'id' | 'createTime' | 'updateTime'>) => {
  try {
    const response = await axios.post(constructApiUrl('product-type'), productTypeData);
    await fetchProductTypes(); // Refresh data
    return response.data;
  } catch (error) {
    console.error('Error creating product type:', error);
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
};

const deviceModelValue = ref({ key: 'all', label: '全部', value: 'all' });
const productTypeValue = ref({ key: 'all', label: '全部', value: 'all' });
const pbmValue = ref({ key: 'all', label: '全部', value: 'all' });
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

const pbmOptions = computed(() => {
  // Mock PBM options since not in the data
  return [
    { key: 'all', value: 'all', label: '全部' },
    { key: 'pbm1', value: 'PBM1', label: 'PBM1' },
    { key: 'pbm2', value: 'PBM2', label: 'PBM2' },
    { key: 'pbm3', value: 'PBM3', label: 'PBM3' },
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

const handlePbmChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    pbmValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    pbmValue.value = val;
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

  // PBM filter (mock implementation)
  if (pbmValue.value && pbmValue.value.value !== 'all') {
    // Since PBM is not in the data, we'll filter by some other criteria
    dataToFilter = dataToFilter.filter(item => item.productId.includes(pbmValue.value.value));
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

const handleDelete = async (record: DataItem) => {
  try {
    // Show confirmation dialog using Modal.confirm
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除产品 "${record.productName}" 吗？此操作不可撤销。`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        if (record.id) {
          await deleteProductType(record.id);
          message.success('产品删除成功');
        }
      },
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    message.error('删除产品失败，请重试');
  }
};

const handleDeviceModelClick = (record: DataItem) => {
  console.log('Device model clicked:', record.deviceModel);
  router.push({
    path: '/devicetype',
    query: {
      search: record.deviceModel,
    },
  });
};

const handleIpNameClick = (record: DataItem) => {
  console.log('IP name clicked:', record.ipName);
  router.push({
    path: '/ip-management',
    query: {
      search: record.ipName,
    },
  });
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
  ipName: ''
});

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
    ipName: ''
  };
};

const handleCreateConfirm = async () => {
  try {
    console.log('Create product form submitted:', createForm.value);
    
    // Validate required fields
    if (!createForm.value.deviceModel || !createForm.value.productModel || 
        !createForm.value.productName || !createForm.value.productType || 
        !createForm.value.color || !createForm.value.productDetails || !createForm.value.ipName) {
      message.error('请填写所有必填字段');
      return;
    }
    
    // Call API to create product
    await createProductType({
      productId: createForm.value.productModel, // Use productModel as productId
      productModel: createForm.value.productModel,
      productName: createForm.value.productName,
      productType: createForm.value.productType,
      color: createForm.value.color,
      productDetails: createForm.value.productDetails,
      deviceModel: createForm.value.deviceModel,
      ipName: createForm.value.ipName,
      creator: '当前用户', // You might want to get this from user context
    });
    
    message.success('产品创建成功');
    closeCreateModal();
  } catch (error) {
    console.error('Error creating product:', error);
    message.error('创建产品失败，请重试');
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
  ipName: ''
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
    ipName: ''
  };
};

const handleEditConfirm = async () => {
  try {
    console.log('Edit product form submitted:', editForm.value);
    
    // Validate required fields
    if (!editForm.value.deviceModel || !editForm.value.productModel || 
        !editForm.value.productName || !editForm.value.productType || 
        !editForm.value.color || !editForm.value.productDetails || !editForm.value.ipName) {
      message.error('请填写所有必填字段');
      return;
    }
    
    // Call API to update product
    if (editForm.value.id) {
      await updateProductType(editForm.value.id, {
        productId: editForm.value.productModel, // Use productModel as productId
        productModel: editForm.value.productModel,
        productName: editForm.value.productName,
        productType: editForm.value.productType,
        color: editForm.value.color,
        productDetails: editForm.value.productDetails,
        deviceModel: editForm.value.deviceModel,
        ipName: editForm.value.ipName,
      });
      
      message.success('产品更新成功');
      closeEditModal();
    }
  } catch (error) {
    console.error('Error updating product:', error);
    message.error('更新产品失败，请重试');
  }
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
  padding-right: 30px;
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

:deep(.pbm-select .ant-select-selector) {
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
  padding: 24px;
}

.form-group {
  margin-bottom: 16px;
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

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  background-color: white;
  transition: border-color 0.3s;
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
</style>
