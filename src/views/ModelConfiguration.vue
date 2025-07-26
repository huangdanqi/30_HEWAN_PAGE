<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>模型配置</h2>
    </div>

    <!-- select item area -->
    <div class="top-controls-wrapper">
      <div class="left-aligned-section">
        <div class="select-container model-type-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">模型类型:</span>
          <a-tooltip :title="modelTypeValue.label">
          <a-select
            v-model:value="modelTypeValue"
              style="width: 180px;"
            :options="modelTypeOptions"
            @change="handleModelTypeChange"
            :allowClear="true" 
            label-in-value
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
            v-model:value="searchInputValue"
            placeholder="请输入关键字"
            style="width: 200px"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
          <a-button type="primary" @click="showCreateModelModal = true">新建模型</a-button>
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
  <SettingOutlined @click="() => console.log('Setting clicked')" />
</a-popover>


      </div>
    </div>
      
    <!-- table area -->
    <div class="table-container">
      <a-table
        :columns="columns"
        :data-source="paginatedData"
        :pagination="totalFilteredData === 0 ? false : pagination"
        :loading="loading"
        :size="tableSize"
        :scroll="{ x: 2000 }"
        @change="handleTableChange"
        :showSorterTooltip="false"
      >
      <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'operation'">
        <a-space class="action-cell" direction="horizontal">
          <a class="view-link">查看</a>
          <a-divider type="vertical" />
          <a class="edit-link" @click="handleEditClick(record)">编辑</a>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定要删除该信息吗?"
            @confirm="$emit('delete-record', record)"
          >
            <a class="danger-link">删除</a>
          </a-popconfirm>
        </a-space>
      </template>
      <template v-else-if="column.key === 'updater'">
        <span>33</span>
      </template>
    </template>
      </a-table>
    </div>

    <!-- Create Modal -->
    <a-modal
      v-model:visible="showCreateModelModal"
      title="新建模型"
      :footer="null"
      width="600px"
    >
      <a-form layout="vertical">
        <a-form-item required>
          <template #label>
             模型类型
          </template>
          <a-select v-model:value="selectedModelType" placeholder="请选择" @change="handleModelTypeChange">
            <a-select-option value="VAD">VAD</a-select-option>
            <a-select-option value="ASR">ASR</a-select-option>
            <a-select-option value="意图识别">意图识别</a-select-option>
            <a-select-option value="智能体">智能体</a-select-option>
            <a-select-option value="LLM">LLM</a-select-option>
            <a-select-option value="Memory">Memory</a-select-option>
            <a-select-option value="TTS">TTS</a-select-option>
            <a-select-option value="IP VCM">IP VCM</a-select-option>
            <a-select-option value="User VCM">User VCM</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item required>
          <template #label>
            模型名称
          </template>
          <a-input placeholder="请输入" v-model:value="modelName" />
        </a-form-item>

        <!-- TTS specific fields -->
        <template v-if="selectedModelType === 'TTS'">
          <a-form-item required>
            <template #label>
              音色ID
            </template>
            <a-input placeholder="请输入" />
          </a-form-item>
          <a-form-item required>
            <template #label>
               音色名称
            </template>
            <a-input placeholder="请输入" />
          </a-form-item>
        </template>

        <a-form-item required>
          <template #label>
             访问地址
          </template>
          <a-radio-group v-model:value="accessType">
            <a-radio value="api">API调用模型</a-radio>
            <a-radio value="local">本地模型</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item required v-if="accessType === 'api'">
          <template #label>
            API地址
          </template>
          <a-input placeholder="请输入URL" />
        </a-form-item>

        <a-form-item required v-if="accessType === 'local'">
          <template #label>
            本地模型文件目录
          </template>
          <a-input placeholder="请输入" />
        </a-form-item>

        <a-form-item required v-if="accessType === 'api'">
          <template #label>
             计费单位
          </template>
          <a-input placeholder="请输入" />
        </a-form-item>

        <a-form-item required v-if="accessType === 'api'">
          <template #label>
            单位费用
          </template>
          <a-input placeholder="请输入" suffix="元" style="text-align: right;" />
        </a-form-item>

        <a-collapse v-model:activeKey="activeCollapseKeys" ghost>
          <template #expandIcon="{ isActive }">
            <PlusOutlined v-if="!isActive" style="color: #1890ff; font-weight: bold; font-size: 16px;" />
            <MinusOutlined v-else style="color: #1890ff; font-weight: bold; font-size: 16px;" />
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
                   值
                </template>
                <a-input placeholder="请输入" v-model:value="field.value" />
              </a-form-item>
              <div style="display: flex; gap: 4px; margin-top: 24px;">
                <PlusOutlined 
                  style="color: #1890ff; cursor: pointer; font-weight: bold; font-size: 16px;" 
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
                <PlusOutlined style="color: #1890ff; font-weight: bold; font-size: 16px;" />
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
                 值
                </template>
                <a-input placeholder="请输入" v-model:value="field.value" />
              </a-form-item>
              <div style="display: flex; gap: 4px; margin-top: 24px;">
                <PlusOutlined 
                  style="color: #1890ff; cursor: pointer; font-weight: bold; font-size: 16px;" 
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
                <PlusOutlined style="color: #1890ff; font-weight: bold; font-size: 16px;" />
                添加字段
              </a-button>
            </div>
          </a-collapse-panel>
        </a-collapse>

        <div style="display: flex; justify-content: flex-end; gap: 16px; margin-top: 24px;">
          <a-button @click="showCreateModelModal = false">取消</a-button>
          <a-button type="primary" @click="handleConfirmCreate">确定</a-button>
        </div>
      </a-form>
    </a-modal>

    <!-- Edit Modal -->
    <a-modal
      v-model:visible="showEditModelModal"
      title="编辑模型"
      :footer="null"
      width="600px"
    >
      <a-form layout="vertical">
        <a-form-item required>
          <template #label>
             模型类型
          </template>
          <a-select v-model:value="editForm.selectedModelType" placeholder="请选择" @change="handleEditModelTypeChange">
            <a-select-option value="VAD">VAD</a-select-option>
            <a-select-option value="ASR">ASR</a-select-option>
            <a-select-option value="意图识别">意图识别</a-select-option>
            <a-select-option value="智能体">智能体</a-select-option>
            <a-select-option value="LLM">LLM</a-select-option>
            <a-select-option value="Memory">Memory</a-select-option>
            <a-select-option value="TTS">TTS</a-select-option>
            <a-select-option value="IP VCM">IP VCM</a-select-option>
            <a-select-option value="User VCM">User VCM</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item required>
          <template #label>
            模型名称
          </template>
          <a-input placeholder="请输入" v-model:value="editForm.modelName" />
        </a-form-item>

        <!-- TTS specific fields -->
        <template v-if="editForm.selectedModelType === 'TTS'">
          <a-form-item required>
            <template #label>
              音色ID
            </template>
            <a-input placeholder="请输入" v-model:value="editForm.voiceId" />
          </a-form-item>
          <a-form-item required>
            <template #label>
               音色名称
            </template>
            <a-input placeholder="请输入" v-model:value="editForm.voiceName" />
          </a-form-item>
        </template>

        <a-form-item required>
          <template #label>
             访问地址
          </template>
          <a-radio-group v-model:value="editForm.accessType">
            <a-radio value="api">API调用模型</a-radio>
            <a-radio value="local">本地模型</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item required v-if="editForm.accessType === 'api'">
          <template #label>
            API地址
          </template>
          <a-input placeholder="请输入URL" v-model:value="editForm.apiUrl" />
        </a-form-item>

        <a-form-item required v-if="editForm.accessType === 'local'">
          <template #label>
            本地模型文件目录
          </template>
          <a-input placeholder="请输入" v-model:value="editForm.localModelFileDir" />
        </a-form-item>

        <a-form-item required v-if="editForm.accessType === 'api'">
          <template #label>
             计费单位
          </template>
          <a-input placeholder="请输入" v-model:value="editForm.paymentUnit" />
        </a-form-item>

        <a-form-item required v-if="editForm.accessType === 'api'">
          <template #label>
            单位费用
          </template>
          <a-input placeholder="请输入" suffix="元" style="text-align: right;" v-model:value="editForm.unitCost" />
        </a-form-item>

        <a-collapse v-model:activeKey="editForm.activeCollapseKeys" ghost>
          <template #expandIcon="{ isActive }">
            <PlusOutlined v-if="!isActive" style="color: #1890ff; font-weight: bold; font-size: 16px;" />
            <MinusOutlined v-else style="color: #1890ff; font-weight: bold; font-size: 16px;" />
          </template>
          <a-collapse-panel key="auth" header="认证信息">
            <div v-for="(field, index) in editForm.authFields" :key="index" style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
              <a-form-item required style="flex: 1; margin-bottom: 0;">
                <template #label>
                 字段名
                </template>
                <a-input placeholder="请输入" v-model:value="field.fieldName" />
              </a-form-item>
              <a-form-item required style="flex: 1; margin-bottom: 0;">
                <template #label>
                   值
                </template>
                <a-input placeholder="请输入" v-model:value="field.value" />
              </a-form-item>
              <div style="display: flex; gap: 4px; margin-top: 24px;">
                <PlusOutlined 
                  style="color: #1890ff; cursor: pointer; font-weight: bold; font-size: 16px;" 
                  @click="addEditAuthField"
                />
                <MinusCircleOutlined 
                  style="color: #ff4d4f; cursor: pointer; font-weight: bold; font-size: 16px;" 
                  @click="removeEditAuthField(index)"
                />
              </div>
            </div>
            <div v-if="editForm.authFields.length === 0" style="display: flex; justify-content: center; margin-top: 16px;">
              <a-button type="dashed" @click="addEditAuthField">
                <PlusOutlined style="color: #1890ff; font-weight: bold; font-size: 16px;" />
                添加字段
              </a-button>
            </div>
          </a-collapse-panel>

          <a-collapse-panel key="custom" header="自定义参数">
            <div v-for="(field, index) in editForm.customFields" :key="index" style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
              <a-form-item required style="flex: 1; margin-bottom: 0;">
                <template #label>
                  字段名
                </template>
                <a-input placeholder="请输入" v-model:value="field.fieldName" />
              </a-form-item>
              <a-form-item required style="flex: 1; margin-bottom: 0;">
                <template #label>
                 值
                </template>
                <a-input placeholder="请输入" v-model:value="field.value" />
              </a-form-item>
              <div style="display: flex; gap: 4px; margin-top: 24px;">
                <PlusOutlined 
                  style="color: #1890ff; cursor: pointer; font-weight: bold; font-size: 16px;" 
                  @click="addEditCustomField"
                />
                <MinusCircleOutlined 
                  style="color: #ff4d4f; cursor: pointer; font-weight: bold; font-size: 16px;" 
                  @click="removeEditCustomField(index)"
                />
              </div>
            </div>
            <div v-if="editForm.customFields.length === 0" style="display: flex; justify-content: center; margin-top: 16px;">
              <a-button type="dashed" @click="addEditCustomField">
                <PlusOutlined style="color: #1890ff; font-weight: bold; font-size: 16px;" />
                添加字段
              </a-button>
            </div>
          </a-collapse-panel>
        </a-collapse>

        <div style="display: flex; justify-content: flex-end; gap: 16px; margin-top: 24px;">
          <a-button @click="showEditModelModal = false">取消</a-button>
          <a-button type="primary" @click="handleConfirmEdit">确定</a-button>
        </div>
      </a-form>
    </a-modal>

  </a-config-provider>
