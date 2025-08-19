<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>工具配置</h2>
    </div>

    <!-- select item area -->
    <div class="top-controls-wrapper">
      <div class="left-aligned-section">
        <div class="select-container tool-type-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">工具类型:</span>
          <a-tooltip :title="toolTypeValue.label">
          <a-select
            v-model:value="toolTypeValue"
              style="width: 110px;"
            :options="toolTypeOptions"
            @change="handleToolTypeChange"
            :allowClear="true" 
            label-in-value
          >
            <a-select-option value="all">全部</a-select-option>
            <!-- If you have dynamic options, add them here -->
          </a-select>
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
            @input="handleSearchChange"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
          <a-button type="primary" @click="handleCreateTool">新建工具</a-button>
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
      <template v-if="column.key === 'operation_14'">
        <a-space class="action-cell" direction="horizontal">
          <a class="view-link" @click="$emit('view-record', record)">查看</a>
          <a-divider type="vertical" />
          <a class="edit-link" @click="handleEditTool(record)">编辑</a>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定要删除该工具吗?"
            @confirm="$emit('delete-record', record)"
          >
            <a class="danger-link">删除</a>
          </a-popconfirm>
        </a-space>
      </template>
      <template v-if="column.key === 'apiAddress_4'">
        <span>{{ record.apiAddress || '-' }}</span>
      </template>
      <template v-if="column.key === 'localToolFilePath_5'">
        <span>{{ record.localToolFilePath || '-' }}</span>
      </template>
      <template v-if="column.key === 'accumulatedUsage_9'">
        <span>{{ record.accumulatedUsage }}次</span>
      </template>
      <template v-if="column.key === 'accumulatedCost_10'">
        <span>{{ record.accumulatedCost }}元</span>
      </template>
    </template>
      </a-table>
    </div>

    <!-- 新建工具 Modal -->
    <a-modal
      v-model:open="showCreateToolModal"
      title="新建工具"
      :width="600"
      @cancel="handleCreateToolModalCancel"
    >
      <a-form
        :model="{
          toolName: toolName,
          accessType: accessType,
          apiAddress: apiAddress,
          localToolFilePath: localToolFilePath,
          billingUnit: billingUnit,
          unitCost: unitCost
        }"
        :rules="createToolFormRules"
        layout="vertical"
        ref="createToolFormRef"
      >
        <a-form-item label="工具类型" required>
          <a-input
            v-model:value="selectedToolType"
            placeholder="请选择或输入工具类型"
            class="tool-type-input"
          />
        </a-form-item>

        <a-form-item label="工具名称" name="toolName" required>
          <a-input v-model:value="toolName" placeholder="请输入" />
        </a-form-item>

        <a-form-item label="访问地址" name="accessType" required>
          <a-radio-group v-model:value="accessType">
            <a-radio value="api">API调用工具</a-radio>
            <a-radio value="local">本地工具</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item v-if="accessType === 'api'" label="API地址" name="apiAddress" required>
          <a-input v-model:value="apiAddress" placeholder="请输入URL" />
        </a-form-item>

        <a-form-item v-if="accessType === 'local'" label="本地工具文件目录" name="localToolFilePath" required>
          <a-input v-model:value="localToolFilePath" placeholder="请输入" />
        </a-form-item>

        <a-form-item v-if="accessType === 'api'" label="计费单位" name="billingUnit" required>
          <a-input v-model:value="billingUnit" placeholder="请输入" />
        </a-form-item>

        <a-form-item v-if="accessType === 'api'" label="单位费用" name="unitCost" required>
          <a-input v-model:value="unitCost" placeholder="请输入" suffix="元" />
        </a-form-item>

        <a-collapse v-model:activeKey="activeCollapseKeys" ghost>
          <template #expandIcon="{ isActive }">
            <PlusOutlined v-if="!isActive" style="font-weight: bold; font-size: 16px;" />
            <MinusOutlined v-else style="font-weight: bold; font-size: 16px;" />
          </template>
          <a-collapse-panel key="auth" header="认证信息">
            <div v-for="(field, index) in authFields" :key="index" style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
              <a-form-item required style="flex: 1; margin-bottom: 0;">
                <template #label>
                 字段名
                </template>
                <a-input placeholder="请输入" v-model:value="field.fieldName" />
              </a-form-item>
              <a-form-item required style="flex: 1; margin-bottom: 0;">
                <template #label>
                  类型
                </template>
                <a-select v-model:value="field.fieldType" placeholder="请选择" style="width: 100%;">
                  <a-select-option value="string">字符串</a-select-option>
                  <a-select-option value="boolean">布尔</a-select-option>
                  <a-select-option value="number">数字</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item required style="flex: 1; margin-bottom: 0;">
                <template #label>
                   值
                </template>
                <a-input 
                  v-if="field.fieldType !== 'boolean'" 
                  placeholder="请输入" 
                  v-model:value="field.value" 
                />
                <a-switch 
                  v-else 
                  v-model:checked="field.value" 
                  :checked-children="'是'" 
                  :un-checked-children="'否'"
                />
              </a-form-item>
              <div style="display: flex; gap: 4px; margin-top: 24px;">
                <PlusOutlined 
                  style="cursor: pointer; font-weight: bold; font-size: 16px;" 
                  @click="addAuthField"
                />
                <MinusCircleOutlined 
                  style="color: #ff4d4f; cursor: pointer; font-weight: bold; font-size: 16px;" 
                  @click="removeAuthField(index)"
                />
              </div>
            </div>
            <div v-if="authFields.length === 0" style="display: flex; justify-content: center; margin-top: 16px;">
              <a-button type="dashed" @click="addAuthField">
                <PlusOutlined style="font-weight: bold; font-size: 16px;" />
                添加字段
              </a-button>
            </div>
          </a-collapse-panel>

          <a-collapse-panel key="custom" header="自定义参数">
            <div v-for="(field, index) in customFields" :key="index" style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
              <a-form-item required style="flex: 1; margin-bottom: 0;">
                <template #label>
                  字段名
                </template>
                <a-input placeholder="请输入" v-model:value="field.fieldName" />
              </a-form-item>
              <a-form-item required style="flex: 1; margin-bottom: 0;">
                <template #label>
                  类型
                </template>
                <a-select v-model:value="field.fieldType" placeholder="请选择" style="width: 100%;">
                  <a-select-option value="string">字符串</a-select-option>
                  <a-select-option value="boolean">布尔</a-select-option>
                  <a-select-option value="number">数字</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item required style="flex: 1; margin-bottom: 0;">
                <template #label>
                 值
                </template>
                <a-input 
                  v-if="field.fieldType !== 'boolean'" 
                  placeholder="请输入" 
                  v-model:value="field.value" 
                />
                <a-switch 
                  v-else 
                  v-model:checked="field.value" 
                  :checked-children="'是'" 
                  :un-checked-children="'否'"
                />
              </a-form-item>
              <div style="display: flex; gap: 4px; margin-top: 24px;">
                <PlusOutlined 
                  style="cursor: pointer; font-weight: bold; font-size: 16px;" 
                  @click="addCustomField"
                />
                <MinusCircleOutlined 
                  style="color: #ff4d4f; cursor: pointer; font-weight: bold; font-size: 16px;" 
                  @click="removeCustomField(index)"
                />
              </div>
            </div>
            <div v-if="customFields.length === 0" style="display: flex; justify-content: center; margin-top: 16px;">
              <a-button type="dashed" @click="addCustomField">
                <PlusOutlined style="font-weight: bold; font-size: 16px;" />
                添加字段
              </a-button>
            </div>
          </a-collapse-panel>
        </a-collapse>
      </a-form>
      
      <template #footer>
        <div style="text-align: right; padding: 10px 0;">
          <a-button @click="handleCreateToolModalCancel">取消</a-button>
          <a-button type="primary" @click="handleCreateToolModalConfirm" style="margin-left: 8px;">确定</a-button>
        </div>
      </template>
    </a-modal>

    <!-- 编辑工具 Modal -->
    <a-modal
      v-model:open="showEditToolModal"
      title="编辑工具"
      :width="600"
      @cancel="handleEditToolModalCancel"
    >
      <a-form
        :model="{
          toolType: editToolType,
          toolName: editToolName,
          accessType: editAccessType,
          apiAddress: editApiAddress,
          localToolFilePath: editLocalToolFilePath,
          billingUnit: editBillingUnit,
          unitCost: editUnitCost
        }"
        :rules="createToolFormRules"
        layout="vertical"
        ref="editToolFormRef"
      >
        <a-form-item label="工具类型" name="toolType" required>
          <a-auto-complete
            v-model:value="editToolType"
            placeholder="请选择或输入工具类型"
            :options="toolTypeSuggestions"
            @change="handleEditModalToolTypeChange"
            @blur="handleEditToolTypeBlur"
            @search="handleToolTypeSearch"
            allow-clear
          />
        </a-form-item>

        <a-form-item label="工具名称" name="toolName" required>
          <a-input v-model:value="editToolName" placeholder="请输入" />
        </a-form-item>

        <a-form-item label="访问地址" name="accessType" required>
          <a-radio-group v-model:value="editAccessType">
            <a-radio value="api">API调用工具</a-radio>
            <a-radio value="local">本地工具</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item v-if="editAccessType === 'api'" label="API地址" name="apiAddress" required>
          <a-input v-model:value="editApiAddress" placeholder="请输入URL" />
        </a-form-item>

        <a-form-item v-if="editAccessType === 'local'" label="本地工具文件目录" name="localToolFilePath" required>
          <a-input v-model:value="editLocalToolFilePath" placeholder="请输入" />
        </a-form-item>

        <a-form-item v-if="editAccessType === 'api'" label="计费单位" name="billingUnit" required>
          <a-input v-model:value="editBillingUnit" placeholder="请输入" />
        </a-form-item>

        <a-form-item v-if="editAccessType === 'api'" label="单位费用" name="unitCost" required>
          <a-input v-model:value="editUnitCost" placeholder="请输入" suffix="元" />
        </a-form-item>

        <a-collapse v-model:activeKey="editActiveCollapseKeys" ghost>
          <template #expandIcon="{ isActive }">
            <PlusOutlined v-if="!isActive" style="font-weight: bold; font-size: 16px;" />
            <MinusOutlined v-else style="font-weight: bold; font-size: 16px;" />
          </template>
          <a-collapse-panel key="auth" header="认证信息">
            <div v-for="(field, index) in editAuthFields" :key="index" style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
              <a-form-item required style="flex: 1; margin-bottom: 0;">
                <template #label>
                 字段名
                </template>
                <a-input placeholder="请输入" v-model:value="field.fieldName" />
              </a-form-item>
              <a-form-item required style="flex: 1; margin-bottom: 0;">
                <template #label>
                  类型
                </template>
                <a-select v-model:value="field.fieldType" placeholder="请选择" style="width: 100%;">
                  <a-select-option value="string">字符串</a-select-option>
                  <a-select-option value="boolean">布尔</a-select-option>
                  <a-select-option value="number">数字</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item required style="flex: 1; margin-bottom: 0;">
                <template #label>
                   值
                </template>
                <a-input 
                  v-if="field.fieldType !== 'boolean'" 
                  placeholder="请输入" 
                  v-model:value="field.value" 
                />
                <a-switch 
                  v-else 
                  v-model:checked="field.value" 
                  :checked-children="'是'" 
                  :un-checked-children="'否'"
                />
              </a-form-item>
              <div style="display: flex; gap: 4px; margin-top: 24px;">
                <PlusOutlined 
                  style="cursor: pointer; font-weight: bold; font-size: 16px;" 
                  @click="addEditAuthField"
                />
                <MinusCircleOutlined 
                  style="color: #ff4d4f; cursor: pointer; font-weight: bold; font-size: 16px;" 
                  @click="removeEditAuthField(index)"
                />
              </div>
            </div>
            <div v-if="editAuthFields.length === 0" style="display: flex; justify-content: center; margin-top: 16px;">
              <a-button type="dashed" @click="addEditAuthField">
                <PlusOutlined style="font-weight: bold; font-size: 16px;" />
                添加字段
              </a-button>
            </div>
          </a-collapse-panel>

          <a-collapse-panel key="custom" header="自定义参数">
            <div v-for="(field, index) in editCustomFields" :key="index" style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
              <a-form-item required style="flex: 1; margin-bottom: 0;">
                <template #label>
                  字段名
                </template>
                <a-input placeholder="请输入" v-model:value="field.fieldName" />
              </a-form-item>
              <a-form-item required style="flex: 1; margin-bottom: 0;">
                <template #label>
                  类型
                </template>
                <a-select v-model:value="field.fieldType" placeholder="请选择" style="width: 100%;">
                  <a-select-option value="string">字符串</a-select-option>
                  <a-select-option value="boolean">布尔</a-select-option>
                  <a-select-option value="number">数字</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item required style="flex: 1; margin-bottom: 0;">
                <template #label>
                 值
                </template>
                <a-input 
                  v-if="field.fieldType !== 'boolean'" 
                  placeholder="请输入" 
                  v-model:value="field.value" 
                />
                <a-switch 
                  v-else 
                  v-model:checked="field.value" 
                  :checked-children="'是'" 
                  :un-checked-children="'否'"
                />
              </a-form-item>
              <div style="display: flex; gap: 4px; margin-top: 24px;">
                <PlusOutlined 
                  style="cursor: pointer; font-weight: bold; font-size: 16px;" 
                  @click="addEditCustomField"
                />
                <MinusCircleOutlined 
                  style="color: #ff4d4f; cursor: pointer; font-weight: bold; font-size: 16px;" 
                  @click="removeEditCustomField(index)"
                />
              </div>
            </div>
            <div v-if="editCustomFields.length === 0" style="display: flex; justify-content: center; margin-top: 16px;">
              <a-button type="dashed" @click="addEditCustomField">
                <PlusOutlined style="font-weight: bold; font-size: 16px;" />
                添加字段
              </a-button>
            </div>
          </a-collapse-panel>
        </a-collapse>
      </a-form>
      
      <template #footer>
        <div style="text-align: right; padding: 10px 0;">
          <a-button @click="handleEditToolModalCancel">取消</a-button>
          <a-button type="primary" @click="handleEditToolModalConfirm" style="margin-left: 8px;">确定</a-button>
        </div>
      </template>
    </a-modal>
  </a-config-provider>
