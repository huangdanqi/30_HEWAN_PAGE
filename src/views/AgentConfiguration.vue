<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <div class="title-container">
      <h2>Agent配置</h2>
    </div>

    <div class="top-controls-wrapper">
      <div class="left-aligned-section">
        <div class="select-container agent-type-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">IP归属:</span>
          <a-tooltip :title="agentTypeValue.label">
            <a-select v-model:value="agentTypeValue" style="width: 110px;" :options="agentTypeOptions" @change="handleAgentTypeChange" :allowClear="true" label-in-value>
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div>
        <div class="select-container agent-status-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">ASR:</span>
          <a-tooltip :title="agentStatusValue.label">
            <a-select v-model:value="agentStatusValue" style="width: 120px;" :options="agentStatusOptions" @change="handleAgentStatusChange" :allowClear="true" label-in-value>
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div>
        <div class="select-container agent-version-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">LLM:</span>
          <a-tooltip :title="agentVersionValue.label">
            <a-select v-model:value="agentVersionValue" style="width: 120px;" :options="agentVersionOptions" @change="handleAgentVersionChange" :allowClear="true" label-in-value>
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div>
        <div class="select-container agent-region-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">VCM角色:</span>
          <a-tooltip :title="agentRegionValue.label">
            <a-select v-model:value="agentRegionValue" style="width: 120px;" :options="agentRegionOptions" @change="handleAgentRegionChange" :allowClear="true" label-in-value>
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div>
        <div class="select-container agent-mode-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">语音名称:</span>
          <a-tooltip :title="agentModeValue.label">
            <a-select v-model:value="agentModeValue" style="width: 120px;" :options="agentModeOptions" @change="handleAgentModeChange" :allowClear="true" label-in-value>
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div>
      </div>
      
      <div class="right-aligned-icons">
        <a-input v-model:value="searchInputValue" placeholder="输入关键字搜索" style="width: 200px">
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
        <a-button type="primary" @click="handleCreateAgentClick">新建Agent</a-button>
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
                <draggable v-model="columnOrder" item-key="key" @end="onColumnOrderChange" class="column-checkbox-group">
                  <template #item="{ element: colKey }">
                    <div class="column-checkbox-item" style="padding: 4px 0;">
                      <a-checkbox :checked="selectedColumnKeys.includes(colKey)" @change="(event: Event) => handleColumnVisibilityChange(colKey, (event.target as HTMLInputElement).checked)">
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
      
    <div class="table-container">
      <a-table :columns="columns" :data-source="filteredData" :pagination="filteredData.length === 0 ? false : pagination" :loading="loading" :size="tableSize" :scroll="{ x: 1000 }" @change="handleTableChange" :showSorterTooltip="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'operation_19'">
            <a-space class="action-cell" direction="horizontal">
              <a class="view-link" @click="$emit('view-record', record)">查看</a>
              <a-divider type="vertical" />
              <a class="edit-link" @click="handleEditAgent(record)">编辑</a>
              <a-divider type="vertical" />
              <a-popconfirm title="确定要删除该配置吗?" @confirm="$emit('delete-record', record)">
                <a class="danger-link">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 新增Agent Modal -->
    <a-modal
      v-model:open="showCreateAgentModal"
      title="新增Agent"
      :width="600"
      @cancel="handleCreateModalCancel"
    >
      <a-form
        :model="createForm"
        :rules="createFormRules"
        layout="vertical"
        ref="createFormRef"
      >
        <a-form-item label="Agent名称" name="agentName" required>
          <a-input v-model:value="createForm.agentName" placeholder="请输入" />
        </a-form-item>

        <a-form-item label="VAD" name="vad" required>
          <a-select v-model:value="createForm.vad" placeholder="请选择">
            <a-select-option value="VAD类型">VAD类型</a-select-option>
            <a-select-option value="静音检测">静音检测</a-select-option>
            <a-select-option value="语音活动检测">语音活动检测</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="ASR" name="asr" required>
          <a-select v-model:value="createForm.asr" placeholder="请选择">
            <a-select-option value="蓝色语音ASR">蓝色语音ASR</a-select-option>
            <a-select-option value="百度ASR">百度ASR</a-select-option>
            <a-select-option value="讯飞ASR">讯飞ASR</a-select-option>
            <a-select-option value="阿里ASR">阿里ASR</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="语音识别" name="speechRecognition">
          <a-select v-model:value="createForm.speechRecognition" placeholder="请选择">
            <a-select-option value="16路语音识别">16路语音识别</a-select-option>
            <a-select-option value="8路语音识别">8路语音识别</a-select-option>
            <a-select-option value="4路语音识别">4路语音识别</a-select-option>
            <a-select-option value="单路语音识别">单路语音识别</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="情绪识别" name="emotionRecognition">
          <a-select v-model:value="createForm.emotionRecognition" placeholder="请选择">
            <a-select-option value="情感识别情绪陪伴">情感识别情绪陪伴</a-select-option>
            <a-select-option value="基础情感识别">基础情感识别</a-select-option>
            <a-select-option value="高级情感识别">高级情感识别</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="LLM" name="llm">
          <a-select v-model:value="createForm.llm" placeholder="请选择">
            <a-select-option value="Deep Seek R1">Deep Seek R1</a-select-option>
            <a-select-option value="GPT-4">GPT-4</a-select-option>
            <a-select-option value="Claude">Claude</a-select-option>
            <a-select-option value="Gemini">Gemini</a-select-option>
            <a-select-option value="文心一言">文心一言</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Prompt" name="prompt">
          <a-textarea v-model:value="createForm.prompt" placeholder="请输入" :rows="3" />
        </a-form-item>

        <a-form-item label="Memory" name="memory">
          <a-select v-model:value="createForm.memory" placeholder="请选择">
            <a-select-option value="Memory 0">Memory 0</a-select-option>
            <a-select-option value="Memory 1">Memory 1</a-select-option>
            <a-select-option value="Memory 2">Memory 2</a-select-option>
            <a-select-option value="Memory 3">Memory 3</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="工具" name="tools">
          <a-select v-model:value="createForm.tools" placeholder="请选择">
            <a-select-option value="bing, RAG, ...">bing, RAG, ...</a-select-option>
            <a-select-option value="bing, 搜索">bing, 搜索</a-select-option>
            <a-select-option value="RAG, 知识库">RAG, 知识库</a-select-option>
            <a-select-option value="bing, RAG, 搜索">bing, RAG, 搜索</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="语音合成类型" name="speechSynthesisType" required>
          <a-radio-group v-model:value="createForm.speechSynthesisType">
            <a-radio value="TTS">TTS</a-radio>
            <a-radio value="自定义识别">自定义识别</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item v-if="createForm.speechSynthesisType === 'TTS'" label="TTS" name="tts" required>
          <a-select v-model:value="createForm.tts" placeholder="请选择">
            <a-select-option value="微软TTS">微软TTS</a-select-option>
            <a-select-option value="阿里TTS">阿里TTS</a-select-option>
            <a-select-option value="讯飞TTS">讯飞TTS</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item v-if="createForm.speechSynthesisType === '自定义识别'" label="IP VCM" name="ipVcm" required>
          <a-select v-model:value="createForm.ipVcm" placeholder="请选择">
            <a-select-option value="蓝色语音识别">蓝色语音识别</a-select-option>
            <a-select-option value="百度VCM">百度VCM</a-select-option>
            <a-select-option value="讯飞VCM">讯飞VCM</a-select-option>
            <a-select-option value="阿里VCM">阿里VCM</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="角色选择" name="roleSelection" required>
          <a-select v-model:value="createForm.roleSelection" placeholder="请选择">
            <a-select-option value="小智">小智</a-select-option>
            <a-select-option value="小爱">小爱</a-select-option>
            <a-select-option value="小度">小度</a-select-option>
            <a-select-option value="嘿嘿">嘿嘿</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
      
      <template #footer>
        <div style="text-align: right; padding: 10px 0;">
          <a-button @click="handleCreateModalCancel">取消</a-button>
          <a-button type="primary" @click="handleCreateAgent" style="margin-left: 8px;">确定</a-button>
        </div>
      </template>
    </a-modal>

    <!-- 编辑Agent Modal -->
    <a-modal
      v-model:open="showEditAgentModal"
      title="编辑Agent"
      :width="600"
      @cancel="handleEditModalCancel"
    >
      <a-form
        :model="editForm"
        :rules="createFormRules"
        layout="vertical"
        ref="editFormRef"
      >
        <a-form-item label="Agent名称" name="agentName" required>
          <a-input v-model:value="editForm.agentName" placeholder="请输入" />
        </a-form-item>

        <a-form-item label="VAD" name="vad" required>
          <a-select v-model:value="editForm.vad" placeholder="请选择">
            <a-select-option value="VAD类型">VAD类型</a-select-option>
            <a-select-option value="静音检测">静音检测</a-select-option>
            <a-select-option value="语音活动检测">语音活动检测</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="ASR" name="asr" required>
          <a-select v-model:value="editForm.asr" placeholder="请选择">
            <a-select-option value="ASR类型">ASR类型</a-select-option>
            <a-select-option value="蓝色语音ASR">蓝色语音ASR</a-select-option>
            <a-select-option value="百度ASR">百度ASR</a-select-option>
            <a-select-option value="讯飞ASR">讯飞ASR</a-select-option>
            <a-select-option value="阿里ASR">阿里ASR</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="语音识别" name="speechRecognition">
          <a-select v-model:value="editForm.speechRecognition" placeholder="请选择">
            <a-select-option value="智能语音识别">智能语音识别</a-select-option>
            <a-select-option value="16路语音识别">16路语音识别</a-select-option>
            <a-select-option value="8路语音识别">8路语音识别</a-select-option>
            <a-select-option value="4路语音识别">4路语音识别</a-select-option>
            <a-select-option value="单路语音识别">单路语音识别</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="情绪识别" name="emotionRecognition">
          <a-select v-model:value="editForm.emotionRecognition" placeholder="请选择">
            <a-select-option value="情绪识别">情绪识别</a-select-option>
            <a-select-option value="情感识别情绪陪伴">情感识别情绪陪伴</a-select-option>
            <a-select-option value="基础情感识别">基础情感识别</a-select-option>
            <a-select-option value="高级情感识别">高级情感识别</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="LLM" name="llm">
          <a-select v-model:value="editForm.llm" placeholder="请选择">
            <a-select-option value="LLM">LLM</a-select-option>
            <a-select-option value="Deep Seek R1">Deep Seek R1</a-select-option>
            <a-select-option value="GPT-4">GPT-4</a-select-option>
            <a-select-option value="Claude">Claude</a-select-option>
            <a-select-option value="Gemini">Gemini</a-select-option>
            <a-select-option value="文心一言">文心一言</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Prompt" name="prompt">
          <a-textarea v-model:value="editForm.prompt" placeholder="请输入" :rows="3" />
        </a-form-item>

        <a-form-item label="Memory" name="memory">
          <a-select v-model:value="editForm.memory" placeholder="请选择">
            <a-select-option value="Memory0">Memory0</a-select-option>
            <a-select-option value="Memory 0">Memory 0</a-select-option>
            <a-select-option value="Memory 1">Memory 1</a-select-option>
            <a-select-option value="Memory 2">Memory 2</a-select-option>
            <a-select-option value="Memory 3">Memory 3</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="工具" name="tools">
          <a-select v-model:value="editForm.tools" placeholder="请选择" mode="multiple">
            <a-select-option value="Bing">Bing</a-select-option>
            <a-select-option value="RAG">RAG</a-select-option>
            <a-select-option value="天气查询">天气查询</a-select-option>
            <a-select-option value="bing, RAG, ...">bing, RAG, ...</a-select-option>
            <a-select-option value="bing, 搜索">bing, 搜索</a-select-option>
            <a-select-option value="RAG, 知识库">RAG, 知识库</a-select-option>
            <a-select-option value="bing, RAG, 搜索">bing, RAG, 搜索</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="语音合成类型" name="speechSynthesisType" required>
          <a-radio-group v-model:value="editForm.speechSynthesisType">
            <a-radio value="TTS">TTS</a-radio>
            <a-radio value="自定义识别">自定义识别</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item v-if="editForm.speechSynthesisType === 'TTS'" label="TTS" name="tts" required>
          <a-select v-model:value="editForm.tts" placeholder="请选择">
            <a-select-option value="TTS">TTS</a-select-option>
            <a-select-option value="微软TTS">微软TTS</a-select-option>
            <a-select-option value="阿里TTS">阿里TTS</a-select-option>
            <a-select-option value="讯飞TTS">讯飞TTS</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item v-if="editForm.speechSynthesisType === '自定义识别'" label="IP VCM" name="ipVcm" required>
          <a-select v-model:value="editForm.ipVcm" placeholder="请选择">
            <a-select-option value="IP VCM">IP VCM</a-select-option>
            <a-select-option value="蓝色语音识别">蓝色语音识别</a-select-option>
            <a-select-option value="百度VCM">百度VCM</a-select-option>
            <a-select-option value="讯飞VCM">讯飞VCM</a-select-option>
            <a-select-option value="阿里VCM">阿里VCM</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="角色选择" name="roleSelection" required>
          <a-select v-model:value="editForm.roleSelection" placeholder="请选择">
            <a-select-option value="000 台湾小美">000 台湾小美</a-select-option>
            <a-select-option value="000300200009 智联">000300200009 智联</a-select-option>
            <a-select-option value="小智">小智</a-select-option>
            <a-select-option value="小爱">小爱</a-select-option>
            <a-select-option value="小度">小度</a-select-option>
            <a-select-option value="嘿嘿">嘿嘿</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
      
      <template #footer>
        <div style="text-align: right; padding: 10px 0;">
          <a-button @click="handleEditModalCancel">取消</a-button>
          <a-button type="primary" @click="handleEditAgentSubmit" style="margin-left: 8px;">确定</a-button>
        </div>
      </template>
    </a-modal>
  </a-config-provider>
