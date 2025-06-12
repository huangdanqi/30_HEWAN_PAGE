<template>
  <!-- Title -->
  <div class="title-container">
    <h2>Demo page</h2>
  </div>

  <!-- select item area -->


  <a-select
    v-model:value="selectedAge"
    placeholder="Select Age"
    style="width: 120px; margin-left: 10px;"
    :options="ageOptions"
    allowClear
  ></a-select>

  <!-- table area -->
  <a-table sticky :columns="columns" :data-source="filteredData" :scroll="{ x: 1500 }">
    <template #bodyCell="{ column }">
      <template v-if="column.key === 'operation'"><a>action</a></template>
    </template>

  </a-table>


</template>
<script lang="ts" setup>
import type { TableColumnsType } from 'ant-design-vue';
import { ref, computed } from 'vue';
import type { SelectProps } from 'ant-design-vue';

interface DataItem {
  key: number;
  name: string;
  age: number;
  address: string;
}

const columns = ref<TableColumnsType>([
  {
    title: 'Full Name',
    width: 100,
    dataIndex: 'name',
    key: 'name',
    // fixed: 'left',
  },
  {
    title: 'Age',
    width: 100,
    dataIndex: 'age',
    key: 'age',
    // fixed: 'left',
  },
  {
    title: 'Column 1',
    dataIndex: 'address',
    key: '1',
    width: 150,
  },
  {
    title: 'Column 2',
    dataIndex: 'address',
    key: '2',
    width: 150,
  },
  {
    title: 'Column 3',
    dataIndex: 'address',
    key: '3',
    width: 150,
  },
  {
    title: 'Column 4',
    dataIndex: 'address',
    key: '4',
    width: 150,
  },
  {
    title: 'Column 5',
    dataIndex: 'address',
    key: '5',
    width: 150,
  },
  {
    title: 'Column 6',
    dataIndex: 'address',
    key: '6',
    width: 150,
  },
  {
    title: 'Column 7',
    dataIndex: 'address',
    key: '7',
    width: 150,
  },
  { title: 'Column 8', dataIndex: 'address', key: '8' },
  {
    title: 'Action',
    key: 'operation',
    // fixed: 'right',
    width: 100,
  },
]);

const rawData: DataItem[] = [];
for (let i = 0; i < 100; i++) {
  rawData.push({
    key: i,
    name: `Edrward ${i}`,
    age: 32 + (i % 5), // Vary age for demonstration
    address: `London Park no. ${i}`,
  });
}

const data = ref<DataItem[]>(rawData);


const selectedAge = ref<string | undefined>(undefined); 

const ageOptions = computed<SelectProps['options']>(() => {
  const uniqueAges = [...new Set(data.value.map(item => item.age))].sort((a, b) => a - b);
  return uniqueAges.map(age => ({ value: age.toString(), label: `Age: ${age}` }));
});

const filteredData = computed<DataItem[]>(() => {
  if (selectedAge.value) {
    return data.value.filter(item => item.age.toString() === selectedAge.value);
  } else {
    return data.value;
  }
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

/* Custom style to reduce row height */
.ant-table-tbody > tr > td {
  padding: 8px; /* Adjust as needed, default is often 16px */
  font-size: 12px; /* Set font size to 13px */
  font-family: 'PingFang SC', sans-serif; /* Set font family */
}

.ant-table-thead > tr > th {
  font-size: 13px; /* Apply font size to table headers as well */
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
</style>
