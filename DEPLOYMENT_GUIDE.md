# 游戏网站后端部署指南

## 一、部署架构

```
前端 (Vercel)          后端 (Render)           数据库 (MongoDB Atlas)
    │                       │                        │
    │  https://galzb.cc.cd  │                        │
    ├───────────────────────┼────────────────────────┤
    │                       │                        │
    │   API请求 ──────────► │  数据查询 ────────────► │
    │                       │                        │
```

## 二、部署步骤

### 步骤 1：创建 MongoDB Atlas 数据库

1. 访问 https://www.mongodb.com/atlas/database
2. 注册/登录账户
3. 创建免费集群（Free Tier）：
   - 选择云服务商：AWS / Google Cloud（推荐）
   - 选择区域：靠近您的用户（asia-southeast-1 等）
   - 选择套餐：**FREE** (Shared)
4. 创建数据库用户：
   - 点击 "Security" → "Database Access"
   - 添加新用户：用户名和密码（记住这个密码！）
5. 配置网络访问：
   - 点击 "Security" → "Network Access"
   - 点击 "Add IP Address"
   - 选择 "Allow Access from Anywhere" (0.0.0.0/0)
6. 获取连接字符串：
   - 点击 "Deployment" → "Database"
   - 点击 "Connect" → "Connect your application"
   - 复制连接字符串，格式如下：
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/game_download_db?retryWrites=true&w=majority
   ```

### 步骤 2：在 Render 部署后端

1. 访问 https://render.com
2. 注册/登录 GitHub 账户
3. 创建 Web Service：
   - 点击 "New +" → "Web Service"
   - 连接您的 GitHub 仓库
   - 配置服务：
     - **Name**: `game-api`
     - **Region**: Singapore（或您附近的区域）
     - **Branch**: main
     - **Root Directory**: `server`
     - **Runtime**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free
4. 添加环境变量：
   - 点击 "Environment" → "Environment Variables"
   - 添加以下变量：
     - `MONGODB_URI`: 您在步骤 1 中复制的连接字符串
     - `NODE_ENV`: `production`
5. 部署服务：
   - 点击 "Create Web Service"
   - 等待构建和部署完成（约 2-3 分钟）
6. 获取后端URL：
   - 部署成功后，您会看到类似 `https://game-api-xxxxx.onrender.com` 的URL
   - 记录这个URL，后面会用到

### 步骤 3：配置冷启动预防（可选但推荐）

Render的免费套餐会在15分钟无活动后进入休眠状态。已配置自动ping脚本，每14分钟访问一次自己的服务，防止冷启动。

**Render平台设置：**
1. 在Render Dashboard找到您的 `game-api` 服务
2. 点击 "Settings"
3. 找到 "Health Check"
4. 确认已启用（默认已启用）

### 步骤 4：更新前端 API 配置

1. 编辑 `src/api/api.ts` 文件
2. 将第 3 行的 `RENDER_URL` 替换为您在步骤 2 获得的后端URL：
   ```typescript
   const RENDER_URL = 'https://game-api-xxxxx.onrender.com';
   ```
3. 保存文件

### 步骤 5：推送代码到 GitHub

```bash
git add .
git commit -m "配置后端API地址"
git push origin main
```

### 步骤 6：验证部署

1. 访问您的后端API：`https://game-api-xxxxx.onrender.com`
2. 测试API端点：
   - `https://game-api-xxxxx.onrender.com/api/games`
   - `https://game-api-xxxxx.onrender.com/api/banners`
3. Vercel会自动重新部署前端
4. 访问您的网站：`https://galzb.cc.cd`
5. 打开浏览器开发者工具（F12）→ Network，检查API请求是否成功

### 步骤 7：初始化数据库数据

部署完成后，您需要手动初始化数据库数据。有两种方式：

**方式 A：通过后端API初始化（推荐）**

在后端服务器中添加初始化路由，或在本地运行初始化脚本：

1. 在本地修改 `server/.env` 文件，将 `MONGODB_URI` 替换为您的 Atlas 连接字符串
2. 运行 `npm run init` 或 `node initData.js`
3. 数据会被插入到云端数据库

**方式 B：通过 MongoDB Atlas 界面导入**

1. 登录 MongoDB Atlas
2. 进入您的集群
3. 点击 "Collections" → "Create Database"
4. 手动创建集合并导入数据（JSON格式）

## 三、配置说明

### 环境变量

