# HeWan Page Server - 文件功能说明与修改指南

## 核心文件说明

### 前端核心文件

#### 1. `src/main.ts`
- **功能**: 应用程序入口点
- **修改内容**: 
  - 导入Vue应用和路由
  - 配置Pinia状态管理
  - 挂载应用到DOM
- **如需修改**: 添加全局插件、配置或样式

#### 2. `src/App.vue`
- **功能**: 根组件，定义应用布局
- **修改内容**: 
  - 路由视图容器
  - 全局样式和布局
- **如需修改**: 更改应用整体布局或添加全局组件

#### 3. `src/router/index.ts`
- **功能**: 定义所有页面路由
- **修改内容**: 
  - 路由路径配置
  - 组件懒加载
  - 路由守卫
- **如需修改**: 添加新页面路由或修改路由逻辑

#### 4. `src/stores/auth.ts`
- **功能**: 用户认证状态管理
- **修改内容**: 
  - 登录状态
  - 用户信息
  - 权限控制
- **如需修改**: 更改认证逻辑或添加新的状态管理

#### 5. `src/utils/api.ts`
- **功能**: API请求配置和封装
- **修改内容**: 
  - 基础URL配置
  - 请求拦截器
  - 响应处理
- **如需修改**: 更改API基础配置或添加新的请求方法

### 后端核心文件

#### 1. `server/server.js`
- **功能**: 主服务器文件
- **修改内容**: 
  - Express应用配置
  - 中间件设置
  - 路由注册
  - 静态文件服务
- **如需修改**: 添加新的中间件、路由或服务器配置

#### 2. `server/config/database.js`
- **功能**: 数据库连接配置
- **修改内容**: 
  - MySQL连接池配置
  - 数据库连接参数
- **如需修改**: 更改数据库配置或连接参数

#### 3. `server/middleware/upload.js`
- **功能**: 文件上传中间件
- **修改内容**: 
  - 文件大小限制
  - 文件类型验证
  - 存储路径配置
- **如需修改**: 更改文件上传配置或添加新的文件类型支持

### 数据库文件

#### 1. `server/database/setup_complete_database.sql`
- **功能**: 完整的数据库结构和示例数据
- **修改内容**: 
  - 表结构定义
  - 索引创建
  - 示例数据插入
- **如需修改**: 添加新表、修改表结构或更新示例数据

## 功能模块文件说明

### 产品管理模块

#### 前端文件
- **`src/views/ProductList.vue`**: 产品列表管理页面
  - 功能: 产品CRUD操作、搜索、过滤、分页
  - 修改点: 表格列配置、搜索条件、操作按钮

- **`src/views/ProductType.vue`**: 产品类型管理页面
  - 功能: 产品类型定义和管理
  - 修改点: 类型字段、验证规则、关联配置

- **`src/components/ProductCreateModal.vue`**: 产品创建模态框
  - 功能: 新产品创建表单
  - 修改点: 表单字段、验证规则、提交逻辑

#### 后端文件
- **`server/routes/productList.js`**: 产品列表API路由
  - 功能: 产品CRUD API端点
  - 修改点: 查询逻辑、数据验证、错误处理

- **`server/routes/productType.js`**: 产品类型API路由
  - 功能: 产品类型管理API
  - 修改点: 类型管理逻辑、关联查询

### 设备管理模块

#### 前端文件
- **`src/views/DeviceManagement.vue`**: 设备管理主页面
  - 功能: 设备注册、状态监控、固件管理
  - 修改点: 设备信息字段、状态显示、操作功能

- **`src/views/DeviceType.vue`**: 设备类型管理
  - 功能: 设备型号定义和配置
  - 修改点: 设备规格、功能配置、固件关联

- **`src/views/DeviceProduction.vue`**: 设备生产管理
  - 功能: 设备生产计划和跟踪
  - 修改点: 生产流程、成本计算、质量控制

#### 后端文件
- **`server/routes/deviceManagement.js`**: 设备管理API
  - 功能: 设备CRUD、状态更新、固件关联
  - 修改点: 设备逻辑、状态管理、固件处理

- **`server/routes/deviceType.js`**: 设备类型API
  - 功能: 设备类型管理
  - 修改点: 类型配置、规格管理

