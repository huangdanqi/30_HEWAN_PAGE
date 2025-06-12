<template>
  <div class="product-list-container">
    <ProductListTitle />

    <ProductListHeader
      v-model:searchText="searchText"
      v-model:filterProductType="filterProductType"
      v-model:filterProductName="filterProductName"
      v-model:filterColor="filterColor"
      v-model:filterInitialMember="filterInitialMember"
      :uniqueProductTypes="uniqueProductTypes"
      :uniqueProductNames="uniqueProductNames"
      :uniqueColors="uniqueColors"
      :uniqueInitialMembers="uniqueInitialMembers"
      @search="handleSearch"
      @refresh="fetchData"
      @show-info="handleShowInfo"
      @configure-columns="showConfigModal"
    />

    <ProductListTable
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

import ProductListTitle from '../components/ProductListTitle.vue';
import ProductListHeader from '../components/ProductListHeader.vue';
import ProductListTable from '../components/ProductListTable.vue';

interface DataItem {
  key: string;
  serialNumber: number; // 序号
  productID: string; // 商品ID
  productName: string; // 商品名称
  originalProductID: string; // 产品ID
  originalProductName: string; // 产品名称
  productType: string; // 产品类型
  color: string; // 颜色
  initialMember: string; // 初始会员
  deviceID: string; // 设备ID
  subAccountID: string; // 子账户ID
  activationTime: string; // 激活时间
}

const data = ref<DataItem[]>([]);
const loading = ref(false);
const searchText = ref('');
const filterProductType = ref('all');
const filterProductName = ref('all');
const filterColor = ref('all');
const filterInitialMember = ref('all');
const isConfigModalVisible = ref(false);
const visibleColumnKeys = ref<string[]>([]);

const uniqueProductTypes = ref<string[]>(['全部', '盲盒', '手办']);
const uniqueProductNames = ref<string[]>(['全部', '粉色啵啵盲盒挂件', '蓝色啵啵手办']);
const uniqueColors = ref<string[]>(['全部', '荧光粉', '天蓝色']);
const uniqueInitialMembers = ref<string[]>(['全部', '普通会员', '高级会员']);

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
  { title: '商品ID', dataIndex: 'productID', key: 'productID', width: 120 },
  { title: '商品名称', dataIndex: 'productName', key: 'productName', width: 150 },
  { title: '产品ID', dataIndex: 'originalProductID', key: 'originalProductID', width: 120 },
  { title: '产品名称', dataIndex: 'originalProductName', key: 'originalProductName', width: 150 },
  { title: '产品类型', dataIndex: 'productType', key: 'productType', width: 100 },
  { title: '颜色', dataIndex: 'color', key: 'color', width: 80 },
  { title: '初始会员', dataIndex: 'initialMember', key: 'initialMember', width: 100 },
  { title: '设备ID', dataIndex: 'deviceID', key: 'deviceID', width: 200 },
  { title: '子账户ID', dataIndex: 'subAccountID', key: 'subAccountID', width: 150 },
  { title: '激活时间', dataIndex: 'activationTime', key: 'activationTime', width: 150, sorter: true },
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
  console.log('Fetching product list data with filters:', 
    filterProductType.value, 
    filterProductName.value, 
    filterColor.value, 
    filterInitialMember.value, 
    searchText.value
  );
  console.log('Pagination:', pagination.current, pagination.pageSize);

  await new Promise(resolve => setTimeout(resolve, 1000));

  const dummyData: DataItem[] = Array.from({ length: 50 }).map((_, i) => ({
    key: `product-item-${i}`,
    serialNumber: i + 1,
    productID: `hjhwmn832nj2f`,
    productName: '粉色啵啵盲盒挂件普通版',
    originalProductID: `HWSZ00100${i}`,
    originalProductName: '粉色啵啵盲盒挂件',
    productType: '盲盒挂件',
    color: '荧光粉',
    initialMember: '普通会员',
    deviceID: '0075A1B2SZTDSC250619B2X9J8',
    subAccountID: '183****7953',
    activationTime: '2025-7-13 19:25:11',
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

watch([filterProductType, filterProductName, filterColor, filterInitialMember], () => {
  pagination.current = 1;
  fetchData();
});

</script>

<style scoped>
.product-list-container {
  padding: 24px;
}
</style> 