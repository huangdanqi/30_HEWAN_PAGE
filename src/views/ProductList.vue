<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>商品列表</h2>
    </div>
<!-- Temporary test button - add this somewhere in your template -->
<a-button @click="testSimpleProductCreation" style="margin-left: 10px;">测试简单创建</a-button>
<a-button @click="testBatchAddEndpoint" style="margin-left: 10px;">测试批量新增端点</a-button>
<a-button @click="testDatabaseConnection" style="margin-left: 10px;">测试数据库连接</a-button>
<a-button @click="testTableStructure" style="margin-left: 10px;">测试表结构</a-button>
    <!-- select item area -->
    <div class="top-controls-wrapper">
      <div class="left-aligned-section">
        <div class="select-container product-type-select" style="margin-left: 10px;" :class="{ 'selected': productTypeValue }">
          <span class="select-always-placeholder">产品类型:</span>
          <a-tooltip :title="productTypeOptions.find(opt => opt.value === productTypeValue)?.label || '全部'">
            <a-select v-model:value="productTypeValue" style="width: 120px;" :options="productTypeOptions" allow-clear />
          </a-tooltip>
        </div>
        <div class="select-container product-name-select" style="margin-left: 10px;" :class="{ 'selected': productNameValue }">
          <span class="select-always-placeholder">商品名称:</span>
          <a-tooltip :title="productNameOptions.find(opt => opt.value === productNameValue)?.label || '全部'">
            <a-select v-model:value="productNameValue" style="width: 150px;" :options="productNameOptions" allow-clear />
          </a-tooltip>
        </div>
  
        <div class="select-container ip-role-select" style="margin-left: 10px;" :class="{ 'selected': ipRoleValue }">
          <span class="select-always-placeholder">IP角色:</span>
          <a-tooltip :title="ipRoleOptions.find(opt => opt.value === ipRoleValue)?.label || '全部'">
            <a-select v-model:value="ipRoleValue" style="width: 120px;" :options="ipRoleOptions" allow-clear />
          </a-tooltip>
        </div>

        <div class="select-container color-select" style="margin-left: 10px;" :class="{ 'selected': colorValue }">
          <span class="select-always-placeholder">颜色:</span>
          <a-tooltip :title="colorOptions.find(opt => opt.value === colorValue)?.label || '全部'">
            <a-select v-model:value="colorValue" style="width: 120px;" :options="colorOptions" allow-clear />
          </a-tooltip>
        </div>
      </div>
      <!-- icon area -->
      <div class="right-aligned-icons">
          <!-- search area  -->
          <a-input
            v-model:value="searchInputValue"
            placeholder="输入关键字搜索"
            style="width: 200px"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
          <!-- Add the two new buttons -->
          <a-button type="primary" @click="handleBatchAdd">批量新增</a-button>
          <a-button type="primary" @click="handleFileExport">文件导出</a-button>
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
        :scroll="{ x: 1000 }"
        @change="handleTableChange"
        :showSorterTooltip="false"
      >
      <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'operation'">
        <a-space class="action-cell" direction="horizontal">
          <a class="export-link" @click="handleExportClick(record)">导出二维码/条形码</a>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定要删除该信息吗?"
            @confirm="handleDeleteRecord(record)"
          >
            <a class="danger-link">删除</a>
          </a-popconfirm>
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

    <!-- Batch Add Modal -->
    <a-modal
      v-model:open="batchAddModalVisible"
      title="批量新增玩具商品"
      :footer="null"
      width="600px"
      @cancel="handleBatchAddCancel"
    >
      <div class="modal-content">
        <div class="section-header">批量新增</div>
        
        <a-form
          :model="batchAddForm"
          :rules="batchAddRules"
          layout="vertical"
          ref="batchAddFormRef"
        >
          <a-form-item label="产品名称" name="productName" required>
            <a-select
              v-model:value="batchAddForm.productName"
              placeholder="请选择"
              style="width: 100%"
              @change="handleProductNameChange"
              :options="batchProductNameOptions"
              :loading="toyProductionLoading"
            >
              <a-spin v-if="toyProductionLoading" />
            </a-select>
          </a-form-item>
          
          <a-form-item label="生产批次" name="productionBatch" required>
            <a-select
              v-model:value="batchAddForm.productionBatch"
              placeholder="请选择"
              style="width: 100%"
              @change="handleProductionBatchChange"
              :options="batchProductionBatchOptions"
              :disabled="!batchAddForm.productName"
              :loading="toyProductionLoading"
            >
              <a-spin v-if="toyProductionLoading" />
            </a-select>
          </a-form-item>
          
          <a-form-item label="生产厂家" name="manufacturer" required>
            <a-select
              v-model:value="batchAddForm.manufacturer"
              placeholder="请选择"
              style="width: 100%"
              @change="handleManufacturerChange"
              :options="batchManufacturerOptions"
              :disabled="!batchAddForm.productionBatch"
              :loading="toyProductionLoading"
            >
              <a-spin v-if="toyProductionLoading" />
            </a-select>
          </a-form-item>
          
          <a-form-item label="数量" name="quantity" required>
            <a-input-number
              v-model:value="batchAddForm.quantity"
              placeholder="请输入"
              style="width: 100%"
              :min="1"
              :max="getAvailableQuantity"
              :precision="0"
              addon-after="个"
              :disabled="toyProductionLoading"
            />
            <div v-if="!toyProductionLoading && getAvailableQuantity > 0" class="quantity-info">
              <p class="text-success">
                当前生产批次剩余数量：{{ getAvailableQuantity }} 个
              </p>
              <p v-if="existingProductQuantity > 0" class="text-info">
                已创建商品数量：{{ existingProductQuantity }} 个
              </p>
            </div>
            <p v-else-if="toyProductionLoading" class="text-center text-muted">加载中...</p>
            <p v-else class="text-center text-danger">
              当前生产批次数量不足，无法添加更多商品。
            </p>
          </a-form-item>
        </a-form>
        
        <div class="modal-footer">
          <a-button @click="handleBatchAddCancel">取消</a-button>
          <a-button type="primary" @click="handleBatchAddConfirm" :loading="batchAddLoading">确定</a-button>
        </div>
      </div>
    </a-modal>

    <!-- Secondary Confirmation Modal -->
    <a-modal
      v-model:open="confirmationModalVisible"
      title="新建商品-二次确认"
      :footer="null"
      width="500px"
      @cancel="handleConfirmationCancel"
    >
      <div class="modal-content">
        <div class="section-header">新建商品</div>
        
        <div class="confirmation-content">
          <div class="warning-icon">
            <ExclamationCircleOutlined />
          </div>
          <div class="warning-message">
            该批次生产数量为{{ batchProductionQuantity }}个,已创建商品数量{{ existingProductQuantity }}个,本次新建后商品数量将超过批次生产数量,是否继续新建?
          </div>
        </div>
        
        <div class="modal-footer">
          <a-button @click="handleConfirmationCancel">取消</a-button>
          <a-button type="primary" @click="handleConfirmationConfirm" :loading="batchAddLoading">确定</a-button>
        </div>
      </div>
    </a-modal>
    <!-- Form Confirmation Modal -->
    <a-modal
      v-model:open="formConfirmationModalVisible"
      title="确认新增"
      :footer="null"
      width="500px"
      @cancel="handleFormConfirmationCancel"
    >
      <div class="modal-content">
        <div class="section-header">确认新增</div>
        
        <div class="form-confirmation-content">
          <div class="confirmation-icon">
            <CheckCircleOutlined />
          </div>
          <div class="confirmation-message">
            确认新增{{ batchAddForm.quantity }}条数据？
          </div>
          
          <!-- Show form data for confirmation -->
          <div class="form-data-summary">
            <div class="summary-item">
              <span class="label">产品名称:</span>
              <span class="value">{{ batchAddForm.productName }}</span>
            </div>
            <div class="summary-item">
              <span class="label">生产批次:</span>
              <span class="value">{{ batchAddForm.productionBatch }}</span>
            </div>
            <div class="summary-item">
              <span class="label">生产厂家:</span>
              <span class="value">{{ batchAddForm.manufacturer }}</span>
            </div>
            <div class="summary-item">
              <span class="label">数量:</span>
              <span class="value">{{ batchAddForm.quantity }}个</span>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <a-button @click="handleFormConfirmationCancel">取消</a-button>
          <a-button type="primary" @click="handleFormConfirmationConfirm" :loading="batchAddLoading">确定</a-button>
        </div>
      </div>
    </a-modal>
  </a-config-provider>
