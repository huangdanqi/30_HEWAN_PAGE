<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>玩具生产</h2>
    </div>

    <!-- select item area -->
    <div class="top-controls-wrapper">
      <div class="left-aligned-section">



        <div class="select-container product-name-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">产品名称:</span>
          <a-tooltip :title="productNameValue.label">
            <a-select
              v-model:value="productNameValue"
              style="width: 120px;"
              :options="productNameOptions"
              @change="handleProductNameChange"
              :allowClear="true"
              label-in-value
              class="product-name-select"
            >
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div>
        <div class="select-container manufacturer-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">生产厂家:</span>
          <a-tooltip :title="manufacturerValue.label">
            <a-select
              v-model:value="manufacturerValue"
              style="width: 120px;"
              :options="manufacturerOptions"
              @change="handleManufacturerChange"
              :allowClear="true"
              label-in-value
              class="manufacturer-select"
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
            v-model="searchInputValue"
            placeholder="输入关键字搜索"
            style="width: 200px"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
          <a-button type="primary" @click="showBatchModal = true">新增批次</a-button>
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
      
    <!-- Debug section -->
    <!-- <div style="background: #f0f0f0; padding: 10px; margin: 10px 0; border: 1px solid #ccc;">
      <h4>Debug Info:</h4>
      <p>rawData length: {{ rawData.length }}</p>
      <p>filteredData length: {{ filteredData.length }}</p>
      <p>columns length: {{ columns.length }}</p>
      <p>loading: {{ loading }}</p>
      <p>First item data: {{ filteredData[0] ? JSON.stringify(filteredData[0], null, 2) : 'No data' }}</p>
    </div> -->
    
    <!-- table area -->
    <div class="table-container">
      <!-- Show message when no data -->
      <div v-if="!loading && filteredData.length === 0" class="no-data-message">
        <a-empty description="暂无数据" />
      </div>
      
      <a-table
        v-else
        :columns="columns"
        :data-source="filteredData"
        :pagination="filteredData.length === 0 ? false : pagination"
        :loading="loading"
        :size="tableSize"
        :scroll="{ x: 1000 }"
        @change="handleTableChange"
        :showSorterTooltip="false"
        @edit-record="handleEditRecord"
      >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'operation'">
          <div class="action-cell">
            <a class="view-link" @click="handleViewRecord(record)">查看</a>
            <a-divider type="vertical" />
            <a class="edit-link" @click="handleEditRecord(record)">编辑</a>
            <a-divider type="vertical" />
            <a-popconfirm
              title="确定要删除该信息吗?"
              @confirm="$emit('delete-record', record)"
            >
              <a class="danger-link">删除</a>
            </a-popconfirm>
          </div>
        </template>
        <template v-else-if="column.key === 'rowIndex'">
          <span>{{ (currentPage - 1) * pageSize + index + 1 }}</span>
        </template>
        <template v-else-if="column.key === 'productModel'">
          <a 
            v-if="record[column.dataIndex]" 
            class="product-model-link" 
            @click="router.push({ path: '/product-type', query: { search: record[column.dataIndex] }})"
          >
            {{ record[column.dataIndex] }}
          </a>
          <span v-else>-</span>
        </template>
        <template v-else>
          <span>{{ record[column.dataIndex] || '' }}</span>
        </template>
      </template>
      </a-table>
    </div>

    <FirmwareReleaseModal
      :open="showReleaseModal"
      :uniqueDeviceModels="uniqueDeviceModels"
      @update:open="handleReleaseModalClose"
      @submit="handleReleaseModalSubmit"
    />

    <FirmwareEditModal
      :open="showEditModal"
      :record="editRecord"
      @update:open="handleEditModalClose"
      @submit="handleEditModalSubmit"
    />

    <ProductCreateModal
      v-model:open="showProductCreateModal"
      :deviceModelOptions="deviceModelOptions"
      :ipNameOptions="[]"
      @submit="handleProductCreateSubmit"
    />

    <a-modal
      v-model:open="showBatchModal"
      title="新增批次"
      @ok="handleBatchOk"
      @cancel="handleBatchModalClose"
      width="500px"
    >
      <a-form layout="vertical" :model="batchFormData" :rules="batchFormRules" ref="batchFormRef">
        <a-form-item required label="产品名称" name="productName">
          <a-select 
            v-model:value="batchFormData.productName" 
            placeholder="请选择"
            show-search
            :options="productNameOptions"
            :filter-option="filterProductOptions"
          />
        </a-form-item>
        <a-form-item required label="生产批次" name="productionBatch">
          <a-date-picker 
            v-model:value="batchFormData.productionBatch" 
            style="width: 100%;" 
            placeholder="请选择"
            format="YYYY-MM-DD"
          />
        </a-form-item>
        <a-form-item required label="生产厂家" name="manufacturer">
          <a-auto-complete
            v-model:value="batchFormData.manufacturer"
            placeholder="请输入"
            :maxlength="15"
            :options="batchManufacturerOptions"
            @input="handleManufacturerInput"
            allow-clear
          />
        </a-form-item>
        <a-form-item required label="单价" name="unitPrice">
          <a-input 
            v-model:value="batchFormData.unitPrice" 
            suffix="元" 
            placeholder="请输入"
            type="number"
            step="0.01"
            min="0"
          />
        </a-form-item>
        <a-form-item required label="数量" name="quantity">
          <a-input 
            v-model:value="batchFormData.quantity" 
            suffix="个" 
            placeholder="请输入"
            type="number"
            min="1"
            step="1"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Edit Batch Modal -->
    <a-modal
      v-model:open="showEditBatchModal"
      title="编辑批次"
      @ok="handleEditBatchOk"
      @cancel="handleEditBatchModalClose"
      width="500px"
    >
      <a-form layout="vertical" :model="editBatchFormData" :rules="editBatchFormRules" ref="editBatchFormRef">
        <a-form-item required label="产品名称" name="productName">
          <a-select 
            v-model:value="editBatchFormData.productName" 
            placeholder="请选择"
            show-search
            :options="productNameOptions"
            :filter-option="filterProductOptions"
            :disabled="isEditFieldsDisabled"
            class="disabled-field"
          />
        </a-form-item>
        <a-form-item required label="生产批次" name="productionBatch">
          <a-date-picker 
            v-model:value="editBatchFormData.productionBatch" 
            style="width: 100%;" 
            placeholder="请选择"
            format="YYYY-MM-DD"
            :disabled="isEditFieldsDisabled"
            class="disabled-field"
          />
        </a-form-item>
        <a-form-item required label="生产厂家" name="manufacturer">
          <a-auto-complete
            v-model:value="editBatchFormData.manufacturer"
            placeholder="请输入"
            :maxlength="15"
            :options="batchManufacturerOptions"
            @input="handleEditManufacturerInput"
            allow-clear
            :disabled="isEditFieldsDisabled"
            class="disabled-field"
          />
        </a-form-item>
        <a-form-item required label="单价" name="unitPrice">
          <a-input 
            v-model:value="editBatchFormData.unitPrice" 
            suffix="元" 
            placeholder="请输入"
            type="number"
            step="0.01"
            min="0"
          />
        </a-form-item>
        <a-form-item required label="数量" name="quantity">
          <a-input-number
            v-model:value="editBatchFormData.quantity"
            suffix="个"
            placeholder="请输入"
            :min="1"
            :step="1"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>

  </a-config-provider>
