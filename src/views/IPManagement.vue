<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>IP管理</h2>
    </div>

    <!-- select item area -->
    <div class="top-controls-wrapper">
      <div class="left-aligned-section">
        <div class="select-container ip-name-select" style="margin-right: 16px;">
          <span class="select-always-placeholder">IP名称:</span>
          <a-tooltip :title="ipNameValue.label">
            <a-select
              v-model:value="ipNameValue"
              style="width: 120px;"
              :options="ipNameOptions"
              @change="handleIpNameChange"
              :allowClear="true"
              label-in-value
              placeholder="请选择IP名称"
            >
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div>
        <div class="select-container ip-type-select" style="margin-right: 16px;">
          <span class="select-always-placeholder">IP类型:</span>
          <a-tooltip :title="ipTypeValue.label">
            <a-select
              v-model:value="ipTypeValue"
              style="width: 130px;"
              :options="ipTypeOptions"
              @change="handleIpTypeChange"
              :allowClear="true"
              label-in-value
              placeholder="请选择IP类型"
            >
              <a-select-option value="all">全部</a-select-option>
            </a-select>
          </a-tooltip>
        </div>
        <div class="select-container status-select" style="margin-right: 16px;">
          <span class="select-always-placeholder">状态:</span>
          <a-tooltip :title="statusValue.label">
            <a-select
              v-model:value="statusValue"
              style="width: 100px;"
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
          placeholder="输入关键字搜索"
          style="width: 200px; margin-right: 16px;"
          @input="handleSearchChange"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
        <a-button type="primary" @click="showCreateIpModal = true" style="margin-right: 16px;">
          新建 IP
        </a-button>
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
          <a class="view-link" @click="handleViewClick(record)">查看</a>
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
        <span>{{ record.updater }}</span>
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

    <FirmwareReleaseModal
      :visible="showReleaseModal"
      @update:visible="handleReleaseModalClose"
      @submit="handleReleaseModalSubmit"
    />

    <a-modal
      v-model:visible="showCreateIpModal"
      title="新建IP"
      :footer="null"
      width="500px"
    >
      <a-form layout="vertical" :model="createFormData" :rules="createFormRules" ref="createFormRef">
        <a-form-item label="IP名称" name="ipName" required>
          <a-input 
            v-model:value="createFormData.ipName" 
            placeholder="请输入" 
            :maxLength="10"
            showCount
          />
        </a-form-item>
        
        <a-form-item label="IP介绍" name="ipIntro" required>
          <a-textarea 
            v-model:value="createFormData.ipIntro" 
            placeholder="请输入" 
            rows="4"
            :maxLength="2000"
            showCount
          />
        </a-form-item>
        
        <a-form-item label="五行" name="running" required>
          <a-select v-model:value="createFormData.running" placeholder="请选择">
            <a-select-option value="金">金</a-select-option>
            <a-select-option value="木">木</a-select-option>
            <a-select-option value="水">水</a-select-option>
            <a-select-option value="火">火</a-select-option>
            <a-select-option value="土">土</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="星座" name="portrait" required>
          <a-select v-model:value="createFormData.portrait" placeholder="请选择">
            <a-select-option value="摩羯座">摩羯座</a-select-option>
            <a-select-option value="水瓶座">水瓶座</a-select-option>
            <a-select-option value="双鱼座">双鱼座</a-select-option>
            <a-select-option value="白羊座">白羊座</a-select-option>
            <a-select-option value="金牛座">金牛座</a-select-option>
            <a-select-option value="双子座">双子座</a-select-option>
            <a-select-option value="巨蟹座">巨蟹座</a-select-option>
            <a-select-option value="狮子座">狮子座</a-select-option>
            <a-select-option value="处女座">处女座</a-select-option>
            <a-select-option value="天秤座">天秤座</a-select-option>
            <a-select-option value="天蝎座">天蝎座</a-select-option>
            <a-select-option value="射手座">射手座</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="MBTI" name="mbti" required>
          <a-select v-model:value="createFormData.mbti" placeholder="请选择">
            <a-select-option value="INTJ">INTJ</a-select-option>
            <a-select-option value="INTP">INTP</a-select-option>
            <a-select-option value="ENTJ">ENTJ</a-select-option>
            <a-select-option value="ENTP">ENTP</a-select-option>
            <a-select-option value="INFJ">INFJ</a-select-option>
            <a-select-option value="INFP">INFP</a-select-option>
            <a-select-option value="ENFJ">ENFJ</a-select-option>
            <a-select-option value="ENFP">ENFP</a-select-option>
            <a-select-option value="ISTP">ISTP</a-select-option>
            <a-select-option value="ISFP">ISFP</a-select-option>
            <a-select-option value="ESTP">ESTP</a-select-option>
            <a-select-option value="ESFP">ESFP</a-select-option>
            <a-select-option value="ISTJ">ISTJ</a-select-option>
            <a-select-option value="ISFJ">ISFJ</a-select-option>
            <a-select-option value="ESTJ">ESTJ</a-select-option>
            <a-select-option value="ESFJ">ESFJ</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="喜好" name="preference" required>
          <a-input 
            v-model:value="createFormData.preference" 
            placeholder="请输入" 
            :maxLength="10"
            showCount
          />
        </a-form-item>
        
        <!-- 个性化参数 section -->
        <div style="margin-bottom: 16px;">
          <div style="font-weight: 500; margin-bottom: 8px; color: rgba(0, 0, 0, 0.85); display: flex; align-items: center; gap: 4px;">
            <PlusOutlined 
              style="font-size: 14px; cursor: pointer;" 
              @click="addPersonalizedParam"
            />
            个性化参数
          </div>
          <div v-for="(field, index) in createFormData.personalizedParams" :key="index" style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
            <a-form-item style="flex: 1; margin-bottom: 0;">
              <template #label>
                <span style="color: #ff4d4f;">*</span>字段名
              </template>
              <a-input placeholder="请输入" v-model:value="field.fieldName" />
            </a-form-item>
            <a-form-item style="flex: 1; margin-bottom: 0;">
              <template #label>
                <span style="color: #ff4d4f;">*</span>类型
              </template>
              <a-select v-model:value="field.type" placeholder="请选择">
                <a-select-option value="string">字符串</a-select-option>
                <a-select-option value="number">数字</a-select-option>
                <a-select-option value="boolean">布尔值</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item style="flex: 1; margin-bottom: 0;">
              <template #label>
                <span style="color: #ff4d4f;">*</span>值
              </template>
              <!-- Dynamic input based on type -->
              <a-input v-if="field.type === 'string'" placeholder="请输入" v-model:value="field.value" />
              <a-input-number v-else-if="field.type === 'number'" placeholder="请输入" v-model:value="field.value" style="width: 100%;" />
              <a-switch v-else-if="field.type === 'boolean'" v-model:checked="field.value" />
            </a-form-item>
            <div style="display: flex; gap: 4px; margin-top: 24px;">
              <PlusOutlined 
                v-if="index === createFormData.personalizedParams.length - 1"
                style="cursor: pointer; font-weight: bold; font-size: 16px;" 
                @click="addPersonalizedParam"
              />
              <MinusCircleOutlined 
                style="color: #ff4d4f; cursor: pointer; font-weight: bold; font-size: 16px;" 
                @click="removePersonalizedParam(index)"
              />
            </div>
          </div>
        </div>
        
        <a-form-item label="Agent名称" name="agentLink">
          <a-select v-model:value="createFormData.agentLink" placeholder="请选择">
            <a-select-option value="啵啵多模态情感陪伴智能体">啵啵多模态情感陪伴智能体</a-select-option>
            <a-select-option value="明细多维度心理测评模型">明细多维度心理测评模型</a-select-option>
            <a-select-option value="小智智能对话系统">小智智能对话系统</a-select-option>
            <a-select-option value="暖暖情感陪伴机器人">暖暖情感陪伴机器人</a-select-option>
            <a-select-option value="阳光正能量传播者">阳光正能量传播者</a-select-option>
            <a-select-option value="细心数据分析专家">细心数据分析专家</a-select-option>
            <a-select-option value="和谐关系协调者">和谐关系协调者</a-select-option>
            <a-select-option value="深度洞察分析师">深度洞察分析师</a-select-option>
            <a-select-option value="自由探索引导者">自由探索引导者</a-select-option>
            <a-select-option value="稳重目标规划师">稳重目标规划师</a-select-option>
            <a-select-option value="创新思维启发者">创新思维启发者</a-select-option>
            <a-select-option value="梦幻艺术创作者">梦幻艺术创作者</a-select-option>
            <a-select-option value="智慧知识传播者">智慧知识传播者</a-select-option>
            <a-select-option value="温暖家庭守护者">温暖家庭守护者</a-select-option>
            <a-select-option value="活力社交达人">活力社交达人</a-select-option>
            <a-select-option value="关怀情感陪伴者">关怀情感陪伴者</a-select-option>
            <a-select-option value="魅力表演艺术家">魅力表演艺术家</a-select-option>
            <a-select-option value="精准数据分析师">精准数据分析师</a-select-option>
            <a-select-option value="平衡关系协调者">平衡关系协调者</a-select-option>
            <a-select-option value="神秘洞察专家">神秘洞察专家</a-select-option>
          </a-select>
        </a-form-item>
        
        <div style="display: flex; justify-content: flex-end; gap: 16px; margin-top: 24px;">
          <a-button @click="handleCreateCancel">取消</a-button>
          <a-button type="primary" @click="handleCreateSubmit" :loading="createLoading">确定</a-button>
        </div>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="showEditModal"
      title="编辑IP"
      :footer="null"
      width="500px"
    >
      <a-form layout="vertical" :model="editFormData" :rules="editFormRules" ref="editFormRef">
        <a-form-item label="IP名称" name="ipName" required>
          <a-input 
            v-model:value="editFormData.ipName" 
            placeholder="请输入" 
            :maxLength="10"
            showCount
          />
        </a-form-item>
        
        <a-form-item label="IP介绍" name="ipIntro" required>
          <a-textarea 
            v-model:value="editFormData.ipIntro" 
            placeholder="请输入" 
            rows="4"
            :maxLength="2000"
            showCount
          />
        </a-form-item>
        
        <a-form-item label="五行" name="running" required>
          <a-select v-model:value="editFormData.running" placeholder="请选择">
            <a-select-option value="金">金</a-select-option>
            <a-select-option value="木">木</a-select-option>
            <a-select-option value="水">水</a-select-option>
            <a-select-option value="火">火</a-select-option>
            <a-select-option value="土">土</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="星座" name="portrait" required>
          <a-select v-model:value="editFormData.portrait" placeholder="请选择">
            <a-select-option value="摩羯座">摩羯座</a-select-option>
            <a-select-option value="水瓶座">水瓶座</a-select-option>
            <a-select-option value="双鱼座">双鱼座</a-select-option>
            <a-select-option value="白羊座">白羊座</a-select-option>
            <a-select-option value="金牛座">金牛座</a-select-option>
            <a-select-option value="双子座">双子座</a-select-option>
            <a-select-option value="巨蟹座">巨蟹座</a-select-option>
            <a-select-option value="狮子座">狮子座</a-select-option>
            <a-select-option value="处女座">处女座</a-select-option>
            <a-select-option value="天秤座">天秤座</a-select-option>
            <a-select-option value="天蝎座">天蝎座</a-select-option>
            <a-select-option value="射手座">射手座</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="MBTI" name="mbti" required>
          <a-select v-model:value="editFormData.mbti" placeholder="请选择">
            <a-select-option value="INTJ">INTJ</a-select-option>
            <a-select-option value="INTP">INTP</a-select-option>
            <a-select-option value="ENTJ">ENTJ</a-select-option>
            <a-select-option value="ENTP">ENTP</a-select-option>
            <a-select-option value="INFJ">INFJ</a-select-option>
            <a-select-option value="INFP">INFP</a-select-option>
            <a-select-option value="ENFJ">ENFJ</a-select-option>
            <a-select-option value="ENFP">ENFP</a-select-option>
            <a-select-option value="ISTP">ISTP</a-select-option>
            <a-select-option value="ISFP">ISFP</a-select-option>
            <a-select-option value="ESTP">ESTP</a-select-option>
            <a-select-option value="ESFP">ESFP</a-select-option>
            <a-select-option value="ISTJ">ISTJ</a-select-option>
            <a-select-option value="ISFJ">ISFJ</a-select-option>
            <a-select-option value="ESTJ">ESTJ</a-select-option>
            <a-select-option value="ESFJ">ESFJ</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="喜好" name="preference" required>
          <a-input 
            v-model:value="editFormData.preference" 
            placeholder="请输入" 
            :maxLength="10"
            showCount
          />
        </a-form-item>
        
        <!-- 个性化参数 section -->
        <div style="margin-bottom: 16px;">
          <div style="font-weight: 500; margin-bottom: 8px; color: rgba(0, 0, 0, 0.85); display: flex; align-items: center; gap: 4px;">
            <PlusOutlined 
              style="font-size: 14px; cursor: pointer;" 
              @click="addEditPersonalizedParam"
            />
            个性化参数
          </div>
          <div v-for="(field, index) in editFormData.personalizedParams" :key="index" style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
            <a-form-item style="flex: 1; margin-bottom: 0;">
              <template #label>
                <span style="color: #ff4d4f;">*</span>字段名
              </template>
              <a-input placeholder="请输入" v-model:value="field.fieldName" />
            </a-form-item>
            <a-form-item style="flex: 1; margin-bottom: 0;">
              <template #label>
                <span style="color: #ff4d4f;">*</span>类型
              </template>
              <a-select v-model:value="field.type" placeholder="请选择">
                <a-select-option value="string">字符串</a-select-option>
                <a-select-option value="number">数字</a-select-option>
                <a-select-option value="boolean">布尔值</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item style="flex: 1; margin-bottom: 0;">
              <template #label>
                <span style="color: #ff4d4f;">*</span>值
              </template>
              <!-- Dynamic input based on type -->
              <a-input v-if="field.type === 'string'" placeholder="请输入" v-model:value="field.value" />
              <a-input-number v-else-if="field.type === 'number'" placeholder="请输入" v-model:value="field.value" style="width: 100%;" />
              <a-switch v-else-if="field.type === 'boolean'" v-model:checked="field.value" />
            </a-form-item>
            <div style="display: flex; gap: 4px; margin-top: 24px;">
              <PlusOutlined 
                v-if="index === editFormData.personalizedParams.length - 1"
                style="cursor: pointer; font-weight: bold; font-size: 16px;" 
                @click="addEditPersonalizedParam"
              />
              <MinusCircleOutlined 
                style="color: #ff4d4f; cursor: pointer; font-weight: bold; font-size: 16px;" 
                @click="removeEditPersonalizedParam(index)"
              />
            </div>
          </div>
        </div>
        
        <a-form-item label="Agent名称" name="agentLink">
          <a-select v-model:value="editFormData.agentLink" placeholder="请选择">
            <a-select-option value="啵啵多模态情感陪伴智能体">啵啵多模态情感陪伴智能体</a-select-option>
            <a-select-option value="明细多维度心理测评模型">明细多维度心理测评模型</a-select-option>
            <a-select-option value="小智智能对话系统">小智智能对话系统</a-select-option>
            <a-select-option value="暖暖情感陪伴机器人">暖暖情感陪伴机器人</a-select-option>
            <a-select-option value="阳光正能量传播者">阳光正能量传播者</a-select-option>
            <a-select-option value="细心数据分析专家">细心数据分析专家</a-select-option>
            <a-select-option value="和谐关系协调者">和谐关系协调者</a-select-option>
            <a-select-option value="深度洞察分析师">深度洞察分析师</a-select-option>
            <a-select-option value="自由探索引导者">自由探索引导者</a-select-option>
            <a-select-option value="稳重目标规划师">稳重目标规划师</a-select-option>
            <a-select-option value="创新思维启发者">创新思维启发者</a-select-option>
            <a-select-option value="梦幻艺术创作者">梦幻艺术创作者</a-select-option>
            <a-select-option value="智慧知识传播者">智慧知识传播者</a-select-option>
            <a-select-option value="温暖家庭守护者">温暖家庭守护者</a-select-option>
            <a-select-option value="活力社交达人">活力社交达人</a-select-option>
            <a-select-option value="关怀情感陪伴者">关怀情感陪伴者</a-select-option>
            <a-select-option value="魅力表演艺术家">魅力表演艺术家</a-select-option>
            <a-select-option value="精准数据分析师">精准数据分析师</a-select-option>
            <a-select-option value="平衡关系协调者">平衡关系协调者</a-select-option>
            <a-select-option value="神秘洞察专家">神秘洞察专家</a-select-option>
          </a-select>
        </a-form-item>
        
        <div style="display: flex; justify-content: flex-end; gap: 16px; margin-top: 24px;">
          <a-button @click="handleEditCancel">取消</a-button>
          <a-button type="primary" @click="handleEditSubmit" :loading="editLoading">确定</a-button>
        </div>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="showViewModal"
      title="查看IP"
      :footer="null"
      width="500px"
    >
      <div class="view-form">
        <div class="form-item">
          <div class="form-label required">IP名称:</div>
          <div class="form-value">{{ viewFormData.ipName }}</div>
        </div>
        
        <div class="form-item">
          <div class="form-label required">IP介绍:</div>
          <div class="form-value">{{ viewFormData.ipIntro }}</div>
        </div>
        
        <div class="form-item">
          <div class="form-label required">五行:</div>
          <div class="form-value">{{ viewFormData.running }}</div>
        </div>
        
        <div class="form-item">
          <div class="form-label required">星座:</div>
          <div class="form-value">{{ viewFormData.portrait }}</div>
        </div>
        
        <div class="form-item">
          <div class="form-label required">MBTI:</div>
          <div class="form-value">{{ viewFormData.mbti }}</div>
        </div>
        
        <div class="form-item">
          <div class="form-label required">喜好:</div>
          <div class="form-value">{{ viewFormData.preference }}</div>
        </div>
        
        <div class="form-item">
          <div class="form-label">Agent名称:</div>
          <div class="form-value">{{ viewFormData.agentLink || '-' }}</div>
        </div>
        
        <!-- 个性化参数 section -->
        <div class="form-item">
          <div class="form-label">个性化参数:</div>
          <div class="form-value">
            <div v-if="viewFormData.personalizedParams && viewFormData.personalizedParams.length > 0">
              <div v-for="(param, index) in viewFormData.personalizedParams" :key="index" style="margin-bottom: 4px;">
                <span style="font-weight: 500;">{{ param.fieldName }}:</span> 
                <span v-if="param.type === 'boolean'">{{ param.value ? '是' : '否' }}</span>
                <span v-else>{{ param.value }}</span>
                <span style="color: #666; margin-left: 8px;">({{ param.type === 'string' ? '字符串' : param.type === 'number' ? '数字' : '布尔值' }})</span>
              </div>
            </div>
            <span v-else>-</span>
          </div>
        </div>
        
        <div style="display: flex; justify-content: flex-end; gap: 16px; margin-top: 24px;">
          <a-button @click="handleViewCancel">取消</a-button>
          <a-button type="primary" @click="handleViewConfirm">确定</a-button>
        </div>
      </div>
    </a-modal>

  </a-config-provider>