</template>
<script lang="ts" setup>
import type { ColumnsType } from 'ant-design-vue/es/table';
const formConfirmationModalVisible = ref(false);
import { ref, computed, onMounted, h } from 'vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme, message } from 'ant-design-vue';
import { ReloadOutlined, ColumnHeightOutlined ,SettingOutlined, SearchOutlined, ExclamationCircleOutlined, CheckCircleOutlined} from '@ant-design/icons-vue';
import draggable from 'vuedraggable';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { Empty } from 'ant-design-vue';
// Column configs are defined inline
import { constructApiUrl } from '../utils/api';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

const route = useRoute();
const router = useRouter();

// API calls use constructApiUrl helper

// const handleEditClick = () => {
//   message.info('开发中');
// };

// const handleExportClick = (record: DataItem) => {
//   message.info(`导出 ${record.productName} 的二维码/事务码`);
// };
// const handleEditClick = () => {
//   message.info('开发中');
// };

// const handleExportClick = (record: DataItem) => {
//   message.info(`导出 ${record.productName} 的二维码/事务码`);
// };
// handleEditClick removed - not used in this component

const handleExportClick = (record: DataItem) => {
  message.info(`导出 ${record.productName} 的二维码/事务码`);
};
// Add the two new handler functions
// Batch Add Modal related data
const batchAddModalVisible = ref(false);
const confirmationModalVisible = ref(false);
const batchAddLoading = ref(false);
const batchAddFormRef = ref();
const batchProductionQuantity = ref(0);
const existingProductQuantity = ref(0);

// Add new reactive data for toy production options
const toyProductionData = ref<ToyProductionItem[]>([]);
const toyProductionLoading = ref(false);

const batchAddForm = ref({
  productName: '',
  productionBatch: '',
  manufacturer: '',
  quantity: 1
});

const batchAddRules = {
  productName: [{ required: true, message: '请选择产品名称' }],
  productionBatch: [{ required: true, message: '请选择生产批次' }],
  manufacturer: [{ required: true, message: '请选择生产厂家' }],
  quantity: [
    { required: true, message: '请输入数量' },
    { 
      validator: async (_rule: any, value: number) => {
        const availableQuantity = getAvailableQuantity.value;
        if (value && availableQuantity > 0 && value > availableQuantity) {
          throw new Error(`数量不能超过生产批次数量 ${availableQuantity} 个`);
        }
      }
    }
  ]
};

// Fetch toy production data for dynamic options
const fetchToyProductionData = async () => {
  try {
    toyProductionLoading.value = true;
    const response = await axios.get(constructApiUrl('toy-production'));
    if (response.data && response.data.data) {
      toyProductionData.value = response.data.data;
    } else {
      toyProductionData.value = response.data || [];
    }
    console.log('Toy production data fetched:', toyProductionData.value);
  } catch (error) {
    console.error('Error fetching toy production data:', error);
    message.error('获取生产数据失败');
    toyProductionData.value = [];
  } finally {
    toyProductionLoading.value = false;
  }
};