</template>

<script lang="ts" setup>
import type { ColumnsType } from 'ant-design-vue/es/table';
import { ref, computed, onMounted, watch } from 'vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme } from 'ant-design-vue';
import { ReloadOutlined, ColumnHeightOutlined, SettingOutlined, SearchOutlined } from '@ant-design/icons-vue';
import draggable from 'vuedraggable';

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '',
  },
}));

interface DataItem {
  key: number;
  agentId: string;
  agentName: string;
  ipAttribution: string;
  vad: string;
  asr: string;
  speechRecognition: string;
  emotionRecognition: string;
  llm: string;
  memory: string;
  tools: string;
  tts: string;
  ttsRoleName: string;
  ipVcm: string;
  vcmRoleName: string;
  voiceName: string;
  updater: string;
  createdAt: string;
  updatedAt: string;
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
  customRender?: (record: any) => string | number;
  className?: string;
}

const columnConfigs: ColumnConfig[] = [
  { key: 'rowIndex', title: '序号', dataIndex: 'rowIndex', width: 60, fixed: 'left', customRender: ({ index }) => (currentPage.value - 1) * pageSize.value + index + 1 },
  { key: 'agentId_1', title: 'Agent ID', dataIndex: 'agentId', width: 150 },
  { key: 'agentName_2', title: 'Agent名称', dataIndex: 'agentName', width: 180 },
  { key: 'ipAttribution_3', title: 'IP归属', dataIndex: 'ipAttribution', width: 100 },
  { key: 'vad_4', title: 'VAD', dataIndex: 'vad', width: 100 },
  { key: 'asr_5', title: 'ASR', dataIndex: 'asr', width: 120 },
  { key: 'speechRecognition_6', title: '语音识别', dataIndex: 'speechRecognition', width: 120 },
  { key: 'emotionRecognition_7', title: '情绪识别', dataIndex: 'emotionRecognition', width: 120 },
  { key: 'llm_8', title: 'LLM', dataIndex: 'llm', width: 120 },
  { key: 'memory_9', title: 'Memory', dataIndex: 'memory', width: 100 },
  { key: 'tools_10', title: '工具', dataIndex: 'tools', width: 150 },
  { key: 'tts_11', title: 'TTS', dataIndex: 'tts', width: 100 },
  { key: 'ttsRoleName_12', title: 'TTS角色名称', dataIndex: 'ttsRoleName', width: 120 },
  { key: 'ipVcm_13', title: 'IP VCM', dataIndex: 'ipVcm', width: 120 },
  { key: 'vcmRoleName_14', title: 'VCM角色名称', dataIndex: 'vcmRoleName', width: 120 },
  { key: 'voiceName_15', title: '语音名称', dataIndex: 'voiceName', width: 100 },
  { key: 'updater_16', title: '更新人', dataIndex: 'updater', width: 100 },
  { key: 'createdAt_17', title: '创建时间', dataIndex: 'createdAt', width: 150, sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'updatedAt_18', title: '更新时间', dataIndex: 'updatedAt', width: 160, sorter: (a: any, b: any) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'operation_19', title: '操作', dataIndex: '', width: 200, fixed: 'right' },
];

