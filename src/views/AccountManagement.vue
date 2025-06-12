<template>
  <div class="account-management-container">
    <AccountManagementTitle />

    <AccountManagementHeader
      v-model:searchQuery="searchQuery"
      v-model:packageType="packageType"
      @search="handleSearch"
      @refresh="fetchData"
      @create-member="handleCreateMember"
      @configure-columns="showConfigModal"
    />

    <AccountManagementTable
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

import AccountManagementTitle from '../components/AccountManagementTitle.vue';
import AccountManagementHeader from '../components/AccountManagementHeader.vue';
import AccountManagementTable from '../components/AccountManagementTable.vue';

interface DataItem {
  key: string;
  serialNumber: number; // 序号
  accountID: string; // 账户ID
  accountName: string; // 账户名称
  accountType: string; // 账户类型
  status: string; // 状态
  creationTime: string; // 创建时间
  updateTime: string; // 更新时间
}

const data = ref<DataItem[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const packageType = ref('all');
const isConfigModalVisible = ref(false);
const visibleColumnKeys = ref<string[]>([]);

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
  { title: '账户ID', dataIndex: 'accountID', key: 'accountID', width: 120 },
  { title: '账户名称', dataIndex: 'accountName', key: 'accountName', width: 150 },
  { title: '账户类型', dataIndex: 'accountType', key: 'accountType', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
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
  console.log('Fetching account management data with filters:', searchQuery.value, packageType.value);
  console.log('Pagination:', pagination.current, pagination.pageSize);

  await new Promise(resolve => setTimeout(resolve, 1000));

  const dummyData: DataItem[] = Array.from({ length: 50 }).map((_, i) => ({
    key: `account-item-${i}`,
    serialNumber: i + 1,
    accountID: `ACC${100 + i}`,
    accountName: `用户${i + 1}`,
    accountType: i % 2 === 0 ? '管理员' : '普通用户',
    status: i % 3 === 0 ? '活跃' : '禁用',
    creationTime: '2025-07-21 10:00:00',
    updateTime: '2025-07-21 11:30:00',
  }));

  const filteredData = dummyData.filter(item => {
    if (packageType.value === 'all') {
      return true;
    } else if (packageType.value === 'unlimited') {
      return item.accountType === '管理员';
    } else if (packageType.value === 'limited') {
      return item.accountType === '普通用户';
    }
    return true;
  });

  data.value = filteredData.slice(
    ((pagination.current as number) - 1) * (pagination.pageSize as number),
    (pagination.current as number) * (pagination.pageSize as number)
  );
  pagination.total = filteredData.length;
  loading.value = false;
};

const handleSearch = (value: string) => {
  searchQuery.value = value;
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

const handleCreateMember = () => {
  message.info('新建成员 functionality to be implemented');
  // TODO: Implement create member logic
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
  selectAllColumns();
});

watch(searchQuery, () => {
  pagination.current = 1;
  fetchData();
});

watch(packageType, () => {
  pagination.current = 1;
  fetchData();
});
</script>

<style scoped>
.account-management-container {
  padding: 24px;
}
</style> 