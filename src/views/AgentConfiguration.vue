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
        <!-- <div class="select-container agent-mode-select" style="margin-left: 10px;">
          <span class="select-always-placeholder">语音名称:</span>
          <a-tooltip :title="agentModeValue.label">
            <a-select v-model:value="agentModeValue" style="width: 120px;" :options="agentModeOptions" @change="handleAgentModeChange" :allowClear="true" label-in-value>
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div> -->
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
          <template v-if="column.key === 'ipAttribution_3'">
            <a @click="handleIpNameClick(record.ipAttribution)">{{ record.ipAttribution }}</a>
          </template>
          <template v-if="column.key === 'vad_4'">
            <a @click="handleVadClick(record.vad)">{{ record.vad }}</a>
          </template>
          <template v-if="column.key === 'asr_5'">
            <a @click="handleAsrClick(record.asr)">{{ record.asr }}</a>
          </template>
          <template v-if="column.key === 'speechRecognition_6'">
            <a @click="handleIntelligentAgentClick(record.speechRecognition)">{{ record.speechRecognition }}</a>
          </template>
          <template v-if="column.key === 'emotionRecognition_7'">
            <a @click="handleIntelligentAgentClick(record.emotionRecognition)">{{ record.emotionRecognition }}</a>
          </template>
          <template v-if="column.key === 'llm_8'">
            <a @click="handleLlmClick(record.llm)">{{ record.llm }}</a>
          </template>
          <template v-if="column.key === 'memory_9'">
            <a @click="handleMemoryClick(record.memory)">{{ record.memory }}</a>
          </template>
          <template v-if="column.key === 'tools_10'">
            <a @click="handleToolsClick(record.tools)">{{ record.tools }}</a>
          </template>
          <template v-if="column.key === 'tts_11'">
            <a @click="handleTtsClick(record.tts, record.ttsRoleName)">{{ record.tts }} {{ record.ttsRoleName }}</a>
          </template>
          <template v-if="column.key === 'ipVcm_13'">
            <a @click="handleIpVcmClick(record.ipVcm, record.vcmRoleName)">{{ record.ipVcm }} {{ record.vcmRoleName }}</a>
          </template>
        </template>
      </a-table>
      
      <!-- No data message -->
      <div v-if="showNoDataMessage" class="no-data-message">
        <a-empty 
          :description="noDataMessage"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
        >
          <a-button type="primary" @click="clearSearch">清除搜索</a-button>
        </a-empty>
      </div>
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

        <a-form-item label="VAD" name="vadName" required>
          <a-select v-model:value="createForm.vadName" placeholder="请选择">
            <a-select-option value="VAD类型">VAD类型</a-select-option>
            <a-select-option value="静音检测">静音检测</a-select-option>
            <a-select-option value="语音活动检测">语音活动检测</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="ASR" name="asrName" required>
          <a-select v-model:value="createForm.asrName" placeholder="请选择">
            <a-select-option value="蓝色语音ASR">蓝色语音ASR</a-select-option>
            <a-select-option value="百度ASR">百度ASR</a-select-option>
            <a-select-option value="讯飞ASR">讯飞ASR</a-select-option>
            <a-select-option value="阿里ASR">阿里ASR</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="意图识别" name="intelligentAgentName">
          <a-select v-model:value="createForm.intelligentAgentName" placeholder="请选择">
            <a-select-option value="16路意图识别">16路意图识别</a-select-option>
            <a-select-option value="8路意图识别">8路意图识别</a-select-option>
            <a-select-option value="4路意图识别">4路意图识别</a-select-option>
            <a-select-option value="单路意图识别">单路意图识别</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="智能体" name="emotionRecognition">
          <a-select v-model:value="createForm.emotionRecognition" placeholder="请选择">
            <a-select-option value="情感识别情绪陪伴">情感识别情绪陪伴</a-select-option>
            <a-select-option value="基础情感识别">基础情感识别</a-select-option>
            <a-select-option value="高级情感识别">高级情感识别</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="LLM" name="llmName">
          <a-select v-model:value="createForm.llmName" placeholder="请选择">
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

        <a-form-item label="Memory" name="memoryName">
          <a-select v-model:value="createForm.memoryName" placeholder="请选择">
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
            <a-radio value="音色复刻">音色复刻</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item v-if="createForm.speechSynthesisType === 'TTS'" label="TTS" name="ttsName" required>
          <a-select v-model:value="createForm.ttsName" placeholder="请选择">
            <a-select-option value="微软TTS">微软TTS</a-select-option>
            <a-select-option value="阿里TTS">阿里TTS</a-select-option>
            <a-select-option value="讯飞TTS">讯飞TTS</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item v-if="createForm.speechSynthesisType === '音色复刻'" label="IP VCM" name="ipVcmName" required>
          <a-select v-model:value="createForm.ipVcmName" placeholder="请选择">
            <a-select-option value="蓝色意图识别">蓝色意图识别</a-select-option>
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
          <a-select v-model:value="editForm.vadName" placeholder="请选择">
            <a-select-option value="VAD类型">VAD类型</a-select-option>
            <a-select-option value="静音检测">静音检测</a-select-option>
            <a-select-option value="语音活动检测">语音活动检测</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="ASR" name="asr" required>
          <a-select v-model:value="editForm.asrName" placeholder="请选择">
            <a-select-option value="ASR类型">ASR类型</a-select-option>
            <a-select-option value="蓝色语音ASR">蓝色语音ASR</a-select-option>
            <a-select-option value="百度ASR">百度ASR</a-select-option>
            <a-select-option value="讯飞ASR">讯飞ASR</a-select-option>
            <a-select-option value="阿里ASR">阿里ASR</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="意图识别" name="intentRecognition">
          <a-select v-model:value="editForm.intelligentAgentName" placeholder="请选择">
            <a-select-option value="智能意图识别">智能意图识别</a-select-option>
            <a-select-option value="16路意图识别">16路意图识别</a-select-option>
            <a-select-option value="8路意图识别">8路意图识别</a-select-option>
            <a-select-option value="4路意图识别">4路意图识别</a-select-option>
            <a-select-option value="单路意图识别">单路意图识别</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="智能体" name="emotionRecognition">
          <a-select v-model:value="editForm.emotionRecognition" placeholder="请选择">
            <a-select-option value="智能体">智能体</a-select-option>
            <a-select-option value="情感识别情绪陪伴">情感识别情绪陪伴</a-select-option>
            <a-select-option value="基础情感识别">基础情感识别</a-select-option>
            <a-select-option value="高级情感识别">高级情感识别</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="LLM" name="llm">
          <a-select v-model:value="editForm.llmName" placeholder="请选择">
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
          <a-select v-model:value="editForm.memoryName" placeholder="请选择">
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
          <a-select v-model:value="editForm.ttsName" placeholder="请选择">
            <a-select-option value="TTS">TTS</a-select-option>
            <a-select-option value="微软TTS">微软TTS</a-select-option>
            <a-select-option value="阿里TTS">阿里TTS</a-select-option>
            <a-select-option value="讯飞TTS">讯飞TTS</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item v-if="editForm.speechSynthesisType === '自定义识别'" label="IP VCM" name="ipVcm" required>
          <a-select v-model:value="editForm.ipVcmName" placeholder="请选择">
            <a-select-option value="IP VCM">IP VCM</a-select-option>
            <a-select-option value="蓝色意图识别">蓝色意图识别</a-select-option>
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
import { useRoute, useRouter } from 'vue-router';
import { Empty } from 'ant-design-vue';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '',
  },
}));