const columnOrder = ref<string[]>(columnConfigs.map(config => config.key));
const selectedColumnKeys = ref<string[]>(columnConfigs.map(config => config.key));

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
    customRender: config.customRender ? config.customRender : ({ text }) => (text === undefined || text === null || text === '' ? '-' : text),
    className: config.className,
  })) as ColumnsType;
};

const columns = computed<ColumnsType>(() => {
  const visibleConfigs = columnOrder.value
    .filter(key => selectedColumnKeys.value.includes(key))
    .map(key => columnConfigs.find(config => config.key === key))
    .filter(Boolean) as ColumnConfig[];

  const visibleColumns = createColumnsFromConfigs(visibleConfigs);

  return visibleColumns.sort((a, b) => {
    const fixedOrder = { 'left': 1, undefined: 2, 'right': 3 };
    const aFixed = fixedOrder[a.fixed as keyof typeof fixedOrder] || 2;
    const bFixed = fixedOrder[b.fixed as keyof typeof fixedOrder] || 2;
    return aFixed - bFixed;
  });
});

const rawData: DataItem[] = [];
const ipAttributions = ['超能', '小智', '小爱', '小度', '小冰'];
const vadTypes = ['VAD类型', '静音检测', '语音活动检测'];
const asrTypes = ['蓝色语音ASR', '百度ASR', '讯飞ASR', '阿里ASR'];
const speechRecognitionTypes = ['16路语音识别', '8路语音识别', '4路语音识别', '单路语音识别'];
const emotionRecognitionTypes = ['情感识别情绪陪伴', '基础情感识别', '高级情感识别'];
const llmTypes = ['Deep Seek R1', 'GPT-4', 'Claude', 'Gemini', '文心一言'];
const memoryTypes = ['Memory 0', 'Memory 1', 'Memory 2', 'Memory 3'];
const toolTypes = ['bing, RAG, ...', 'bing, 搜索', 'RAG, 知识库', 'bing, RAG, 搜索'];
const ttsTypes = ['-', '微软TTS', '阿里TTS', '讯飞TTS'];
const ttsRoleNames = ['-', '小智', '小爱', '小度'];
const ipVcmTypes = ['蓝色语音识别', '百度VCM', '讯飞VCM', '阿里VCM'];
const vcmRoleNames = ['嘿嘿', '小智', '小爱', '小度'];
const voiceNames = ['33', '小智', '小爱', '小度', '小冰'];
const updaters = ['33', 'admin', 'user1', 'user2'];

