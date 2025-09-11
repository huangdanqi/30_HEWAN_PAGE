<template>
  <div class="log-query-container">
    <LogQueryTitle />

    <LogQueryHeader
      v-model:searchText="searchText"
      v-model:filterOperationType="filterOperationType"
      v-model:filterUser="filterUser"
      v-model:dateRange="dateRange"
      :uniqueOperationTypes="uniqueOperationTypes"
      :uniqueUsers="uniqueUsers"
      @search="handleSearch"
      @refresh="fetchData"
      @configure-columns="showConfigModal"
    />

    <LogQueryTable
      :columns="columns"
      :data="data"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      @view-details="viewDetails"
    />

    <!-- Column Configuration Modal -->
    <a-modal
      title="Configure Table Columns"
      v-model:open="isConfigModalVisible"
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

import LogQueryTitle from '../components/LogQueryTitle.vue';
import LogQueryHeader from '../components/LogQueryHeader.vue';
import LogQueryTable from '../components/LogQueryTable.vue';

interface DataItem {
  key: string;
  serialNumber: number; // 序号
  operationType: string; // 操作类型
  operationContent: string; // 操作内容
  operator: string; // 操作人
  operationTime: string; // 操作时间
  ipAddress: string; // IP地址
}

const data = ref<DataItem[]>([]);
const loading = ref(false);
const searchText = ref('');
const filterOperationType = ref('all');
const filterUser = ref('all');
const dateRange = ref<[string, string]>(['', '']);
const isConfigModalVisible = ref(false);
const visibleColumnKeys = ref<string[]>([]);

const uniqueOperationTypes = ref<string[]>(['全部', '登录', '登出', '创建', '更新', '删除']);
const uniqueUsers = ref<string[]>(['全部', 'admin', 'user1', 'user2']);

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
  { title: '操作类型', dataIndex: 'operationType', key: 'operationType', width: 120 },
  { title: '操作内容', dataIndex: 'operationContent', key: 'operationContent', width: 300 },
  { title: '操作人', dataIndex: 'operator', key: 'operator', width: 100 },
  { title: '操作时间', dataIndex: 'operationTime', key: 'operationTime', width: 180, sorter: true },
  { title: 'IP地址', dataIndex: 'ipAddress', key: 'ipAddress', width: 150 },
  {
    title: '操作',
    key: 'operation',
    fixed: 'right' as const,
    width: 100,
  },
];

const columns = computed(() => {
  return allColumns.filter(column => visibleColumnKeys.value.includes(column.key as string));
});

const fetchData = async () => {
  loading.value = true;
  console.log('Fetching log query data with filters:', 
    filterOperationType.value, 
    filterUser.value, 
    dateRange.value, 
    searchText.value
  );
  console.log('Pagination:', pagination.current, pagination.pageSize);

  await new Promise(resolve => setTimeout(resolve, 1000));

  const dummyData: DataItem[] = Array.from({ length: 50 }).map((_, i) => ({
    key: `log-item-${i}`,
    serialNumber: i + 1,
    operationType: i % 3 === 0 ? '登录' : i % 3 === 1 ? '创建' : '删除',
    operationContent: `用户 ${i + 1} 执行了操作`,
    operator: `user${i % 2 === 0 ? 1 : 2}`,
    operationTime: '2025-07-22 10:00:00',
    ipAddress: `192.168.1.${i}`,
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

const viewDetails = (record: DataItem) => {
  console.log('Viewing details for record:', record);
  message.info('查看详情 functionality to be implemented');
  // TODO: Implement view details logic
};

onMounted(() => {
  fetchData();
  selectAllColumns(); // Select all columns by default on mount
});

watch([filterOperationType, filterUser, dateRange, searchText], () => {
  pagination.current = 1;
  fetchData();
});

</script>

<style scoped>
.log-query-container {
  padding: 24px;
}
</style> 