</template>
<script lang="ts" setup>
import type { ColumnsType } from 'ant-design-vue/es/table';
import { ref, computed, onMounted, watch, h } from 'vue';
import { useRouter } from 'vue-router';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme, message, Empty } from 'ant-design-vue';
import { ReloadOutlined, ColumnHeightOutlined ,SettingOutlined, SearchOutlined} from '@ant-design/icons-vue';
import draggable from 'vuedraggable';
import axios from 'axios';
import FirmwareReleaseModal from '@/components/FirmwareReleaseModal.vue';
import FirmwareEditModal from '@/components/FirmwareEditModal.vue';
import ProductCreateModal from '@/components/ProductCreateModal.vue';
import { 
  createColumnConfigs, 
  useTableColumns, 
  createColumn,
  type ColumnDefinition 
} from '../utils/tableConfig';
import { constructApiUrl } from '../utils/api';
import dayjs from 'dayjs';

const router = useRouter();

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '', // Override the '页' suffix for quick jumper
  },
}));

interface DataItem {
  key: number;
  id?: number;
  rowIndex?: number; // Add rowIndex field
  productionBatchId: string; // 生产批次ID
  productModel: string; // 产品型号
  productName: string; // 产品名称
  productionBatchDate: string; // 生产批次 (date)
  manufacturer: string; // 生产厂家
  unitPrice: number; // 单价(元)
  quantity: number; // 数量(个)
  totalPrice: number; // 总价(元)
  updater: string; // 更新人
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
  defaultSortOrder?: 'ascend' | 'descend';
  customRender?: (record: any, index?: number) => any;
}