for (let i = 0; i < 150; i++) {
  const date = new Date(2025, 5, 23, 23, 25, 33);
  date.setDate(date.getDate() + i);
  date.setHours(date.getHours() + (i % 24));
  date.setMinutes(date.getMinutes() + (i % 60));
  date.setSeconds(date.getSeconds() + (i % 60));

  const createdAt = date.toISOString().slice(0, 19).replace('T', ' ');
  const updatedDate = new Date(date);
  updatedDate.setHours(date.getHours() + 2);
  const updatedAt = updatedDate.toISOString().slice(0, 19).replace('T', ' ');

  rawData.push({
    key: i + 1,
    agentId: `hjhwnt832yj${i + 1}`,
    agentName: `嘿嘿多模态情感陪伴玩具${i + 1}`,
    ipAttribution: ipAttributions[i % ipAttributions.length],
    vad: vadTypes[i % vadTypes.length],
    asr: asrTypes[i % asrTypes.length],
    speechRecognition: speechRecognitionTypes[i % speechRecognitionTypes.length],
    emotionRecognition: emotionRecognitionTypes[i % emotionRecognitionTypes.length],
    llm: llmTypes[i % llmTypes.length],
    memory: memoryTypes[i % memoryTypes.length],
    tools: toolTypes[i % toolTypes.length],
    tts: ttsTypes[i % ttsTypes.length],
    ttsRoleName: ttsRoleNames[i % ttsRoleNames.length],
    ipVcm: ipVcmTypes[i % ipVcmTypes.length],
    vcmRoleName: vcmRoleNames[i % vcmRoleNames.length],
    voiceName: voiceNames[i % voiceNames.length],
    updater: updaters[i % updaters.length],
    createdAt: createdAt,
    updatedAt: updatedAt,
  });
}

