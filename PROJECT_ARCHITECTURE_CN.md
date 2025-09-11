# Hewan 页面服务器 - 项目架构文档

## 项目概述

Hewan 页面服务器是一个全栈 Web 应用程序，使用 Node.js 后端和 Vue.js 前端构建，专为管理产品列表、设备管理、固件更新和生产跟踪系统而设计。

## 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端层                                  │
├─────────────────────────────────────────────────────────────────┤
│  Vue.js 前端 (src/)                                             │
│  ├── 组件 (可重用 UI 组件)                                       │
│  ├── 视图 (页面组件)                                             │
│  ├── 存储 (Pinia 状态管理)                                       │
│  ├── 路由 (Vue Router 导航)                                     │
│  └── 工具 (辅助函数)                                             │
├─────────────────────────────────────────────────────────────────┤
│                        服务器层                                  │
├─────────────────────────────────────────────────────────────────┤
│  Node.js 后端 (server/)                                         │
│  ├── 路由 (API 端点)                                             │
│  ├── 中间件 (请求处理)                                           │
│  ├── 数据库 (MySQL 集成)                                         │
│  └── 配置 (服务器配置)                                           │
├─────────────────────────────────────────────────────────────────┤
│                      数据库层                                    │
├─────────────────────────────────────────────────────────────────┤
│  MySQL 数据库                                                    │
│  ├── product_list (产品管理)                                     │
│  ├── device_management (设备跟踪)                                │
│  ├── firmware (固件版本)                                         │
│  ├── toy_production (生产数据)                                   │
│  └── user_accounts (用户管理)                                    │
└─────────────────────────────────────────────────────────────────┘
```

## 文件结构和功能

### 根目录文件

#### 配置文件
- **`package.json`** - Node.js 依赖项和脚本
- **`vite.config.ts`** - Vue.js 的 Vite 构建配置
- **`tsconfig.json`** - TypeScript 配置
- **`tsconfig.app.json`** - TypeScript 应用特定配置
- **`tsconfig.node.json`** - TypeScript Node.js 配置

#### 数据库脚本
- **`add_creator_name_column.sql`** - 向 product_list 表添加创建者名称列
- **`create_product_table.sql`** - 创建主产品表结构
- **`insert_sample_data.sql`** - 插入测试样本数据
- **`fix_encoding_final.sql`** - 修复中文字符编码问题
- **`final_fix.sql`** - 综合数据库修复

#### 迁移脚本
- **`run_migration.bat`** - Windows 批处理文件，用于数据库迁移
- **`run_migration.ps1`** - PowerShell 脚本，用于数据库迁移
- **`run_migration_simple.bat`** - 简化的 Windows 迁移脚本
- **`run_migration_simple.ps1`** - 简化的 PowerShell 迁移脚本

#### 服务器管理脚本
- **`start_server.bat`** - Windows 启动服务器脚本
- **`start_cloud_dev.bat`** - Windows 云开发脚本
- **`start_cloud_dev.sh`** - Linux/Mac 云开发脚本
- **`deploy.bat`** - Windows 部署脚本
- **`deploy.ps1`** - PowerShell 部署脚本

#### 实用脚本
- **`check_server_status.sh`** - 检查服务器是否运行
- **`check_mysql_auth.sh`** - 验证 MySQL 身份验证
- **`fix_mysql_auth.sh`** - 修复 MySQL 身份验证问题
- **`reset_mysql_password.sh`** - 重置 MySQL 密码
- **`access_app.sh`** - 访问应用程序的脚本

### 前端源代码 (`src/`)

#### 核心应用文件
- **`main.ts`** - Vue.js 应用程序入口点
- **`App.vue`** - 根 Vue 组件
- **`style.css`** - 全局 CSS 样式
- **`shims-vue.d.ts`** - Vue.js TypeScript 声明
- **`vite-env.d.ts`** - Vite 环境类型

#### 组件 (`src/components/`)
- **`AppSidebar.vue`** - 主导航侧边栏
- **`AppTopbar.vue`** - 顶部导航栏
- **`AddBatchModal.vue`** - 批量添加产品的模态框
- **`BomUploadModal.vue`** - BOM 文件上传模态框
- **`DeviceImportModal.vue`** - 设备导入模态框
- **`FirmwareEditModal.vue`** - 固件编辑模态框
- **`FirmwareReleaseModal.vue`** - 固件发布模态框
- **`ProductCreateModal.vue`** - 产品创建模态框
- **`LogQueryHeader.vue`** - 日志查询界面头部
- **`LogQueryTable.vue`** - 日志查询结果表
- **`LogQueryTitle.vue`** - 日志查询页面标题

#### 视图 (`src/views/`)
- **`Login.vue`** - 用户身份验证页面
- **`Account.vue`** - 用户账户管理
- **`ProductList.vue`** - 产品列表管理
- **`ProductType.vue`** - 产品类型管理
- **`DeviceManagement.vue`** - 设备管理界面
- **`DeviceProduction.vue`** - 设备生产跟踪
- **`DeviceType.vue`** - 设备类型管理
- **`Firmware.vue`** - 固件管理界面
- **`ToyProduction.vue`** - 玩具生产跟踪
- **`ModelConfiguration.vue`** - 模型配置界面
- **`ToolConfiguration.vue`** - 工具配置界面
- **`IPManagement.vue`** - IP 地址管理
- **`IPAudio.vue`** - IP 音频管理
- **`IPImage.vue`** - IP 图像管理
- **`IPVideo.vue`** - IP 视频管理
- **`BuiltInAlarm.vue`** - 内置报警管理
- **`LogQuery.vue`** - 日志查询界面
- **`MusicResources.vue`** - 音乐资源管理
- **`OTA.vue`** - 空中更新管理

#### 存储 (`src/stores/`)
- **`auth.ts`** - 身份验证状态管理 (Pinia 存储)

#### 路由 (`src/router/`)
- **`index.ts`** - Vue Router 配置和路由定义

#### 工具 (`src/utils/`)
- **`api.ts`** - API 工具函数和 HTTP 客户端
- **`tableConfig.ts`** - 表格配置和设置

#### 布局 (`src/layouts/`)
- **`MainLayout.vue`** - 主应用程序布局包装器

### 后端服务器 (`server/`)

#### 核心服务器文件
- **`server.js`** - 主 Express.js 服务器入口点
- **`setup_database.js`** - 数据库初始化脚本
- **`README.md`** - 服务器文档

#### 配置 (`server/config/`)
- **`database.js`** - 数据库连接配置

#### 路由 (`server/routes/`)
- **`accounts.js`** - 用户账户管理 API 端点
- **`productList.js`** - 产品列表 CRUD 操作
- **`productType.js`** - 产品类型管理
- **`deviceManagement.js`** - 设备管理 API
- **`deviceProduction.js`** - 设备生产 API
- **`deviceType.js`** - 设备类型管理
- **`firmware.js`** - 固件管理 API
- **`toyProduction.js`** - 玩具生产 API
- **`modelConfiguration.js`** - 模型配置 API
- **`toolConfiguration.js`** - 工具配置 API
- **`ipManagement.js`** - IP 管理 API
- **`ipAudio.js`** - IP 音频管理
- **`ipImage.js`** - IP 图像管理
- **`ipVideo.js`** - IP 视频管理
- **`alarm.js`** - 报警管理 API
- **`bom.js`** - 物料清单管理
- **`agentConfiguration.js`** - 代理配置 API

#### 中间件 (`server/middleware/`)
- **`upload.js`** - 文件上传处理中间件

#### 数据库脚本 (`server/database/`)
- **`all_tables.sql`** - 完整数据库架构
- **`create_missing_tables.sql`** - 创建缺失的数据库表
- **`simple_create_tables.sql`** - 简化的表创建
- **`product_list.sql`** - 产品列表表结构
- **`product_type.sql`** - 产品类型表结构
- **`device_management.sql`** - 设备管理表结构
- **`device_production.sql`** - 设备生产表结构
- **`device_type.sql`** - 设备类型表结构
- **`firmware.sql`** - 固件表结构
- **`toy_production.sql`** - 玩具生产表结构
- **`toy_production_new.sql`** - 新玩具生产表结构
- **`toy_production_hyphen.sql`** - 连字符玩具生产表
- **`model_configuration.sql`** - 模型配置表结构

#### 数据库设置脚本
- **`setup_product_list_database.js`** - 设置产品列表数据库
- **`setup_product_type_database.js`** - 设置产品类型数据库
- **`setup_device_management_database.js`** - 设置设备管理数据库
- **`setup_device_production_database.js`** - 设置设备生产数据库
- **`setup_device_type_database.js`** - 设置设备类型数据库
- **`setup_firmware_database.js`** - 设置固件数据库
- **`setup_toy_production_database.js`** - 设置玩具生产数据库
- **`setup_toy_production_new_database.js`** - 设置新玩具生产数据库
- **`setup_toy_production_hyphen_database.js`** - 设置连字符玩具生产数据库
- **`setup_model_configuration_database.js`** - 设置模型配置数据库

#### 实用脚本
- **`add_file_address_column.js`** - 向表添加文件地址列
- **`add_product_type_data.js`** - 添加样本产品类型数据
- **`update_product_list_data.js`** - 更新产品列表数据
- **`update_firmware_database.js`** - 更新固件数据库
- **`verify_product_type_count.js`** - 验证产品类型计数
- **`debug_table_structure.js`** - 调试数据库表结构
- **`test_connection.js`** - 测试数据库连接
- **`test_cloud_db.js`** - 测试云数据库连接

### 公共资源 (`public/`)

#### 媒体文件
- **`images/`** - 应用程序图像和图标
- **`audio/`** - 报警和通知的音频文件
- **`videos/`** - 演示视频文件
- **`firmware/`** - 设备更新的固件文件
- **`barcode/`** - 条形码图像
- **`QRcode/`** - 二维码图像
- **`bom-files/`** - 物料清单文件

## 文件关系和依赖

### 前端依赖
```
main.ts → App.vue → MainLayout.vue → 组件 + 视图
                ↓
            路由 → 视图 → 组件
                ↓
            存储 → 组件/视图
                ↓
            工具 → API 调用 → 后端