</template>
<script lang="ts" setup>
import type { ColumnsType } from 'ant-design-vue/es/table';
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme, message } from 'ant-design-vue';
import { ReloadOutlined, ColumnHeightOutlined, SettingOutlined, SearchOutlined, ExportOutlined, PlusOutlined, MinusOutlined, MinusCircleOutlined} from '@ant-design/icons-vue';
import draggable from 'vuedraggable';
import { 
  createColumnConfigs, 
  useTableColumns, 
  createColumn,
  type ColumnDefinition 
} from '../utils/tableConfig';
import { constructApiUrl } from '../utils/api';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '', // Override the '页' suffix for quick jumper
  },
}));

// Get current username from auth store
const currentUsername = computed(() => {
  return authStore.user?.name || authStore.user?.username || '管理员';
});

interface DataItem {
  id: number;
  toolId: string; // 工具ID
  toolType: string; // 工具类型
  toolName: string; // 工具名称
  apiAddress: string; // API地址
  localToolFilePath: string; // 本地工具文件目录
  purchaseTime: string; // 购买时间
  activationTime: string; // 启用时间
  expirationTime: string; // 到期时间
  accumulatedUsage: number; // 累积使用量
  accumulatedCost: number; // 累积费用
  updater: string; // 更新人
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
}

