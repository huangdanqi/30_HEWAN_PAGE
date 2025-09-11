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
            <template #suffix>
              <a-button 
                v-if="searchInputValue" 
                type="text" 
                size="small" 
                @click="clearSearch"
                style="margin-right: -8px;"
              >
                ✕
              </a-button>
            </template>
          </a-input>
          <a-button type="primary" @click="showCreateModelModal = true">新建模型</a-button>
          <!-- <a-button @click="forceRefreshData" :loading="loading">强制刷新</a-button> -->
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
        :key="tableRefreshKey"
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
        <span>{{ record.updater || '-' }}</span>
      </template>
    </template>
      </a-table>
      
      <!-- No data message -->
      <!-- <div v-if="showNoDataMessage" class="no-data-message">
        <a-empty 
          :description="noDataMessage"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
        >
          <a-button type="primary" @click="clearSearch">清除搜索</a-button>
        </a-empty>
      </div> -->
    </div>

    <!-- Create Modal -->
    <a-modal
      v-model:open="showCreateModelModal"
      title="新建模型"
      :footer="null"
      width="600px"
      @cancel="resetCreateForm"
    >
      <a-form layout="vertical">
        <!-- 1. 模型类型 (Model Type) -->
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
        
        <!-- 2. 模型名称 (Model Name) -->
        <a-form-item required>
          <template #label>
            模型名称
          </template>
          <a-input 
            placeholder="请输入" 
            v-model:value="modelName" 
            :maxlength="15"
            show-count
          />
        </a-form-item>

        <!-- 3. 访问信息 (Access Information) -->
        <a-form-item required>
          <template #label>
            访问信息
          </template>
          <a-radio-group v-model:value="accessType">
            <a-radio value="local">本地模型</a-radio>
            <a-radio value="api">API调用模型</a-radio>
          </a-radio-group>
        </a-form-item>

        <!-- 4. API地址 (API Address) - Conditional -->
        <a-form-item required v-if="accessType === 'api'">
          <template #label>
            API地址
          </template>
          <a-input placeholder="请输入URL" v-model:value="apiUrl" />
        </a-form-item>

        <!-- 5. 本地模型文件目录 (Local Model File Directory) - Conditional -->
        <a-form-item required v-if="accessType === 'local'">
          <template #label>
            本地模型文件目录
          </template>
          <a-input placeholder="请输入" v-model:value="localModelFileDir" />
        </a-form-item>

        <!-- 6. 计费单位 (Billing Unit) - Conditional for API -->
        <a-form-item v-if="accessType === 'api'">
          <template #label>
            计费单位
          </template>
          <a-input placeholder="请输入" v-model:value="billingUnit" />
        </a-form-item>

        <!-- 7. 单位费用 (Unit Cost) - Conditional for API -->
        <a-form-item v-if="accessType === 'api'">
          <template #label>
            单位费用
          </template>
          <a-input placeholder="请输入" suffix="元" style="text-align: right;" v-model:value="unitCost" />
        </a-form-item>

        <!-- 8. 音色ID (Voice ID) - Conditional for TTS, IP VCM, User VCM -->
        <a-form-item required v-if="['TTS', 'IP VCM', 'User VCM'].includes(selectedModelType)">
          <template #label>
            音色ID
          </template>
          <a-input placeholder="请输入" v-model:value="voiceId" />
        </a-form-item>

        <!-- 9. 音色名称 (Voice Name) - Conditional for TTS, IP VCM, User VCM -->
        <a-form-item required v-if="['TTS', 'IP VCM', 'User VCM'].includes(selectedModelType)">
          <template #label>
            音色名称
          </template>
          <a-input 
            placeholder="请输入" 
            v-model:value="voiceName" 
            :maxlength="15"
            show-count
          />
        </a-form-item>

        <!-- 10. 认证信息 (Authentication Information) - Available for both local and API models -->
        <a-collapse v-model:activeKey="activeCollapseKeys" ghost>
          <template #expandIcon="{ isActive }">
            <PlusOutlined v-if="!isActive" style="font-weight: bold; font-size: 16px;" />
            <MinusOutlined v-else style="font-weight: bold; font-size: 16px;" />
          </template>
          <a-collapse-panel key="auth" header="认证信息">
            <div v-for="(field, index) in authFields" :key="index" style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
              <a-form-item style="flex: 1; margin-bottom: 0;">
                <template #label>
                  字段名
                </template>
                <a-input placeholder="请输入" v-model:value="field.fieldName" />
              </a-form-item>
              <a-form-item style="flex: 1; margin-bottom: 0;">
                <template #label>
                  类型
                </template>
                <a-select v-model:value="field.fieldType" placeholder="请选择" style="width: 100%;">
                  <a-select-option value="string">字符串</a-select-option>
                  <a-select-option value="boolean">布尔</a-select-option>
                  <a-select-option value="number">数字</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item style="flex: 1; margin-bottom: 0;">
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

          <!-- 11. 自定义参数 (Custom Parameters) - Available for both local and API models -->
          <a-collapse-panel key="custom" header="自定义参数">
            <div v-for="(field, index) in customFields" :key="index" style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
              <a-form-item style="flex: 1; margin-bottom: 0;">
                <template #label>
                  字段名
                </template>
                <a-input placeholder="请输入" v-model:value="field.fieldName" />
              </a-form-item>
              <a-form-item style="flex: 1; margin-bottom: 0;">
                <template #label>
                  类型
                </template>
                <a-select v-model:value="field.fieldType" placeholder="请选择" style="width: 100%;">
                  <a-select-option value="string">字符串</a-select-option>
                  <a-select-option value="boolean">布尔</a-select-option>
                  <a-select-option value="number">数字</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item style="flex: 1; margin-bottom: 0;">
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

        <!-- 12. 后台导入 (Backend Import) - Info text -->
        <!-- <div style="margin-top: 16px; padding: 12px; background-color: #f5f5f5; border-radius: 4px; font-size: 12px; color: #666;">
          音色复刻模型可通过外部服务接口导入
        </div> -->

        <div style="display: flex; justify-content: flex-end; gap: 16px; margin-top: 24px;">
          <a-button @click="showCreateModelModal = false">取消</a-button>
          <a-button type="primary" @click="handleConfirmCreate" :loading="loading">确定</a-button>
        </div>
      </a-form>
    </a-modal>

    <!-- Edit Modal -->
    <a-modal
      v-model:open="showEditModelModal"
      title="编辑模型"
      :footer="null"
      width="600px"
      @cancel="resetEditForm"
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

        <!-- Voice-specific fields for TTS, IP VCM, User VCM -->
        <template v-if="['TTS', 'IP VCM', 'User VCM'].includes(editForm.selectedModelType)">
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
          <a-input placeholder="请输入" v-model:value="editForm.billingUnit" />
        </a-form-item>

        <a-form-item required v-if="editForm.accessType === 'api'">
          <template #label>
            单位费用
          </template>
          <a-input placeholder="请输入" suffix="元" style="text-align: right;" v-model:value="editForm.unitCost" />
        </a-form-item>

        <a-collapse v-model:activeKey="editForm.activeCollapseKeys" ghost>
          <template #expandIcon="{ isActive }">
            <PlusOutlined v-if="!isActive" style="font-weight: bold; font-size: 16px;" />
            <MinusOutlined v-else style="font-weight: bold; font-size: 16px;" />
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
            <div v-if="editForm.authFields.length === 0" style="display: flex; justify-content: center; margin-top: 16px;">
              <a-button type="dashed" @click="addEditAuthField">
                <PlusOutlined style="font-weight: bold; font-size: 16px;" />
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
            <div v-if="editForm.customFields.length === 0" style="display: flex; justify-content: center; margin-top: 16px;">
              <a-button type="dashed" @click="addEditCustomField">
                <PlusOutlined style="font-weight: bold; font-size: 16px;" />
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
import axios from 'axios'; // Added axios import
import { useRoute, useRouter } from 'vue-router';
import { Empty } from 'ant-design-vue';
import { 
  createColumnConfigs, 
  useTableColumns, 
  createColumn,
  type ColumnDefinition 
} from '../utils/tableConfig';
import { constructApiUrl } from '../utils/api';