- **`server/routes/deviceProduction.js`**: 设备生产API
  - 功能: 生产计划、成本管理
  - 修改点: 生产逻辑、成本计算

### 固件管理模块

#### 前端文件
- **`src/views/Firmware.vue`**: 固件管理页面
  - 功能: 固件上传、版本管理、发布控制
  - 修改点: 版本号规则、发布流程、兼容性检查

- **`src/components/FirmwareEditModal.vue`**: 固件编辑模态框
  - 功能: 固件信息编辑
  - 修改点: 编辑字段、验证规则

- **`src/components/FirmwareReleaseModal.vue`**: 固件发布模态框
  - 功能: 固件发布控制
  - 修改点: 发布条件、通知机制

#### 后端文件
- **`server/routes/firmware.js`**: 固件管理API
  - 功能: 固件上传、版本管理、设备更新
  - 修改点: 文件处理、版本控制、更新逻辑

### IP资源管理模块

#### 前端文件
- **`src/views/IPAudio.vue`**: 音频资源管理
  - 功能: 音频文件上传、分类、预览
  - 修改点: 音频格式、时长限制、分类规则

- **`src/views/IPVideo.vue`**: 视频资源管理
  - 功能: 视频文件管理、格式转换、预览
  - 修改点: 视频格式、分辨率、压缩设置

- **`src/views/IPImage.vue`**: 图片资源管理
  - 功能: 图片上传、压缩、分类
  - 修改点: 图片格式、尺寸限制、压缩参数

- **`src/views/MusicResources.vue`**: 音乐资源管理
  - 功能: 音乐文件管理、元数据提取
  - 修改点: 音乐格式、元数据字段、分类系统

#### 后端文件
- **`server/routes/ipAudio.js`**: 音频资源API
- **`server/routes/ipVideo.js`**: 视频资源API
- **`server/routes/ipImage.js`**: 图片资源API
- **`server/routes/ipMusic.js`**: 音乐资源API
- **`server/routes/ipManagement.js`**: IP管理API

### 生产管理模块

#### 前端文件
- **`src/views/ToyProduction.vue`**: 玩具生产管理
  - 功能: 玩具生产计划、成本控制、质量控制
  - 修改点: 生产流程、成本计算、质量检查点

#### 后端文件
- **`server/routes/toyProduction.js`**: 玩具生产API
- **`server/routes/bom.js`**: 物料清单API

### 配置管理模块

#### 前端文件
- **`src/views/ModelConfiguration.vue`**: 模型配置管理
- **`src/views/AgentConfiguration.vue`**: 代理配置管理
- **`src/views/ToolConfiguration.vue`**: 工具配置管理

#### 后端文件
- **`server/routes/modelConfiguration.js`**: 模型配置API
- **`server/routes/agentConfiguration.js`**: 代理配置API
- **`server/routes/toolConfiguration.js`**: 工具配置API

## 修改指南

### 添加新功能模块

#### 1. 创建新的数据表
```sql
-- 在 server/database/setup_complete_database.sql 中添加
CREATE TABLE IF NOT EXISTS new_module (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. 创建后端API路由
```javascript
// 创建 server/routes/newModule.js
import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/new-module
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM new_module');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/new-module
router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;
        const [result] = await pool.query(
            'INSERT INTO new_module (name, description) VALUES (?, ?)',
            [name, description]
        );
        res.json({ id: result.insertId, name, description });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
```

#### 3. 注册新路由
```javascript
// 在 server/server.js 中添加
import newModuleRoutes from './routes/newModule.js';
app.use('/api/new-module', newModuleRoutes);
```

#### 4. 创建前端页面
```vue
<!-- 创建 src/views/NewModule.vue -->
<template>
  <div class="new-module">
    <a-card title="新模块管理">
      <a-table :columns="columns" :data-source="data" :loading="loading">
        <!-- 表格内容 -->
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/utils/api';

const data = ref([]);
const loading = ref(false);

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await api.get('/new-module');
    data.value = response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>
```

#### 5. 添加路由配置
```typescript
// 在 src/router/index.ts 中添加
{
  path: '/new-module',
  name: 'NewModule',
  component: () => import('@/views/NewModule.vue'),
  meta: { requiresAuth: true }
}
```

#### 6. 添加到导航菜单
```vue
<!-- 在 src/components/AppSidebar.vue 中添加 -->
<a-menu-item key="new-module">
  <router-link to="/new-module">
    <span>新模块管理</span>
  </router-link>