interface FieldItem {
  fieldName: string;
  fieldType: 'string' | 'boolean' | 'number';
  value: string | boolean | number;
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
  sortOrder?: 'ascend' | 'descend';
  defaultSortOrder?: 'ascend' | 'descend';
  customRender?: (record: any) => string | number;
  customCell?: (record: any) => any;
  className?: string;
}

const columnConfigs: ColumnConfig[] = [
  { key: 'rowIndex', title: '序号', dataIndex: 'rowIndex', width: 60, fixed: 'left', customRender: ({ index }) => (currentPage.value - 1) * pageSize.value + index + 1, sorter: (a, b) => a.id - b.id, sortDirections: ['ascend', 'descend'] },
  { key: 'toolId_1', title: '工具ID', dataIndex: 'toolId', width: 150, sorter: (a, b) => a.toolId.localeCompare(b.toolId), sortDirections: ['ascend', 'descend'] },
  { key: 'toolType_2', title: '工具类型', dataIndex: 'toolType', width: 120, sorter: (a, b) => a.toolType.localeCompare(b.toolType), sortDirections: ['ascend', 'descend'] },
  { key: 'toolName_3', title: '工具名称', dataIndex: 'toolName', width: 120, sorter: (a, b) => a.toolName.localeCompare(b.toolName), sortDirections: ['ascend', 'descend'] },
  { key: 'apiAddress_4', title: 'API地址', dataIndex: 'apiAddress', width: 200, sorter: (a, b) => (a.apiAddress || '').localeCompare(b.apiAddress || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'localToolFilePath_5', title: '本地工具文件目录', dataIndex: 'localToolFilePath', width: 200, sorter: (a, b) => (a.localToolFilePath || '').localeCompare(b.localToolFilePath || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'purchaseTime_6', title: '购买时间', dataIndex: 'purchaseTime', width: 150, sorter: (a, b) => new Date(a.purchaseTime).getTime() - new Date(b.purchaseTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'activationTime_7', title: '启用时间', dataIndex: 'activationTime', width: 150, sorter: (a, b) => new Date(a.activationTime).getTime() - new Date(b.activationTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'expirationTime_8', title: '到期时间', dataIndex: 'expirationTime', width: 150, sorter: (a, b) => new Date(a.expirationTime).getTime() - new Date(b.expirationTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'accumulatedUsage_9', title: '累积使用量', dataIndex: 'accumulatedUsage', width: 120, sorter: (a, b) => a.accumulatedUsage - b.accumulatedUsage, sortDirections: ['ascend', 'descend'] },
  { key: 'accumulatedCost_10', title: '累积费用', dataIndex: 'accumulatedCost', width: 120, sorter: (a, b) => a.accumulatedCost - b.accumulatedCost, sortDirections: ['ascend', 'descend'] },
  { key: 'updater_11', title: '更新人', dataIndex: 'updater', width: 100, sorter: (a, b) => (a.updater || '').localeCompare(b.updater || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'createdAt_12', title: '创建时间', dataIndex: 'createdAt', width: 150, sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'updatedAt_13', title: '更新时间', dataIndex: 'updatedAt', width: 150, sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'operation_14', title: '操作', dataIndex: '', width: 180, fixed: 'right' },
];

// Store column order and visibility separately
const columnOrder = ref<string[]>(columnConfigs.map(config => config.key));
const selectedColumnKeys = ref<string[]>(columnConfigs.map(config => config.key));

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

// Data fetching from MySQL
const rawData = ref<DataItem[]>([]);

const fetchData = async () => {
  console.log('fetchData called');
  loading.value = true;
  try {
    console.log('Calling tool-configuration endpoint');
    const response = await axios.get(constructApiUrl(`tool-configuration?page=${currentPage.value}&pageSize=${pageSize.value}`));
    console.log('Tool configuration response:', response.data);
    
    if (response.data.success && response.data.data) {
      totalCount.value = response.data.total || response.data.data.length;
      rawData.value = response.data.data.map((item: any) => ({
        ...item,
        accumulatedUsage: item.accumulatedUsage || 0,
        accumulatedCost: item.accumulatedCost || 0
      }));
    } else {
      message.error('获取数据失败：服务器返回无效数据');
      rawData.value = [];
      totalCount.value = 0;
    }
  } catch (error: any) {
    console.error('Error fetching data:', error);
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      if (error.response.status === 404) {
        message.error('错误：工具配置表不存在，请检查数据库');
      } else if (error.response.status === 500) {
        message.error('错误：数据库连接失败或表结构错误');
      } else {
        message.error(`获取数据失败：${error.response.data?.message || '服务器错误'}`);
      }
    } else if (error.request) {
      // Network error
      message.error('错误：无法连接到服务器，请检查网络连接');
    } else {
      // Other errors
      message.error('错误：获取数据时发生未知错误');
    }
    
    // Set empty data instead of fallback data
    rawData.value = [];
    totalCount.value = 0;
  } finally {
    loading.value = false;
  }
};

const toolTypeValue = ref({ key: 'all', label: '全部', value: 'all' });

const toolTypeOptions = computed(() => {
  const uniqueToolTypes = Array.from(new Set(rawData.value.map(item => item.toolType)));
  const options = uniqueToolTypes.map(type => ({
    key: type,
    value: type,
    label: type,
  }));
  return [
    { key: 'all', value: 'all', label: '全部' },
    ...options
  ];
});

const handleToolTypeChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    toolTypeValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    toolTypeValue.value = val;
  }
  // Reset to first page when filter changes
  currentPage.value = 1;
  fetchData();
};

const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);

console.log('Initial toolTypeValue:', toolTypeValue.value);

const sorterInfo = ref<any>({
  columnKey: 'updatedAt',
  order: 'descend',
});

const pagination = computed(() => ({
  total: totalCount.value,
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
    fetchData(); // Fetch new data when page size changes
  },
  onChange: (page: number, size: number) => {
    console.log('onChange', page, size);
    currentPage.value = page;
    pageSize.value = size;
    fetchData(); // Fetch new data when page changes
  },
}));

const onRefresh = () => {
  console.log('Refresh button clicked!');
  loading.value = true; // Show loading icon
  searchInputValue.value = '';
  currentPage.value = 1;
  resetColumns(); // Reset column order and visibility

  // Reset all selector values to '全部'
  toolTypeValue.value = { key: 'all', label: '全部', value: 'all' };

  // Fetch fresh data from MySQL
  fetchData();
};

const filteredData = computed(() => {
  let dataToFilter = rawData.value;

  if (searchInputValue.value) {
    const searchTerm = searchInputValue.value.toLowerCase();
    dataToFilter = dataToFilter.filter((item: DataItem) => {
      return Object.values(item).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(searchTerm)
      );
    });
  }

  // Filter by Tool Type
  if (
    toolTypeValue.value &&
    toolTypeValue.value.value !== 'all' &&
    toolTypeValue.value.value !== ''
  ) {
    const filterToolType = toolTypeValue.value.value;
    dataToFilter = dataToFilter.filter(item => item.toolType === filterToolType);
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

const searchInputValue = ref('');

// Watch for search input changes
const searchTimeout = ref<NodeJS.Timeout | null>(null);
const handleSearchChange = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1;
    fetchData();
  }, 500);
};

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
    fetchData(); // Fetch new data when pagination changes
  }
  
  // Handle sorting changes
  const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;
  if (currentSorter && currentSorter.order) {
    sorterInfo.value = {
      columnKey: currentSorter.columnKey,
      order: currentSorter.order,
    };
  } else {
    // When sorting is cleared, revert to default
    sorterInfo.value = {
      columnKey: 'updatedAt',
      order: 'descend',
    };
  }
};

