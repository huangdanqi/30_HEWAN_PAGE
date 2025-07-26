import { ref, computed } from 'vue';
import type { ColumnsType } from 'ant-design-vue/es/table';

// Base interface for column configuration
export interface ColumnConfig {
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

// Interface for creating column configs
export interface ColumnDefinition {
  key: string;
  title: string;
  dataIndex: string;
  width: number;
  fixed?: 'left' | 'right' | boolean;
  sortable?: boolean;
  sortType?: 'string' | 'number' | 'date';
  className?: string;
}

// Function to create column configs from definitions
export function createColumnConfigs(definitions: ColumnDefinition[]): ColumnConfig[] {
  return definitions.map(def => {
    const config: ColumnConfig = {
      key: def.key,
      title: def.title,
      dataIndex: def.dataIndex,
      width: def.width,
      fixed: def.fixed,
      className: def.className,
    };

    // Add sorting if specified
    if (def.sortable) {
      config.sortDirections = ['ascend', 'descend'];
      
      // Create sorter function based on sort type
      if (def.sortType === 'number') {
        config.sorter = (a: any, b: any) => {
          const aVal = parseFloat(a[def.dataIndex]) || 0;
          const bVal = parseFloat(b[def.dataIndex]) || 0;
          return aVal - bVal;
        };
      } else if (def.sortType === 'date') {
        config.sorter = (a: any, b: any) => {
          const aVal = new Date(a[def.dataIndex]).getTime();
          const bVal = new Date(b[def.dataIndex]).getTime();
          return aVal - bVal;
        };
      } else {
        // Default string sorting
        config.sorter = (a: any, b: any) => {
          const aVal = String(a[def.dataIndex] || '').toLowerCase();
          const bVal = String(b[def.dataIndex] || '').toLowerCase();
          return aVal.localeCompare(bVal);
        };
      }
    }

    return config;
  });
}

// Composable for managing table columns
export function useTableColumns(columnConfigs: ColumnConfig[]) {
  const columnOrder = ref<string[]>(columnConfigs.map(config => config.key));
  const selectedColumnKeys = ref<string[]>(columnConfigs.map(config => config.key));
  const sorterInfo = ref<any>({
    columnKey: '',
    order: undefined,
  });

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

  // Reset columns to default
  const resetColumns = () => {
    selectedColumnKeys.value = columnConfigs.map(config => config.key);
    columnOrder.value = columnConfigs.map(config => config.key);
  };

  // Handle column order change (drag and drop)
  const onColumnOrderChange = (event: { newIndex: number; oldIndex: number }) => {
    const { newIndex, oldIndex } = event;
    const movedColumn = columnOrder.value[oldIndex];
    const newOrder = [...columnOrder.value];
    newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, movedColumn);
    columnOrder.value = newOrder;
  };

  // Handle column visibility change
  const handleColumnVisibilityChange = (key: string, checked: boolean) => {
    if (checked) {
      if (!selectedColumnKeys.value.includes(key)) {
        selectedColumnKeys.value.push(key);
      }
    } else {
      selectedColumnKeys.value = selectedColumnKeys.value.filter(k => k !== key);
    }
  };

  // Handle table change (sorting, pagination, filtering)
  const handleTableChange = (
    _paginationData: any,
    _filters: any,
    sorter: any,
  ) => {
    const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;

    if (currentSorter && currentSorter.order) {
      sorterInfo.value = {
        columnKey: currentSorter.columnKey,
        order: currentSorter.order,
      };
    } else {
      // When sorting is cleared, reset sorter info
      sorterInfo.value = {
        columnKey: '',
        order: undefined,
      };
    }
  };

  return {
    columns,
    columnOrder,
    selectedColumnKeys,
    sorterInfo,
    resetColumns,
    onColumnOrderChange,
    handleColumnVisibilityChange,
    handleTableChange,
  };
}

// Helper function to create a simple column definition
export function createColumn(
  key: string,
  title: string,
  dataIndex: string,
  width: number,
  options: {
    fixed?: 'left' | 'right';
    sortable?: boolean;
    sortType?: 'string' | 'number' | 'date';
    className?: string;
  } = {}
): ColumnDefinition {
  return {
    key,
    title,
    dataIndex,
    width,
    fixed: options.fixed,
    sortable: options.sortable,
    sortType: options.sortType,
    className: options.className,
  };
} 