const agentTypeValue = ref({ key: 'all', label: '全部', value: 'all' });
const agentStatusValue = ref({ key: 'all', label: '全部', value: 'all' });
const agentVersionValue = ref({ key: 'all', label: '全部', value: 'all' });
const agentRegionValue = ref({ key: 'all', label: '全部', value: 'all' });
const agentModeValue = ref({ key: 'all', label: '全部', value: 'all' });

const agentTypeOptions = computed(() => {
  const uniqueAgentTypes = Array.from(new Set(rawData.map(item => item.ipAttribution)));
  const options = uniqueAgentTypes.map(type => ({ key: type, value: type, label: type }));
  return [{ key: 'all', value: 'all', label: '全部' }, ...options];
});

const agentStatusOptions = computed(() => {
  const uniqueStatuses = Array.from(new Set(rawData.map(item => item.asr)));
  const options = uniqueStatuses.map(status => ({ key: status, value: status, label: status }));
  return [{ key: 'all', value: 'all', label: '全部' }, ...options];
});

const agentVersionOptions = computed(() => {
  const uniqueVersions = Array.from(new Set(rawData.map(item => item.llm)));
  const options = uniqueVersions.map(version => ({ key: version, value: version, label: version }));
  return [{ key: 'all', value: 'all', label: '全部' }, ...options];
});