const onSettingClick = () => {
  console.log('Setting clicked');
};

const loading = ref(false); // Add a loading state

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

const handleCreateTool = () => {
  console.log('Create tool button clicked');
  showCreateToolModal.value = true;
};

// Modal state variables
const showCreateToolModal = ref(false);
const selectedToolType = ref('');
const toolName = ref('');
const accessType = ref('api'); // 'api' or 'local'
const apiAddress = ref('');
const localToolFilePath = ref('');
const billingUnit = ref('');
const unitCost = ref('');
const activeCollapseKeys = ref<string[]>([]);
const authFields = ref<FieldItem[]>([]);
const customFields = ref<FieldItem[]>([]);

// Form validation rules
const createToolFormRules = {
  toolType: [{ required: true, message: '请选择工具类型', trigger: 'blur' }],
  toolName: [{ required: true, message: '请输入工具名称', trigger: 'blur' }],
  accessType: [{ required: true, message: '请选择访问类型', trigger: 'change' }],
  apiAddress: [{ required: true, message: '请输入API地址', trigger: 'blur' }],
  localToolFilePath: [{ required: true, message: '请输入本地工具文件目录', trigger: 'blur' }],
  billingUnit: [{ required: true, message: '请输入计费单位', trigger: 'blur' }],
  unitCost: [{ required: true, message: '请输入单位费用', trigger: 'blur' }]
};