```

### 后端依赖
```
server.js → 路由 → 中间件 → 数据库
     ↓
配置 → 数据库连接
     ↓
数据库脚本 → MySQL 表
```

### 数据流
```
用户输入 → Vue 组件 → Pinia 存储 → API 调用 → Express 路由 → MySQL 数据库
    ↑                                                                        ↓
显示数据 ← Vue 组件 ← Pinia 存储 ← API 响应 ← Express 路由 ← 查询结果
```

## 主要特性和功能

### 1. 产品管理
- **CRUD 操作**: 创建、读取、更新、删除产品
- **批量操作**: 批量导入和管理
- **创建者跟踪**: 动态用户名实现
- **类型分类**: 产品分类系统

### 2. 设备管理
- **设备跟踪**: 监控设备状态和位置
- **生产数据**: 跟踪制造进度
- **类型管理**: 按类别组织设备
- **配置**: 设备特定设置

### 3. 固件管理
- **版本控制**: 跟踪固件版本
- **更新分发**: 空中更新
- **文件管理**: 存储和组织固件文件
- **发布管理**: 控制固件发布

### 4. 生产跟踪
- **玩具生产**: 监控玩具制造
- **设备生产**: 跟踪设备组装
- **质量控制**: 生产质量指标
- **库存管理**: 库存水平跟踪

### 5. IP 管理
- **地址分配**: IP 地址分配
- **媒体管理**: 音频、图像和视频文件
- **网络配置**: 网络设置管理
- **资源组织**: 媒体资源分类

## 开发工作流程

### 1. 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 启动后端服务器
cd server && node server.js
```

