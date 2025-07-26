<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>表格配置演示</h2>
    </div>

    <!-- Control Bar -->
    <div class="top-controls-wrapper">
      <div class="left-aligned-section">
        <div class="select-container status-select" style="margin-right: 16px;">
          <span class="select-always-placeholder">状态:</span>
          <a-tooltip :title="statusValue.label">
            <a-select
              v-model:value="statusValue"
              style="width: 120px;"
              :options="statusOptions"
              @change="handleStatusChange"
              :allowClear="true"
              label-in-value
              placeholder="请选择状态"
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
          placeholder="请输入"
          style="width: 200px; margin-right: 16px;"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
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
        :data-source="filteredData"
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
              <a class="view-link" @click="handleView(record)">查看</a>
              <a-divider type="vertical" />
              <a class="edit-link" @click="handleEdit(record)">编辑</a>
              <a-divider type="vertical" />
              <a class="danger-link" @click="handleDelete(record)">删除</a>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

  </a-config-provider>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme } from 'ant-design-vue';
import { ReloadOutlined, ColumnHeightOutlined, SettingOutlined, SearchOutlined } from '@ant-design/icons-vue';
import draggable from 'vuedraggable';
import { 
  createColumnConfigs, 
  useTableColumns, 
  createColumn,
  type ColumnDefinition 
} from '../utils/tableConfig';

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '',
  },
}));

// Define your data interface
interface DataItem {
  key: number;
  id: string;
  name: string;
  status: string;
  amount: number;
  date: string;
  description: string;
}

// Define column definitions - this is where you add/remove columns
const columnDefinitions: ColumnDefinition[] = [
  createColumn('rowIndex', '序号', 'rowIndex', 60, { fixed: 'left' }),
  createColumn('id', 'ID', 'id', 120),
  createColumn('name', '名称', 'name', 150, { sortable: true, sortType: 'string' }),
  createColumn('status', '状态', 'status', 100, { sortable: true, sortType: 'string' }),
  createColumn('amount', '金额', 'amount', 120, { sortable: true, sortType: 'number' }),
  createColumn('date', '日期', 'date', 150, { sortable: true, sortType: 'date' }),
  createColumn('description', '描述', 'description', 200),
  createColumn('operation', '操作', 'operation', 150, { fixed: 'right' }),
];

// Create column configs from definitions
const columnConfigs = createColumnConfigs(columnDefinitions);

// Use the table columns composable
const {
  columns,
  columnOrder,
  selectedColumnKeys,
  sorterInfo,
  resetColumns,
  onColumnOrderChange,
  handleColumnVisibilityChange,
  handleTableChange,
} = useTableColumns(columnConfigs);

// Generate sample data
const rawData: DataItem[] = [];
for (let i = 0; i < 50; i++) {
  rawData.push({
    key: i + 1,
    id: `ITEM-${String(i + 1).padStart(3, '0')}`,
    name: `项目 ${i + 1}`,
    status: i % 3 === 0 ? '活跃' : i % 3 === 1 ? '暂停' : '完成',
    amount: Math.floor(Math.random() * 10000) + 100,
    date: new Date(2025, 0, 1 + i).toISOString().split('T')[0],
    description: `这是项目 ${i + 1} 的描述信息`,
  });
}

// Filter and search logic
const searchInputValue = ref('');
const statusValue = ref({ key: 'all', label: '全部', value: 'all' });
const loading = ref(false);
const tableSize = ref('middle');
const currentPage = ref(1);
const pageSize = ref(10);

const statusOptions = computed(() => {
  const uniqueStatuses = Array.from(new Set(rawData.map(item => item.status)));
  const options = uniqueStatuses.map(status => ({
    key: status,
    value: status,
    label: status,
  }));
  return [
    { key: 'all', value: 'all', label: '全部' },
    ...options
  ];
});

const handleStatusChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    statusValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    statusValue.value = val;
  }
};

const filteredData = computed(() => {
  let dataToFilter = rawData;

  // Search filter
  if (searchInputValue.value) {
    const searchTerm = searchInputValue.value.toLowerCase();
    dataToFilter = dataToFilter.filter((item: DataItem) => {
      return Object.values(item).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(searchTerm)
      );
    });
  }

  // Status filter
  if (statusValue.value && statusValue.value.value !== 'all') {
    dataToFilter = dataToFilter.filter(item => item.status === statusValue.value.value);
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
  loading.value = true;
  searchInputValue.value = '';
  currentPage.value = 1;
  resetColumns();
  statusValue.value = { key: 'all', label: '全部', value: 'all' };

  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const handleMenuClick = ({ key }: { key: string }) => {
  tableSize.value = key;
};

const onSettingClick = () => {
  console.log('Setting clicked');
};

// Action handlers
const handleView = (record: DataItem) => {
  console.log('View:', record);
};

const handleEdit = (record: DataItem) => {
  console.log('Edit:', record);
};

const handleDelete = (record: DataItem) => {
  console.log('Delete:', record);
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

:deep(.nowrap-header) {
  white-space: nowrap !important;
}
</style> 