const createToolFormRef = ref();

// Modal handlers
const handleCreateToolModalCancel = () => {
  showCreateToolModal.value = false;
  createToolFormRef.value?.resetFields();
  // Reset form data
  selectedToolType.value = '';
  toolName.value = '';
  accessType.value = 'api';
  apiAddress.value = '';
  localToolFilePath.value = '';
  billingUnit.value = '';
  unitCost.value = '';
  authFields.value = [];
  customFields.value = [];
  activeCollapseKeys.value = [];
};

const handleCreateToolModalConfirm = async () => {
  try {
    await createToolFormRef.value?.validate();
    
    // Generate a unique tool ID
    const toolId = 'tool_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Prepare the data for the API
    const toolData = {
      toolId: toolId,
      toolType: selectedToolType.value,
      toolName: toolName.value,
      apiAddress: accessType.value === 'api' ? apiAddress.value : null,
      localToolFilePath: accessType.value === 'local' ? localToolFilePath.value : null,
      purchaseTime: new Date().toISOString().slice(0, 19).replace('T', ' '), // Current time
      activationTime: new Date().toISOString().slice(0, 19).replace('T', ' '), // Current time
      expirationTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), // 1 year from now
      accumulatedUsage: 0,
      accumulatedCost: 0.00,
      updater: currentUsername.value // Use dynamic username from auth store
    };

    console.log('Creating tool configuration:', toolData);
    
    // Send POST request to create new tool
    const response = await axios.post('http://121.43.196.106:2829/api/tool-configuration', toolData);
    
    if (response.data.success) {
      message.success('工具创建成功！');
      showCreateToolModal.value = false;
      createToolFormRef.value?.resetFields();
      
      // Reset form data
      selectedToolType.value = '';
      toolName.value = '';
      accessType.value = 'api';
      apiAddress.value = '';
      localToolFilePath.value = '';
      billingUnit.value = '';
      unitCost.value = '';
      authFields.value = [];
      customFields.value = [];
      activeCollapseKeys.value = [];
      
      // Refresh the table data to show the new record
      fetchData();
    } else {
      message.error('创建失败：' + (response.data.message || '未知错误'));
    }
  } catch (error: any) {
    console.error('Error creating tool:', error);
    if (error.response?.data?.message) {
      message.error('创建失败：' + error.response.data.message);
    } else {
      message.error('创建失败：网络错误或服务器错误');
    }
  }
};





