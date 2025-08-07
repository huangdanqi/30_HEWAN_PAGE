# Multi-API Architecture for Account.vue

## Overview
This implementation demonstrates how to fetch data from multiple API endpoints for different columns, simulating a real-world scenario where data comes from different database tables.

## API Endpoints

### 1. Basic Account Data (`/api/accounts/basic`)
**Purpose**: Fetches basic account and device information
**Columns served**:
- 序号 (Row Index)
- 主账户ID (Member ID)
- 手机号 (Phone Number)
- 设备型号 (Device Model)
- 设备ID (Device ID)
- IP角色 (IP Role)
- 产品ID (Product ID)
- 商品ID (Commodity ID)
- 音色复刻模型ID (Voice Cloning Model ID)
- 首次激活时间 (Initial Activation Time)
- 注册时间 (Registration Time)

**Filters**: Search, IP Role
**Sorting**: Registration time, Initial activation time

### 2. Membership Data (`/api/accounts/membership`)
**Purpose**: Fetches member subscription and payment information
**Columns served**:
- 当前会员类型 (Current Member Type)
- 会员付费 (Member Payment)
- 会员激活时间 (Member Activation Time)
- 会员到期时间 (Member Expiration Time)
- 服务年费用盈余 (Annual Service Fee Balance)

**Filters**: Member Type, Member Payment
**Sorting**: Member activation time, Member expiration time, Annual service fee balance

### 3. 4G Service Data (`/api/accounts/4g-service`)
**Purpose**: Fetches 4G service and plan information
**Columns served**:
- 4G卡号 (4G Card Number)
- 4G套餐 (4G Plan)
- 当月剩余流量 (Remaining Data Current Month)
- 4G付费 (4G Payment)
- 4G激活时间 (4G Activation Time)
- 4G到期时间 (4G Expiration Time)

**Filters**: 4G Plan, 4G Payment
**Sorting**: 4G activation time, 4G expiration time

### 4. Usage Statistics (`/api/accounts/usage`)
**Purpose**: Fetches usage statistics and metrics
**Columns served**:
- ASR用量 (ASR Usage)
- LLM用量 (LLM Usage)
- TTS用量 (TTS Usage)
- 音色克隆用量 (Voice Clone Usage)

**Filters**: None (usage data is global)
**Sorting**: Any usage field

## Frontend Implementation

### Data Sources
The frontend maintains separate data sources for each API endpoint:
```typescript
const dataSources = ref<{ [key: string]: DataItem[] }>({
  basic: [],
  membership: [],
  fourgService: [],
  usage: []
});
```

### Column Configuration
Each column is configured with its corresponding API endpoint:
```typescript
{ key: 'memberId_1', title: '主账户ID', dataIndex: 'memberId', width: 150, apiEndpoint: 'basic' },
{ key: 'currentMemberType_10', title: '当前会员类型', dataIndex: 'currentMemberType', width: 120, apiEndpoint: 'membership' },
{ key: 'fourGCardNumber_14', title: '4G卡号', dataIndex: 'fourGCardNumber', width: 120, apiEndpoint: 'fourgService' },
{ key: 'asrUsage_21', title: 'ASR用量', dataIndex: 'asrUsage', width: 120, apiEndpoint: 'usage' },
```

### Data Fetching Strategy
1. **Endpoint Detection**: The system identifies which endpoints are needed based on visible columns
2. **Parallel Fetching**: All required endpoints are called in parallel for better performance
3. **Data Merging**: Data from different endpoints is merged by ID to create complete records
4. **Filter Application**: Filters are applied to the appropriate endpoints only

### Data Combination
```typescript
const combinedData = computed(() => {
  const allIds = new Set();
  
  // Collect all IDs from all data sources
  Object.values(dataSources.value).forEach(data => {
    data.forEach(item => allIds.add(item.id));
  });

  // Create combined records
  return Array.from(allIds).map(id => {
    const record: any = { id, key: id };
    
    // Merge data from all sources
    Object.entries(dataSources.value).forEach(([source, data]) => {
      const sourceRecord = data.find(item => item.id === id);
      if (sourceRecord) {
        Object.assign(record, sourceRecord);
      }
    });
    
    return record;
  });
});
```

## Benefits of This Architecture

### 1. **Scalability**
- Each endpoint can be optimized for its specific data type
- Different endpoints can use different caching strategies
- Load can be distributed across multiple database tables

### 2. **Performance**
- Parallel API calls reduce total loading time
- Only fetch data for visible columns
- Each endpoint can implement its own pagination and filtering

### 3. **Maintainability**
- Clear separation of concerns
- Each endpoint can be developed and tested independently
- Easy to add new data sources

### 4. **Flexibility**
- Different columns can have different filtering and sorting options
- Each endpoint can implement its own business logic
- Easy to add new columns or modify existing ones

## Real-World Scenarios

### Scenario 1: Microservices Architecture
Each endpoint could be served by a different microservice:
- `basic` → User Service
- `membership` → Subscription Service
- `4g-service` → Network Service
- `usage` → Analytics Service

### Scenario 2: Different Database Tables
Each endpoint could query different database tables:
- `basic` → `users` table
- `membership` → `subscriptions` table
- `4g-service` → `network_services` table
- `usage` → `usage_metrics` table

### Scenario 3: Different Data Sources
Each endpoint could fetch from different data sources:
- `basic` → MySQL database
- `membership` → PostgreSQL database
- `4g-service` → Redis cache
- `usage` → MongoDB collection

## API Endpoints Summary

| Endpoint | Purpose | Columns | Filters | Sorting |
|----------|---------|---------|---------|---------|
| `/api/accounts/basic` | Basic account info | 11 columns | Search, IP Role | Registration, Initial activation |
| `/api/accounts/membership` | Subscription data | 5 columns | Member Type, Payment | Activation, Expiration, Balance |
| `/api/accounts/4g-service` | 4G service data | 6 columns | 4G Plan, Payment | Activation, Expiration |
| `/api/accounts/usage` | Usage statistics | 4 columns | None | Any usage field |

## Testing the Multi-API Setup

You can test each endpoint individually:

```bash
# Test basic data
curl "http://localhost:3001/api/accounts/basic?page=1&pageSize=5"

# Test membership data
curl "http://localhost:3001/api/accounts/membership?page=1&pageSize=5"

# Test 4G service data
curl "http://localhost:3001/api/accounts/4g-service?page=1&pageSize=5"

# Test usage data
curl "http://localhost:3001/api/accounts/usage?page=1&pageSize=5"
```

This architecture provides a robust foundation for handling complex data requirements in real-world applications. 