</a-menu-item>
```

### 修改现有功能

#### 1. 修改数据库字段
```sql
-- 添加新字段
ALTER TABLE existing_table ADD COLUMN new_field VARCHAR(100) COMMENT '新字段说明';

-- 修改字段类型
ALTER TABLE existing_table MODIFY COLUMN existing_field TEXT;

-- 添加索引
ALTER TABLE existing_table ADD INDEX idx_new_field (new_field);
```

#### 2. 修改API逻辑
```javascript
// 在对应的路由文件中修改
router.get('/', async (req, res) => {
    try {
        // 添加新的查询逻辑
        const { search, filter } = req.query;
        let query = 'SELECT * FROM table_name';
        let params = [];
        
        if (search) {
            query += ' WHERE name LIKE ?';
            params.push(`%${search}%`);
        }
        
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

#### 3. 修改前端组件
```vue
<!-- 在对应的Vue组件中修改 -->
<template>
  <div>
    <!-- 添加新的UI元素 -->
    <a-input-search
      v-model:value="searchValue"
      placeholder="搜索..."
      @search="handleSearch"
    />
    
    <!-- 修改表格列 -->
    <a-table :columns="updatedColumns" :data-source="data">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <!-- 添加新的操作按钮 -->
          <a-button @click="handleNewAction(record)">新操作</a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
// 添加新的响应式数据
const searchValue = ref('');

// 添加新的方法
const handleSearch = (value: string) => {
  // 实现搜索逻辑
};

const handleNewAction = (record: any) => {
  // 实现新操作逻辑
};
</script>
```

### 文件上传配置修改

#### 1. 修改文件大小限制
```javascript
// 在 server/middleware/upload.js 中修改
const upload = multer({
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  // 其他配置...
});
```

#### 2. 添加新的文件类型支持
```javascript
// 在 server/middleware/upload.js 中添加
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'audio/mp3', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

const upload = multer({
  fileFilter: fileFilter,
  // 其他配置...
});
```

### 数据库查询优化

#### 1. 添加索引
```sql
-- 为常用查询字段添加索引
ALTER TABLE product_list ADD INDEX idx_product_model (product_model);
ALTER TABLE device_management ADD INDEX idx_device_model (device_model);
ALTER TABLE firmware ADD INDEX idx_device_model_version (device_model, version_number);
```

#### 2. 优化查询语句
```javascript
// 使用连接查询替代多次查询
const [rows] = await pool.query(`
  SELECT p.*, d.device_model, d.current_firmware_version
  FROM product_list p
  LEFT JOIN device_management d ON p.device_id = d.device_id
  WHERE p.product_model = ?
`, [productModel]);
```

### 错误处理改进

#### 1. 统一错误处理
```javascript
// 在 server/server.js 中添加全局错误处理
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: '数据验证失败', details: error.message });
  }
  
  if (error.name === 'MulterError') {
    return res.status(400).json({ error: '文件上传错误', details: error.message });
  }
  
  res.status(500).json({ error: '服务器内部错误' });
});
```

#### 2. 前端错误处理
```typescript
// 在 src/utils/api.ts 中添加
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 处理未授权错误
      router.push('/login');
    } else if (error.response?.status === 500) {
      // 处理服务器错误
      message.error('服务器错误，请稍后重试');
    }
    return Promise.reject(error);
  }
);
```

## 性能优化建议

### 1. 数据库优化
- 为频繁查询的字段添加索引
- 使用连接查询减少数据库往返
- 实现分页查询避免大量数据加载

### 2. 前端优化
- 使用组件懒加载
- 实现虚拟滚动处理大量数据
- 优化图片和文件加载

### 3. 缓存策略
- 实现API响应缓存
- 使用浏览器缓存静态资源
- 实现数据库查询缓存

## 安全建议

### 1. 输入验证
- 所有用户输入都要进行验证
- 使用参数化查询防止SQL注入
- 验证文件类型和大小

### 2. 权限控制
- 实现基于角色的访问控制
- 验证用户权限
- 记录用户操作日志

### 3. 数据保护
- 敏感数据加密存储
- 使用HTTPS传输
- 定期备份数据