// Search functions for related data
const searchProductTypeData = async (productModel: string) => {
  try {
    const response = await axios.get(constructApiUrl('product-type'));
    const productTypeData = response.data;
    
    // Find the product type record that matches the product model
    const matchingRecord = productTypeData.find((item: any) => 
      (item.product_model || item.productModel) === productModel ||
      (item.device_model || item.deviceModel) === productModel
    );
    
    if (matchingRecord) {
      return {
        ipName: matchingRecord.ip_name || matchingRecord.ipName || matchingRecord.ipRoleName || '',
        productName: matchingRecord.product_name || matchingRecord.productName || '',
        productType: matchingRecord.product_type || matchingRecord.productType || '',
        color: matchingRecord.color || '',
        productId: matchingRecord.product_id || matchingRecord.productId || '',
        productTypeId: matchingRecord.id || ''
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error searching product type data:', error);
    return null;
  }
};

const searchIPManagementData = async (ipRole: string) => {
  try {
    const response = await axios.get(constructApiUrl('ip-management'));
    const ipData = response.data.data || response.data;
    
    // Find the IP record that matches the IP role
    const matchingRecord = ipData.find((item: any) => 
      (item.ip_name || item.ipName) === ipRole
    );
    
    if (matchingRecord) {
      return {
        ipId: matchingRecord.ip_id || matchingRecord.ipId || '',
        ipName: matchingRecord.ip_name || matchingRecord.ipName || ''
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error searching IP management data:', error);
    return null;
  }
};

const searchToyProductionData = async (productModel: string) => {
  try {
    const response = await axios.get(constructApiUrl('toy-production'));
    const toyProductionData = response.data.data || response.data;
    
    // Find the toy production record that matches the product model
    const matchingRecord = toyProductionData.find((item: any) => 
      (item.product_model || item.productModel) === productModel
    );
    
    if (matchingRecord) {
      return {
        productionBatchId: matchingRecord.product_id || matchingRecord.productionBatchId || '',
        productId: matchingRecord.id || ''
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error searching toy production data:', error);
    return null;
  }
};

// Computed options for batch add form - now using toy production data
const batchProductNameOptions = computed(() => {
  if (toyProductionData.value.length === 0) return [];
  
  // Get unique product names from toy production data
  return Array.from(new Set(
    toyProductionData.value
      .filter(item => item.productName && item.productName.trim() !== '')
      .map(item => item.productName)
  )).map(name => ({ value: name, label: name }));
});

const batchProductionBatchOptions = computed(() => {
  if (!batchAddForm.value.productName) return [];
  
  // Get unique production batches for the selected product name
  return Array.from(new Set(
    toyProductionData.value
      .filter(item => 
        item.productName === batchAddForm.value.productName &&
        item.productionBatchDate && item.productionBatchDate.trim() !== ''
      )
      .map(item => item.productionBatchDate)
  )).map(batch => ({ value: batch, label: batch }));
});

const batchManufacturerOptions = computed(() => {
  if (!batchAddForm.value.productName || !batchAddForm.value.productionBatch) return [];
  
  // Get unique manufacturers for the selected product name and production batch
  return Array.from(new Set(
    toyProductionData.value
      .filter(item => 
        item.productName === batchAddForm.value.productName && 
        item.productionBatchDate === batchAddForm.value.productionBatch &&
        item.manufacturer && item.manufacturer.trim() !== ''
      )
      .map(item => item.manufacturer)
  )).map(manufacturer => ({ value: manufacturer, label: manufacturer }));
});

// Get available quantity for the selected combination
const getAvailableQuantity = computed(() => {
  if (!batchAddForm.value.productName || !batchAddForm.value.productionBatch || !batchAddForm.value.manufacturer) {
    return 0;
  }
  
  const toyProductionRecord = toyProductionData.value.find(item => 
    item.productName === batchAddForm.value.productName &&
    item.productionBatchDate === batchAddForm.value.productionBatch &&
    item.manufacturer === batchAddForm.value.manufacturer
  );
  
  return toyProductionRecord ? toyProductionRecord.quantity : 0;
});

// Batch Add handlers
const handleBatchAdd = () => {
  batchAddModalVisible.value = true;
  resetBatchAddForm();
  fetchToyProductionData(); // Fetch data when modal opens
};

const handleBatchAddCancel = () => {
  batchAddModalVisible.value = false;
  resetBatchAddForm();
};

const handleProductNameChange = () => {
  batchAddForm.value.productionBatch = '';
  batchAddForm.value.manufacturer = '';
  batchAddForm.value.quantity = 1;
  // Reset validation state
  if (batchAddFormRef.value) {
    batchAddFormRef.value.clearValidate(['productionBatch', 'manufacturer', 'quantity']);
  }
};

const handleProductionBatchChange = () => {
  batchAddForm.value.manufacturer = '';
  batchAddForm.value.quantity = 1;
  // Reset validation state
  if (batchAddFormRef.value) {
    batchAddFormRef.value.clearValidate(['manufacturer', 'quantity']);
  }
};

const handleManufacturerChange = () => {
  batchAddForm.value.quantity = 1;
  // Reset validation state
  if (batchAddFormRef.value) {
    batchAddFormRef.value.clearValidate(['quantity']);
  }
};

const resetBatchAddForm = () => {
  batchAddForm.value = {
    productName: '',
    productionBatch: '',
    manufacturer: '',
    quantity: 1
  };
  if (batchAddFormRef.value) {
    batchAddFormRef.value.resetFields();
  }
  // Reset quantity validation values
  batchProductionQuantity.value = 0;
  existingProductQuantity.value = 0;
};

const handleBatchAddConfirm = async () => {
  try {
    await batchAddFormRef.value.validate();
    
    // Show form confirmation modal first
    formConfirmationModalVisible.value = true;
    
  } catch (error) {
    console.error('Form validation failed:', error);
  }
};
const handleFormConfirmationCancel = () => {
  formConfirmationModalVisible.value = false;
};

const handleFormConfirmationConfirm = async () => {
  try {
    formConfirmationModalVisible.value = false;
    
    // Check quantity validation
    const totalQuantity = await checkQuantityValidation();
    
    if (totalQuantity > batchProductionQuantity.value) {
      // Show quantity warning confirmation modal
      confirmationModalVisible.value = true;
    } else {
      // Proceed with enhanced batch creation
      await createBatchProducts();
    }
  } catch (error: any) {
    console.error('Error in form confirmation:', error);
    message.error('添加产品失败: ' + (error.message || '未知错误'));
  }
};
const checkQuantityValidation = async () => {
  // Get the available quantity from toy production data
  const availableQuantity = getAvailableQuantity.value;
  
  if (availableQuantity === 0) {
    throw new Error('未找到对应的生产批次数据');
  }
  
  // Set the production quantity for display
  batchProductionQuantity.value = availableQuantity;
  
  // Count existing products with the same combination
  const existingProducts = rawData.value.filter(item => 
    item.productName === batchAddForm.value.productName &&
    item.productionBatch === batchAddForm.value.productionBatch &&
    item.manufacturer === batchAddForm.value.manufacturer
  );
  
  existingProductQuantity.value = existingProducts.length;
  
  return existingProductQuantity.value + batchAddForm.value.quantity;
};

// const createBatchProducts = async () => {
//   try {
//     batchAddLoading.value = true;
    
//     // Create products with QR code and barcode generation
//     const products = [];
//     for (let i = 0; i < batchAddForm.value.quantity; i++) {
//       const productData = {
//         productName: batchAddForm.value.productName,
//         productionBatch: batchAddForm.value.productionBatch,
//         manufacturer: batchAddForm.value.manufacturer,
//         // Add other required fields
//       };
      
//       // Generate QR code and barcode
//       const qrCodePath = await generateQRCode(productData);
//       const barcodePath = await generateBarcode(productData);
      
//       productData.qrCodeFileDirectory = qrCodePath;
//       productData.barcodeFileDirectory = barcodePath;
      
//       products.push(productData);
//     }
    
//     // Save to database
//     await createProductList(products[0]); // For now, creating one by one
    
//     message.success(`成功创建 ${batchAddForm.value.quantity} 个商品`);
//     batchAddModalVisible.value = false;
//     resetBatchAddForm();
//     fetchProductList(); // Refresh the list
    
//   } catch (error) {
//     console.error('Error creating batch products:', error);
//     message.error('创建商品失败');
//   } finally {
//     batchAddLoading.value = false;
//   }
// };
// Generate unique product ID with timestamp and random component
const generateUniqueProductId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PROD_${timestamp}_${random}`;
};

// generateFilePaths function removed - using direct generation in createBatchProducts

const createBatchProducts = async () => {
  try {
    batchAddLoading.value = true;
    
    console.log(`Starting enhanced batch creation of ${batchAddForm.value.quantity} products`);
    
    // First, get the selected toy production record to use as the product model
    const selectedToyProduction = toyProductionData.value.find(item => 
      item.productName === batchAddForm.value.productName &&
      item.productionBatchDate === batchAddForm.value.productionBatch &&
      item.manufacturer === batchAddForm.value.manufacturer
    );
    
    if (!selectedToyProduction) {
      throw new Error('未找到对应的生产批次信息');
    }
    
    // Search for related data using product model
    const productModel = selectedToyProduction.productModel;
    console.log('Searching for related data using product model:', productModel);
    
    const [productTypeInfo, ipManagementInfo, toyProductionInfo] = await Promise.all([
      searchProductTypeData(productModel),
      searchIPManagementData(batchAddForm.value.productName), // Use product name as IP role
      searchToyProductionData(productModel)
    ]);
    
    console.log('Found related data:', {
      productTypeInfo,
      ipManagementInfo, 
      toyProductionInfo
    });
    
    const createdProducts = [];
    const errors = [];
    
    // Create products based on the specified quantity
    for (let i = 0; i < batchAddForm.value.quantity; i++) {
      try {
        const productId = generateUniqueProductId();
        
        // Generate QR code and barcode
        const tempProductData = {
          productId,
          productName: batchAddForm.value.productName,
          productModel: productModel,
          manufacturer: batchAddForm.value.manufacturer,
          productionBatch: batchAddForm.value.productionBatch,
          ipRole: productTypeInfo?.ipName || batchAddForm.value.productName,
          creationTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };
        
        const [qrCodePath, barcodePath] = await Promise.all([
          generateQRCode(tempProductData),
          generateBarcode(tempProductData)
        ]);
        
        const productData = {
          serialNumber: 1,
          productId: productId,
          productName: productTypeInfo?.productName || batchAddForm.value.productName,
          productType: productTypeInfo?.productType || '玩具',
          productModel: productModel,
          ipRole: productTypeInfo?.ipName || batchAddForm.value.productName,
          color: productTypeInfo?.color || '默认',
          productionBatch: batchAddForm.value.productionBatch,
          manufacturer: batchAddForm.value.manufacturer,
          qrCodeFileDirectory: qrCodePath,
          qrCodeExported: '否',
          barcodeFileDirectory: barcodePath,
          barcodeExported: '否',
          deviceId: '', // Can be null as requested
          subAccountId: '', // Can be null as requested
          fileExportTime: '',
          firstBindingTime: '',
          creatorId: 1
          // creationTime is handled by the database automatically
        };
        
        console.log(`Creating enhanced product ${i + 1}/${batchAddForm.value.quantity}:`, productData);
        
        // Debug: Log exactly what will be sent to the API
        console.log('Fields being sent to API:', Object.keys(productData));
        console.log('Values being sent to API:', Object.values(productData));
        
        // Create the product
        await createProductList(productData);
        createdProducts.push(productData);
        
        // Small delay to prevent overwhelming the database
        if (i < batchAddForm.value.quantity - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error: any) {
        console.error(`Error creating product ${i + 1}:`, error);
        errors.push({
          index: i + 1,
          error: (error as any).response?.data?.message || (error as any).message || '未知错误'
        });
      }
    }
    
    // Show results to user
    if (createdProducts.length === batchAddForm.value.quantity) {
      message.success(`成功创建 ${createdProducts.length} 个商品，包含QR码和条形码`);
    } else if (createdProducts.length > 0) {
      message.warning(`成功创建 ${createdProducts.length} 个商品，${errors.length} 个失败`);
      console.error('Failed products:', errors);
    } else {
      message.error('所有商品创建失败');
      console.error('All products failed:', errors);
    }
    
    // Close modals and refresh list if any products were created
    if (createdProducts.length > 0) {
      batchAddModalVisible.value = false;
      confirmationModalVisible.value = false;
      resetBatchAddForm();
      await fetchProductList(); // Refresh the list
    }
    
  } catch (error: any) {
    console.error('Error in enhanced batch creation process:', error);
    message.error('批量创建过程中发生错误: ' + (error.message || '未知错误'));
  } finally {
    batchAddLoading.value = false;
  }
};
// Generate QR code and save to public folder
const generateQRCode = async (productData: any) => {
  try {
    const timestamp = Date.now();
    const productId = productData.productId;
    const filename = `${productId}_${timestamp}.png`;
    const filepath = `/QRcode/${filename}`;
    
    // Create QR code data with product information
    const qrData = JSON.stringify({
      productId: productData.productId,
      productName: productData.productName,
      productModel: productData.productModel,
      manufacturer: productData.manufacturer,
      productionBatch: productData.productionBatch,
      ipRole: productData.ipRole,
      creationTime: productData.creationTime
    });
    
    // Generate QR code as base64 data URL
    await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Convert base64 to blob and save (in real application, you'd send this to server)
    // For now, we'll just return the filepath
    console.log('QR Code generated for:', productId, 'Data:', qrData);
    
    return filepath;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return `/QRcode/default_${Date.now()}.png`;
  }
};

// Generate barcode and save to public folder
const generateBarcode = async (productData: any) => {
  try {
    const timestamp = Date.now();
    const productId = productData.productId;
    const filename = `${productId}_${timestamp}.png`;
    const filepath = `/barcode/${filename}`;
    
    // Create a canvas element for barcode generation
    const canvas = document.createElement('canvas');
    
    // Generate barcode using product ID
    JsBarcode(canvas, productId, {
      format: 'CODE128',
      width: 2,
      height: 100,
      displayValue: true,
      fontSize: 16,
      textAlign: 'center',
      textPosition: 'bottom',
      margin: 10
    });
    
    // In real application, you'd save the canvas data to server
    console.log('Barcode generated for:', productId);
    
    return filepath;
  } catch (error) {
    console.error('Error generating barcode:', error);
    return `/barcode/default_${Date.now()}.png`;
  }
};

const handleConfirmationCancel = () => {
  confirmationModalVisible.value = false;
};

const handleConfirmationConfirm = async () => {
  try {
    confirmationModalVisible.value = false;
    await createBatchProducts();
  } catch (error: any) {
    console.error('Error in confirmation confirm:', error);
    message.error('添加产品失败: ' + (error.message || '未知错误'));
  }
};

const handleFileExport = () => {
  message.info('文件导出功能开发中');
};

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '', // Override the '页' suffix for quick jumper
  },
}));

// Define the type for the table data
interface DataItem {
  id?: number;
  key?: number;
  productId: string; // 商品ID
  ipRole: string; // IP角色
  productModel: string; // 产品型号
  productName: string; // 产品名称
  productType: string; // 产品类型
  color: string; // 颜色
  productionBatch: string; // 生产批次
  manufacturer: string; // 生产厂家
  qrCodeFileDirectory: string; // 二维码文件目录
  qrCodeExported: string; // 二维码是否导出
  barcodeFileDirectory: string; // 条形码目录
  barcodeExported: string; // 条形码是否导出
  deviceId: string; // 设备ID
  subAccountId: string; // 子账户ID
  fileExportTime: string; // 文件导出时间
  firstBindingTime: string; // 首次绑定时间
  creatorId: number; // 创建人
  creationTime?: string; // 创建时间 (optional, handled by database)
  updateTime: string; // 更新时间
  serialNumber?: number; // Added for batch creation
}

// Add interface for toy production data
interface ToyProductionItem {
  id: number;
  key: number;
  productionBatchId: string; // 生产批次ID
  productModel: string; // 产品型号
  productName: string; // 产品名称
  productionBatchDate: string; // 生产批次 (date)
  manufacturer: string; // 生产厂家
  unitPrice: number; // 单价(元)
  quantity: number; // 数量(个)
  totalPrice: number; // 总价(元)
  updater: string; // 更新人
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
  defaultSortOrder?: 'ascend' | 'descend';
  customRender?: (record: any) => string | number;
  className?: string;
}

const columnConfigs = [
  { key: 'serialNumber', title: '序号', dataIndex: 'serialNumber', width: 60, fixed: 'left', customRender: ({ index }: { index: number }) => (currentPage.value - 1) * pageSize.value + index + 1 },
  { key: 'productId', title: '商品ID', dataIndex: 'productId', width: 120 },
  { key: 'ipRole', title: 'IP角色', dataIndex: 'ipRole', width: 100,       customRender: ({ text }: { text: any, record: any }) => {
    if (!text || text === '') return '-';
    return h('a', {
      style: { cursor: 'pointer' },
      onClick: () => router.push({ name: 'agent-configuration', query: { search: text } })
    }, text);
  }},
  { key: 'productModel', title: '产品型号', dataIndex: 'productModel', width: 120, customRender: ({ text }: { text: any, record: any }) => {
    if (!text || text === '') return '-';
    return h('a', {
      style: { cursor: 'pointer' },
      onClick: () => router.push({ name: 'product-type', query: { search: text } })
    }, text);
  }},
  { key: 'productName', title: '产品名称', dataIndex: 'productName', width: 200 },
  { key: 'productType', title: '产品类型', dataIndex: 'productType', width: 200 },
  { key: 'color', title: '颜色', dataIndex: 'color', width: 100 },
  { key: 'productionBatch', title: '生产批次', dataIndex: 'productionBatch', width: 120, customRender: ({ text }: { text: any, record: any }) => {
    if (!text || text === '') return '-';
    return h('a', {
      style: { cursor: 'pointer' },
      onClick: () => router.push({ name: 'product-type', query: { search: text } })
    }, text);
  }},
  { key: 'manufacturer', title: '生产厂家', dataIndex: 'manufacturer', width: 200 },
  { key: 'qrCodeFileDirectory', title: '二维码文件目录', dataIndex: 'qrCodeFileDirectory', width: 200 },
  { key: 'qrCodeExported', title: '二维码是否导出', dataIndex: 'qrCodeExported', width: 120 },
  { key: 'barcodeFileDirectory', title: '条形码目录', dataIndex: 'barcodeFileDirectory', width: 200 },
  { key: 'barcodeExported', title: '条形码是否导出', dataIndex: 'barcodeExported', width: 120 },
  { key: 'deviceId', title: '设备ID', dataIndex: 'deviceId', width: 220, customRender: ({ text }: { text: any, record: any }) => {
    if (!text || text === '') return '-';
    return h('a', {
      style: { cursor: 'pointer' },
      onClick: () => router.push({ name: 'device-management', query: { search: text } })
    }, text);
  }},
  { key: 'subAccountId', title: '子账户ID', dataIndex: 'subAccountId', width: 120, customRender: ({ text }: { text: any, record: any }) => {
    if (!text || text === '') return '-';
    return h('a', {
      style: { cursor: 'pointer' },
      onClick: () => router.push({ name: 'account', query: { search: text } })
    }, text);
  }},
  { key: 'fileExportTime', title: '文件导出时间', dataIndex: 'fileExportTime', width: 160, sorter: (a: any, b: any) => new Date(a.fileExportTime).getTime() - new Date(b.fileExportTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'firstBindingTime', title: '首次绑定时间', dataIndex: 'firstBindingTime', width: 160, sorter: (a: any, b: any) => new Date(a.firstBindingTime).getTime() - new Date(b.firstBindingTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'creatorId', title: '创建人', dataIndex: 'creatorId', width: 80 },
  { key: 'creationTime', title: '创建时间', dataIndex: 'creationTime', width: 160, sorter: (a: any, b: any) => new Date(a.creationTime).getTime() - new Date(b.creationTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'updateTime', title: '更新时间', dataIndex: 'updateTime', width: 160, sorter: (a: any, b: any) => new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'operation', title: '操作', dataIndex: 'operation', width: 200, fixed: 'right' },
  // ... rest of your columns remain the same
];
// Store column order and visibility separately
const columnOrder = ref<string[]>(columnConfigs.map(config => config.key));
const selectedColumnKeys = ref<string[]>(columnConfigs.map(config => config.key));

const sorterInfo = ref<any>({
  columnKey: 'updateTime',
  order: 'descend',
});

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
    defaultSortOrder: config.defaultSortOrder,
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
const fetchProductList = async () => {
  try {
    loading.value = true;
    console.log('Fetching product list data...');
    
    const response = await axios.get(constructApiUrl('product-list'));
    console.log('Product list response:', response.data);
    
    // Transform the data to ensure all required fields are present
    rawData.value = response.data.map((item: any, index: number) => ({
      id: item.id,
      key: index + 1,
      productId: item.product_id || item.productId || '',
      ipRole: item.ip_role || item.ipRole || '',
      productModel: item.product_model || item.productModel || '',
      productName: item.product_name || item.productName || '',
      productType: item.product_type || item.productType || '',
      color: item.color || '',
      productionBatch: item.production_batch || item.productionBatch || '',
      manufacturer: item.manufacturer || '',
      qrCodeFileDirectory: item.qr_code_file_directory || item.qrCodeFileDirectory || '',
      qrCodeExported: item.qr_code_exported || item.qrCodeExported || '',
      barcodeFileDirectory: item.barcode_file_directory || item.barcodeFileDirectory || '',
      barcodeExported: item.barcode_exported || item.barcodeExported || '',
      deviceId: item.device_id || item.deviceId || '',
      subAccountId: item.sub_account_id || item.subAccountId || '',
      fileExportTime: item.file_export_time || item.fileExportTime || '',
      firstBindingTime: item.first_binding_time || item.firstBindingTime || '',
      creatorId: item.creator_id || item.creatorId || 0,
      creationTime: item.creation_time || item.creationTime || '',
      updateTime: item.update_time || item.updateTime || '',
      serialNumber: item.serial_number || 1 // Ensure serialNumber is present
    }));
    
    console.log('Processed product list data:', rawData.value);
  } catch (error) {
    console.error('Error fetching product list:', error);
    message.error('获取商品列表数据失败，请检查网络连接');
    rawData.value = [];
  } finally {
    loading.value = false;
  }
};

// const createProductList = async (productListData: Omit<DataItem, 'key' | 'id' | 'updateTime'>) => {
//   try {
//     const response = await axios.post(constructApiUrl('product-list'), productListData);
//     await fetchProductList(); // Refresh data
//     return response.data;
//   } catch (error) {
//     console.error('Error creating product list:', error);
//     throw error;
//   }
// };
const createProductList = async (productListData: Omit<DataItem, 'key' | 'id' | 'updateTime'>) => {
  try {
    console.log('Creating product with data:', productListData);
    
    // Match the exact database schema - only send fields that exist in the database
    const apiData: any = {
      serial_number: productListData.serialNumber || 1,
      product_id: productListData.productId || '',
      ip_role: productListData.ipRole || '',
      product_model: productListData.productModel || '',
      product_name: productListData.productName || '',
      product_type: productListData.productType || '',
      color: productListData.color || '',
      production_batch: productListData.productionBatch || '',
      manufacturer: productListData.manufacturer || '',
      qr_code_file_directory: productListData.qrCodeFileDirectory || '',
      qr_code_exported: productListData.qrCodeExported || '否',
      barcode_file_directory: productListData.barcodeFileDirectory || '',
      barcode_exported: productListData.barcodeExported || '否',
      device_id: productListData.deviceId || '', // Allow empty as requested
      sub_account_id: productListData.subAccountId || '', // Allow empty as requested
      file_export_time: productListData.fileExportTime || '',
      first_binding_time: productListData.firstBindingTime || '',
      creator_id: productListData.creatorId || 1
    };
    
    // Debug: Verify we have exactly 18 fields as expected by the database
    console.log('Number of fields being sent:', Object.keys(apiData).length);
    console.log('Expected: 18 fields');
    if (Object.keys(apiData).length !== 18) {
      console.error('FIELD COUNT MISMATCH! Expected 18, got:', Object.keys(apiData).length);
    }
    
    console.log('Sending API data (matching DB schema):', apiData);
    console.log('API data keys:', Object.keys(apiData));
    console.log('API data values:', Object.values(apiData));
    
    const response = await axios.post(constructApiUrl('product-list'), apiData);
    console.log('Product creation response:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('Error creating product list:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

// Function removed - using enhanced batch creation instead
const testSimpleProductCreation = async () => {
  try {
    const testData = {
      product_id: 'TEST_001',
      product_name: '测试产品',
      product_type: '玩具',
      product_model: '测试型号',
      ip_role: '默认',
      color: '默认',
      production_batch: '2025-01-27',
      manufacturer: '测试厂家',
      qr_code_file_directory: '/test/qr.png',
      qr_code_exported: '否',
      barcode_file_directory: '/test/barcode.png',
      barcode_exported: '否',
      creator_id: 1,
      creation_time: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    
    console.log('Testing with corrected data:', testData);
    const response = await axios.post(constructApiUrl('product-list'), testData);
    console.log('Test response:', response.data);
    message.success('测试成功！');
  } catch (error: any) {
    console.error('Test failed:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    message.error('测试失败');
  }
};

// Test the new batch add endpoint
const testBatchAddEndpoint = async () => {
  try {
    console.log('Testing batch add endpoint with empty request');
    
    // Test with empty request
    const response = await axios.post(constructApiUrl('product-list/test-batch-add'), {});
    console.log('Batch add test response:', response.data);
    message.success('批量新增端点测试成功！');
    
    // Test with regular data
    const testData = {
      product_id: 'TEST_BATCH_001',
      product_name: '测试批量产品',
      product_type: '玩具'
    };
    
    const response2 = await axios.post(constructApiUrl('product-list/test-batch-add'), testData);
    console.log('Regular creation test response:', response2.data);
    message.success('常规创建端点测试成功！');
    
  } catch (error: any) {
    console.error('Batch add endpoint test failed:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    message.error('批量新增端点测试失败');
  }
};

// Test database connection
const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    const response = await axios.get(constructApiUrl('product-list/test-db'));
    console.log('Database test response:', response.data);
    
    if (response.data.connection === 'OK') {
      message.success('数据库连接正常！');
      if (response.data.tableExists) {
        message.success('product_list表存在！');
        console.log('Table structure:', response.data.tableStructure);
      } else {
        message.warning('product_list表不存在！');
      }
    } else {
      message.error('数据库连接失败！');
    }
  } catch (error: any) {
    console.error('Database connection test failed:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    message.error('数据库连接测试失败');
  }
};

// Test table structure
const testTableStructure = async () => {
  try {
    console.log('Testing table structure...');
    const response = await axios.get(constructApiUrl('product-list/test-db'));
    console.log('Table structure test response:', response.data);
    
    if (response.data.tableStructure) {
      const columns = response.data.tableStructure;
      const columnNames = columns.map((col: any) => col.Field).join(', ');
      message.success(`表结构: ${columnNames}`);
      console.log('Available columns:', columnNames);
    } else {
      message.warning('无法获取表结构信息');
    }
  } catch (error: any) {
    console.error('Table structure test failed:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    message.error('表结构测试失败');
  }
};
// updateProductList function removed - not used in this component

const deleteProductList = async (id: number) => {
  try {
    await axios.delete(constructApiUrl(`product-list/${id}`));
    await fetchProductList(); // Refresh data
  } catch (error) {
    console.error('Error deleting product list:', error);
    throw error;
  }
};

const searchInputValue = ref('');

// Handle search parameter from URL
onMounted(() => {
  if (route.query.search) {
    searchInputValue.value = route.query.search as string;
  }
  fetchProductList(); // Fetch data on component mount
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

const handleTableChange = (
  paginationData: any,
  filters: any,
  sorter: any,
) => {
  console.log('Table change:', paginationData, filters, sorter);
  
  // Handle sorting changes only - pagination is handled by separate handlers
  const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;
  if (currentSorter && currentSorter.order) {
    sorterInfo.value = {
      columnKey: currentSorter.columnKey,
      order: currentSorter.order,
    };
  } else {
    // When sorting is cleared, revert to default
    sorterInfo.value = {
      columnKey: 'updateTime',
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

const onRefresh = () => {
  console.log('Refresh button clicked!');
  searchInputValue.value = '';
  currentPage.value = 1;
  resetColumns(); // Reset column order and visibility
  fetchProductList(); // Fetch fresh data from API
};

// Add selector reactive values and computed options
const productIdValue = ref('');
const productNameValue = ref('');
const productTypeValue = ref('');
const ipRoleValue = ref('');
const colorValue = ref('');

const productNameOptions = computed(() => [{ value: '', label: '全部' }, ...Array.from(new Set(rawData.value.map(item => item.productName))).map(v => ({ value: v, label: v }))]);
const productTypeOptions = computed(() => [{ value: '', label: '全部' }, ...Array.from(new Set(rawData.value.map(item => item.productType))).map(v => ({ value: v, label: v }))]);
const ipRoleOptions = computed(() => [{ value: '', label: '全部' }, ...Array.from(new Set(rawData.value.map(item => item.ipRole))).map(v => ({ value: v, label: v }))]);
const colorOptions = computed(() => [{ value: '', label: '全部' }, ...Array.from(new Set(rawData.value.map(item => item.color))).map(v => ({ value: v, label: v }))]);

const filteredData = computed(() => {
  let dataToFilter: DataItem[] = [...rawData.value];
  
  if (productIdValue.value) {
    dataToFilter = dataToFilter.filter(item => item.productId === productIdValue.value);
  }
  if (productNameValue.value) {
    dataToFilter = dataToFilter.filter(item => item.productName === productNameValue.value);
  }
  if (productTypeValue.value) {
    dataToFilter = dataToFilter.filter(item => item.productType === productTypeValue.value);
  }
  if (ipRoleValue.value) {
    dataToFilter = dataToFilter.filter(item => item.ipRole === ipRoleValue.value);
  }
  if (colorValue.value) {
    dataToFilter = dataToFilter.filter(item => item.color === colorValue.value);
  }
  if (searchInputValue.value) {
    const searchTerm = searchInputValue.value.toLowerCase();
    dataToFilter = dataToFilter.filter((item) => {
      return Object.values(item).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(searchTerm)
      );
    });
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

const currentPage = ref(1);
const pageSize = ref(10);

// Computed property for paginated data
const paginatedData = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  const paginated = filteredData.value.slice(startIndex, endIndex);
  console.log('PaginatedData:', {
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    startIndex,
    endIndex,
    totalItems: filteredData.value.length,
    paginatedItems: paginated.length
  });
  return paginated;
});

// Pagination change handlers
const handlePageChange = (page: number, size: number) => {
  console.log('Pagination onChange called:', page, size);
  currentPage.value = page;
  if (size !== pageSize.value) {
    pageSize.value = size;
    currentPage.value = 1; // Reset to first page when page size changes
  }
  console.log('Current page after change:', currentPage.value);
};

const handlePageSizeChange = (current: number, size: number) => {
  console.log('Pagination onShowSizeChange called:', current, size);
  pageSize.value = size;
  currentPage.value = 1; // Reset to first page when page size changes
  console.log('Page size after change:', pageSize.value);
};

const pagination = computed(() => {
  const paginationConfig = {
    total: filteredData.value.length, 
    current: currentPage.value,
    pageSize: pageSize.value,
    showSizeChanger: true, 
    pageSizeOptions: ['10', '20', '50'], 
    showTotal: (total: number, range: [number, number]) => `第${range[0]}-${range[1]}条/共${total}条`, 
    showQuickJumper: { goButton: '页' },
    onChange: handlePageChange,
    onShowSizeChange: handlePageSizeChange
  };
  console.log('Pagination config:', paginationConfig);
  return paginationConfig;
});

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
      await deleteProductList(record.id);
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

/* Make the action buttons horizontal and style export as blue and bold */
:deep(.ant-table-cell .action-cell) {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 150px;
}
:deep(.ant-table-cell .action-cell .export-link) {
  color: #1890ff !important; /* Ant Design blue */
  font-weight: bold;
}
:deep(.ant-table-cell .action-cell .danger-link) {
  color: #ff4d4f !important; /* Ant Design red */
  font-weight: bold;
}

:deep(.product-type-select .ant-select-selector) {
  padding-left: 65px !important;
}
:deep(.product-name-select .ant-select-selector) {
  padding-left: 70px !important;
}
:deep(.ip-role-select .ant-select-selector) {
  padding-left: 50px !important;
}
:deep(.color-select .ant-select-selector) {
  padding-left: 40px !important;
}

:deep(.member-type-select .ant-select-selector) {
  padding-left: 65px !important;
}

:deep(.member-payment-select .ant-select-selector) {
  padding-left: 65px !important;
}

:deep(.fourg-payment-select .ant-select-selector) {
  padding-left: 55px !important;
}

:deep(.fourg-plan-select .ant-select-selector) {
  padding-left: 55px !important;
}

:deep(.nowrap-header) {
  white-space: nowrap !important;
}

:deep(.ant-select-selector:hover),
:deep(.ant-select-focused .ant-select-selector) {
  background-color: #f5f5f5 !important;
  transition: background 0.2s;
}

:deep(.ant-table-column-sorter-up),
:deep(.ant-table-column-sorter-down) {
  color: #bfbfbf; /* grey by default */
}
:deep(.ant-table-column-sorter-up.active),
:deep(.ant-table-column-sorter-down.active) {
  color: #1677ff; /* blue when active */
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
/* Button spacing for the new buttons */
.right-aligned-icons .ant-btn {
  margin-left: 8px;
}
/* Modal styling */
.modal-content {
  padding: 20px 0;
}

.section-header {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;
  color: rgba(0, 0, 0, 0.85);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.confirmation-content {
  text-align: center;
  padding: 20px 0;
}

.warning-icon {
  font-size: 48px;
  color: #faad14;
  margin-bottom: 16px;
}

.warning-message {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.6;
}
.form-confirmation-content {
  text-align: center;
  padding: 20px 0;
}

.confirmation-icon {
  font-size: 48px;
  color: #52c41a;
  margin-bottom: 16px;
}

.confirmation-message {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 24px;
  font-weight: 500;
}

.form-data-summary {
  background: #fafafa;
  border-radius: 6px;
  padding: 16px;
  margin: 16px 0;
  text-align: left;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.summary-item .label {
  color: rgba(0, 0, 0, 0.65);
  font-weight: 500;
}

.summary-item .value {
  color: rgba(0, 0, 0, 0.85);
  font-weight: 600;
}

/* Quantity info styling */
.quantity-info {
  margin-top: 8px;
  padding: 8px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
}

.quantity-info p {
  margin: 4px 0;
  font-size: 12px;
}

.quantity-info .text-success {
  color: #52c41a;
}

.quantity-info .text-info {
  color: #1890ff;
}

.text-success {
  color: #52c41a;
}

.text-info {
  color: #1890ff;
}

.text-danger {
  color: #ff4d4f;
}

.text-muted {
  color: #8c8c8c;
}

.text-center {
  text-align: center;
}
</style>