const agentRegionOptions = computed(() => {
  const uniqueRegions = Array.from(new Set(rawData.map(item => item.vcmRoleName)));
  const options = uniqueRegions.map(region => ({ key: region, value: region, label: region }));
  return [{ key: 'all', value: 'all', label: '全部' }, ...options];
});

const agentModeOptions = computed(() => {
  const uniqueModes = Array.from(new Set(rawData.map(item => item.voiceName)));
  const options = uniqueModes.map(mode => ({ key: mode, value: mode, label: mode }));
  return [{ key: 'all', value: 'all', label: '全部' }, ...options];
});

const handleAgentTypeChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    agentTypeValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    agentTypeValue.value = val;
  }
};

const handleAgentStatusChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    agentStatusValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    agentStatusValue.value = val;
  }
};

const handleAgentVersionChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    agentVersionValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    agentVersionValue.value = val;
  }
};

const handleAgentRegionChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    agentRegionValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    agentRegionValue.value = val;
  }
};

const handleAgentModeChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    agentModeValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    agentModeValue.value = val;
  }
};

const currentPage = ref(1);
const pageSize = ref(10);
const sorterInfo = ref<any>({ columnKey: 'updatedAt', order: 'descend' });
const searchInputValue = ref('');
const loading = ref(false);
const tableSize = ref('middle');
const showCreateAgentModal = ref(false);
const showEditAgentModal = ref(false);
const editForm = ref({
  agentName: '',
  vad: '',
  asr: '',
  speechRecognition: '',
  emotionRecognition: '',
  llm: '',
  prompt: '',
  memory: '',
  tools: '',
  speechSynthesisType: 'TTS',
  tts: '',
  ipVcm: '',
  roleSelection: ''
});

const editFormRef = ref();

