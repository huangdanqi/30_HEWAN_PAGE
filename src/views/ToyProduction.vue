<template>
  <div class="toy-production-container">
    <ToyProductionTitle />

    <ToyProductionHeader
      v-model:searchText="searchText"
      v-model:filterToyType="filterToyType"
      v-model:filterMaterial="filterMaterial"
      :uniqueToyTypes="uniqueToyTypes"
      :uniqueMaterials="uniqueMaterials"
      @search="handleSearch"
      @refresh="fetchData"
      @create-toy-production="handleCreateToyProduction"
      @configure-columns="showConfigModal"
    />

    <ToyProductionTable
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

import ToyProductionTitle from '../components/ToyProductionTitle.vue';
import ToyProductionHeader from '../components/ToyProductionHeader.vue';
import ToyProductionTable from '../components/ToyProductionTable.vue';

interface DataItem {
  key: string;
  serialNumber: number; // 序号
  toyID: string; // 玩具ID
  toyName: string; // 玩具名称
  toyType: string; // 玩具类型
  material: string; // 材料
  productionDate: string; // 生产日期
  batchNumber: string; // 批次号
  quantity: number; // 数量
  creator: string; // 创建人
  creationTime: string; // 创建时间
  updateTime: string; // 更新时间
}

const data = ref<DataItem[]>([]);
const loading = ref(false);
const searchText = ref('');
const filterToyType = ref('all');
const filterMaterial = ref('all');
const isConfigModalVisible = ref(false);
const visibleColumnKeys = ref<string[]>([]);

const uniqueToyTypes = ref<string[]>(['盲盒', '手办', '模型']);
const uniqueMaterials = ref<string[]>(['塑料', '金属', '木材', '布料']);

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
  { title: '玩具ID', dataIndex: 'toyID', key: 'toyID', width: 120 },
  { title: '玩具名称', dataIndex: 'toyName', key: 'toyName', width: 150 },
  { title: '玩具类型', dataIndex: 'toyType', key: 'toyType', width: 100 },
  { title: '材料', dataIndex: 'material', key: 'material', width: 100 },
  { title: '生产日期', dataIndex: 'productionDate', key: 'productionDate', width: 150, sorter: true },
  { title: '批次号', dataIndex: 'batchNumber', key: 'batchNumber', width: 120 },
  { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
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
  console.log('Fetching toy production data with filters:', filterToyType.value, filterMaterial.value, searchText.value);
  console.log('Pagination:', pagination.current, pagination.pageSize);

  await new Promise(resolve => setTimeout(resolve, 1000));

  const dummyData: DataItem[] = Array.from({ length: 50 }).map((_, i) => ({
    key: `toy-item-${i}`,
    serialNumber: i + 1,
    toyID: `TOY${100 + i}`,
    toyName: '智能机器人',
    toyType: '模型',
    material: '塑料',
    productionDate: '2025-07-20',
    batchNumber: `BATCH${200 + i}`,
    quantity: Math.floor(Math.random() * 1000) + 100,
    creator: '小明',
    creationTime: '2025-07-20 10:00:00',
    updateTime: '2025-07-20 11:30:00',
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

const handleCreateToyProduction = () => {
  message.info('新建玩具生产 functionality to be implemented');
  // TODO: Implement create toy production logic
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

watch([filterToyType, filterMaterial], () => {
  pagination.current = 1;
  fetchData();
});

</script>

<style scoped>
.toy-production-container {
  padding: 24px;
}
</style> 