const columnConfigs = [
  { key: 'rowIndex', title: '序号', dataIndex: 'rowIndex', width: 60, fixed: 'left', sorter: (a: any, b: any) => a.rowIndex - b.rowIndex, sortDirections: ['ascend', 'descend'] },
  { key: 'productionBatchId', title: '生产批次ID', dataIndex: 'productionBatchId', width: 150, sorter: (a: any, b: any) => (a.productionBatchId || '').localeCompare(b.productionBatchId || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'productModel', title: '产品型号', dataIndex: 'productModel', width: 150, sorter: (a: any, b: any) => a.productModel.localeCompare(b.productModel), sortDirections: ['ascend', 'descend'] },
  { key: 'productName', title: '产品名称', dataIndex: 'productName', width: 200, sorter: (a: any, b: any) => a.productName.localeCompare(b.productName), sortDirections: ['ascend', 'descend'] },
  { key: 'productionBatchDate', title: '生产批次', dataIndex: 'productionBatchDate', width: 120, sorter: (a: any, b: any) => a.productionBatchDate.localeCompare(b.productionBatchDate), sortDirections: ['ascend', 'descend'] },
  { key: 'manufacturer', title: '生产厂家', dataIndex: 'manufacturer', width: 250, sorter: (a: any, b: any) => a.manufacturer.localeCompare(b.manufacturer), sortDirections: ['ascend', 'descend'] },
  { key: 'unitPrice', title: '单价(元)', dataIndex: 'unitPrice', width: 100, sorter: (a: any, b: any) => a.unitPrice - b.unitPrice, sortDirections: ['ascend', 'descend'] },
  { key: 'quantity', title: '数量(个)', dataIndex: 'quantity', width: 100, sorter: (a: any, b: any) => a.quantity - b.quantity, sortDirections: ['ascend', 'descend'] },
  { key: 'totalPrice', title: '总价(元)', dataIndex: 'totalPrice', width: 120, sorter: (a: any, b: any) => a.totalPrice - b.totalPrice, sortDirections: ['ascend', 'descend'] },
  { key: 'updater', title: '更新人', dataIndex: 'updater', width: 100, sorter: (a: any, b: any) => (a.updater || '').localeCompare(b.updater || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'createTime', title: '创建时间', dataIndex: 'createTime', width: 160, sorter: (a: any, b: any) => a.createTime.localeCompare(b.createTime), sortDirections: ['ascend', 'descend'] },
  { key: 'updateTime', title: '更新时间', dataIndex: 'updateTime', width: 160, sorter: (a: any, b: any) => a.updateTime.localeCompare(b.updateTime), sortDirections: ['ascend', 'descend'], defaultSortOrder: 'descend' },
  { key: 'operation', title: '操作', dataIndex: 'operation', width: 200, fixed: 'right' },
];

// Store column order and visibility separately
const columnOrder = ref<string[]>(columnConfigs.map(config => config.key));
const selectedColumnKeys = ref<string[]>(columnConfigs.map(config => config.key));

// Create columns from configs
const createColumnsFromConfigs = (configs: ColumnConfig[]): ColumnsType => {
  console.log('=== CREATE COLUMNS FROM CONFIGS ===');
  console.log('Input configs:', configs);
  
  const columns = configs.map(config => {
    console.log(`Processing config for key: ${config.key}`);
    
    // Simplified column creation for debugging
    const column = {
      title: config.title,
      dataIndex: config.dataIndex,
      key: config.key,
      width: config.width,
      fixed: config.fixed,
      sorter: config.sorter,
      sortDirections: config.sorter ? config.sortDirections : undefined,
      sortOrder: sorterInfo.value && config.key === sorterInfo.value.columnKey ? sorterInfo.value.order : undefined,
      defaultSortOrder: config.defaultSortOrder,
      customRender: config.customRender || (({ text, record }) => {
        // Handle hyperlink for productModel column
        if (config.key === 'productModel') {
          return text ? h('a', {
            style: { cursor: 'pointer' },
            onClick: () => router.push({ path: '/product-type', query: { search: text } })
          }, text) : '-';
        }
        // Handle updater column - show updater or fallback to creator
        if (config.key === 'updater') {
          const updaterValue = record.updater || record.creator;
          return updaterValue && updaterValue !== '' ? updaterValue : '未设置';
        }
        // Default rendering for other columns
        return text === undefined || text === null || text === '' ? '-' : text;
      }),
    };
    
    console.log(`Created column for ${config.key}:`, column);
    return column;
  }) as ColumnsType;
  
  console.log('Final columns:', columns);
  return columns;
};

// Computed property for visible columns
const columns = computed<ColumnsType>(() => {
  // Get visible configs based on selected keys and order
  const visibleConfigs = columnOrder.value
    .filter(key => selectedColumnKeys.value.includes(key))
    .map(key => columnConfigs.find(config => config.key === key))
    .filter(Boolean) as ColumnConfig[];

  console.log('=== COLUMNS COMPUTED ===');
  console.log('columnOrder:', columnOrder.value);
  console.log('selectedColumnKeys:', selectedColumnKeys.value);
  console.log('visibleConfigs:', visibleConfigs);

  // Create columns from visible configs
  const visibleColumns = createColumnsFromConfigs(visibleConfigs);
  console.log('visibleColumns:', visibleColumns);

  // Sort columns: fixed left, then unfixed, then fixed right
  const sortedColumns = visibleColumns.sort((a, b) => {
    const fixedOrder = { 'left': 1, undefined: 2, 'right': 3 };
    const aFixed = fixedOrder[a.fixed as keyof typeof fixedOrder] || 2;
    const bFixed = fixedOrder[b.fixed as keyof typeof fixedOrder] || 2;
    return aFixed - bFixed;
  });
  
  console.log('Final sorted columns:', sortedColumns);
  return sortedColumns;
});

// Generate virtual data for the new columns
const rawData = ref<DataItem[]>([]);
const loading = ref(false);
const total = ref<number>(0); // Ensure it's typed as number

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// API functions
const fetchToyProductionData = async () => {
  try {
    loading.value = true;
    console.log('=== STARTING API CALL ===');
    console.log('Fetching toy production data with page:', currentPage.value, 'pageSize:', pageSize.value);
    console.log('API URL:', constructApiUrl('toy-production'));
    
    const response = await axios.get(constructApiUrl('toy-production'), {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value
      }
    });
    
    console.log('=== API RESPONSE RECEIVED ===');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    console.log('Response data type:', typeof response.data);
    console.log('Response data keys:', response.data ? Object.keys(response.data) : 'No data');
    
    if (response.data && response.data.data) {
      // Server-side pagination response
      console.log('=== PROCESSING PAGINATED DATA ===');
      console.log('Data array length:', response.data.data.length);
      console.log('First item:', response.data.data[0]);
      
      if (response.data.data.length > 0) {
        const firstItem = response.data.data[0];
        console.log('First item keys:', Object.keys(firstItem));
        console.log('First item values:', Object.values(firstItem));
        
        // Check specific fields we need
        console.log('=== FIELD CHECK ===');
        console.log('productionBatchId:', firstItem.productionBatchId);
        console.log('productModel:', firstItem.productModel);
        console.log('productName:', firstItem.productName);
        console.log('productionBatchDate:', firstItem.productionBatchDate);
        console.log('manufacturer:', firstItem.manufacturer);
        console.log('unitPrice:', firstItem.unitPrice);
        console.log('quantity:', firstItem.quantity);
        console.log('totalPrice:', firstItem.totalPrice);
        console.log('updater:', firstItem.updater);
        console.log('createTime:', firstItem.createTime);
        console.log('updateTime:', firstItem.updateTime);
      }
      
      rawData.value = response.data.data.map((item: any, index: number) => {
        console.log(`Processing item ${index}:`, item);
        
        const processedItem = {
          ...item,
          key: item.id || index + 1,
          // Map to the expected field names for the table based on existing API response
          productionBatchId: item.productionBatchId || '',
          productModel: item.productModel || '',
          productName: item.productName || '',
          productionBatchDate: item.productionBatchDate || '',
          manufacturer: item.manufacturer || '',
          unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : parseFloat(item.unitPrice) || 0,
          quantity: typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 0,
          totalPrice: typeof item.totalPrice === 'number' ? item.totalPrice : parseFloat(String(item.totalPrice).replace(/,/g, '')) || 0,
          updater: item.updater || item.creator || '未设置',
          createTime: item.createTime || '',
          updateTime: item.updateTime || ''
        };
        
        console.log(`Processed item ${index}:`, processedItem);
        return processedItem;
      });
      
      console.log('=== FINAL PROCESSED DATA ===');
      console.log('rawData length:', rawData.value.length);
      console.log('rawData:', rawData.value);
      
      // Update pagination info from server
      if (response.data.pagination) {
        currentPage.value = response.data.pagination.current;
        pageSize.value = response.data.pagination.pageSize;
        total.value = parseInt(response.data.pagination.total) || 0;
        
        console.log('Updated pagination - current:', currentPage.value, 'pageSize:', pageSize.value, 'total:', total.value);
      }
    } else {
      console.log('=== NO DATA IN RESPONSE ===');
      console.log('Response data is falsy or has no data property');
      message.error('获取数据失败：服务器返回无效数据');
      rawData.value = [];
      total.value = 0;
    }
  } catch (error: any) {
    console.error('=== API ERROR ===');
    console.error('Error fetching toy production data:', error);
    console.error('Error response:', error.response);
    console.error('Error request:', error.request);
    console.error('Error message:', error.message);
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      console.error('Server error status:', error.response.status);
      console.error('Server error data:', error.response.data);
      
      if (error.response.status === 404) {
        message.error('错误：玩具生产表不存在，请检查数据库');
      } else if (error.response.status === 500) {
        message.error('错误：数据库连接失败或表结构错误');
      } else {
        message.error(`获取数据失败：${error.response.data?.message || '服务器错误'}`);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - no response received');
      message.error('错误：无法连接到服务器，请检查网络连接');
    } else {
      // Other errors
      console.error('Other error:', error.message);
      message.error('错误：获取数据时发生未知错误');
    }
    
    // Set empty data instead of fallback data
    rawData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
    console.log('=== API CALL COMPLETED ===');
    console.log('Final rawData length:', rawData.value.length);
    console.log('Final total:', total.value);
    console.log('Final loading state:', loading.value);
  }
};

const deviceModelValue = ref({ key: 'all', label: '全部', value: 'all' });
const productNameValue = ref({ key: 'all', label: '全部', value: 'all' });
const manufacturerValue = ref({ key: 'all', label: '全部', value: 'all' });

const deviceModelOptions = computed(() => {
  const unique = Array.from(new Set(rawData.value.map(item => item.productModel)));
  return [{ key: 'all', value: 'all', label: '全部' }, ...unique.map(v => ({ key: v, value: v, label: v }))];
});

const productNameOptions = computed(() => {
  const unique = Array.from(new Set(rawData.value.map(item => item.productName)));
  return [{ key: 'all', value: 'all', label: '全部' }, ...unique.map(v => ({ key: v, value: v, label: v }))];
});

const manufacturerOptions = computed(() => {
  const unique = Array.from(new Set(rawData.value.map(item => item.manufacturer)));
  return [{ key: 'all', value: 'all', label: '全部' }, ...unique.map(v => ({ key: v, value: v, label: v }))];
});

const batchManufacturerOptions = computed(() => {
  const unique = Array.from(new Set(rawData.value.map(item => item.manufacturer)));
  return unique.map(v => ({ key: v, value: v, label: v }));
});

const handleProductNameChange = (val: any) => {
  productNameValue.value = !val || !val.value || val.value === 'all'
    ? { key: 'all', label: '全部', value: 'all' }
    : val;
};

const handleManufacturerChange = (val: any) => {
  manufacturerValue.value = !val || !val.value || val.value === 'all'
    ? { key: 'all', label: '全部', value: 'all' }
    : val;
};

const currentPage = ref(1);
const pageSize = ref(10);

console.log('Initial deviceModelValue:', deviceModelValue.value);

const sorterInfo = ref<any>({
  columnKey: 'updateTime',
  order: 'descend',
});

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
    fetchToyProductionData(); // Fetch fresh data when page size changes
  },
  onChange: (page: number, size: number) => {
    console.log('onChange', page, size);
    currentPage.value = page;
    pageSize.value = size;
    fetchToyProductionData(); // Fetch fresh data when page changes
  },
}));

