<template>
  <a-config-provider :locale="customLocale" :theme="{ algorithm: theme.defaultAlgorithm }">
    <!-- Title -->
    <div class="title-container">
      <h2>Demo page</h2>
    </div>

    <!-- select item area -->
    <div class="top-controls-wrapper">
      <div class="left-aligned-section">
        <a-select
          v-model:value="value"
          label-in-value
          style="width: 120px"
          :options="options"
          @change="handleChange"
        ></a-select>
      </div>

      <!-- icon area -->
      <div class="right-aligned-icons">
          <!-- search area  -->
          <a-input
            v-model:value="searchInputValue"
            placeholder="输入关键字搜索"
            style="width: 200px"
            @pressEnter="onSearch"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
          <ReloadOutlined />
          <ColumnHeightOutlined />
          <SettingOutlined />
      </div>
    </div>
      
    <!-- table area -->
    <!-- <a-table sticky :columns="columns" :data-source="filteredData" :pagination="pagination" >
      <template #bodyCell="{ column }">
        <template v-if="column.key === 'operation'"><a>action</a></template>
      </template>
    </a-table> -->
    <a-table
    :columns="columns"
    :data-source="filteredData"
 
    :pagination="pagination"
    
    :scroll="{ x: 2660 }"
   
  >
    
  </a-table>

  </a-config-provider>
</template>
<script lang="ts" setup>
import type { TableColumnsType } from 'ant-design-vue';
import { ref, computed } from 'vue';
import type { SelectProps } from 'ant-design-vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import { theme } from 'ant-design-vue';
import { ReloadOutlined, ColumnHeightOutlined ,SettingOutlined, SearchOutlined} from '@ant-design/icons-vue';

const customLocale = computed(() => ({
  ...zh_CN,
  Pagination: {
    ...zh_CN.Pagination,
    page: '', // Override the '页' suffix for quick jumper
  },
}));

interface DataItem {
  key: number;
  accountId: string; // 账户ID
  phoneNumber: string; // 手机号
  deviceModel: string; // 设备型号
  deviceId: string; // 设备ID
  productId: string; // 商品ID
  ipRole: string; // IP角色
  productModel: string; // 产品型号
  currentMemberType: string; // 当前会员类型
  memberPayment: string; // 会员付费
  memberActivationTime: string; // 会员激活时间
  memberExpirationTime: string; // 会员到期时间
  fourGCardNumber: string; // 4G卡号
  fourGPlan: string; // 4G套餐
  remainingDataThisMonth: string; // 当月剩余流量
  fourGPayment: string; // 4G付费
  fourGActivationTime: string; // 4G激活时间
  fourGExpirationTime: string; // 4G到期时间
  serviceAnnualFeeBalance: number; // 服务年费用余额 (元)
  asrAnnualUsage: string; // ASR年用量
  llmAnnualUsage: string; // LLM年用量
  ttsAnnualUsage: string; // TTS年用量
  voiceCloneAnnualUsage: string; // 音色克隆年用量
  registrationTime: string; // 注册时间
}

const columns = ref<TableColumnsType>([
  { title: '序号', dataIndex: 'key', key: 'key', width: 60, fixed: 'left' },
  { title: '账户ID', dataIndex: 'accountId', key: 'accountId', width: 150 },
  { title: '手机号', dataIndex: 'phoneNumber', key: 'phoneNumber', width: 120 },
  { title: '设备型号', dataIndex: 'deviceModel', key: 'deviceModel', width: 100 },
  { title: '设备ID', dataIndex: 'deviceId', key: 'deviceId', width: 150 },
  { title: '商品ID', dataIndex: 'productId', key: 'productId', width: 150 },
  { title: 'IP角色', dataIndex: 'ipRole', key: 'ipRole', width: 80 },
  { title: '产品型号', dataIndex: 'productModel', key: 'productModel', width: 120 },
  { title: '当前会员类型', dataIndex: 'currentMemberType', key: 'currentMemberType', width: 120 },
  { title: '会员付费', dataIndex: 'memberPayment', key: 'memberPayment', width: 100 },
  { title: '会员激活时间', dataIndex: 'memberActivationTime', key: 'memberActivationTime', width: 150 },
  { title: '会员到期时间', dataIndex: 'memberExpirationTime', key: 'memberExpirationTime', width: 150 },
  { title: '4G卡号', dataIndex: 'fourGCardNumber', key: 'fourGCardNumber', width: 120 },
  { title: '4G套餐', dataIndex: 'fourGPlan', key: 'fourGPlan', width: 100 },
  { title: '当月剩余流量', dataIndex: 'remainingDataThisMonth', key: 'remainingDataThisMonth', width: 120 },
  { title: '4G付费', dataIndex: 'fourGPayment', key: 'fourGPayment', width: 100 },
  { title: '4G激活时间', dataIndex: 'fourGActivationTime', key: 'fourGActivationTime', width: 150 },
  { title: '4G到期时间', dataIndex: 'fourGExpirationTime', key: 'fourGExpirationTime', width: 150 },
  { title: '服务年费用余额 (元)', dataIndex: 'serviceAnnualFeeBalance', key: 'serviceAnnualFeeBalance', width: 150 },
  { title: 'ASR年用量', dataIndex: 'asrAnnualUsage', key: 'asrAnnualUsage', width: 120 },
  { title: 'LLM年用量', dataIndex: 'llmAnnualUsage', key: 'llmAnnualUsage', width: 120 },
  { title: 'TTS年用量', dataIndex: 'ttsAnnualUsage', key: 'ttsAnnualUsage', width: 120 },
  { title: '音色克隆年用量', dataIndex: 'voiceCloneAnnualUsage', key: 'voiceCloneAnnualUsage', width: 150 },
  { title: '注册时间', dataIndex: 'registrationTime', key: 'registrationTime', width: 150 },
  { title: 'Action', key: 'operation', fixed: 'right', width: 100 },
]);

