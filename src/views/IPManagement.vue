<template>
  <div class="ip-management-container">
    <IPManagementTitle />

    <IPManagementHeader
      v-model:searchText="searchText"
      @search="handleSearch"
      @refresh="fetchData"
      @create-ip="handleCreateIP"
      @show-info="handleShowInfo"
      @configure-columns="showConfigModal"
    />

    <IPManagementTable
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

import IPManagementTitle from '../components/IPManagementTitle.vue';
import IPManagementHeader from '../components/IPManagementHeader.vue';
import IPManagementTable from '../components/IPManagementTable.vue';

interface DataItem {
  key: string;
  serialNumber: number; // 序号
  ipID: string; // IP ID
  ipName: string; // IP名称
  ipDescription: string; // IP介绍
  ipAudioLibrary: string; // IP音库
  ipMaterialLibrary: string; // IP素材库
  creator: string; // 创建人
  creatorAvatar: string; // 创建人头像
  creationTime: string; // 创建时间
  updateTime: string; // 更新时间
}

const data = ref<DataItem[]>([]);
const loading = ref(false);
const searchText = ref('');
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
  { title: 'IP ID', dataIndex: 'ipID', key: 'ipID', width: 120 },
  { title: 'IP名称', dataIndex: 'ipName', key: 'ipName', width: 150 },
  { title: 'IP介绍', dataIndex: 'ipDescription', key: 'ipDescription', width: 200 },
  { title: 'IP音库', dataIndex: 'ipAudioLibrary', key: 'ipAudioLibrary', width: 200 },
  { title: 'IP素材库', dataIndex: 'ipMaterialLibrary', key: 'ipMaterialLibrary', width: 200 },
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
  console.log('Fetching IP management data with filters:', searchText.value);
  console.log('Pagination:', pagination.current, pagination.pageSize);

  await new Promise(resolve => setTimeout(resolve, 1000));

  const dummyData: DataItem[] = Array.from({ length: 50 }).map((_, i) => ({
    key: `ip-item-${i}`,
    serialNumber: i + 1,
    ipID: `hjhwmn832nj${i}`,
    ipName: '啵啵',
    ipDescription: '星座：白羊座；MBTI: INFP；属性：火；性格：开朗、乐观、富有同情心、好奇心强、善于思考和创造、追求自由、热爱自然和艺术、有自己的独特见解。',
    ipAudioLibrary: 'https://example.com/firmware.bin',
    ipMaterialLibrary: 'https://example.com/firmware.bin',
    creator: '33',
    creatorAvatar: '/images/avatar.jpg',
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

const handleCreateIP = () => {
  message.info('新建IP functionality to be implemented');
  // TODO: Implement create IP logic
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

watch(searchText, () => {
  pagination.current = 1;
  fetchData();
});

</script>

<style scoped>
.ip-management-container {
  padding: 24px;
}
</style> 