</template>
<script lang="ts" setup>
import type { ColumnsType } from 'ant-design-vue/es/table';
import { ref, computed, onMounted, watch } from 'vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme, message } from 'ant-design-vue';
import { ReloadOutlined, ColumnHeightOutlined ,SettingOutlined, SearchOutlined, PlusOutlined, MinusCircleOutlined} from '@ant-design/icons-vue';
import draggable from 'vuedraggable';
import FirmwareReleaseModal from '@/components/FirmwareReleaseModal.vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth'; // Import the auth store
import { useRouter } from 'vue-router';
import { h } from 'vue';
import { Empty } from 'ant-design-vue';
import { useRoute } from 'vue-router';
import { 
  createColumnConfigs, 
  useTableColumns, 
  createColumn,
  type ColumnDefinition 
} from '../utils/tableConfig';
import { constructApiUrl } from '../utils/api';

const router = useRouter();
const route = useRoute();

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Auth store for getting current user
const authStore = useAuthStore();

// Computed property for current username
const currentUsername = computed(() => {
  return authStore.user?.name || authStore.user?.username || '管理员';
});

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '', // Override the '页' suffix for quick jumper
  },
}));

interface DataItem {
  ipId: string;
  ipName: string;
  ipIntro: string;
  running: string;
  portrait: string;
  mbti: string;
  preference: string;
  agentLink: string;
  updater: string;
  createTime: string;
  updateTime: string;
  personalizedParams?: { fieldName: string; value: string | number | boolean; type: 'string' | 'number' | 'boolean' }[];
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
  defaultSortOrder?: 'ascend' | 'descend';
  customRender?: (record: any) => string | number;
}