// Create form data
const createForm = ref({
  agentName: '',
  vad: '',
  asr: '',
  speechRecognition: '',
  emotionRecognition: '',
  llm: '',
  prompt: '',
  memory: '',
  tools: '',
  speechSynthesisType: 'TTS',
  tts: '',
  ipVcm: '',
  roleSelection: ''
});

// Form validation rules
const createFormRules = {
  agentName: [{ required: true, message: '请输入Agent名称', trigger: 'blur' }],
  vad: [{ required: true, message: '请选择VAD', trigger: 'change' }],
  asr: [{ required: true, message: '请选择ASR', trigger: 'change' }],
  speechSynthesisType: [{ required: true, message: '请选择语音合成类型', trigger: 'change' }],
  tts: [{ required: true, message: '请选择TTS', trigger: 'change' }],
  ipVcm: [{ required: true, message: '请选择IP VCM', trigger: 'change' }],
  roleSelection: [{ required: true, message: '请选择角色', trigger: 'change' }]
};

const createFormRef = ref();

// Modal handlers
const handleCreateModalCancel = () => {
  showCreateAgentModal.value = false;
  createFormRef.value?.resetFields();
};

const handleCreateAgent = async () => {
  try {
    await createFormRef.value?.validate();
    console.log('Create agent form data:', createForm.value);
    // Here you would typically send the data to your API
    showCreateAgentModal.value = false;
    createFormRef.value?.resetFields();
  } catch (error) {
    console.error('Form validation failed:', error);
  }
};

const handleCreateAgentClick = () => {
  console.log('Create Agent button clicked');
  showCreateAgentModal.value = true;
};

const handleEditAgent = (record: DataItem) => {
  console.log('Edit Agent clicked for record:', record);
  // Pre-fill the form with data from the selected row
  editForm.value = {
    agentName: record.agentName,
    vad: record.vad,
    asr: record.asr,
    speechRecognition: record.speechRecognition,
    emotionRecognition: record.emotionRecognition,
    llm: record.llm,
    prompt: '您好，我是智能多模态情感分析产品，我可以为您提供情感分析服务。', // Default prompt
    memory: record.memory,
    tools: record.tools,
    speechSynthesisType: record.tts ? 'TTS' : '自定义识别',
    tts: record.tts || '',
    ipVcm: record.ipVcm || '',
    roleSelection: record.ttsRoleName || record.vcmRoleName || ''
  };
  showEditAgentModal.value = true;
};

const handleEditModalCancel = () => {
  showEditAgentModal.value = false;
  editFormRef.value?.resetFields();
};

const handleEditAgentSubmit = async () => {
  try {
    await editFormRef.value?.validate();
    console.log('Edit agent form data:', editForm.value);
    // Here you would typically send the updated data to your API
    showEditAgentModal.value = false;
    editFormRef.value?.resetFields();
  } catch (error) {
    console.error('Form validation failed:', error);
  }
};