const onRefresh = () => {
  console.log('Refresh button clicked!');
  loading.value = true; // Show loading icon
  searchInputValue.value = '';
  currentPage.value = 1;
  resetColumns(); // Reset column order and visibility

  // Reset all selector values to '全部'
  deviceModelValue.value = { key: 'all', label: '全部', value: 'all' };
  productNameValue.value = { key: 'all', label: '全部', value: 'all' };
  manufacturerValue.value = { key: 'all', label: '全部', value: 'all' };

  // Fetch fresh data from API
  fetchToyProductionData();
};

const searchInputValue = ref('');
const debouncedSearchValue = ref('');

let debounceTimeout: any = null;
watch(searchInputValue, (val) => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    debouncedSearchValue.value = val;
  }, 300); // 300ms debounce
});

const filteredData = computed<DataItem[]>(() => {
  console.log('=== FILTERED DATA COMPUTED ===');
  console.log('rawData length:', rawData.value.length);
  console.log('rawData:', rawData.value);
  console.log('searchInputValue:', searchInputValue.value);
  console.log('debouncedSearchValue:', debouncedSearchValue.value);
  console.log('productNameValue:', productNameValue.value);
  console.log('manufacturerValue:', manufacturerValue.value);
  
  let dataToFilter: DataItem[] = [...rawData.value];
  console.log('Initial dataToFilter length:', dataToFilter.length);

  if (debouncedSearchValue.value) {
    const searchTerm = debouncedSearchValue.value.toLowerCase();
    console.log('Applying search filter with term:', searchTerm);
    dataToFilter = dataToFilter.filter((item: DataItem) => {
      return Object.values(item).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(searchTerm)
      );
    });
    console.log('After search filter, dataToFilter length:', dataToFilter.length);
  }

  // Filter by product name
  if (
    productNameValue.value &&
    productNameValue.value.value !== 'all' &&
    productNameValue.value.value !== ''
  ) {
    console.log('Applying product name filter:', productNameValue.value.value);
    dataToFilter = dataToFilter.filter(item => item.productName === productNameValue.value.value);
    console.log('After product name filter, dataToFilter length:', dataToFilter.length);
  }

  // Filter by manufacturer
  if (
    manufacturerValue.value &&
    manufacturerValue.value.value !== 'all' &&
    manufacturerValue.value.value !== ''
  ) {
    console.log('Applying manufacturer filter:', manufacturerValue.value.value);
    dataToFilter = dataToFilter.filter(item => item.manufacturer === manufacturerValue.value.value);
    console.log('After manufacturer filter, dataToFilter length:', dataToFilter.length);
  }

  // Sorting logic
  if (sorterInfo.value && sorterInfo.value.order) {
    console.log('Applying sorting:', sorterInfo.value);
    const { columnKey, order } = sorterInfo.value;
    const sorterFn = columnConfigs.find(c => c.key === columnKey)?.sorter;
    if (sorterFn) {
      dataToFilter.sort((a, b) => {
        const result = sorterFn(a, b);
        return order === 'ascend' ? result : -result;
      });
    }
  } else {
    // Apply default sorting by updateTime in descending order
    console.log('Applying default sorting by updateTime descending');
    dataToFilter.sort((a, b) => {
      return b.updateTime.localeCompare(a.updateTime); // Descending order
    });
  }

  console.log('Final filteredData length:', dataToFilter.length);
  console.log('Final filteredData:', dataToFilter);
  return dataToFilter;
});