</template>
<script lang="ts" setup>
import type { ColumnsType } from 'ant-design-vue/es/table';
import { ref, computed, onMounted, watch } from 'vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme, message } from 'ant-design-vue';
import { ReloadOutlined, ColumnHeightOutlined ,SettingOutlined, SearchOutlined, PlusOutlined, MinusCircleOutlined, MinusOutlined} from '@ant-design/icons-vue';
import draggable from 'vuedraggable';

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '', // Override the '页' suffix for quick jumper
  },
}));

interface DataItem {
  key: number;
  modelId: string;
  modelType: string;
  modelName: string;
  voiceId: string;
  voiceName: string;
  apiUrl: string;
  localModelFileDir: string;
  remainingCalls: number;
  leaseTime: string;
  startTime: string;
  expirationTime: string;
  paymentUnit: string;
  unitCost: number;
  accumulatedUsage: string;
  accumulatedCost: string;
  updater: string;
  createTime: string;
  updateTime: string;
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
  className?: string;
}

const columnConfigs: ColumnConfig[] = [
  { key: 'rowIndex', title: '序号', dataIndex: 'rowIndex', width: 60, fixed: 'left', customRender: ({ index }) => (currentPage.value - 1) * pageSize.value + index + 1 },
  { key: 'modelId', title: '模型ID', dataIndex: 'modelId', width: 150 },
  { key: 'modelType', title: '模型类型', dataIndex: 'modelType', width: 120 },
  { key: 'modelName', title: '模型名称', dataIndex: 'modelName', width: 150 },
  { key: 'voiceId', title: '音色ID', dataIndex: 'voiceId', width: 150 },
  { key: 'voiceName', title: '音色名称', dataIndex: 'voiceName', width: 150 },
  { key: 'apiUrl', title: 'API url', dataIndex: 'apiUrl', width: 250 },
  { key: 'localModelFileDir', title: '本地模型文件目录', dataIndex: 'localModelFileDir', width: 200 },
  { key: 'remainingCalls', title: '剩余调用次数', dataIndex: 'remainingCalls', width: 120, sorter: (a, b) => a.remainingCalls - b.remainingCalls, sortDirections: ['ascend', 'descend'] },
  { key: 'leaseTime', title: '租赁时间', dataIndex: 'leaseTime', width: 160, sorter: (a, b) => new Date(a.leaseTime).getTime() - new Date(b.leaseTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'startTime', title: '启动时间', dataIndex: 'startTime', width: 160, sorter: (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'expirationTime', title: '到期时间', dataIndex: 'expirationTime', width: 160, sorter: (a, b) => new Date(a.expirationTime).getTime() - new Date(b.expirationTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'paymentUnit', title: '付费单位', dataIndex: 'paymentUnit', width: 100 },
  { key: 'unitCost', title: '单位费用 (元)', dataIndex: 'unitCost', width: 120, sorter: (a, b) => a.unitCost - b.unitCost, sortDirections: ['ascend', 'descend'] },
  { key: 'accumulatedUsage', title: '累计使用量', dataIndex: 'accumulatedUsage', width: 120 },
  { key: 'accumulatedCost', title: '累计费用 (元)', dataIndex: 'accumulatedCost', width: 120 },
  { key: 'updater', title: '更新人', dataIndex: 'updater', width: 80 },
  { key: 'createTime', title: '创建时间', dataIndex: 'createTime', width: 160, sorter: (a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'updateTime', title: '更新时间', dataIndex: 'updateTime', width: 160, sorter: (a, b) => new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'operation', title: '操作', dataIndex: '', width: 200, fixed: 'right' },
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
  try {
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
  } catch (error) {
    console.error('Error in columns computed:', error);
    return [];
  }
});

// Generate sample data based on the image
const rawData: DataItem[] = [];
const modelTypes = ['user VCM', 'system VCM'];
const voiceNames = ['啵啵的音色', '其他音色'];
const paymentUnits = ['h', 'd', 'm'];

try {
  for (let i = 0; i < 43; i++) {
    const date = new Date(2025, 6, 13, 19, 25, 11); // Base date from image
    date.setDate(date.getDate() + i); // Vary date by day for each record

    const baseTime = date.toISOString().slice(0, 19).replace('T', ' ');
    const expirationDate = new Date(date);
    expirationDate.setDate(date.getDate() + 30); // 30 days later
    const expirationTime = expirationDate.toISOString().slice(0, 19).replace('T', ' ');

    rawData.push({
      key: i + 1,
      modelId: 'hjhwn832nj2f',
      modelType: modelTypes[i % modelTypes.length],
      modelName: '啵啵多模态',
      voiceId: 'hjhwn832nj2f',
      voiceName: voiceNames[i % voiceNames.length],
      apiUrl: i % 2 === 0 ? 'https://example.com/firmware.bin' : '-',
      localModelFileDir: i % 2 === 1 ? 'example/firmware.bin' : '-',
      remainingCalls: 8,
      leaseTime: baseTime,
      startTime: baseTime,
      expirationTime: expirationTime,
      paymentUnit: paymentUnits[i % paymentUnits.length],
      unitCost: 10,
      accumulatedUsage: '106 h',
      accumulatedCost: '45元',
      updater: '33',
      createTime: baseTime,
      updateTime: baseTime,
    });
  }
} catch (error) {
  console.error('Error generating data:', error);
}

console.log('Raw Data:', rawData);

const modelTypeValue = ref({ key: 'all', label: '全部', value: 'all' });

const modelTypeOptions = computed(() => {
  const uniqueModelTypes = Array.from(new Set(rawData.map(item => item.modelType)));
  const options = uniqueModelTypes.map(type => ({
    key: type,
    value: type,
    label: type,
  }));
  return [
    { key: 'all', value: 'all', label: '全部' },
    ...options
  ];
});

const handleModelTypeChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    modelTypeValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    modelTypeValue.value = val;
  }
};

const currentPage = ref(1);
const pageSize = ref(10);

const sorterInfo = ref<any>({
  columnKey: 'updateTime',
  order: 'descend',
});

const pagination = computed(() => ({
  total: totalFilteredData.value, 
  current: currentPage.value,
  pageSize: pageSize.value,
  showSizeChanger: true, 
  pageSizeOptions: ['10', '20', '50'], 
  showTotal: (total: number, range: [number, number]) => `第${range[0]}-${range[1]}条/共${total}条`, 
  showQuickJumper: { goButton: '页' }, 
  onShowSizeChange: (current: number, size: number) => {
    console.log('onShowSizeChange', current, size);
    currentPage.value = 1; // Reset to first page when changing page size
    pageSize.value = size;
  },
  onChange: (page: number, size: number) => {
    console.log('onChange', page, size);
    currentPage.value = page;
    pageSize.value = size;
  },
}));

const onRefresh = () => {
  console.log('Refresh button clicked!');
  loading.value = true;
  searchInputValue.value = '';
  currentPage.value = 1;
  resetColumns();
  modelTypeValue.value = { key: 'all', label: '全部', value: 'all' };

  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const filteredData = computed(() => {
  try {
    let dataToFilter = rawData;

    if (searchInputValue.value) {
      const searchTerm = searchInputValue.value.toLowerCase();
      dataToFilter = dataToFilter.filter((item: DataItem) => {
        return Object.values(item).some(value =>
          typeof value === 'string' && value.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Filter by model type
    if (
      modelTypeValue.value &&
      modelTypeValue.value.value !== 'all' &&
      modelTypeValue.value.value !== ''
    ) {
      const currentModelType = modelTypeValue.value.value;
      dataToFilter = dataToFilter.filter(item => item.modelType === currentModelType);
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
  } catch (error) {
    console.error('Error in filteredData computed:', error);
    return [];
  }
});

// Computed property for total count of filtered data (before pagination)
const totalFilteredData = computed(() => {
  try {
    let dataToFilter = rawData;

    if (searchInputValue.value) {
      const searchTerm = searchInputValue.value.toLowerCase();
      dataToFilter = dataToFilter.filter((item: DataItem) => {
        return Object.values(item).some(value =>
          typeof value === 'string' && value.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Filter by model type
    if (
      modelTypeValue.value &&
      modelTypeValue.value.value !== 'all' &&
      modelTypeValue.value.value !== ''
    ) {
      const currentModelType = modelTypeValue.value.value;
      dataToFilter = dataToFilter.filter(item => item.modelType === currentModelType);
    }

    return dataToFilter.length;
  } catch (error) {
    console.error('Error in totalFilteredData computed:', error);
    return 0;
  }
});

// Computed property for paginated data
const paginatedData = computed(() => {
  try {
    const startIndex = (currentPage.value - 1) * pageSize.value;
    const endIndex = startIndex + pageSize.value;
    return filteredData.value.slice(startIndex, endIndex);
  } catch (error) {
    console.error('Error in paginatedData computed:', error);
    return [];
  }
});

const handleTableChange = (
  paginationData: any,
  filters: any,
  sorter: any,
) => {
  console.log('Table change:', paginationData, filters, sorter);
  const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;

  if (currentSorter && currentSorter.order) {
    sorterInfo.value = {
      columnKey: currentSorter.columnKey,
      order: currentSorter.order,
    };
  } else {
    sorterInfo.value = {
      columnKey: 'updateTime',
      order: 'descend',
    };
  }
  
  // Reset to first page when sorting changes
  currentPage.value = 1;
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

// Add back missing reactive variables
const searchInputValue = ref('');
const loading = ref(false);
const tableSize = ref('middle');
const showCreateModelModal = ref(false);
const showEditModelModal = ref(false);

const handleMenuClick = ({ key }: { key: string }) => {
  tableSize.value = key;
};

// Arrays to manage field pairs
const authFields = ref([{ fieldName: '', value: '' }]);
const customFields = ref([{ fieldName: '', value: '' }]);

// Functions to handle field pairs
const addAuthField = () => {
  authFields.value.push({ fieldName: '', value: '' });
};

const removeAuthField = (index: number) => {
  authFields.value.splice(index, 1);
};

const addCustomField = () => {
  customFields.value.push({ fieldName: '', value: '' });
};

const removeCustomField = (index: number) => {
  customFields.value.splice(index, 1);
};

// Edit form reactive variables
const editForm = ref({
  selectedModelType: '',
  modelName: '',
  voiceId: '',
  voiceName: '',
  accessType: 'api',
  apiUrl: '',
  localModelFileDir: '',
  paymentUnit: '',
  unitCost: '',
  activeCollapseKeys: ['auth', 'custom'] as string[],
  authFields: [{ fieldName: '', value: '' }],
  customFields: [{ fieldName: '', value: '' }],
});

const handleEditModelTypeChange = (val: any) => {
  editForm.value.selectedModelType = val;
};

const addEditAuthField = () => {
  editForm.value.authFields.push({ fieldName: '', value: '' });
};

const removeEditAuthField = (index: number) => {
  editForm.value.authFields.splice(index, 1);
};

const addEditCustomField = () => {
  editForm.value.customFields.push({ fieldName: '', value: '' });
};

const removeEditCustomField = (index: number) => {
  editForm.value.customFields.splice(index, 1);
};

// Update handleEditClick to populate edit form
const handleEditClick = (record: DataItem) => {
  // Populate edit form with record data
  editForm.value.selectedModelType = record.modelType;
  editForm.value.modelName = record.modelName;
  editForm.value.voiceId = record.voiceId;
  editForm.value.voiceName = record.voiceName;
  editForm.value.apiUrl = record.apiUrl;
  editForm.value.localModelFileDir = record.localModelFileDir;
  editForm.value.paymentUnit = record.paymentUnit;
  editForm.value.unitCost = record.unitCost.toString();
  
  // Determine access type based on data
  if (record.apiUrl && record.apiUrl !== '-') {
    editForm.value.accessType = 'api';
    editForm.value.activeCollapseKeys = ['auth', 'custom'];
  } else {
    editForm.value.accessType = 'local';
    editForm.value.activeCollapseKeys = [];
  }
  
  showEditModelModal.value = true;
};

// Watch for edit form access type changes
watch(() => editForm.value.accessType, (newValue) => {
  if (newValue === 'api') {
    editForm.value.activeCollapseKeys = ['auth', 'custom'];
  } else {
    editForm.value.activeCollapseKeys = [];
  }
});

const handleConfirmCreate = () => {
  message.success('新建模型成功！');
  showCreateModelModal.value = false;
};

const handleConfirmEdit = () => {
  message.success('编辑模型成功！');
  showEditModelModal.value = false;
};

// Add back modal form reactive variables
const selectedModelType = ref('');
const accessType = ref('api');
const activeCollapseKeys = ref<string[]>([]);
const modelName = ref('');

// Watch for access type changes to control collapse state
watch(accessType, (newValue) => {
  if (newValue === 'api') {
    activeCollapseKeys.value = ['auth', 'custom'];
  } else {
    activeCollapseKeys.value = [];
  }
});

onMounted(() => {
  console.log('ModelConfiguration component mounted');
});

defineExpose({
  handleTableChange,
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
  font-family: 'PingFang SC', sans-serif;
  white-space: nowrap;
  text-align: left;
}

.ant-table-wrapper-small .ant-table-tbody > tr > td,
.ant-table-wrapper-small .ant-table-thead > tr > th {
  padding: 2px 2px;
  font-size: 10px;
  line-height: 1.2;
}

.ant-table-wrapper-middle .ant-table-tbody > tr > td,
.ant-table-wrapper-middle .ant-table-thead > tr > th {
  padding: 8px 8px;
  font-size: 12px;
  line-height: 1.5;
}

.ant-table-wrapper-large .ant-table-tbody > tr > td,
.ant-table-wrapper-large .ant-table-thead > tr > th {
  padding: 16px 16px;
  font-size: 14px;
  line-height: 1.8;
}

/* title like demo page */
.title-container {
  padding: 10px 14px;
  margin-bottom: 10px;
  background-color: #fff;
  border-radius: 4px;
}

.title-container h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  text-align: left;
  font-weight: bold;
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

.right-aligned-icons > .anticon:last-child,
.right-aligned-icons > .ant-btn:last-child,
.right-aligned-icons > .ant-dropdown:last-child,
.right-aligned-icons > .ant-popover:last-child {
  margin-right: 28px;
}

html, body {
  overflow-x: hidden;
}

.table-container {
  padding: 10px;
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
  padding-left: 8px !important;
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
  padding-right: 18px !important;
}

/* Make the action buttons horizontal and style as blue and bold */
:deep(.ant-table-cell .action-cell) {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 120px;
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

:deep(.model-type-select .ant-select-selector) {
  padding-left: 70px !important;
}

:deep(.ant-select-selection-item) {
  text-align: left !important;
  padding-left: 0 !important;
}

:deep(.nowrap-header) {
  white-space: nowrap !important;
}

/* New styles for column setting panel */
.column-setting-panel {
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.setting-section {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-header span {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.column-checkbox-group {
  display: flex;
  flex-direction: column;
}

.column-checkbox-item {
  display: flex;
  align-items: center;
  padding: 4px 0;
}

.column-checkbox-item .ant-checkbox {
  margin-right: 8px;
}

.column-checkbox-item .ant-checkbox-wrapper {
  font-size: 13px;
  color: #555;
}
</style> 