const pagination = computed(() => ({
  total: rawData.length,
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

const filteredData = computed(() => {
  let dataToFilter = rawData;

  if (searchInputValue.value) {
    const searchTerm = searchInputValue.value.toLowerCase();
    dataToFilter = dataToFilter.filter((item: DataItem) => {
      return Object.values(item).some(value => typeof value === 'string' && value.toLowerCase().includes(searchTerm));
    });
  }

  if (agentTypeValue.value && agentTypeValue.value.value !== 'all' && agentTypeValue.value.value !== '') {
    const selectedAgentType = agentTypeValue.value.value;
    dataToFilter = dataToFilter.filter(item => item.ipAttribution === selectedAgentType);
  }

  if (agentStatusValue.value && agentStatusValue.value.value !== 'all' && agentStatusValue.value.value !== '') {
    const selectedStatus = agentStatusValue.value.value;
    dataToFilter = dataToFilter.filter(item => item.asr === selectedStatus);
  }

  if (agentVersionValue.value && agentVersionValue.value.value !== 'all' && agentVersionValue.value.value !== '') {
    const selectedVersion = agentVersionValue.value.value;
    dataToFilter = dataToFilter.filter(item => item.llm === selectedVersion);
  }

  if (agentRegionValue.value && agentRegionValue.value.value !== 'all' && agentRegionValue.value.value !== '') {
    const selectedRegion = agentRegionValue.value.value;
    dataToFilter = dataToFilter.filter(item => item.vcmRoleName === selectedRegion);
  }

  if (agentModeValue.value && agentModeValue.value.value !== 'all' && agentModeValue.value.value !== '') {
    const selectedMode = agentModeValue.value.value;
    dataToFilter = dataToFilter.filter(item => item.voiceName === selectedMode);
  }

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

const handleTableChange = (_paginationData: any, _filters: any, sorter: any) => {
  const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;
  if (currentSorter && currentSorter.order) {
    sorterInfo.value = { columnKey: currentSorter.columnKey, order: currentSorter.order };
  } else {
    sorterInfo.value = { columnKey: 'updatedAt', order: 'descend' };
  }
  currentPage.value = 1;
};

const onRefresh = () => {
  loading.value = true;
  searchInputValue.value = '';
  currentPage.value = 1;
  resetColumns();
  agentTypeValue.value = { key: 'all', label: '全部', value: 'all' };
  agentStatusValue.value = { key: 'all', label: '全部', value: 'all' };
  agentVersionValue.value = { key: 'all', label: '全部', value: 'all' };
  agentRegionValue.value = { key: 'all', label: '全部', value: 'all' };
  agentModeValue.value = { key: 'all', label: '全部', value: 'all' };
  setTimeout(() => { loading.value = false; }, 500);
};

const onSettingClick = () => { console.log('Setting clicked'); };
const handleMenuClick = ({ key }: { key: string }) => { tableSize.value = key; };
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

onMounted(() => {
  selectedColumnKeys.value = columnConfigs.map(config => config.key);
});

defineExpose({ handleTableChange });
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

:deep(.ant-table-cell .action-cell) {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 180px;
  white-space: nowrap;
  flex-wrap: nowrap;
}

:deep(.ant-table-cell .action-cell .edit-link) {
  color: #1890ff !important;
  font-weight: bold;
  white-space: nowrap;
}

:deep(.ant-table-cell .action-cell .view-link) {
  color: #1890ff !important;
  font-weight: bold;
  white-space: nowrap;
}

:deep(.ant-table-cell .action-cell .danger-link) {
  color: #ff4d4f !important;
  font-weight: bold;
  white-space: nowrap;
}

:deep(.agent-type-select .ant-select-selector) {
  padding-left: 60px !important;
}

:deep(.agent-status-select .ant-select-selector) {
  padding-left: 65px !important;
}

:deep(.agent-version-select .ant-select-selector) {
  padding-left: 65px !important;
}

:deep(.agent-region-select .ant-select-selector) {
  padding-left: 65px !important;
}

:deep(.agent-mode-select .ant-select-selector) {
  padding-left: 65px !important;
}

:deep(.nowrap-header) {
  white-space: nowrap !important;
}

/* Remove all padding and ensure text is flush left */
:deep(.ant-select-selection-item) {
  padding: 0 !important;
  margin: 0 !important;
  text-align: left !important;
}

/* Target the specific text content */
:deep(.ant-select-selection-item > span) {
  padding-left: 0 !important;
  margin-left: 0 !important;
}

/* Remove padding from the selector container */
:deep(.ant-select-selector) {
  padding-left: 8px !important;
}

/* Ensure the text content starts from the left edge */
:deep(.ant-select-selection-search) {
  padding-left: 0 !important;
}

:deep(.ant-select-selection-placeholder) {
  padding-left: 0 !important;
}

/* Force all select content to start from left edge */
:deep(.ant-select-selection-overflow) {
  padding-left: 0 !important;
}

:deep(.ant-select-selection-overflow-item) {
  padding-left: 0 !important;
}

/* Override any remaining padding */
:deep(.ant-select-selection-item) {
  padding: 0 !important;
  margin: 0 !important;
  text-align: left !important;
}

/* Additional override for modal forms */
:deep(.ant-modal .ant-select-selection-item) {
  padding: 0 !important;
  margin: 0 !important;
  text-align: left !important;
}

:deep(.ant-modal .ant-select-selection-item > span) {
  padding-left: 0 !important;
  margin-left: 0 !important;
}
</style> 