### 2. 数据库设置
```bash
# 运行迁移脚本
./run_migration.sh

# 或使用 Windows 批处理文件
run_migration.bat
```

### 3. 生产部署
```bash
# 构建前端
npm run build

# 部署到服务器
./deploy.sh
```

## 安全特性

- **身份验证**: 用户登录和会话管理
- **授权**: 基于角色的访问控制
- **输入验证**: 服务器端数据验证
- **SQL 注入保护**: 参数化查询
- **文件上传安全**: 安全文件处理

## 性能优化

- **数据库索引**: 优化的查询性能
- **缓存**: 前端和后端缓存策略
- **懒加载**: 组件和路由懒加载
- **图像优化**: 压缩和优化的媒体文件
- **代码分割**: 更快速加载的包优化

## 监控和日志

- **服务器状态**: 健康检查端点
- **错误日志**: 综合错误跟踪
- **性能指标**: 响应时间监控
- **用户活动**: 用户操作日志
- **数据库监控**: 查询性能跟踪

## 故障排除指南

### 常见问题
1. **数据库连接**: 检查 MySQL 服务和凭据
2. **端口冲突**: 验证端口 3000 是否可用
3. **编码问题**: 确保正确的 UTF-8 配置
4. **文件权限**: 检查文件访问权限
5. **依赖项**: 验证 npm 包是否已安装

### 调试命令
```bash
# 检查服务器状态
./check_server_status.sh

# 测试数据库连接
node server/test_connection.js

# 验证 MySQL 身份验证
./check_mysql_auth.sh
```

本文档提供了 Hewan 页面服务器项目架构的全面概述，帮助开发人员理解系统结构、文件关系和实现细节。