const rawData: DataItem[] = [];
const memberTypes = ['普通会员', 'VIP', 'SVIP'];
const paymentStatuses = ['自动续费', '赠送', '停止续费', '未续购'];

for (let i = 0; i < 100; i++) {
  const date = new Date(2025, 5, 23, 23, 25, 33); // Example date
  date.setDate(date.getDate() + Math.floor(i / 10)); // Vary date slightly

  const activationTime = date.toISOString().slice(0, 19).replace('T', ' ');
  const expirationDate = new Date(date);
  expirationDate.setDate(date.getDate() + 20); // Example expiration 20 days later
  const expirationTime = expirationDate.toISOString().slice(0, 19).replace('T', ' ');

  rawData.push({
    key: i + 1,
    accountId: `jkhg824&3*g${i % 10}`,
    phoneNumber: `183****${7950 + (i % 10)}`,
    deviceModel: `HWSZ00${i % 2 === 0 ? '1' : '2'}`,
    deviceId: `0075A1B2SZTD${1000 + i}`,
    productId: `hjhtwn832nj${i}`,
    ipRole: i % 2 === 0 ? '王龙' : '张三',
    productModel: `HWSZ00100${i % 3}`,
    currentMemberType: memberTypes[i % memberTypes.length],
    memberPayment: paymentStatuses[i % paymentStatuses.length],
    memberActivationTime: activationTime,
    memberExpirationTime: expirationTime,
    fourGCardNumber: `1477629430${10 + i}`,
    fourGPlan: `${(500 + (i % 3) * 100)}M/月`,
    remainingDataThisMonth: `${(20 + (i % 5))}M`,
    fourGPayment: paymentStatuses[(i + 1) % paymentStatuses.length],
    fourGActivationTime: activationTime,
    fourGExpirationTime: expirationTime,
    serviceAnnualFeeBalance: 26.35 + (i % 5),
    asrAnnualUsage: `384,3848 tokens`,
    llmAnnualUsage: `384,3848 tokens`,
    ttsAnnualUsage: `213.55 h`,
    voiceCloneAnnualUsage: `213.55 h`,
    registrationTime: activationTime,
  });
}

const data = ref<DataItem[]>(rawData);

const options = computed<SelectProps['options']>(() => {
  return data.value.map(item => ({
    value: item.key.toString(), 
    label: `${item.accountId}`,
  }));
});

const handleChange: SelectProps['onChange'] = (val) => {
  console.log(val);
};

const onSearch = (searchValue: string) => {
  console.log('use value', searchValue);
};

const value = ref({ value: data.value[0].key.toString(), label: `${data.value[0].accountId}` });

const currentPage = ref(1);
const pageSize = ref(10); 

const pagination = computed(() => ({
  total: rawData.length, 
  current: currentPage.value,
  pageSize: pageSize.value,
  showSizeChanger: true, 
  pageSizeOptions: ['10', '20', '50'], 
  showTotal: (total: number, range: [number, number]) => `第${range[0]}-${range[1]}条/共${total}条`, 
  // showQuickJumper: { goButton: '跳转至' }, 
  onShowSizeChange: (current: number, size: number) => {
    console.log('onShowSizeChange', current, size);
    currentPage.value = current;
    pageSize.value = size;
  },
  onChange: (page: number, size: number) => {
    console.log('onChange', page, size);
    currentPage.value = page;
    pageSize.value = size;
  },
}));

const filteredData = computed<DataItem[]>(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return rawData.slice(start, end);
});

const searchInputValue = ref('');

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

/* Custom style to reduce row height */
.ant-table-tbody > tr > td {
  padding: 8px; /* Adjust as needed, default is often 16px */
  font-size: 12px; /* Set font size to 13px */
  font-family: 'PingFang SC', sans-serif; /* Set font family */
}

.ant-table-thead > tr > th {
  font-size: 12px; /* Apply font size to table headers as well */
  font-family: 'PingFang SC', sans-serif; /* Apply font family to table headers */
}

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

.right-aligned-icons {
  display: flex;
  align-items: center;
  gap: 10px; /* Add space between icons */
  padding-right: 30px;
}

.right-aligned-icons .anticon {
  padding: 0;
  border: none;
  background: transparent;

  cursor: pointer;
  font-size: 16px; /* Adjust as needed */
  color: rgba(0, 0, 0, 0.45); /* Grey color for icons */
}

html, body {
  overflow-x: hidden;
}
</style>
