# MySQL Database Setup for Account.vue

## Overview
This project now connects to a MySQL database to fetch real data for the Account.vue component instead of using mock data.

## Database Setup

### 1. MySQL Database
- **Database Name**: `page_test`
- **Table**: `account_data`
- **Password**: `h05010501`

### 2. Database Structure
The `account_data` table contains the following fields:
- `id` - Primary key
- `member_id` - 主账户ID
- `phone_number` - 手机号
- `device_model` - 设备型号
- `device_id` - 设备ID
- `ip_role` - IP角色
- `product_id` - 产品ID
- `commodity_id` - 商品ID
- `voice_cloning_model_id` - 音色复刻模型ID
- `initial_activation_time` - 首次激活时间
- `current_member_type` - 当前会员类型
- `member_payment` - 会员付费
- `member_activation_time` - 会员激活时间
- `member_expiration_time` - 会员到期时间
- `fourg_card_number` - 4G卡号
- `fourg_plan` - 4G套餐
- `remaining_data_current_month` - 当月剩余流量
- `fourg_payment` - 4G付费
- `fourg_activation_time` - 4G激活时间
- `fourg_expiration_time` - 4G到期时间
- `annual_service_fee_balance` - 服务年费用盈余
- `asr_usage` - ASR用量
- `llm_usage` - LLM用量
- `tts_usage` - TTS用量
- `voice_clone_usage` - 音色克隆用量
- `registration_time` - 注册时间

## Backend API

### Server Setup
- **Location**: `server/` directory
- **Port**: 3001
- **Dependencies**: Express, MySQL2, CORS, dotenv

### API Endpoints

#### 1. Get Account Data
```
GET /api/accounts
```
**Query Parameters:**
- `page` - Page number (default: 1)
- `pageSize` - Records per page (default: 10)
- `search` - Search term
- `ipRole` - Filter by IP role
- `memberType` - Filter by member type
- `memberPayment` - Filter by member payment
- `fourGPlan` - Filter by 4G plan
- `fourGPayment` - Filter by 4G payment
- `sortBy` - Sort field
- `sortOrder` - Sort direction (asc/desc)

#### 2. Get Filter Options
```
GET /api/filter-options
```
Returns available options for dropdown filters.

#### 3. Health Check
```
GET /api/health
```

## Frontend Changes

### Account.vue Updates
- Removed mock data generation
- Added API integration with axios
- Implemented real-time data fetching
- Added loading states
- Connected all filters to backend API
- Added search functionality with debouncing

### Key Features
- **Real-time filtering**: All dropdown filters now query the database
- **Search functionality**: Global search across multiple fields
- **Pagination**: Server-side pagination
- **Sorting**: Server-side sorting
- **Loading states**: Visual feedback during data fetching
- **Error handling**: Graceful error handling for API failures

## Running the Application

### 1. Start Backend Server
```bash
cd server
npm install
npm start
```
Server will run on http://localhost:3001

### 2. Start Frontend Development Server
```bash
npm run dev
```
Frontend will run on http://localhost:5173 (or similar)

### 3. Access the Application
Open your browser and navigate to the frontend URL. The Account page will now display real data from the MySQL database.

## Sample Data
The database includes 10 sample records with various combinations of:
- IP Roles: 王龙, 张三
- Member Types: 普通会员, VIP, SVIP
- Payment Statuses: 自动续费, 赠送, 停止续费, 未续购
- 4G Plans: 500M/月, 600M/月, 700M/月

## Troubleshooting

### Database Connection Issues
1. Ensure MySQL is running
2. Verify password is correct: `h05010501`
3. Check database exists: `page_test`
4. Verify table exists: `account_data`

### API Connection Issues
1. Ensure backend server is running on port 3001
2. Check CORS settings
3. Verify API endpoints are accessible

### Frontend Issues
1. Check browser console for errors
2. Verify axios is installed
3. Check API base URL configuration

## File Structure
```
hewan_page/
├── src/
│   └── views/
│       └── Account.vue (updated with API integration)
├── server/
│   ├── server.js (Express API server)
│   ├── package.json (backend dependencies)
│   └── .env (database configuration)
├── create_database.sql (database setup script)
└── README_SETUP.md (this file)
``` 