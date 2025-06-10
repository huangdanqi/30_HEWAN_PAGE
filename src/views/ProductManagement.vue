<template>
  <div class="product-management-container">
    <ProductManagementTitle />

    <ProductManagementHeader
      v-model:searchText="searchText"
      v-model:filterDeviceModel="filterDeviceModel"
      v-model:filterProductType="filterProductType"
      v-model:filterIpName="filterIpName"
      :uniqueDeviceModels="uniqueDeviceModels"
      :uniqueProductTypes="uniqueProductTypes"
      :uniqueIpNames="uniqueIpNames"
      @search="handleSearch"
      @refresh="fetchData"
      @create-product="handleCreateProduct"
      @show-info="handleShowInfo"
      @configure-columns="showConfigModal"
    />

    <ProductManagementTable
      :columns="columns"
      :data="data"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      @edit-record="editRecord"
      @delete-record="deleteRecord"
    />

    <!-- Column Configuration Modal -->
    <a-modal
      title="Configure Table Columns"
      v-model:visible="isConfigModalVisible"
      @cancel="handleConfigModalClose"
      @ok="handleConfigModalClose"
    >
      <div>
        <h3>
          Visible Columns
          <a-button type="link" @click="selectAllColumns" style="float: right;">Select All</a-button>
        </h3>
        <a-checkbox-group v-model:value="visibleColumnKeys">
          <div v-for="column in allColumns" :key="column.key as string">
            <a-checkbox :value="column.key as string">{{ column.title }}</a-checkbox>
          </div>
        </a-checkbox-group>
      </div>
    </a-modal>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import type { TablePaginationConfig, TableColumnType } from 'ant-design-vue';
import { message } from 'ant-design-vue';

import ProductManagementTitle from '../components/ProductManagementTitle.vue';
import ProductManagementHeader from '../components/ProductManagementHeader.vue';
import ProductManagementTable from '../components/ProductManagementTable.vue';

interface DataItem {
  key: string;
  serialNumber: number; // 序号
  productID: string; // 产品ID
  productName: string; // 产品名称
  productType: string; // 产品类型
  color: string; // 颜色
  productDetails: string; // 产品详情
  deviceModel: string; // 设备型号
  ipName: string; // IP名称
  creator: string; // 创建人
  creatorAvatar: string; // 创建人头像
  creationTime: string; // 创建时间
  updateTime: string; // 更新时间
}

const data = ref<DataItem[]>([]);
const loading = ref(false);
const searchText = ref('');
const filterDeviceModel = ref('all');
const filterProductType = ref('all');
const filterIpName = ref('all');
const isConfigModalVisible = ref(false);
const visibleColumnKeys = ref<string[]>([]);

const uniqueDeviceModels = ref<string[]>(['HWSZ001', 'HWSZ002']);
const uniqueProductTypes = ref<string[]>(['盲盒挂件', '玩具']);
const uniqueIpNames = ref<string[]>(['哆啦A梦', '蜡笔小新']);

const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total: number) => `第 ${((pagination.current as number) - 1) * (pagination.pageSize as number) + 1}-${Math.min((pagination.current as number) * (pagination.pageSize as number), total)}条/共 ${total} 条`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
});

const allColumns: TableColumnType[] = [
  { title: '序号', dataIndex: 'serialNumber', key: 'serialNumber', fixed: 'left', width: 70 },
  { title: '产品ID', dataIndex: 'productID', key: 'productID', width: 120 },
  { title: '产品名称', dataIndex: 'productName', key: 'productName', width: 150 },
  { title: '产品类型', dataIndex: 'productType', key: 'productType', width: 100 },
  { title: '颜色', dataIndex: 'color', key: 'color', width: 80 },
  { title: '产品详情', dataIndex: 'productDetails', key: 'productDetails', width: 200 },
  { title: '设备型号', dataIndex: 'deviceModel', key: 'deviceModel', width: 120 },
  { title: 'IP名称', dataIndex: 'ipName', key: 'ipName', width: 100 },
  { title: '创建人', dataIndex: 'creator', key: 'creator', width: 100 },
  { title: '创建时间', dataIndex: 'creationTime', key: 'creationTime', width: 150, sorter: true },
  { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 150, sorter: true },
  {
    title: '操作',
    key: 'operation',
    fixed: 'right' as const,
    width: 150,
  },
];

const columns = computed(() => {
  return allColumns.filter(column => visibleColumnKeys.value.includes(column.key as string));
});

const fetchData = async () => {
  loading.value = true;
  console.log('Fetching product data with filters:', filterDeviceModel.value, filterProductType.value, filterIpName.value, searchText.value);
  console.log('Pagination:', pagination.current, pagination.pageSize);

  await new Promise(resolve => setTimeout(resolve, 1000));

  const dummyData: DataItem[] = Array.from({ length: 50 }).map((_, i) => ({
    key: `product-item-${i}`,
    serialNumber: i + 1,
    productID: `HWSZ00${100 + i}`,
    productName: '粉色啵啵盲盒挂件',
    productType: '盲盒挂件',
    color: '荧光粉',
    productDetails: '布料：云潮望 獭兔毛 10毛 33号；...',
    deviceModel: 'HWSZ001',
    ipName: '啵啵',
    creator: '33',
    creatorAvatar: '/images/avatar.jpg', // Placeholder for avatar
    creationTime: '2025-7-13 19:25:11',
    updateTime: '2025-7-13 19:25:11',
  }));

  data.value = dummyData.slice(
    ((pagination.current as number) - 1) * (pagination.pageSize as number),
    (pagination.current as number) * (pagination.pageSize as number)
  );
  pagination.total = dummyData.length;
  loading.value = false;
};

const handleSearch = (value: string) => {
  searchText.value = value;
  pagination.current = 1;
  fetchData();
};

const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.current = pag.current || 1;
  pagination.pageSize = pag.pageSize || 10;
  fetchData();
};

const showConfigModal = () => {
  isConfigModalVisible.value = true;
};

const handleConfigModalClose = () => {
  isConfigModalVisible.value = false;
};

const selectAllColumns = () => {
  visibleColumnKeys.value = allColumns.map(column => column.key as string);
};

const handleCreateProduct = () => {
  message.info('新建产品 functionality to be implemented');
  // TODO: Implement create product logic
};

const handleShowInfo = () => {
  message.info('显示信息 functionality to be implemented');
  // TODO: Implement show info logic
};

const editRecord = (record: DataItem) => {
  console.log('Editing record:', record);
  message.info('编辑 functionality to be implemented');
  // TODO: Implement edit logic
};

const deleteRecord = (record: DataItem) => {
  console.log('Deleting record:', record);
  message.info('删除 functionality to be implemented');
  // TODO: Implement delete logic
};

onMounted(() => {
  fetchData();
  selectAllColumns(); // Select all columns by default on mount
});

watch([filterDeviceModel, filterProductType, filterIpName], () => {
  pagination.current = 1;
  fetchData();
});

</script>

<style scoped>
.product-management-container {
  padding: 24px;
}
</style> 