// Add watchers for debugging
watch([filteredData, columns], ([newFilteredData, newColumns]) => {
  console.log('=== WATCHER TRIGGERED ===');
  console.log('filteredData changed:', newFilteredData);
  console.log('columns changed:', newColumns);
  console.log('filteredData length:', newFilteredData.length);
  console.log('columns length:', newColumns.length);
}, { immediate: true });

const handleTableChange = (
  paginationData: any,
  filters: any,
  sorter: any,
) => {
  console.log('Table change:', paginationData, filters, sorter);
  
  // Handle pagination changes - this is handled by the pagination handlers
  if (paginationData && (paginationData.current !== currentPage.value || paginationData.pageSize !== pageSize.value)) {
    currentPage.value = paginationData.current;
    pageSize.value = paginationData.pageSize;
    fetchToyProductionData(); // Fetch fresh data when pagination changes
    return; // Exit early to avoid duplicate calls
  }
  
  const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;

  if (currentSorter && currentSorter.order) {
    sorterInfo.value = {
      columnKey: currentSorter.columnKey,
      order: currentSorter.order,
    };
    fetchToyProductionData(); // Fetch fresh data when sorting changes
  } else {
    // When sorting is cleared, revert to default
    sorterInfo.value = {
      columnKey: 'updateTime',
      order: 'descend',
    };
    fetchToyProductionData(); // Fetch fresh data when sorting is cleared
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

const showReleaseModal = ref(false);
const uniqueDeviceModels = computed(() => Array.from(new Set(rawData.value.map(item => item.productModel))));

const handleReleaseModalClose = () => {
  showReleaseModal.value = false;
};
const handleReleaseModalSubmit = (_data: any) => {
  // You can handle the submit data here
  showReleaseModal.value = false;
};

const showEditModal = ref(false);
const editRecord = ref<any>(null);

const handleEditRecord = (record: any) => {
  // Set the first three fields to be disabled (产品名称, 生产批次, 生产厂家)
  isEditFieldsDisabled.value = true;
  
  // Pre-fill the form with existing data
  editBatchFormData.value = {
    productName: record.productName || '',
    productionBatch: record.productionBatchDate ? dayjs(record.productionBatchDate) : null,
    manufacturer: record.manufacturer || '',
    unitPrice: record.unitPrice?.toString() || '',
    quantity: record.quantity?.toString() || '',
  };
  
  editRecord.value = record;
  showEditBatchModal.value = true;
};

const handleViewRecord = (_record: any) => {
  message.info('查看功能开发中');
  // TODO: Implement view functionality
};
const handleEditModalClose = () => {
  showEditModal.value = false;
  editRecord.value = null;
};
const handleEditModalSubmit = (_data: any) => {
  // Update the data in your table as needed
  showEditModal.value = false;
  editRecord.value = null;
};

const showProductCreateModal = ref(false);

const handleProductCreateSubmit = (_data: any) => {
  // You can add logic to add the new product to rawData here
  showProductCreateModal.value = false;
};

const showBatchModal = ref(false);
const handleBatchOk = async () => {
  try {
    // Validate form
    await batchFormRef.value.validate();
    
    // Check uniqueness: Product Name + Production Batch + Manufacturer combination must be unique
    const isDuplicate = rawData.value.some(item => 
      item.productName === batchFormData.value.productName &&
      item.productionBatchDate === batchFormData.value.productionBatch &&
      item.manufacturer === batchFormData.value.manufacturer
    );
    
    if (isDuplicate) {
      message.error('该产品名称、生产批次、生产厂家组合已存在，请检查后重新输入');
      return;
    }
    
    // Calculate total price
    const totalPrice = (parseFloat(batchFormData.value.unitPrice) || 0) * (parseInt(batchFormData.value.quantity) || 0);
    
    // Prepare data for API - match the backend expected format (snake_case)
    const newBatchData = {
      product_id: `BATCH_${Date.now()}`, // Auto-generate batch ID
      device_model: batchFormData.value.productName, // Use product name as device model
      product_name: batchFormData.value.productName,
      production_batch: batchFormData.value.productionBatch ? batchFormData.value.productionBatch.format('YYYY-MM-DD') : '',
      manufacturer: batchFormData.value.manufacturer,
      unit_price: parseFloat(batchFormData.value.unitPrice) || 0,
      quantity: parseInt(batchFormData.value.quantity) || 0,
      creator: 1 // Default creator ID
    };
    
    // Send data to MySQL database via API
    const response = await axios.post(constructApiUrl('toy-production'), newBatchData);
    
    if (response.status === 201) {
      message.success('批次创建成功！');
      
      // Add the new record to frontend with proper structure
      const newRecord = {
        id: response.data.id,
        key: response.data.id,
        productionBatchId: newBatchData.product_id,
        productModel: newBatchData.device_model,
        productName: batchFormData.value.productName,
        productionBatchDate: newBatchData.production_batch,
        manufacturer: batchFormData.value.manufacturer,
        unitPrice: newBatchData.unit_price,
        quantity: newBatchData.quantity,
        totalPrice: totalPrice,
        updater: String(newBatchData.creator),
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      
      // Add to frontend data
      rawData.value.unshift(newRecord);
      
      // Close modal and reset form
      handleBatchModalClose();
      
      // Refresh data from server to ensure consistency
      await fetchToyProductionData();
    } else {
      message.error('批次创建失败，请重试');
    }
    
  } catch (error: any) {
    if (error.response) {
      message.error(`创建失败: ${error.response.data?.error || '未知错误'}`);
    } else if (error.request) {
      message.error('网络请求失败，请检查网络连接');
    } else {
      message.error(`创建失败: ${error.message}`);
    }
  }
};

const resetBatchForm = () => {
  batchFormData.value = {
    productName: '',
    productionBatch: null,
    manufacturer: '',
    unitPrice: '',
    quantity: '',
  };
  // Clear form validation errors
  if (batchFormRef.value) {
    batchFormRef.value.clearValidate();
  }
};

const handleBatchModalClose = () => {
  resetBatchForm();
  showBatchModal.value = false;
};

const batchFormData = ref({
  productName: '',
  productionBatch: null as any,
  manufacturer: '',
  unitPrice: '',
  quantity: '',
});

const batchFormRules = {
  productName: [{ required: true, message: '请选择产品名称' }],
  productionBatch: [{ required: true, message: '请选择生产批次' }],
  manufacturer: [
    { required: true, message: '请输入生产厂家' },
    { max: 15, message: '生产厂家不能超过15个字符' }
  ],
  unitPrice: [
    { required: true, message: '请输入单价' },
    { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: '请输入有效的价格，最多支持2位小数' }
  ],
  quantity: [
    { required: true, message: '请输入数量' },
    { pattern: /^[1-9][0-9]*$/, message: '请输入正整数' }
  ],
};

const batchFormRef = ref<any>(null);
const editBatchFormRef = ref<any>(null);

const filterProductOptions = (input: string, option: any) => {
  return option.label.toLowerCase().includes(input.toLowerCase());
};

const handleManufacturerInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  batchFormData.value.manufacturer = value.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, ''); // 只允许中英文数字
};

const showEditBatchModal = ref(false);
const editBatchFormData = ref({
  productName: '',
  productionBatch: null as any,
  manufacturer: '',
  unitPrice: '',
  quantity: '',
});

const editBatchFormRules = {
  productName: [{ required: true, message: '请选择产品名称' }],
  productionBatch: [{ required: true, message: '请选择生产批次' }],
  manufacturer: [
    { required: true, message: '请输入生产厂家' },
    { max: 15, message: '生产厂家不能超过15个字符' }
  ],
  unitPrice: [
    { required: true, message: '请输入单价' },
    { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: '请输入有效的价格，最多支持2位小数' }
  ],
  quantity: [
    { required: true, message: '请输入数量' },
    { pattern: /^[1-9][0-9]*$/, message: '请输入正整数' }
  ],
};

const isEditFieldsDisabled = ref(false);

const handleEditBatchOk = async () => {
  try {
    await editBatchFormRef.value.validate();

    const originalRecord = rawData.value.find(item => item.id === editRecord.value.id);
    if (!originalRecord) {
      message.error('未找到要编辑的记录');
      return;
    }

    const isDuplicate = rawData.value.some(item => 
      item.productName === editBatchFormData.value.productName &&
      item.productionBatchDate === editBatchFormData.value.productionBatch &&
      item.manufacturer === editBatchFormData.value.manufacturer &&
      item.id !== originalRecord.id // Exclude the current record itself
    );

    if (isDuplicate) {
      message.error('该产品名称、生产批次、生产厂家组合已存在，请检查后重新输入');
      return;
    }

    const updatedRecord = {
      ...originalRecord,
      productName: editBatchFormData.value.productName,
      productionBatchDate: editBatchFormData.value.productionBatch ? editBatchFormData.value.productionBatch.format('YYYY-MM-DD') : '',
      manufacturer: editBatchFormData.value.manufacturer,
      unitPrice: parseFloat(editBatchFormData.value.unitPrice) || 0,
      quantity: parseInt(editBatchFormData.value.quantity) || 0,
      totalPrice: (parseFloat(editBatchFormData.value.unitPrice) || 0) * (parseInt(editBatchFormData.value.quantity) || 0),
      updateTime: new Date().toISOString(),
    };

    const index = rawData.value.findIndex(item => item.id === originalRecord.id);
    if (index !== -1) {
      rawData.value[index] = updatedRecord;
    }

    resetEditBatchForm();
    showEditBatchModal.value = false;
    message.success('编辑批次成功');
  } catch (error) {
    console.error('Form validation failed:', error);
  }
};

const resetEditBatchForm = () => {
  editBatchFormData.value = {
    productName: '',
    productionBatch: null,
    manufacturer: '',
    unitPrice: '',
    quantity: '',
  };
  if (editBatchFormRef.value) {
    editBatchFormRef.value.clearValidate();
  }
};

const handleEditBatchModalClose = () => {
  resetEditBatchForm();
  showEditBatchModal.value = false;
};

const handleEditManufacturerInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  editBatchFormData.value.manufacturer = value.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, ''); // 只允许中英文数字
};