const route = useRoute();
const router = useRouter();

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '', // Override the '页' suffix for quick jumper
  },
}));

interface DataItem {
  id: number;
  modelId: string;
  modelType: string;
  modelName: string;
  containerId: string;
  versionNumber: string;
  apiUrl: string;
  localModelFileDir: string;
  remainingTrainingTimes: number;
  buildTime: string;
  enableTime: string;
  disableTime: string;
  billingUnit: string;
  unitCost: number;
  accumulatedUsage: string;
  accumulatedCost: string;
  updater: string;
  createTime: string;
  updateTime: string;
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
  customRender?: ({ index }: { index: number }) => any;
  className?: string;
}

const columnConfigs: ColumnConfig[] = [
  { key: 'rowIndex', title: '序号', dataIndex: 'rowIndex', width: 60, fixed: 'left' },
  { key: 'modelId', title: '模型 ID', dataIndex: 'modelId', width: 150, sorter: (a, b) => a.modelId.localeCompare(b.modelId), sortDirections: ['ascend', 'descend'] },
  { key: 'modelType', title: '模型类型', dataIndex: 'modelType', width: 120, sorter: (a, b) => a.modelType.localeCompare(b.modelType), sortDirections: ['ascend', 'descend'] },
  { key: 'modelName', title: '模型名称', dataIndex: 'modelName', width: 150, sorter: (a, b) => a.modelName.localeCompare(b.modelName), sortDirections: ['ascend', 'descend'] },
  { key: 'containerId', title: '音色ID', dataIndex: 'containerId', width: 150, sorter: (a, b) => a.containerId.localeCompare(b.containerId), sortDirections: ['ascend', 'descend'] },
  { key: 'versionNumber', title: '音色名称', dataIndex: 'versionNumber', width: 150, sorter: (a, b) => a.versionNumber.localeCompare(b.versionNumber), sortDirections: ['ascend', 'descend'] },
  { key: 'apiUrl', title: 'API url', dataIndex: 'apiUrl', width: 250, sorter: (a, b) => a.apiUrl.localeCompare(b.apiUrl), sortDirections: ['ascend', 'descend'] },
  { key: 'localModelFileDir', title: '本地模型文件目录', dataIndex: 'localModelFileDir', width: 200, sorter: (a, b) => a.localModelFileDir.localeCompare(b.localModelFileDir), sortDirections: ['ascend', 'descend'] },
  { key: 'remainingTrainingTimes', title: '剩余训练次数', dataIndex: 'remainingTrainingTimes', width: 120, sorter: (a, b) => a.remainingTrainingTimes - b.remainingTrainingTimes, sortDirections: ['ascend', 'descend'] },
  { key: 'buildTime', title: '购买时间', dataIndex: 'buildTime', width: 160, sorter: (a, b) => new Date(a.buildTime).getTime() - new Date(b.buildTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'enableTime', title: '启用时间', dataIndex: 'enableTime', width: 160, sorter: (a, b) => new Date(a.enableTime).getTime() - new Date(b.enableTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'disableTime', title: '到期时间', dataIndex: 'disableTime', width: 160, sorter: (a, b) => new Date(a.disableTime).getTime() - new Date(b.disableTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'billingUnit', title: '计费单位', dataIndex: 'billingUnit', width: 100, sorter: (a, b) => a.billingUnit.localeCompare(b.billingUnit), sortDirections: ['ascend', 'descend'] },
  { key: 'unitCost', title: '单位费用 (元)', dataIndex: 'unitCost', width: 120, sorter: (a, b) => a.unitCost - b.unitCost, sortDirections: ['ascend', 'descend'] },
  { key: 'accumulatedUsage', title: '累计使用量', dataIndex: 'accumulatedUsage', width: 120, sorter: (a, b) => a.accumulatedUsage.localeCompare(b.accumulatedUsage), sortDirections: ['ascend', 'descend'] },
  { key: 'accumulatedCost', title: '累计费用 (元)', dataIndex: 'accumulatedCost', width: 120, sorter: (a, b) => a.accumulatedCost.localeCompare(b.accumulatedCost), sortDirections: ['ascend', 'descend'] },
  { key: 'updater', title: '更新人', dataIndex: 'updater', width: 80, sorter: (a, b) => a.updater.localeCompare(b.updater), sortDirections: ['ascend', 'descend'] },
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
    customRender: ({ index, text }) => {
      if (config.key === 'rowIndex') {
        // Calculate row number based on pagination and index parameter (same as Account.vue)
        return (currentPage.value - 1) * pageSize.value + index + 1;
      }
      // Handle undefined/null/empty text for other columns (same as Account.vue)
      return text === undefined || text === null || text === '' ? '-' : text;
    },
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
const rawData = ref<DataItem[]>([]);
const loading = ref(false);
const tableRefreshKey = ref(0); // Key to force table refresh

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Fetch data from MySQL database
const fetchData = async (forceRefresh = false) => {
  console.log('fetchData called, forceRefresh:', forceRefresh);
  loading.value = true;
  try {
    console.log('Calling model-configuration endpoint');
    
    // Add cache-busting parameter to ensure fresh data
    const timestamp = Date.now();
    const url = constructApiUrl(`model-configuration?page=1&pageSize=1000&_t=${timestamp}`);
    
    if (forceRefresh) {
      console.log('Force refreshing data with timestamp:', timestamp);
    }
    
    const response = await axios.get(url);
    console.log('Model configuration response:', response.data);
    
    // Add key property to each item for table identification
    rawData.value = response.data.data.map((item: any) => ({
      ...item,
      key: item.id // Use id as key for table rows
    }));
    
    console.log('Updated rawData with', rawData.value.length, 'items');
    console.log('Sample data item:', rawData.value[0]);
    
    // Debug: Check if updater field is present
    if (rawData.value.length > 0) {
      console.log('First item updater field:', rawData.value[0].updater);
      console.log('All updater values:', rawData.value.map(item => item.updater));
    }
    
    // Increment table refresh key to force re-render
    tableRefreshKey.value++;
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

const modelTypeValue = ref({ key: 'all', label: '全部', value: 'all' });

const modelTypeOptions = computed(() => {
  const uniqueModelTypes = Array.from(new Set(rawData.value.map(item => item.modelType)));
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
  columnKey: null,
  order: null,
});

const pagination = computed(() => {
  console.log('Pagination computed - currentPage:', currentPage.value, 'pageSize:', pageSize.value, 'total:', totalFilteredData.value);
  return {
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
  };
});

const onRefresh = () => {
  console.log('Refresh button clicked!');
  loading.value = true;
  searchInputValue.value = '';
  currentPage.value = 1;
  resetColumns();
  modelTypeValue.value = { key: 'all', label: '全部', value: 'all' };
  fetchData(); // Re-fetch data from database

  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const forceRefreshData = () => {
  console.log('Force refresh button clicked!');
  fetchData(true); // Force refresh with cache busting
};

const filteredData = computed(() => {
  try {
    let dataToFilter = rawData.value;

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

    // Sorting logic using Ant Design sorter
    if (sorterInfo.value && sorterInfo.value.order) {
      const { columnKey, order } = sorterInfo.value;
      const sorterFn = columnConfigs.find(c => c.key === columnKey)?.sorter;
      if (sorterFn) {
        dataToFilter.sort((a, b) => {
          const result = sorterFn(a, b);
          return order === 'ascend' ? result : -result;
        });
      }
    } else {
      // Default sorting by updateTime in descending order
      dataToFilter.sort((a, b) => {
        const dateA = new Date(a.updateTime).getTime();
        const dateB = new Date(b.updateTime).getTime();
        return dateB - dateA; // Descending order (newest first)
      });
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
    let dataToFilter = rawData.value;

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

// Computed property for paginated data
const paginatedData = computed(() => {
  try {
    const startIndex = (currentPage.value - 1) * pageSize.value;
    const endIndex = startIndex + pageSize.value;
    const result = filteredData.value.slice(startIndex, endIndex);
    
    console.log('paginatedData computed:');
    console.log('- currentPage:', currentPage.value);
    console.log('- pageSize:', pageSize.value);
    console.log('- startIndex:', startIndex);
    console.log('- endIndex:', endIndex);
    console.log('- filteredData length:', filteredData.value.length);
    console.log('- result length:', result.length);
    
    return result;
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
  console.log('=== handleTableChange called ===');
  console.log('paginationData:', paginationData);
  console.log('filters:', filters);
  console.log('sorter:', sorter);
  
  // Handle pagination changes
  if (paginationData && (paginationData.current !== currentPage.value || paginationData.pageSize !== pageSize.value)) {
    console.log('Pagination change detected');
    console.log('Old - currentPage:', currentPage.value, 'pageSize:', pageSize.value);
    console.log('New - currentPage:', paginationData.current, 'pageSize:', paginationData.pageSize);
    
    currentPage.value = paginationData.current;
    pageSize.value = paginationData.pageSize;
    
    console.log('Updated - currentPage:', currentPage.value, 'pageSize:', pageSize.value);
  }
  
  // Handle sorting changes
  const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;
  if (currentSorter && currentSorter.order) {
    console.log('Sorting change detected');
    sorterInfo.value = {
      columnKey: currentSorter.columnKey,
      order: currentSorter.order,
    };
    // Only reset to first page when sorting changes, not when pagination changes
    if (!paginationData) {
      console.log('Resetting to first page due to sorting change');
      currentPage.value = 1;
    }
  } else {
    sorterInfo.value = {
      columnKey: null,
      order: null,
    };
  }
  
  console.log('=== handleTableChange end ===');
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
const tableSize = ref('middle');
const showCreateModelModal = ref(false);
const showEditModelModal = ref(false);

// Function to clear search
const clearSearch = () => {
  searchInputValue.value = '';
  currentPage.value = 1; // Reset to first page when clearing search
};

const handleMenuClick = ({ key }: { key: string }) => {
  tableSize.value = key;
};

// Arrays to manage field pairs
const authFields = ref<FieldItem[]>([{ fieldName: '', fieldType: 'string', value: '' }]);
const customFields = ref<FieldItem[]>([{ fieldName: '', fieldType: 'string', value: '' }]);

// Functions to handle field pairs
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

// Edit form reactive variables
const editForm = ref({
  id: 0, // Add record ID field
  selectedModelType: '',
  modelName: '',
  containerId: '',
  versionNumber: '',
  voiceId: '',
  voiceName: '',
  accessType: 'api',
  apiUrl: '',
  localModelFileDir: '',
  billingUnit: '',
  unitCost: '',
  activeCollapseKeys: ['auth', 'custom'] as string[],
  authFields: [{ fieldName: '', fieldType: 'string', value: '' }] as FieldItem[],
  customFields: [{ fieldName: '', fieldType: 'string', value: '' }] as FieldItem[],
});

const handleEditModelTypeChange = (val: any) => {
  editForm.value.selectedModelType = val;
};

const addEditAuthField = () => {
  editForm.value.authFields.push({ fieldName: '', fieldType: 'string', value: '' });
};

// Watch for edit form field type changes to reset value appropriately
watch(() => editForm.value.authFields, (newFields) => {
  newFields.forEach(field => {
    if (field.fieldType === 'boolean' && typeof field.value !== 'boolean') {
      field.value = false;
    } else if (field.fieldType !== 'boolean' && typeof field.value === 'boolean') {
      field.value = '';
    }
  });
}, { deep: true });

const removeEditAuthField = (index: number) => {
  editForm.value.authFields.splice(index, 1);
};

const addEditCustomField = () => {
  editForm.value.customFields.push({ fieldName: '', fieldType: 'string', value: '' });
};

// Watch for edit form custom field type changes to reset value appropriately
watch(() => editForm.value.customFields, (newFields) => {
  newFields.forEach(field => {
    if (field.fieldType === 'boolean' && typeof field.value !== 'boolean') {
      field.value = false;
    } else if (field.fieldType !== 'boolean' && typeof field.value === 'boolean') {
      field.value = '';
    }
  });
}, { deep: true });

const removeEditCustomField = (index: number) => {
  editForm.value.customFields.splice(index, 1);
};

// Update handleEditClick to populate edit form
const handleEditClick = (record: DataItem) => {
  // Store the record ID for the API call
  editForm.value.id = record.id;
  
  // Populate edit form with record data
  editForm.value.selectedModelType = record.modelType;
  editForm.value.modelName = record.modelName;
  editForm.value.containerId = record.containerId;
  editForm.value.versionNumber = record.versionNumber;
  editForm.value.apiUrl = record.apiUrl;
  editForm.value.localModelFileDir = record.localModelFileDir;
  editForm.value.billingUnit = record.billingUnit;
  editForm.value.unitCost = record.unitCost.toString();
  
  // Populate voice fields for TTS, IP VCM, User VCM models
  if (['TTS', 'IP VCM', 'User VCM'].includes(record.modelType)) {
    editForm.value.voiceId = record.containerId || ''; // Use containerId as voiceId
    editForm.value.voiceName = record.versionNumber || ''; // Use versionNumber as voiceName
  } else {
    editForm.value.voiceId = '';
    editForm.value.voiceName = '';
  }
  
  // Determine access type based on data
  if (record.apiUrl && record.apiUrl !== '-') {
    editForm.value.accessType = 'api';
    editForm.value.activeCollapseKeys = ['auth', 'custom'];
  } else {
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

// Watch for route query changes to update search input
watch(() => route.query.search, (newSearch) => {
  if (newSearch) {
    searchInputValue.value = newSearch as string;
    console.log('Search parameter updated from route:', newSearch);
  }
});

// Watch for search input changes to reset pagination
watch(searchInputValue, (newValue) => {
  if (newValue !== undefined) {
    currentPage.value = 1; // Reset to first page when search changes
  }
});

// Add back modal form reactive variables
const selectedModelType = ref('');
const accessType = ref('api');
const activeCollapseKeys = ref<string[]>([]);
const modelName = ref('');
const voiceId = ref('');
const voiceName = ref('');
const apiUrl = ref('');
const localModelFileDir = ref('');
const billingUnit = ref('');
const unitCost = ref('');

// Import auth store for dynamic username
import { useAuthStore } from '../stores/auth';
const authStore = useAuthStore();

// Form validation and submission
const handleConfirmCreate = async () => {
  console.log('=== CREATE MODEL START ===');
  console.log('Form data:', {
    selectedModelType: selectedModelType.value,
    modelName: modelName.value,
    accessType: accessType.value,
    apiUrl: apiUrl.value,
    localModelFileDir: localModelFileDir.value,
    billingUnit: billingUnit.value,
    unitCost: unitCost.value,
    authFields: authFields.value,
    customFields: customFields.value
  });

  // Validation
  if (!selectedModelType.value) {
    message.error('请选择模型类型');
    return;
  }

  if (!modelName.value || modelName.value.trim() === '') {
    message.error('请输入模型名称');
    return;
  }

  if (modelName.value.length > 15) {
    message.error('模型名称不能超过15个字符');
    return;
  }

  // Validate access information
  if (accessType.value === 'api') {
    if (!apiUrl.value || apiUrl.value.trim() === '') {
      message.error('请输入API地址');
      return;
    }
  } else if (accessType.value === 'local') {
    if (!localModelFileDir.value || localModelFileDir.value.trim() === '') {
      message.error('请输入本地模型文件目录');
      return;
    }
  }

  // Validate voice fields for TTS, IP VCM, User VCM
  if (['TTS', 'IP VCM', 'User VCM'].includes(selectedModelType.value)) {
    if (!voiceId.value || voiceId.value.trim() === '') {
      message.error('请输入音色ID');
      return;
    }
    if (!voiceName.value || voiceName.value.trim() === '') {
      message.error('请输入音色名称');
      return;
    }
    if (voiceName.value.length > 15) {
      message.error('音色名称不能超过15个字符');
      return;
    }
  }

  // Validate auth fields
  for (let i = 0; i < authFields.value.length; i++) {
    const field = authFields.value[i];
    if (field.fieldName && field.value !== undefined && field.value !== '') {
      // If both field name and value are provided, they should be valid
      if (!field.fieldName.trim()) {
        message.error('认证信息字段名不能为空');
        return;
      }
      // For boolean fields, value can be false (which is valid)
      if (field.fieldType !== 'boolean' && (!field.value || field.value.toString().trim() === '')) {
        message.error('认证信息字段值不能为空');
        return;
      }
    }
    // If either field name or value is empty, that's fine (optional fields)
  }

  // Validate custom fields
  for (let i = 0; i < customFields.value.length; i++) {
    const field = customFields.value[i];
    if (field.fieldName && field.value !== undefined && field.value !== '') {
      // If both field name and value are provided, they should be valid
      if (!field.fieldName.trim()) {
        message.error('自定义参数字段名不能为空');
        return;
      }
      // For boolean fields, value can be false (which is valid)
      if (field.fieldType !== 'boolean' && (!field.value || field.value.toString().trim() === '')) {
        message.error('自定义参数字段值不能为空');
        return;
      }
    }
    // If either field name or value is empty, that's fine (optional fields)
  }

  // Check for duplicate modelType + modelName combination
  const existingModel = rawData.value.find(item => 
    item.modelType === selectedModelType.value && 
    item.modelName === modelName.value
  );
  
  if (existingModel) {
    message.error(`模型类型 "${selectedModelType.value}" 下已存在名为 "${modelName.value}" 的模型，请使用不同的名称`);
    return;
  }

  try {
    loading.value = true;
    console.log('Validation passed, preparing to submit...');

    // Debug username from AppTopbar.vue
    console.log('Auth store user:', authStore.user);
    console.log('Username from AppTopbar:', authStore.user?.name || authStore.user?.username || '管理员');

    // Prepare data for submission
    const formData = {
      modelType: selectedModelType.value,
      modelName: modelName.value,
      voiceId: voiceId.value,
      voiceName: voiceName.value,
      accessType: accessType.value,
      apiUrl: apiUrl.value,
      localModelFileDir: localModelFileDir.value,
      billingUnit: billingUnit.value,
      unitCost: parseFloat(unitCost.value) || 0,
      authFields: authFields.value,
      customFields: customFields.value,
      updater: authStore.user?.name || authStore.user?.username || '管理员'
    };

    console.log('Submitting form data:', JSON.stringify(formData, null, 2));
    console.log('Username being sent as updater:', formData.updater);
    console.log('API URL:', constructApiUrl('model-configuration'));

    const response = await axios.post(constructApiUrl('model-configuration'), formData);
    
    console.log('=== CREATE MODEL SUCCESS ===');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);

    if (response.data.success) {
      message.success('新建模型成功！');
      showCreateModelModal.value = false;
      resetCreateForm();
      
      // Small delay to ensure database is updated, then force refresh
      setTimeout(() => {
        fetchData(true); // Force refresh the data to get updated updater field
      }, 500);
    } else {
      message.error('创建失败: ' + (response.data.error || '未知错误'));
    }
  } catch (error: any) {
    console.log('=== CREATE MODEL ERROR ===');
    console.error('Error creating model:', error);
    console.error('Error response:', error.response);
    console.error('Error message:', error.message);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Error config:', error.config);
    message.error('创建失败: ' + (error.response?.data?.error || error.message || '未知错误'));
  } finally {
    loading.value = false;
    console.log('=== CREATE MODEL END ===');
  }
};

const resetCreateForm = () => {
  selectedModelType.value = '';
  modelName.value = '';
  voiceId.value = '';
  voiceName.value = '';
  accessType.value = 'api';
  apiUrl.value = '';
  localModelFileDir.value = '';
  billingUnit.value = '';
  unitCost.value = '';
  activeCollapseKeys.value = [];
  authFields.value = [{ fieldName: '', fieldType: 'string', value: '' }] as FieldItem[];
  customFields.value = [{ fieldName: '', fieldType: 'string', value: '' }] as FieldItem[];
};

const resetEditForm = () => {
  editForm.value.id = 0;
  editForm.value.selectedModelType = '';
  editForm.value.modelName = '';
  editForm.value.containerId = '';
  editForm.value.versionNumber = '';
  editForm.value.voiceId = '';
  editForm.value.voiceName = '';
  editForm.value.accessType = 'api';
  editForm.value.apiUrl = '';
  editForm.value.localModelFileDir = '';
  editForm.value.billingUnit = '';
  editForm.value.unitCost = '';
  editForm.value.activeCollapseKeys = ['auth', 'custom'];
  editForm.value.authFields = [{ fieldName: '', fieldType: 'string', value: '' }] as FieldItem[];
  editForm.value.customFields = [{ fieldName: '', fieldType: 'string', value: '' }] as FieldItem[];
};

// Watch for access type changes to control collapse state
watch(accessType, (newValue) => {
  // Always show auth and custom sections for both local and API models
  activeCollapseKeys.value = ['auth', 'custom'];
});

const handleConfirmEdit = async () => {
  console.log('=== EDIT MODEL START ===');
  console.log('Edit form data:', editForm.value);

  // Validation
  if (!editForm.value.selectedModelType) {
    message.error('请选择模型类型');
    return;
  }

  if (!editForm.value.modelName || editForm.value.modelName.trim() === '') {
    message.error('请输入模型名称');
    return;
  }

  if (editForm.value.modelName.length > 15) {
    message.error('模型名称不能超过15个字符');
    return;
  }

  // Validate access information
  if (editForm.value.accessType === 'api') {
    if (!editForm.value.apiUrl || editForm.value.apiUrl.trim() === '') {
      message.error('请输入API地址');
      return;
    }
  } else if (editForm.value.accessType === 'local') {
    if (!editForm.value.localModelFileDir || editForm.value.localModelFileDir.trim() === '') {
      message.error('请输入本地模型文件目录');
      return;
    }
  }

  // Validate voice fields for TTS, IP VCM, User VCM
  if (['TTS', 'IP VCM', 'User VCM'].includes(editForm.value.selectedModelType)) {
    if (!editForm.value.voiceId || editForm.value.voiceId.trim() === '') {
      message.error('请输入音色ID');
      return;
    }
    if (!editForm.value.voiceName || editForm.value.voiceName.trim() === '') {
      message.error('请输入音色名称');
      return;
    }
    if (editForm.value.voiceName.length > 15) {
      message.error('音色名称不能超过15个字符');
      return;
    }
  }
  // For non-voice models, voiceId and voiceName are optional

  try {
    loading.value = true;
    console.log('Validation passed, preparing to submit edit...');

    // Get dynamic username from auth store (same as AppTopbar.vue)
    const currentUsername = authStore.user?.name || authStore.user?.username || '管理员';
    console.log('Current username from auth store:', currentUsername);

    // Prepare data for submission - map to server expected fields
    const formData = {
      modelType: editForm.value.selectedModelType,
      modelName: editForm.value.modelName,
      voiceId: editForm.value.voiceId || '', // Send voiceId directly
      voiceName: editForm.value.voiceName || '', // Send voiceName directly
      accessType: editForm.value.accessType,
      apiUrl: editForm.value.apiUrl,
      localModelFileDir: editForm.value.localModelFileDir,
      billingUnit: editForm.value.billingUnit,
      unitCost: parseFloat(editForm.value.unitCost) || 0,
      authFields: editForm.value.authFields,
      customFields: editForm.value.customFields,
      updater: currentUsername // Use dynamic username
    };

    console.log('Submitting edit form data:', JSON.stringify(formData, null, 2));
    console.log('Username being sent as updater:', formData.updater);

    // Get the record ID from the edit form
    const recordId = editForm.value.id;
    
    // Call the edit API endpoint with the record ID
    const response = await axios.put(`${constructApiUrl(`model-configuration/${recordId}`)}`, formData);
    
    console.log('=== EDIT MODEL SUCCESS ===');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);

    if (response.data.success) {
      message.success('编辑模型成功！');
      showEditModelModal.value = false;
      
      // Small delay to ensure database is updated, then force refresh
      setTimeout(() => {
        fetchData(true); // Force refresh the data to get updated updater field
      }, 500);
    } else {
      message.error('编辑失败: ' + (response.data.error || '未知错误'));
    }
  } catch (error: any) {
    console.log('=== EDIT MODEL ERROR ===');
    console.error('Error editing model:', error);
    console.error('Error response:', error.response);
    console.error('Error message:', error.message);
    message.error('编辑失败: ' + (error.response?.data?.error || error.message || '未知错误'));
  } finally {
    loading.value = false;
    console.log('=== EDIT MODEL END ===');
  }
};

onMounted(() => {
  console.log('ModelConfiguration component mounted');
  console.log('Auth store state:', {
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated(),
    token: authStore.token
  });
  
  // Handle search parameter from URL
  if (route.query.search) {
    searchInputValue.value = route.query.search as string;
    console.log('Search parameter from URL:', route.query.search);
  }
  
  // Set a test user if not authenticated
  if (!authStore.isAuthenticated()) {
    console.log('No user authenticated, setting test user...');
    authStore.setLoggedInState('测试用户');
  }
  
  fetchData(); // Call fetchData on mount
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
</style> 