**Render 环境变量：**
- `MONGODB_URI`: MongoDB Atlas 连接字符串
- `NODE_ENV`: production
- `PORT`: 3000（Render会自动设置）

**前端环境变量（可选）：**
如果需要在前端区分开发和生产环境，可以在 Vercel 中设置：
- `VITE_API_URL`: 后端API地址

### API 超时设置

前端API调用已配置5秒超时：
```typescript
signal: AbortSignal.timeout(5000)
```

如果后端冷启动时间较长，可以适当增加超时时间。

## 四、故障排查

### 问题 1：API 请求失败（CORS 错误）

**原因**：后端没有正确配置 CORS

**解决**：确保 `server.js` 中包含：
```javascript
app.use(cors({
  origin: ['https://galzb.cc.cd', 'https://www.galzb.cc.cd']
}));
```

### 问题 2：MongoDB 连接失败

**检查项**：
1. MONGODB_URI 是否正确
2. 数据库用户密码是否正确
3. 网络访问白名单是否包含 0.0.0.0/0
4. 集群状态是否为 "Available"

### 问题 3：后端服务进入休眠

**原因**：Render 免费套餐会在15分钟无活动后自动休眠

**解决**：
1. 已配置自动ping脚本防止休眠
2. 如果仍然休眠，访问一次URL即可唤醒
3. 或升级到 Render Paid Plan

### 问题 4：数据不显示

**排查步骤**：
1. 检查浏览器控制台错误信息
2. 检查 Network 标签中的 API 请求
3. 确认后端API是否正常响应
4. 确认数据库中是否有数据

## 五、维护指南

### 更新数据库数据

在本地修改 `server/initData.js`，然后：
1. 确保本地 MongoDB 连接正常
2. 运行 `node initData.js`
3. 数据会自动更新到云端数据库

### 监控服务状态

1. **Render Dashboard**：查看服务日志和状态
2. **MongoDB Atlas**：查看数据库使用情况和性能
3. **浏览器控制台**：查看前端错误信息

### 备份数据

MongoDB Atlas 免费套餐每天自动备份。也可以手动导出：
1. 进入 Atlas Dashboard
2. 点击 "Collections"
3. 选择数据库和集合
4. 点击 "Export Collection"
5. 选择 JSON 或 CSV 格式

## 六、费用说明

### 免费套餐限制

**MongoDB Atlas（Free Tier）：**
- 存储空间：512 MB
- 共享内存
- 每周自动备份
- 无商业支持

**Render（Free）：**
- 每月 750 小时（足够运行一个服务）
- 服务会在 15 分钟无活动后休眠
- 休眠后首次访问需要 30 秒冷启动
- 无自定义域名（但可以自动分配一个 .onrender.com 域名）

**Vercel（Free）：**
- 无限流量
- 无限带宽
- 100GB 带宽/月
- 部署次数有限制

## 七、性能优化建议

### 1. 启用压缩

在 `server.js` 中添加压缩中间件：
```javascript
import compression from 'compression';
app.use(compression());
```

### 2. 添加缓存

对于不常变化的数据，添加缓存：
```javascript
app.use('/api/games', cacheMiddleware, gamesRouter);
```

### 3. 启用 gzip/brotli 压缩

Vercel 会自动压缩响应，但可以手动启用：
```typescript
// 在 vite.config.ts 中配置
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['vue', 'vue-router', 'pinia']
      }
    }
  }
}
```

## 八、安全建议

### 1. 保护数据库

- [x] 使用强密码
- [x] 配置网络白名单
- [ ] 启用字段级加密（可选，用于敏感数据）

### 2. API 安全

- [ ] 添加 API Key 验证
- [ ] 实现速率限制
- [ ] 添加请求日志

### 3. 环境变量

- [ ] 不要将敏感信息提交到 Git
- [ ] 使用 .env 文件管理本地配置
- [ ] 在 Render/Vercel 中配置生产环境变量

## 九、常用命令

### 本地开发

```bash
# 启动后端
cd server
npm install
npm run dev

# 启动前端
npm run dev
```

### 初始化数据库

```bash
cd server
node initData.js
```

### 查看日志

```bash
# Render 实时日志
render logs -s game-api
```

### 重启服务

```bash
# 在 Render Dashboard 中
# 点击 "Manual Deploy" → "Deploy latest commit"
```

## 十、技术支持

如果遇到问题：
1. 查看 Render 日志
2. 检查 MongoDB Atlas 状态
3. 查看浏览器控制台错误
4. 参考本文档的故障排查部分

---

**祝部署顺利！** 🚀