onMounted(() => {
  console.log('=== COMPONENT MOUNTED ===');
  console.log('Setting selectedColumnKeys:', columnConfigs.map(config => config.key));
  selectedColumnKeys.value = columnConfigs.map(config => config.key);
  console.log('Calling fetchToyProductionData...');
  fetchToyProductionData(); // Fetch data on component mount
  console.log('Component mount completed');
});

defineExpose({
  handleTableChange, // Explicitly expose handleTableChange
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


:deep(.version-number-select .ant-select-selector) {
  padding-left: 60px !important;
}

:deep(.device-model-select .ant-select-selector) {
  padding-left: 65px !important;
}
:deep(.ip-name-select .ant-select-selector) {
  padding-left: 55px !important;
}

:deep(.product-type-select .ant-select-selector) {
  padding-left: 65px !important;
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

/* Make the action buttons horizontal and style them properly */
:deep(.ant-table-cell .action-cell) {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 8px !important;
  min-width: 140px !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
}

:deep(.ant-table-cell .action-cell .ant-space) {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 8px !important;
}

:deep(.ant-table-cell .action-cell .view-link) {
  color: #1890ff !important;
  font-weight: bold !important;
  cursor: pointer !important;
  text-decoration: none !important;
}

:deep(.ant-table-cell .action-cell .edit-link) {
  color: #1890ff !important;
  font-weight: bold !important;
  cursor: pointer !important;
  text-decoration: none !important;
}

:deep(.ant-table-cell .action-cell .danger-link) {
  color: #ff4d4f !important;
  font-weight: bold !important;
  cursor: pointer !important;
  text-decoration: none !important;
}

/* Sorting icon styling - ensure default state is grey */
:deep(.ant-table-column-sorter-up),
:deep(.ant-table-column-sorter-down) {
  color: #bfbfbf !important; /* grey by default */
}

/* Only show blue for the active sorting direction */
:deep(.ant-table-column-sorter-up.ant-table-column-sorter-active) {
  color: #1677ff !important; /* blue when ascending is active */
}

:deep(.ant-table-column-sorter-down.ant-table-column-sorter-active) {
  color: #1677ff !important; /* blue when descending is active */
}

/* Hover effects */
:deep(th .ant-table-column-sorter-up:hover),
:deep(th .ant-table-column-sorter-down:hover) {
  color: #1677ff !important; /* blue on hover */
}

/* Ensure the default sort column shows the correct icon state */
:deep(.ant-table-column-sorter) {
  color: #bfbfbf !important; /* Default grey color */
}

:deep(.ant-table-column-sorter.ant-table-column-sorter-active) {
  color: #1677ff !important; /* Blue when column is actively sorted */
}

:deep(.product-name-select .ant-select-selector) {
  padding-left: 65px !important;
}
:deep(.manufacturer-select .ant-select-selector) {
  padding-left: 65px !important;
}

/* Hyperlink styling for product model */
:deep(.ant-table-tbody .ant-table-cell .product-model-link) {
  color: #1890ff;
  text-decoration: none;
  transition: color 0.3s ease;
  cursor: pointer;
}

:deep(.ant-table-tbody .ant-table-cell .product-model-link:hover) {
  color: #40a9ff;
  text-decoration: underline;
}

:deep(.ant-table-tbody .ant-table-cell .product-model-link:active) {
  color: #096dd9;
}

/* No data message styling */
.no-data-message {
  text-align: center;
  padding: 40px 0;
}

/* Disabled field styling for edit form */
:deep(.disabled-field .ant-select-selector),
:deep(.disabled-field .ant-picker-input),
:deep(.disabled-field .ant-input) {
  background-color: #f5f5f5 !important;
  color: #999 !important;
  cursor: not-allowed !important;
  border-color: #d9d9d9 !important;
}

:deep(.disabled-field .ant-select-arrow),
:deep(.disabled-field .ant-picker-suffix) {
  color: #999 !important;
}

:deep(.disabled-field .ant-select-selection-item) {
  color: #999 !important;
}
</style>