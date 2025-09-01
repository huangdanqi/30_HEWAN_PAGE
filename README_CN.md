# HeWan Page Server - 完整文档

## 目录
1. [项目概述](#项目概述)
2. [系统架构](#系统架构)
3. [安装与设置](#安装与设置)
4. [数据库结构](#数据库结构)
5. [API文档](#api文档)
6. [前端组件](#前端组件)
7. [文件结构](#文件结构)
8. [配置说明](#配置说明)
9. [开发指南](#开发指南)
10. [部署指南](#部署指南)
11. [故障排除](#故障排除)

## 项目概述

HeWan Page Server 是一个综合性的智能玩具制造和设备管理平台。该系统为管理产品、设备、固件、IP资源和生产过程提供完整的解决方案。

### 主要功能
- **账户管理**: 用户注册、认证和会员管理
- **产品管理**: 从创建到生产的完整产品生命周期
- **设备管理**: 设备注册、固件更新和状态监控
- **IP资源管理**: 音频、视频、图片和音乐文件管理
- **生产管理**: 设备和玩具生产跟踪
- **配置管理**: 模型、代理和工具配置系统
- **文件上传系统**: 支持各种文件类型，带大小验证
- **实时监控**: 设备状态和IP管理

### 技术栈
- **前端**: Vue 3 + TypeScript + Ant Design Vue + Vite
- **后端**: Node.js + Express + MySQL
- **数据库**: MySQL 8.0+
- **文件存储**: 本地文件系统，有组织的目录结构
- **认证**: 基于会话的认证

## 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端          │    │   后端API       │    │   数据库        │
│   (Vue 3)       │◄──►│   (Express)     │◄──►│   (MySQL)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   静态文件       │    │   文件上传      │    │   文件存储      │
│   (Public)      │    │   (Multer)      │    │   (本地文件系统) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 安装与设置

### 前置要求
- Node.js (v16或更高版本)
- MySQL (v8.0或更高版本)
- npm或yarn
- Git

### 步骤1: 克隆仓库
```bash
git clone https://github.com/huangdanqi/30_HEWAN_PAGE.git
cd hewan_page_server
```

### 步骤2: 安装依赖
```bash
# 安装前端依赖
npm install

# 安装后端依赖（如果有单独的package.json）
cd server
npm install
cd ..
```

### 步骤3: 数据库设置
```bash
# 创建MySQL数据库
mysql -u your_username -p
CREATE DATABASE hewan_page_server CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 导入完整数据库结构
mysql -u your_username -p hewan_page_server < server/database/setup_complete_database.sql
```

### 步骤4: 环境配置
在根目录创建`.env`文件：
```env
# 数据库配置
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=hewan_page_server
DB_PORT=3306

# 服务器配置
PORT=2829
NODE_ENV=development

# 前端配置
VITE_PORT=2830
VITE_API_BASE_URL=http://127.0.0.1:2829
```

### 步骤5: 启动开发服务器
```bash
# 启动后端服务器
cd server
npm start

# 启动前端开发服务器（在新终端中）
npm run dev
```

## 数据库结构

系统使用18个主要表来管理平台的各个方面：

### 核心表

#### 1. account_data (账户数据表)
- **用途**: 存储用户账户信息和会员详情
- **关键字段**: member_id, device_id, product_id, member_payment, member_expiration_time
- **关联关系**: 链接到product_list和device_management

#### 2. product_list (产品列表表)
- **用途**: 管理产品库存和跟踪
- **关键字段**: serial_number, product_id, product_model, production_batch, device_id
- **关联关系**: 链接到account_data, device_management, product_type

#### 3. device_management (设备管理表)
- **用途**: 跟踪设备生命周期和固件版本
- **关键字段**: device_id, device_model, current_firmware_version, bound_sub_account
- **关联关系**: 链接到product_list, device_type, firmware

#### 4. device_type (设备型号表)
- **用途**: 定义可用设备型号和规格
- **关键字段**: device_model_id, device_model_name, enable_4g, latest_firmware_version
- **关联关系**: 链接到device_management, firmware

#### 5. firmware (固件管理表)
- **用途**: 管理固件版本和发布
- **关键字段**: device_model, version_number, file_path, release_time
- **关联关系**: 链接到device_type, device_management

### 生产表

#### 6. device_production (设备生产表)
- **用途**: 跟踪设备制造过程
- **关键字段**: production_device_id, device_model, production_batch, quantity, total_price

#### 7. toy_production_new (玩具生产表)
- **用途**: 管理玩具制造和库存
- **关键字段**: product_id, device_model, production_batch, quantity, total_price

#### 8. product_type (产品型号表)
- **用途**: 定义产品类别和规格
- **关键字段**: product_id, product_model, product_name, product_type, device_model

### IP资源表

#### 9. ip_management (IP管理表)
- **用途**: 跟踪设备IP地址和在线状态
- **关键字段**: ip_address, device_id, status, last_seen

#### 10. ip_audio (IP音频表)
- **用途**: 管理设备的音频文件
- **关键字段**: audio_id, audio_name, audio_file_address, duration, file_size

#### 11. ip_video (IP视频表)
- **用途**: 管理设备的视频文件
- **关键字段**: video_id, video_name, video_file_address, duration, resolution

#### 12. ip_image (IP图片表)
- **用途**: 管理设备的图片文件
- **关键字段**: image_id, image_name, image_file_address, resolution

#### 13. ip_music (IP音乐表)
- **用途**: 管理设备的音乐文件
- **关键字段**: music_id, music_name, music_file_address, artist, album

### 配置表

#### 14. model_configuration (型号配置表)
- **用途**: 存储设备型号配置
- **关键字段**: model_id, model_name, configuration_data (JSON), status

#### 15. agent_configuration (代理配置表)
- **用途**: 管理AI代理配置
- **关键字段**: agent_id, agent_name, agent_type, configuration_data (JSON)

#### 16. tool_configuration (工具配置表)
- **用途**: 管理工具配置
- **关键字段**: tool_id, tool_name, tool_type, configuration_data (JSON)

### 工具表

#### 17. alarm (闹钟表)
- **用途**: 管理闹钟设置和文件
- **关键字段**: alarmId, alarmName, alarmFileAddress

#### 18. bom (物料清单表)
- **用途**: 管理产品的物料清单
- **关键字段**: bom_id, product_model, component_name, quantity, unit_price

## API文档

### 认证端点
- `POST /api/accounts/login` - 用户登录
- `POST /api/accounts/register` - 用户注册
- `GET /api/accounts/profile` - 获取用户资料

### 产品管理
- `GET /api/product-list` - 获取所有产品
- `POST /api/product-list` - 创建新产品
- `PUT /api/product-list/:id` - 更新产品
- `DELETE /api/product-list/:id` - 删除产品

### 设备管理
- `GET /api/device-management` - 获取所有设备
- `POST /api/device-management` - 注册新设备
- `PUT /api/device-management/:id` - 更新设备
- `DELETE /api/device-management/:id` - 删除设备

### 固件管理
- `GET /api/firmware` - 获取所有固件版本
- `POST /api/firmware` - 上传新固件
- `PUT /api/firmware/:id` - 更新固件
- `DELETE /api/firmware/:id` - 删除固件

### IP资源管理
- `GET /api/ipaudio` - 获取音频文件
- `POST /api/ipaudio` - 上传音频文件
- `GET /api/ipvideo` - 获取视频文件
- `POST /api/ipvideo` - 上传视频文件
- `GET /api/ipimage` - 获取图片文件
- `POST /api/ipimage` - 上传图片文件
- `GET /api/ipmusic` - 获取音乐文件
- `POST /api/ipmusic` - 上传音乐文件

### 生产管理
- `GET /api/device-production` - 获取设备生产记录
- `POST /api/device-production` - 创建生产记录
- `GET /api/toy-production` - 获取玩具生产记录
- `POST /api/toy-production` - 创建玩具生产记录

### 配置管理
- `GET /api/model-configuration` - 获取模型配置
- `POST /api/model-configuration` - 创建配置
- `GET /api/agent-configuration` - 获取代理配置
- `POST /api/agent-configuration` - 创建代理配置
- `GET /api/tool-configuration` - 获取工具配置
- `POST /api/tool-configuration` - 创建工具配置

## 前端组件

### 主要视图

#### 1. Login.vue
- **用途**: 用户认证界面
- **功能**: 登录表单、验证、错误处理
- **位置**: `src/views/Login.vue`

#### 2. ProductList.vue
- **用途**: 产品库存管理
- **功能**: CRUD操作、搜索、过滤、分页
- **关键组件**: ProductCreateModal, AddBatchModal
- **位置**: `src/views/ProductList.vue`

#### 3. DeviceManagement.vue
- **用途**: 设备生命周期管理
- **功能**: 设备注册、固件更新、状态监控
- **关键组件**: DeviceImportModal
- **位置**: `src/views/DeviceManagement.vue`

#### 4. Firmware.vue
- **用途**: 固件版本管理
- **功能**: 上传、版本控制、发布管理
- **关键组件**: FirmwareEditModal, FirmwareReleaseModal
- **位置**: `src/views/Firmware.vue`

#### 5. IPAudio.vue, IPVideo.vue, IPImage.vue, MusicResources.vue
- **用途**: IP资源管理
- **功能**: 文件上传、预览、分类
- **位置**: `src/views/IPAudio.vue` 等

### 可复用组件

#### 1. AppSidebar.vue
- **用途**: 主导航侧边栏
- **功能**: 菜单项、活动状态、可折叠
- **位置**: `src/components/AppSidebar.vue`

#### 2. AppTopbar.vue
- **用途**: 顶部导航栏
- **功能**: 用户信息、登出、通知
- **位置**: `src/components/AppTopbar.vue`

#### 3. 模态框组件
- **ProductCreateModal.vue**: 产品创建表单
- **DeviceImportModal.vue**: 设备导入功能
- **FirmwareEditModal.vue**: 固件编辑界面
- **BomUploadModal.vue**: BOM文件上传

## 文件结构

```
hewan_page_server/
├── src/                          # 前端Vue.js应用
│   ├── assets/                   # 静态资源（图片、图标）
│   ├── components/               # 可复用Vue组件
│   │   ├── AppSidebar.vue       # 主导航侧边栏
│   │   ├── AppTopbar.vue        # 顶部导航栏
│   │   ├── ProductCreateModal.vue # 产品创建模态框
│   │   ├── DeviceImportModal.vue # 设备导入模态框
│   │   ├── FirmwareEditModal.vue # 固件编辑模态框
│   │   └── BomUploadModal.vue   # BOM上传模态框
│   ├── layouts/                  # 布局组件
│   │   └── MainLayout.vue       # 主应用布局
│   ├── router/                   # Vue Router配置
│   │   └── index.ts             # 路由定义
│   ├── stores/                   # Pinia状态管理
│   │   └── auth.ts              # 认证存储
│   ├── utils/                    # 工具函数
│   │   ├── api.ts               # API客户端配置
│   │   └── tableConfig.ts       # 表格配置
│   ├── views/                    # 页面组件
│   │   ├── Login.vue            # 登录页面
│   │   ├── ProductList.vue      # 产品管理
│   │   ├── DeviceManagement.vue # 设备管理
│   │   ├── Firmware.vue         # 固件管理
│   │   ├── IPAudio.vue          # 音频资源管理
│   │   ├── IPVideo.vue          # 视频资源管理
│   │   ├── IPImage.vue          # 图片资源管理
│   │   ├── MusicResources.vue  # 音乐资源管理
│   │   ├── ToyProduction.vue    # 玩具生产管理
│   │   ├── DeviceProduction.vue # 设备生产管理
│   │   ├── ProductType.vue      # 产品类型管理
│   │   ├── DeviceType.vue       # 设备类型管理
│   │   ├── ModelConfiguration.vue # 模型配置
│   │   ├── AgentConfiguration.vue # 代理配置
│   │   ├── ToolConfiguration.vue # 工具配置
│   │   ├── BuiltInAlarm.vue     # 闹钟管理
│   │   ├── IPManagement.vue     # IP管理
│   │   └── Account.vue          # 账户管理
│   ├── App.vue                   # 根组件
│   └── main.ts                   # 应用入口点
├── server/                       # 后端Node.js应用
│   ├── config/                   # 配置文件
│   │   └── database.js           # 数据库连接配置
│   ├── middleware/               # Express中间件
│   │   └── upload.js             # 文件上传中间件
│   ├── routes/                    # API路由
│   │   ├── accounts.js           # 账户管理路由
│   │   ├── productList.js        # 产品列表路由
│   │   ├── deviceManagement.js   # 设备管理路由
│   │   ├── firmware.js           # 固件路由
│   │   ├── ipAudio.js            # IP音频路由
│   │   ├── ipVideo.js            # IP视频路由
│   │   ├── ipImage.js            # IP图片路由
│   │   ├── ipMusic.js            # IP音乐路由
│   │   ├── ipManagement.js       # IP管理路由
│   │   ├── toyProduction.js      # 玩具生产路由
│   │   ├── deviceProduction.js   # 设备生产路由
│   │   ├── productType.js        # 产品类型路由
│   │   ├── deviceType.js         # 设备类型路由
│   │   ├── modelConfiguration.js # 模型配置路由
│   │   ├── agentConfiguration.js # 代理配置路由
│   │   ├── toolConfiguration.js  # 工具配置路由
│   │   ├── alarm.js              # 闹钟路由
│   │   └── bom.js                # BOM路由
│   ├── database/                  # 数据库设置和文档
│   │   ├── setup_complete_database.sql # 完整数据库设置
│   │   ├── 01_create_database.sql # 数据库创建
│   │   ├── 02_sample_data.sql    # 示例数据插入
│   │   └── README.md              # 数据库文档
│   ├── scripts/                   # 数据库设置脚本
│   │   └── setup-database.js     # 数据库初始化脚本
│   └── server.js                  # 主服务器文件
├── public/                        # 公共资源
│   ├── audio/                     # 音频文件
│   ├── images/                     # 图片文件
│   ├── videos/                     # 视频文件
│   ├── firmware/                   # 固件文件
│   ├── bom-files/                  # BOM文件
│   ├── QRcode/                     # 二维码文件
│   └── barcode/                    # 条形码文件
├── docs/                          # 构建的前端文件（生产环境）
├── package.json                   # 前端依赖
├── vite.config.ts                 # Vite配置
├── tsconfig.json                  # TypeScript配置
├── README.md                      # 主文档
└── README_CN.md                   # 中文文档
```

## 配置说明

### 环境变量

#### 后端（server目录中的.env）
```env
# 数据库配置
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=hewan_page_server
DB_PORT=3306

# 服务器配置
PORT=2829
NODE_ENV=development

# 文件上传配置
MAX_FILE_SIZE=52428800  # 50MB字节
UPLOAD_PATH=../public
```

#### 前端（vite.config.ts）
```typescript
export default defineConfig({
  base: '/30_HEWAN_PAGE/',
  server: {
    port: 2830,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:2829',
        changeOrigin: true,
      },
    },
  },
})
```

### 数据库配置
```javascript
// server/config/database.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hewan_page_server',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
```

## 开发指南

### 添加新功能

#### 1. 后端API开发
1. 在`server/routes/`中创建新路由文件
2. 定义API端点，包含适当的错误处理
3. 使用连接池添加数据库查询
4. 如果需要，实现文件上传中间件
5. 在`server.js`中添加路由

#### 2. 前端组件开发
1. 在`src/views/`中创建新的Vue组件
2. 在`src/router/index.ts`中添加路由定义
3. 使用`src/utils/api.ts`实现API调用
4. 在`src/components/AppSidebar.vue`中添加到导航菜单

#### 3. 数据库架构更改
1. 创建迁移SQL文件
2. 更新`setup_complete_database.sql`
3. 使用示例数据测试
4. 更新文档

### 代码标准

#### 后端（Node.js/Express）
- 使用ES6模块
- 实现适当的错误处理
- 对数据库操作使用async/await
- 验证输入数据
- 使用有意义的变量名

#### 前端（Vue 3/TypeScript）
- 使用Composition API
- 实现TypeScript接口
- 使用Ant Design Vue组件
- 遵循Vue.js最佳实践
- 实现适当的错误处理

### 测试
```bash
# 测试数据库连接
cd server
node test_connection.js

# 测试API端点
node test_api.js

# 测试文件上传
node test_upload.js
```

## 部署指南

### 生产构建
```bash
# 构建前端
npm run build

# 构建的文件将在docs/目录中
```

### 服务器部署
```bash
# 安装PM2进行进程管理
npm install -g pm2

# 使用PM2启动服务器
cd server
pm2 start server.js --name hewan-page-server

# 监控服务器
pm2 status
pm2 logs hewan-page-server
```

### 数据库迁移
```bash
# 备份现有数据库
mysqldump -u username -p hewan_page_server > backup.sql

# 应用新架构
mysql -u username -p hewan_page_server < migration.sql
```

## 故障排除

### 常见问题

#### 1. 数据库连接问题
- 检查`.env`中的数据库凭据
- 验证MySQL服务是否运行
- 检查防火墙设置
- 使用`mysql -u username -p`测试连接

#### 2. 文件上传问题
- 检查`upload.js`中的文件大小限制
- 验证上传目录权限
- 检查磁盘空间
- 查看文件类型限制

#### 3. 前端构建问题
- 清除node_modules并重新安装
- 检查TypeScript错误
- 验证Vite配置
- 检查缺失的依赖项

#### 4. API连接问题
- 验证后端服务器是否运行
- 检查CORS配置
- 查看`vite.config.ts`中的代理设置
- 检查网络连接

### 调试命令
```bash
# 检查服务器状态
curl http://localhost:2829/api/health

# 测试数据库连接
cd server && node test_db_connection.js

# 检查文件权限
ls -la public/

# 监控服务器日志
pm2 logs hewan-page-server
```

### 性能优化
- 实现数据库索引
- 使用连接池
- 优化文件上传
- 实现缓存策略
- 监控内存使用

## 支持

如需技术支持或问题：
- 查看上面的故障排除部分
- 查看`server/database/README.md`中的数据库文档
- 检查每个路由文件中的API文档
- 查看Vue.js组件文档

## 许可证

本项目采用MIT许可证。