const addAuthField = () => {
  authFields.value.push({ fieldName: '', fieldType: 'string', value: '' });
};

// Watch for field type changes to reset value appropriately
watch(authFields, (newFields) => {
  newFields.forEach(field => {
    if (field.fieldType === 'boolean' && typeof field.value !== 'boolean') {
      field.value = false;
    } else if (field.fieldType !== 'boolean' && typeof field.value === 'boolean') {
      field.value = '';
    }
  });
}, { deep: true });

const removeAuthField = (index: number) => {
  authFields.value.splice(index, 1);
};

const addCustomField = () => {
  customFields.value.push({ fieldName: '', fieldType: 'string', value: '' });
};

// Watch for field type changes to reset value appropriately
watch(customFields, (newFields) => {
  newFields.forEach(field => {
    if (field.fieldType === 'boolean' && typeof field.value !== 'boolean') {
      field.value = false;
    } else if (field.fieldType !== 'boolean' && typeof field.value === 'boolean') {
      field.value = '';
    }
  });
}, { deep: true });

const removeCustomField = (index: number) => {
  customFields.value.splice(index, 1);
};

// Edit modal state variables
const showEditToolModal = ref(false);
const currentEditingToolId = ref<number | null>(null); // Track which tool is being edited
const editToolType = ref('');
const editToolName = ref('');
const editAccessType = ref('api');
const editApiAddress = ref('');
const editLocalToolFilePath = ref('');
const editBillingUnit = ref('');
const editUnitCost = ref('');
const editActiveCollapseKeys = ref<string[]>([]);
const editAuthFields = ref<FieldItem[]>([]);
const editCustomFields = ref<FieldItem[]>([]);