interface DataItem {
  id: number;
  agentId: string;
  agentName: string;
  botId: string;
  apiUrl: string;
  apiKey: string;
  ipName: string;
  vad: string;
  asr: string;
  intelligentAgent: string;
  llm: string;
  memory: string;
  tools: string;
  tts: string;
  ttsVoiceName: string;
  ipVcm: string;
  vcmVoiceName: string;
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
  customRender?: (record: any) => string | number;
  className?: string;
}

const columnConfigs: ColumnConfig[] = [
  { key: 'rowIndex', title: '序号', dataIndex: 'rowIndex', width: 60, fixed: 'left', customCell: ({ index }) => ({ children: (currentPage.value - 1) * pageSize.value + index + 1 }) },
  { key: 'agentId_1', title: 'Agent ID', dataIndex: 'agentId', width: 150 },
  { key: 'agentName_2', title: 'Agent名称', dataIndex: 'agentName', width: 180 },
  { key: 'ipAttribution_3', title: 'IP名称', dataIndex: 'ipAttribution', width: 100 },
  { key: 'vad_4', title: 'VAD', dataIndex: 'vad', width: 100 },
  { key: 'asr_5', title: 'ASR', dataIndex: 'asr', width: 120 },
  { key: 'intentRecognition_6', title: '意图识别', dataIndex: 'intentRecognition', width: 120 },
  { key: 'emotionRecognition_7', title: '智能体', dataIndex: 'emotionRecognition', width: 120 },
  { key: 'llm_8', title: 'LLM', dataIndex: 'llm', width: 120 },
  { key: 'memory_9', title: 'Memory', dataIndex: 'memory', width: 100 },
  { key: 'tools_10', title: '工具', dataIndex: 'tools', width: 150 },
  { key: 'tts_11', title: 'TTS', dataIndex: 'tts', width: 100 },
  { key: 'ttsRoleName_12', title: 'TTS音色名称', dataIndex: 'ttsRoleName', width: 120 },
  { key: 'ipVcm_13', title: 'IP VCM', dataIndex: 'ipVcm', width: 120 },
  { key: 'vcmRoleName_14', title: 'VCM音色名称', dataIndex: 'vcmRoleName', width: 120 },
//   { key: 'voiceName_15', title: '语音名称', dataIndex: 'voiceName', width: 100 },
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

// Hyperlink functions
const handleIpNameClick = (ipName: string) => {
  router.push({ path: '/ip-management', query: { search: ipName } });
};

const handleVadClick = (vad: string) => {
  router.push({ path: '/model-configuration', query: { search: vad } });
};

const handleAsrClick = (asr: string) => {
  router.push({ path: '/model-configuration', query: { search: asr } });
};

const handleIntelligentAgentClick = (intelligentAgent: string) => {
  router.push({ path: '/model-configuration', query: { search: intelligentAgent } });
};

const handleLlmClick = (llm: string) => {
  router.push({ path: '/model-configuration', query: { search: llm } });
};

const handleMemoryClick = (memory: string) => {
  router.push({ path: '/model-configuration', query: { search: memory } });
};

const handleToolsClick = (tools: string) => {
  router.push({ path: '/tool-configuration', query: { search: tools } });
};

const handleTtsClick = (tts: string, ttsVoiceName: string) => {
  const searchQuery = ttsVoiceName && ttsVoiceName !== '-' ? `${tts} ${ttsVoiceName}` : tts;
  router.push({ path: '/model-configuration', query: { search: searchQuery } });
};

const handleIpVcmClick = (ipVcm: string, vcmVoiceName: string) => {
  const searchQuery = vcmVoiceName && vcmVoiceName !== '-' ? `${ipVcm} ${vcmVoiceName}` : ipVcm;
  router.push({ path: '/model-configuration', query: { search: searchQuery } });
};


 

const agentTypeValue = ref({ key: 'all', label: '全部', value: 'all' });
const agentStatusValue = ref({ key: 'all', label: '全部', value: 'all' });
const agentVersionValue = ref({ key: 'all', label: '全部', value: 'all' });
const agentRegionValue = ref({ key: 'all', label: '全部', value: 'all' });
const agentModeValue = ref({ key: 'all', label: '全部', value: 'all' });

const agentTypeOptions = computed(() => {
  const uniqueAgentTypes = Array.from(new Set(rawData.value.map(item => item.ipAttribution)));
  const options = uniqueAgentTypes.map(type => ({ key: type, value: type, label: type }));
  return [{ key: 'all', value: 'all', label: '全部' }, ...options];
});

const agentStatusOptions = computed(() => {
  const uniqueStatuses = Array.from(new Set(rawData.value.map(item => item.asr)));
  const options = uniqueStatuses.map(status => ({ key: status, value: status, label: status }));
  return [{ key: 'all', value: 'all', label: '全部' }, ...options];
});

const agentVersionOptions = computed(() => {
  const uniqueVersions = Array.from(new Set(rawData.value.map(item => item.llm)));
  const options = uniqueVersions.map(version => ({ key: version, value: version, label: version }));
  return [{ key: 'all', value: 'all', label: '全部' }, ...options];
});

const agentRegionOptions = computed(() => {
  const uniqueRegions = Array.from(new Set(rawData.value.map(item => item.vcmRoleName)));
  const options = uniqueRegions.map(region => ({ key: region, value: region, label: region }));
  return [{ key: 'all', value: 'all', label: '全部' }, ...options];
});

const agentModeOptions = computed(() => {
  const uniqueModes = Array.from(new Set(rawData.value.map(item => item.voiceName)));
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

// Handle search parameter from URL
onMounted(() => {
  if (route.query.search) {
    searchInputValue.value = route.query.search as string;
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

const clearSearch = () => {
  searchInputValue.value = '';
};

const loading = ref(false);
const tableSize = ref('middle');
const showCreateAgentModal = ref(false);
const showEditAgentModal = ref(false);
const editForm = ref({
  agentName: '',
  vad: '',
  asr: '',
  intentRecognition: '',
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
  intelligentAgentId: '',
  apiUrl: '',
  apiKey: '',
  vadName: '',
  asrName: '',
  intelligentAgentName: '',
  llmName: '',
  prompt: '',
  memoryName: '',
  speechSynthesisType: 'TTS',
  ttsName: '',
  ttsVoiceSelection: '',
  ipVcmName: '',
  ipVcmVoiceSelection: ''
});

// Form validation rules
const createFormRules = {
  agentName: [
    { required: true, message: '请输入Agent名称', trigger: 'blur' },
    { max: 15, message: 'Agent名称不能超过15个字符', trigger: 'blur' }
  ],
  apiUrl: [{ required: true, message: '请输入API地址/文件目录', trigger: 'blur' }],
  vadName: [{ required: true, message: '请选择VAD名称', trigger: 'blur' }],
  asrName: [{ required: true, message: '请选择ASR名称', trigger: 'blur' }],
  speechSynthesisType: [{ required: true, message: '请选择语音合成模型', trigger: 'blur' }],
  ttsName: [{ required: true, message: '请选择TTS名称', trigger: 'blur' }],
  ttsVoiceSelection: [{ required: true, message: '请选择TTS音色', trigger: 'blur' }],
  ipVcmName: [{ required: true, message: '请选择IP VCM名称', trigger: 'blur' }],
  ipVcmVoiceSelection: [{ required: true, message: '请选择IP VCM音色', trigger: 'blur' }]
};

// Import auth store for dynamic username
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Form refs
const createFormRef = ref();

// Check for duplicate agent names
const checkAgentNameUniqueness = async (agentName: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/agent-configuration`, {
      params: { search: agentName }
    });
    
    if (response.data.success) {
      const existingAgents = response.data.data.filter(agent => agent.agentName === agentName);
      return existingAgents.length === 0;
    }
    return true;
  } catch (error) {
    console.error('Error checking agent name uniqueness:', error);
    return true;
  }
};

// Modal handlers
const handleCreateModalCancel = () => {
  showCreateAgentModal.value = false;
  createFormRef.value?.resetFields();
  // Reset form data
  createForm.value = {
    agentName: '',
    intelligentAgentId: '',
    apiUrl: '',
    apiKey: '',
    vadName: '',
    asrName: '',
    intelligentAgentName: '',
    llmName: '',
    prompt: '',
    memoryName: '',
    speechSynthesisType: 'TTS',
    ttsName: '',
    ttsVoiceSelection: '',
    ipVcmName: '',
    ipVcmVoiceSelection: ''
  };
};

const handleCreateAgent = async () => {
  alert('确定 button clicked! Testing...');
  console.log('=== handleCreateAgent called ===');
  console.log('Form data:', createForm.value);
  
  try {
    await createFormRef.value?.validate();
    console.log('Form validation passed');
    
    // Get dynamic username from auth store
    const dynamicUsername = authStore.user?.name || authStore.user?.username || 'admin';
    console.log('Dynamic username:', dynamicUsername);
    
    // For now, just show success message without API call
    console.log('Agent would be created successfully');
    alert('Agent created successfully! (Test mode)');
    showCreateAgentModal.value = false;
    createFormRef.value?.resetFields();
    
    // TODO: Uncomment when API is working
    /*
    // Check for duplicate agent name
    const isUnique = await checkAgentNameUniqueness(createForm.value.agentName);
    if (!isUnique) {
      // Show error message for duplicate name
      console.error('Agent名称已存在，请使用其他名称');
      return;
    }
    
    console.log('Create agent form data:', createForm.value);
    
    // Prepare data for API submission
    const agentData = {
      agentName: createForm.value.agentName,
      intelligentAgentId: createForm.value.intelligentAgentId,
      apiUrl: createForm.value.apiUrl,
      apiKey: createForm.value.apiKey,
      vad: createForm.value.vadName,
      asr: createForm.value.asrName,
      intelligentAgent: createForm.value.intelligentAgentName,
      llm: createForm.value.llmName,
      prompt: createForm.value.prompt,
      memory: createForm.value.memoryName,
      tools: createForm.value.tools || '',
      speechSynthesisType: createForm.value.speechSynthesisType,
      tts: createForm.value.speechSynthesisType === 'TTS' ? createForm.value.ttsName : '',
      ttsVoiceName: createForm.value.speechSynthesisType === 'TTS' ? createForm.value.ttsVoiceSelection : '',
      ipVcm: createForm.value.speechSynthesisType === '音色复刻' ? createForm.value.ipVcmName : '',
      vcmVoiceName: createForm.value.speechSynthesisType === '音色复刻' ? createForm.value.ipVcmVoiceSelection : '',
      updater: dynamicUsername // Get from auth store
    };
    
    console.log('Agent data to submit:', agentData);
    
    // Submit to API
    const response = await axios.post(`${API_BASE_URL}/agent-configuration`, agentData);
    
    if (response.data.success) {
      console.log('Agent created successfully');
    showCreateAgentModal.value = false;
    createFormRef.value?.resetFields();
      // Refresh the table data
      // fetchData();
    } else {
      console.error('Failed to create agent:', response.data);
    }
    */
  } catch (error) {
    console.error('Form validation failed:', error);
  }
};

const handleCreateAgentClick = () => {
  console.log('Create Agent button clicked');
  showCreateAgentModal.value = true;
  // Fetch model data when opening the modal
  // fetchModelData(); // This function is no longer needed as data is fetched from MySQL
};

const handleEditAgent = (record: DataItem) => {
  console.log('Edit Agent clicked for record:', record);
  // Pre-fill the form with data from the selected row
  editForm.value = {
    agentName: record.agentName,
    vad: record.vad,
    asr: record.asr,
    intentRecognition: record.speechRecognition,
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
  total: totalCount.value,
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
  let dataToFilter = rawData.value;

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

const handleTableChange = (paginationData: any, _filters: any, sorter: any) => {
  // Handle pagination
  if (paginationData) {
    currentPage.value = paginationData.current;
    pageSize.value = paginationData.pageSize;
  }
  
  // Handle sorting
  const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;
  if (currentSorter && currentSorter.order) {
    sorterInfo.value = { columnKey: currentSorter.columnKey, order: currentSorter.order };
  } else {
    sorterInfo.value = { columnKey: 'updatedAt', order: 'descend' };
  }
  // Remove this line that was causing the pagination issue
  // currentPage.value = 1;
};

// Data fetching - using BuiltAlarm.vue pattern
const rawData = ref<DataItem[]>([]);

const fetchData = async () => {
  console.log('fetchData called');
  loading.value = true;
  try {
    console.log('Calling agent-configuration endpoint');
    // Request all data without pagination parameters
    const response = await axios.get(`${API_BASE_URL}/agent-configuration?page=1&pageSize=1000`);
    console.log('Agent configuration response:', response.data);

    const items = response.data.data || [];
    totalCount.value = response.data.total || items.length;

    rawData.value = items.map(item => ({
      ...item,
      key: item.id, // Use id as key for table rows
      // Map MySQL fields to display fields
      ipAttribution: item.ipName || '-',
      intentRecognition: item.intelligentAgent || '-',
      emotionRecognition: item.intelligentAgent || '-',
      ttsRoleName: item.ttsVoiceName || '-',
      vcmRoleName: item.vcmVoiceName || '-',
      voiceName: item.vcmVoiceName || '-',
      createdAt: item.createTime || '-',
      updatedAt: item.updateTime || '-'
    }));
  } catch (error) {
    console.error('Error fetching data:', error);
    // Add some static data for testing if API fails
    rawData.value = [
      {
        id: 1,
        key: 1,
        agentId: 'test-agent-1',
        agentName: '测试Agent 1',
        botId: 'bot-1',
        apiUrl: 'http://test.com',
        apiKey: 'test-key',
        ipName: '测试IP',
        vad: 'VAD类型',
        asr: '蓝色语音ASR',
        intelligentAgent: '智能意图识别',
        llm: 'Deep Seek R1',
        memory: 'Memory 0',
        tools: 'bing, RAG, ...',
        tts: '微软TTS',
        ttsVoiceName: '小智',
        ipVcm: '蓝色意图识别',
        vcmVoiceName: '嘿嘿',
        updater: 'admin',
        createTime: '2025-01-01 10:00:00',
        updateTime: '2025-01-01 10:00:00',
        ipAttribution: '测试IP',
        intentRecognition: '智能意图识别',
        emotionRecognition: '智能意图识别',
        ttsRoleName: '小智',
        vcmRoleName: '嘿嘿',
        voiceName: '嘿嘿',
        createdAt: '2025-01-01 10:00:00',
        updatedAt: '2025-01-01 10:00:00'
      }
    ];
  } finally {
    loading.value = false;
  }
};

// Call fetchData on component mount
onMounted(() => {
  selectedColumnKeys.value = columnConfigs.map(config => config.key);
  fetchData(); // Fetch from MySQL
});

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
  fetchData(); // Refresh data from MySQL
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

// Add MySQL data fetching
const fetchDataFromMySQL = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/agent-configuration`, {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
        search: searchInputValue.value || undefined
      }
    });
    
    if (response.data.success) {
      // Replace static data with MySQL data
      rawData.value.length = 0; // Clear existing data
      rawData.value.push(...response.data.data);
      console.log('MySQL data fetched successfully:', rawData.value);
    } else {
      console.error('Failed to fetch MySQL data:', response.data);
    }
  } catch (error) {
    console.error('Error fetching MySQL data:', error);
  } finally {
    loading.value = false;
  }
};

// Call MySQL data fetching on mount
onMounted(() => {
  selectedColumnKeys.value = columnConfigs.map(config => config.key);
  fetchDataFromMySQL(); // Fetch from MySQL instead of using static data
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