const columnConfigs: ColumnConfig[] = [
  { key: 'rowIndex', title: '序号', dataIndex: 'rowIndex', width: 60, fixed: 'left', customRender: ({ index }: { index: number }) => (currentPage.value - 1) * pageSize.value + index + 1 },
  { key: 'ipId', title: 'IP ID', dataIndex: 'ipId', width: 150, sorter: (a: any, b: any) => (a.ipId || '').localeCompare(b.ipId || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'ipName', title: 'IP名称', dataIndex: 'ipName', width: 120, sorter: (a: any, b: any) => (a.ipName || '').localeCompare(b.ipName || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'ipIntro', title: 'IP介绍', dataIndex: 'ipIntro', width: 320, sorter: (a: any, b: any) => (a.ipIntro || '').localeCompare(b.ipIntro || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'running', title: '五行', dataIndex: 'running', width: 100, sorter: (a: any, b: any) => (a.running || '').localeCompare(b.running || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'portrait', title: '星座', dataIndex: 'portrait', width: 120, sorter: (a: any, b: any) => (a.portrait || '').localeCompare(b.portrait || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'mbti', title: 'MBTI', dataIndex: 'mbti', width: 100, sorter: (a: any, b: any) => (a.mbti || '').localeCompare(b.mbti || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'preference', title: '喜好', dataIndex: 'preference', width: 200, sorter: (a: any, b: any) => (a.preference || '').localeCompare(b.preference || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'agentLink', title: 'Agent名称', dataIndex: 'agentLink', width: 250, sorter: (a: any, b: any) => (a.agentLink || '').localeCompare(b.agentLink || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'updater', title: '更新人', dataIndex: 'updater', width: 100, sorter: (a: any, b: any) => (a.updater || '').localeCompare(b.updater || ''), sortDirections: ['ascend', 'descend'] },
  { key: 'createTime', title: '创建时间', dataIndex: 'createTime', width: 160, sorter: (a: any, b: any) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime(), sortDirections: ['ascend', 'descend'] },
  { key: 'updateTime', title: '更新时间', dataIndex: 'updateTime', width: 160, sorter: (a: any, b: any) => new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime(), sortDirections: ['ascend', 'descend'] },
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
      : ({ text, record }) => {
          // Handle hyperlinks for specific columns
          if (config.key === 'agentLink') {
            return text ? h('a', {
              style: { cursor: 'pointer' },
              onClick: () => router.push({ name: 'agent-configuration', query: { search: text } })
            }, text) : '-';
          }
          // Default rendering for other columns
          return text === undefined || text === null || text === '' ? '-' : text;
        },
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

// Data state
const rawData = ref<DataItem[]>([]);
const totalRecords = ref(0);
const loading = ref(false);

// Fetch data from API
const fetchData = async () => {
  console.log('fetchData called');
  loading.value = true;
  try {
    console.log('Calling IP management endpoint');
    
    const response = await axios.get(constructApiUrl('ip-management'));
    console.log('IP management response:', response.data);
    
    rawData.value = response.data.data;
    totalRecords.value = parseInt(response.data.total) || 0;

  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

// Helper function to map frontend column keys to database field names
const getSortByField = (columnKey?: string) => {
  const fieldMap: { [key: string]: string } = {
    'createTime': 'create_time',
    'updateTime': 'update_time',
    'ipId': 'ip_id',
    'ipName': 'ip_name',
    'ipIntro': 'ip_intro',
    'agentLink': 'agent_link'
  };
  return fieldMap[columnKey || ''] || 'update_time';
};

const currentPage = ref(1);
const pageSize = ref(10);

const sorterInfo = ref<any>(null);

const pagination = computed(() => ({
  total: totalRecords.value, 
  current: currentPage.value,
  pageSize: pageSize.value,
  showSizeChanger: true, 
  pageSizeOptions: ['10', '20', '50'], 
  showTotal: (total: number, range: [number, number]) => `第${range[0]}-${range[1]}条/共${total}条`, 
  showQuickJumper: { goButton: '页' }
}));

const onRefresh = () => {
  console.log('Refresh button clicked!');
  loading.value = true; // Show loading icon
  searchInputValue.value = '';
  currentPage.value = 1;
  resetColumns(); // Reset column order and visibility
  fetchData(); // Fetch data after refresh
};

const filteredData = computed<DataItem[]>(() => {
  let filtered = [...rawData.value];

  // Client-side search filtering
  if (searchInputValue.value) {
    const searchTerm = searchInputValue.value.toLowerCase();
    filtered = filtered.filter(item => 
      item.ipName.toLowerCase().includes(searchTerm) ||
      item.ipIntro.toLowerCase().includes(searchTerm) ||
      item.agentLink.toLowerCase().includes(searchTerm)
    );
  }
  
  // Always apply default sorting by updateTime in descending order (plain JavaScript)
  if (!sorterInfo.value || !sorterInfo.value.columnKey || !sorterInfo.value.order) {
    // Apply default sorting by updateTime in descending order
    filtered.sort((a, b) => {
      const aDate = new Date(a.updateTime);
      const bDate = new Date(b.updateTime);
      return bDate.getTime() - aDate.getTime(); // Descending order
    });
  } else {
    // Client-side sorting based on sorterInfo (user clicked column header)
    filtered.sort((a, b) => {
      const aValue = a[sorterInfo.value.columnKey as keyof DataItem];
      const bValue = b[sorterInfo.value.columnKey as keyof DataItem];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (sorterInfo.value.order === 'ascend') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      
      // Handle date strings
      if (typeof aValue === 'string' && typeof bValue === 'string' && 
          (sorterInfo.value.columnKey === 'createTime' || sorterInfo.value.columnKey === 'updateTime')) {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        if (sorterInfo.value.order === 'ascend') {
          return aDate.getTime() - bDate.getTime();
        } else {
          return bDate.getTime() - aDate.getTime();
        }
      }
      
      return 0;
    });
  }
  
  // Update total records for pagination
  totalRecords.value = filtered.length;
  
  // Client-side pagination
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  
  return filtered.slice(startIndex, endIndex);
});

const searchInputValue = ref('');

// Filter values for dropdowns
const ipNameValue = ref({ key: 'all', label: '全部', value: 'all' });
const ipTypeValue = ref({ key: 'all', label: '全部', value: 'all' });
const statusValue = ref({ key: 'all', label: '全部', value: 'all' });

// Filter options for dropdowns
const ipNameOptions = computed(() => {
  const uniqueIpNames = Array.from(new Set(rawData.value.map(item => item.ipName)));
  const options = uniqueIpNames.map(name => ({ key: name, value: name, label: name }));
  return [{ key: 'all', value: 'all', label: '全部' }, ...options];
});

const ipTypeOptions = computed(() => {
  const uniqueIpTypes = Array.from(new Set(rawData.value.map(item => item.running)));
  const options = uniqueIpTypes.map(type => ({ key: type, value: type, label: type }));
  return [{ key: 'all', value: 'all', label: '全部' }, ...options];
});

const statusOptions = computed(() => {
  const uniqueStatuses = Array.from(new Set(rawData.value.map(item => item.mbti)));
  const options = uniqueStatuses.map(status => ({ key: status, value: status, label: status }));
  return [{ key: 'all', value: 'all', label: '全部' }, ...options];
});

// Filter change handlers
const handleIpNameChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    ipNameValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    ipNameValue.value = val;
  }
};

const handleIpTypeChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    ipTypeValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    ipTypeValue.value = val;
  }
};

const handleStatusChange = (val: any) => {
  if (!val || !val.value || val.value === 'all') {
    statusValue.value = { key: 'all', label: '全部', value: 'all' };
  } else {
    statusValue.value = val;
  }
};

// Watch for search input changes
const searchTimeout = ref<NodeJS.Timeout | null>(null);
const handleSearchChange = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1;
    // No need to call fetchData since we have all data and search is handled client-side
  }, 500);
};

const handleTableChange = (
  paginationData: any,
  filters: any,
  sorter: any,
) => {
  console.log('=== Table change event ===');
  console.log('paginationData:', paginationData);
  console.log('filters:', filters);
  console.log('sorter:', sorter);
  console.log('Before - currentPage:', currentPage.value, 'pageSize:', pageSize.value);
  
  // Handle pagination changes
  if (paginationData) {
    console.log('Updating pagination - current:', paginationData.current, 'pageSize:', paginationData.pageSize);
    currentPage.value = paginationData.current;
    pageSize.value = paginationData.pageSize;
  }

  // Handle sorting changes
  const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;

  if (currentSorter && currentSorter.order) {
    sorterInfo.value = {
      columnKey: currentSorter.columnKey,
      order: currentSorter.order,
    };
  } else {
    // When sorting is cleared, revert to default (updateTime descending)
    sorterInfo.value = null; // Set to null to indicate no sorting
  }
  
  console.log('After - currentPage:', currentPage.value, 'pageSize:', pageSize.value);
  // No need to call fetchData since we have all data already
};

const onSettingClick = () => {
  console.log('Setting clicked');
};

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

const showReleaseModal = ref(false);

const handleReleaseModalClose = () => {
  showReleaseModal.value = false;
};

const handleReleaseModalSubmit = (_data: any) => {
  // You can handle the submit data here
  showReleaseModal.value = false;
};

const showEditModal = ref(false);
const editRecord = ref<any>(null);

const showCreateIpModal = ref(false);

const editFormData = ref({
  ipName: '',
  ipIntro: '',
  running: '',
  portrait: '',
  mbti: '',
  preference: '',
  agentLink: '',
  personalizedParams: [{ fieldName: '', value: '', type: 'string' }] as { fieldName: string; value: string | number | boolean; type: 'string' | 'number' | 'boolean' }[]
});

const editFormRules = {
  ipName: [{ required: true, message: '请输入IP名称', trigger: 'blur' }],
  ipIntro: [{ required: true, message: '请输入IP介绍', trigger: 'blur' }],
  running: [{ required: true, message: '请选择五行', trigger: 'change' }],
  portrait: [{ required: true, message: '请选择星座', trigger: 'change' }],
  mbti: [{ required: true, message: '请选择MBTI', trigger: 'change' }],
  preference: [{ required: true, message: '请输入喜好', trigger: 'blur' }]
  // Agent名称 is not required
};

const editFormRef = ref<any>(null);
const editLoading = ref(false);

const handleEditClick = (record: DataItem) => {
  editRecord.value = record;
  // Pre-fill the form with record data
  editFormData.value = {
    ipName: record.ipName,
    ipIntro: record.ipIntro,
    running: record.running,
    portrait: record.portrait,
    mbti: record.mbti,
    preference: record.preference,
    agentLink: record.agentLink,
    personalizedParams: record.personalizedParams || [
      { fieldName: 'key1', value: 'value1', type: 'string' },
      { fieldName: 'key2', value: 'value2', type: 'string' },
    ]
  };
  showEditModal.value = true;
};

const handleEditModalClose = () => {
  showEditModal.value = false;
  editRecord.value = null;
  editFormData.value = {
    ipName: '',
    ipIntro: '',
    running: '',
    portrait: '',
    mbti: '',
    preference: '',
    agentLink: '',
    personalizedParams: [{ fieldName: '', value: '', type: 'string' }]
  };
};

const handleEditCancel = () => {
  showEditModal.value = false;
  editRecord.value = null;
  editFormData.value = {
    ipName: '',
    ipIntro: '',
    running: '',
    portrait: '',
    mbti: '',
    preference: '',
    agentLink: '',
    personalizedParams: [{ fieldName: '', value: '', type: 'string' }]
  };
};

const handleEditSubmit = () => {
  editFormRef.value.validate().then(async () => {
    editLoading.value = true;
    try {
      const updatedIp = {
        ipName: editFormData.value.ipName,
        ipIntro: editFormData.value.ipIntro,
        running: editFormData.value.running,
        portrait: editFormData.value.portrait,
        mbti: editFormData.value.mbti,
        preference: editFormData.value.preference,
        agentLink: editFormData.value.agentLink,
        personalizedParams: editFormData.value.personalizedParams,
        updateTime: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        updater: currentUsername.value // Use the current username from auth store
      };

      const response = await axios.put(`http://121.43.196.106:2829/api/ip-management/${editRecord.value.ipId}`, updatedIp);
      console.log('IP updated:', response.data);
      message.success('更新成功');
      showEditModal.value = false;
      editRecord.value = null;
      editFormData.value = {
        ipName: '',
        ipIntro: '',
        running: '',
        portrait: '',
        mbti: '',
        preference: '',
        agentLink: '',
        personalizedParams: [{ fieldName: '', value: '', type: 'string' }]
      };
      fetchData(); // Refresh table
    } catch (error: any) {
      console.error('Error updating IP:', error);
      // Show specific error message from backend
      if (error.response && error.response.data && error.response.data.error) {
        message.error(`更新失败: ${error.response.data.error}`);
      } else {
        message.error('IP更新失败，请检查网络连接');
      }
    }
  });
};

const showViewModal = ref(false);
const viewRecord = ref<any>(null);

const viewFormData = ref({
  ipName: '',
  ipIntro: '',
  running: '',
  portrait: '',
  mbti: '',
  preference: '',
  agentLink: '',
  personalizedParams: [{ fieldName: '', value: '', type: 'string' }] as { fieldName: string; value: string | number | boolean; type: 'string' | 'number' | 'boolean' }[]
});

const handleViewClick = (record: DataItem) => {
  viewRecord.value = record;
  // Pre-fill the form with record data
  viewFormData.value = {
    ipName: record.ipName,
    ipIntro: record.ipIntro,
    running: record.running,
    portrait: record.portrait,
    mbti: record.mbti,
    preference: record.preference,
    agentLink: record.agentLink,
    personalizedParams: record.personalizedParams || [
      { fieldName: 'key1', value: 'value1', type: 'string' },
      { fieldName: 'key2', value: 'value2', type: 'string' },
    ]
  };
  showViewModal.value = true;
};

const handleViewCancel = () => {
  showViewModal.value = false;
  viewRecord.value = null;
  viewFormData.value = {
    ipName: '',
    ipIntro: '',
    running: '',
    portrait: '',
    mbti: '',
    preference: '',
    agentLink: '',
    personalizedParams: [{ fieldName: '', value: '', type: 'string' }]
  };
};

const handleViewConfirm = () => {
  showViewModal.value = false;
  viewRecord.value = null;
  viewFormData.value = {
    ipName: '',
    ipIntro: '',
    running: '',
    portrait: '',
    mbti: '',
    preference: '',
    agentLink: '',
    personalizedParams: [{ fieldName: '', value: '', type: 'string' }]
  };
};

const createFormData = ref({
  ipName: '',
  ipIntro: '',
  running: '',
  portrait: '',
  mbti: '',
  preference: '',
  agentLink: '',
  personalizedParams: [{ fieldName: '', value: '', type: 'string' }] as { fieldName: string; value: string | number | boolean; type: 'string' | 'number' | 'boolean' }[]
});

const createFormRules = {
  ipName: [{ required: true, message: '请输入IP名称', trigger: 'blur' }],
  ipIntro: [{ required: true, message: '请输入IP介绍', trigger: 'blur' }],
  running: [{ required: true, message: '请选择五行', trigger: 'change' }],
  portrait: [{ required: true, message: '请选择星座', trigger: 'change' }],
  mbti: [{ required: true, message: '请选择MBTI', trigger: 'change' }],
  preference: [{ required: true, message: '请输入喜好', trigger: 'blur' }]
  // Agent名称 is not required
};

const createFormRef = ref<any>(null);
const createLoading = ref(false);

const handleCreateSubmit = () => {
  createFormRef.value.validate().then(async () => {
    createLoading.value = true;
    try {
      const newIp = {
        ipName: createFormData.value.ipName,
        ipIntro: createFormData.value.ipIntro,
        running: createFormData.value.running,
        portrait: createFormData.value.portrait,
        mbti: createFormData.value.mbti,
        preference: createFormData.value.preference,
        agentLink: createFormData.value.agentLink,
        personalizedParams: createFormData.value.personalizedParams,
        createTime: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        updater: currentUsername.value // Use the current username from auth store
      };

      const response = await axios.post(`http://121.43.196.106:2829/api/ip-management`, newIp);
      console.log('IP created:', response.data);
      message.success('创建成功');
      showCreateIpModal.value = false;
      createFormData.value = {
        ipName: '',
        ipIntro: '',
        running: '',
        portrait: '',
        mbti: '',
        preference: '',
        agentLink: '',
        personalizedParams: [{ fieldName: '', value: '', type: 'string' }]
      };
      fetchData(); // Refresh table
    } catch (error: any) {
      console.error('Error creating IP:', error);
      // Show specific error message from backend
      if (error.response && error.response.data && error.response.data.error) {
        message.error(`创建失败: ${error.response.data.error}`);
      } else {
        message.error('IP创建失败，请检查网络连接');
      }
    } finally {
      createLoading.value = false;
    }
  });
};

const handleCreateCancel = () => {
  showCreateIpModal.value = false;
  createFormData.value = {
    ipName: '',
    ipIntro: '',
    running: '',
    portrait: '',
    mbti: '',
    preference: '',
    agentLink: '',
    personalizedParams: [{ fieldName: '', value: '', type: 'string' }]
  };
};

const addPersonalizedParam = () => {
  createFormData.value.personalizedParams.push({ fieldName: '', value: '', type: 'string' });
};

const removePersonalizedParam = (index: number) => {
  createFormData.value.personalizedParams.splice(index, 1);
};

// Functions for managing personalized parameters in edit form
const addEditPersonalizedParam = () => {
  editFormData.value.personalizedParams.push({ fieldName: '', value: '', type: 'string' });
};

const removeEditPersonalizedParam = (index: number) => {
  editFormData.value.personalizedParams.splice(index, 1);
};

onMounted(() => {
  fetchData();
});

</script>

<style scoped>
/* Reuse the same styles from IPAudio.vue */
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
  padding-right: 60px;
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

:deep(.ip-name-select .ant-select-selector) {
  padding-left: 50px !important;
}

:deep(.ip-type-select .ant-select-selector) {
  padding-left: 65px !important;
}

:deep(.status-select .ant-select-selector) {
  padding-left: 40px !important;
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
  gap: 4px;
  min-width: 180px;
  flex-wrap: wrap;
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

:deep(.ant-table-column-sorter-up),
:deep(.ant-table-column-sorter-down) {
  color: #bfbfbf !important;
}

:deep(.ant-table-column-sorter-up.active),
:deep(.ant-table-column-sorter-down.active) {
  color: #1677ff !important;
}

:deep(th .ant-table-column-sorter-up:hover),
:deep(th .ant-table-column-sorter-down:hover) {
  color: #1677ff !important;
}

.view-form {
  padding: 0;
}

.view-form .form-item {
  margin-bottom: 16px;
}

.view-form .form-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 4px;
  font-weight: 500;
}

.view-form .form-label.required::before {
  content: '*';
  color: #ff4d4f;
  margin-right: 4px;
}

.view-form .form-value {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
}

:deep(.ant-table-tbody .ant-table-cell a) {
  color: #1890ff;
  text-decoration: none;
  transition: color 0.3s ease;
}

:deep(.ant-table-tbody .ant-table-cell a:hover) {
  color: #40a9ff;
  text-decoration: underline;
}

:deep(.ant-table-tbody .ant-table-cell a:active) {
  color: #096dd9;
}

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