const editToolFormRef = ref();

// Edit modal handlers
const handleEditTool = (record: DataItem) => {
  console.log('Edit tool clicked for record:', record);
  
  // Store the tool ID for the update operation
  currentEditingToolId.value = record.id;
  
  // Pre-fill the form with data from the selected row
  editToolType.value = record.toolType;
  editToolName.value = record.toolName;
  editAccessType.value = record.apiAddress ? 'api' : 'local';
  editApiAddress.value = record.apiAddress || '';
  editLocalToolFilePath.value = record.localToolFilePath || '';
  editBillingUnit.value = 'h'; // Default value
  editUnitCost.value = '3'; // Default value
  
  // Pre-fill authentication fields with sample data
  editAuthFields.value = [
    { fieldName: 'API Key', fieldType: 'string', value: 'hjhwn832nj2f' },
    { fieldName: 'Bot Id', fieldType: 'string', value: '456546572' }
  ];
  
  // Pre-fill custom parameters with sample data
  editCustomFields.value = [
    { fieldName: 'Temperature', fieldType: 'number', value: '0.7' }
  ];
  
  editActiveCollapseKeys.value = ['auth', 'custom'];
  showEditToolModal.value = true;
};

const handleEditToolModalCancel = () => {
  showEditToolModal.value = false;
  editToolFormRef.value?.resetFields();
  
  // Reset form data
  currentEditingToolId.value = null;
  editToolType.value = '';
  editToolName.value = '';
  editAccessType.value = 'api';
  editApiAddress.value = '';
  editLocalToolFilePath.value = '';
  editBillingUnit.value = '';
  editUnitCost.value = '';
  editAuthFields.value = [];
  editCustomFields.value = [];
  editActiveCollapseKeys.value = [];
};

const handleEditToolModalConfirm = async () => {
  try {
    await editToolFormRef.value?.validate();
    
    if (!currentEditingToolId.value) {
      message.error('错误：无法识别要编辑的工具');
      return;
    }
    
    // Validate required fields
    if (!editToolType.value || !editToolName.value) {
      message.error('错误：工具类型和工具名称不能为空');
      return;
    }
    
    if (editAccessType.value === 'api' && !editApiAddress.value) {
      message.error('错误：API地址不能为空');
      return;
    }
    
    if (editAccessType.value === 'local' && !editLocalToolFilePath.value) {
      message.error('错误：本地工具文件目录不能为空');
      return;
    }
    
    // Prepare the data for the API update
    const updateData = {
      toolType: editToolType.value,
      toolName: editToolName.value,
      apiAddress: editAccessType.value === 'api' ? editApiAddress.value : null,
      localToolFilePath: editAccessType.value === 'local' ? editLocalToolFilePath.value : null,
      billingUnit: editAccessType.value === 'api' ? editBillingUnit.value : null,
      unitCost: editAccessType.value === 'api' ? editUnitCost.value : null,
      updater: currentUsername.value || '管理员', // Use dynamic username from auth store
      updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ') // Current timestamp
    };
    
    console.log('Updating tool with data:', updateData);
    
    // Use the same approach as create form - send POST request
    console.log('Sending POST request to create updated tool');
    console.log('Request data:', updateData);
    
    // Generate a new unique tool ID for the updated record
    const newToolId = 'tool_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Prepare the data using the same structure as create form
    const toolData = {
      toolId: newToolId,
      toolType: editToolType.value,
      toolName: editToolName.value,
      apiAddress: editAccessType.value === 'api' ? editApiAddress.value : null,
      localToolFilePath: editAccessType.value === 'local' ? editLocalToolFilePath.value : null,
      purchaseTime: new Date().toISOString().slice(0, 19).replace('T', ' '), // Current time
      activationTime: new Date().toISOString().slice(0, 19).replace('T', ' '), // Current time
      expirationTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), // 1 year from now
      accumulatedUsage: 0,
      accumulatedCost: 0.00,
      updater: currentUsername.value // Use dynamic username from auth store
    };
    
    try {
      // Send POST request to create new tool (same as create form)
      const response = await axios.post('http://121.43.196.106:2829/api/tool-configuration', toolData);
      
      console.log('POST response:', response);
      
      if (response.data.success) {
        message.success('工具信息已更新！');
        showEditToolModal.value = false;
        editToolFormRef.value?.resetFields();
        
        // Reset form data
        currentEditingToolId.value = null;
        editToolType.value = '';
        editToolName.value = '';
        editAccessType.value = 'api';
        editApiAddress.value = '';
        editLocalToolFilePath.value = '';
        editBillingUnit.value = '';
        editUnitCost.value = '';
        editAuthFields.value = [];
        editCustomFields.value = [];
        editActiveCollapseKeys.value = [];
        
        // Refresh the table data to show the new record
        fetchData();
      } else {
        message.error('更新失败：' + (response.data.message || '未知错误'));
      }
    } catch (error: any) {
      console.error('POST request failed:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Show detailed error information
      if (error.response?.data?.message) {
        message.error('更新失败：' + error.response.data.message);
      } else if (error.response?.status === 500) {
        message.error('更新失败：服务器内部错误 (500) - 请检查服务器日志');
      } else {
        message.error('更新失败：网络错误或服务器错误');
      }
    }
  } catch (error: any) {
    console.error('Form validation or other error:', error);
    message.error('更新失败：表单验证失败');
  }
};

const handleEditModalToolTypeChange = (value: string) => {
  editToolType.value = value;
  // Trigger validation after change
  editToolFormRef.value?.validateField('toolType');
};

const handleEditToolTypeBlur = () => {
  // Trigger validation on blur
  editToolFormRef.value?.validateField('toolType');
};

// Add computed property for tool type suggestions
const toolTypeSuggestions = computed(() => {
  // Get unique tool types from the table data
  const uniqueToolTypes = Array.from(new Set(rawData.value.map(item => item.toolType)));
  
  // Convert to autocomplete options format
  return uniqueToolTypes.map(type => ({
    value: type,
    label: type,
  }));
});

const handleToolTypeSearch = (value: string) => {
  // This function can be used for additional search logic if needed
  console.log('Searching for tool type:', value);
};



const addEditAuthField = () => {
  editAuthFields.value.push({ fieldName: '', fieldType: 'string', value: '' });
};

// Watch for edit form field type changes to reset value appropriately
watch(() => editAuthFields.value, (newFields) => {
  newFields.forEach(field => {
    if (field.fieldType === 'boolean' && typeof field.value !== 'boolean') {
      field.value = false;
    } else if (field.fieldType !== 'boolean' && typeof field.value === 'boolean') {
      field.value = '';
    }
  });
}, { deep: true });

const removeEditAuthField = (index: number) => {
  editAuthFields.value.splice(index, 1);
};

const addEditCustomField = () => {
  editCustomFields.value.push({ fieldName: '', fieldType: 'string', value: '' });
};

const removeEditCustomField = (index: number) => {
  editCustomFields.value.splice(index, 1);
};

// Hyperlink functions

onMounted(() => {
  selectedColumnKeys.value = columnConfigs.map(config => config.key);
  fetchData(); // Fetch from MySQL
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

/* Fix placeholder positioning for tool type input */
.tool-type-input :deep(.ant-input) {
  padding: 0 !important;
  text-align: left !important;
}

.tool-type-input :deep(.ant-input::placeholder) {
  text-align: left !important;
  padding: 0 !important;
  margin: 0 !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  transform: none !important;
}



/* Make the action buttons horizontal and style '编辑' as blue and bold */
:deep(.ant-table-cell .action-cell) {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 120px;
  white-space: nowrap;
  flex-wrap: nowrap;
}

:deep(.ant-table-cell .action-cell .view-link) {
  color: #1890ff !important; /* Ant Design blue */
  font-weight: bold;
  white-space: nowrap;
}

:deep(.ant-table-cell .action-cell .edit-link) {
  color: #1890ff !important; /* Ant Design blue */
  font-weight: bold;
  white-space: nowrap;
}

:deep(.ant-table-cell .action-cell .danger-link) {
  color: #ff4d4f !important; /* Ant Design red */
  font-weight: bold;
  white-space: nowrap;
}

:deep(.tool-type-select .ant-select-selector) {
  padding-left: 70px !important;
}

:deep(.nowrap-header) {
  white-space: nowrap !important;
}
</style> 