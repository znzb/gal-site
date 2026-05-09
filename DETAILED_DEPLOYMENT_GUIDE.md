# 游戏网站云端部署详细图文教程

## 📋 部署前准备

### 所需账户
- [ ] GitHub 账户（已有）
- [ ] MongoDB Atlas 账户（需要创建）
- [ ] Render 账户（需要创建，需要关联 GitHub）

### 环境要求
- [ ] Node.js 已安装（用于本地测试）
- [ ] Git 已安装
- [ ] 代码已推送到 GitHub

---

## 第一部分：创建 MongoDB Atlas 数据库

### 步骤 1.1：访问 MongoDB Atlas

打开浏览器，访问：
```
https://www.mongodb.com/atlas/database
```

点击 **"Start Free"** 按钮开始注册

### 步骤 1.2：注册账户

您可以使用以下方式注册：
- 邮箱注册
- Google 账户登录
- GitHub 账户登录

**推荐使用 GitHub 登录**，这样更方便后续操作。

注册完成后，进入 Atlas 控制台。

### 步骤 1.3：创建免费集群

点击 **"Build a Database"** 按钮

#### 选择套餐
- 选择 **"FREE"** 套餐（共享内存，足够个人使用）
- 点击 **"Create"**

#### 配置集群
- **Cloud Provider**: 选择 AWS（或 Google Cloud）
- **Region**: 选择 Asia 区域
  - 推荐：`Asia Southeast (Singapore)` - 延迟最低
  - 或：`Asia Northeast (Tokyo)` - 日本节点也很不错
- **Cluster Name**: 可以保持默认 `Cluster0`

⚠️ **注意**：集群创建后，Region 不能更改！

点击 **"Create Cluster"** 按钮

⏱️ **等待时间**：集群创建需要 1-3 分钟

### 步骤 1.4：创建数据库用户

集群创建完成后，进入安全配置。

1. 在左侧菜单点击 **"Security"**
2. 点击 **"Database Access"**
3. 点击 **"Add New Database User"**

#### 填写用户信息
- **Authentication Method**: Password
- **Username**: `gameadmin` （或其他您喜欢的名字）
- **Password**: 输入一个强密码（至少12位）
- **Database User Privileges**: `Read and write to any database`

⚠️ **重要**：请记住这个用户名和密码，后面会用到！

点击 **"Add User"**

### 步骤 1.5：配置网络访问

允许任何 IP 访问数据库（方便开发）：

1. 在左侧菜单点击 **"Security"**
2. 点击 **"Network Access"**
3. 点击 **"Add IP Address"**
4. 点击 **"Allow Access from Anywhere"**
5. 点击 **"Confirm"**

⚠️ **安全提示**：生产环境建议限制 IP 范围，但开发阶段可以先开放。

### 步骤 1.6：获取连接字符串

1. 点击左侧 **"Deployment"** → **"Database"**
2. 点击 **"Connect"** 按钮
3. 选择 **"Connect your application"**
4. 选择 **Node.js** 和最新版本
5. 复制 **Connection String**

连接字符串格式：
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/game_download_db?retryWrites=true&w=majority
```

#### ⚠️ 重要操作：替换占位符

将连接字符串中的 `<username>` 和 `<password>` 替换为步骤 1.4 创建的用户信息：

```bash
# 原始格式
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/game_download_db?retryWrites=true&w=majority

# 替换后示例
mongodb+srv://gameadmin:MySecurePassword123@cluster0.xxxxx.mongodb.net/game_download_db?retryWrites=true&w=majority
```

✅ **保存这个连接字符串**，下一步会用到！

---

## 第二部分：部署后端到 Render

### 步骤 2.1：访问 Render

打开浏览器，访问：
```
https://render.com
```

点击 **"Get Started"** 或 **"Sign Up"**

### 步骤 2.2：注册账户

**推荐使用 GitHub 登录**：
1. 点击 "Sign in with GitHub"
2. 授权 Render 访问您的 GitHub 账户
3. 完成 GitHub 授权后，自动完成 Render 注册

### 步骤 2.3：创建 Web Service

1. 在 Dashboard 页面，点击 **"New +"**
2. 选择 **"Web Service"**

### 步骤 2.4：连接 GitHub 仓库

如果是首次使用 Render：
1. 点击 **"Configure Account"**
2. 在 "GitHub" 部分，点击 **"Connect Account"**
3. 在弹出的页面中选择要授权的仓库
4. 选择 `f:\yx` 项目对应的仓库
5. 点击 **"Install"**

回到创建 Web Service 页面，选择您的仓库。

### 步骤 2.5：配置 Web Service

#### 基本配置
- **Name**: `game-api`
- **Region**: Singapore（或靠近您的区域）
- **Branch**: `main`
- **Root Directory**: `server` ⬅️ **重要！**

#### 运行时配置
- **Runtime**: Node
- **Language**: Node (如果需要选择)
- **Build Command**: `npm install`
- **Start Command**: `npm start`

#### 套餐选择
- **Plan**: Free ⬅️ 选择免费套餐

### 步骤 2.6：添加环境变量

向下滚动到 "Environment Variables" 部分，点击 **"Add Environment Variable"**，添加以下变量：

#### 变量 1：MONGODB_URI
- **Key**: `MONGODB_URI`
- **Value**: 粘贴步骤 1.6 获取的连接字符串
- 点击 **"Add"**

#### 变量 2：NODE_ENV
- **Key**: `NODE_ENV`
- **Value**: `production`
- 点击 **"Add"**

#### 变量 3：PORT
- **Key**: `PORT`
- **Value**: `3000`
- 点击 **"Add"**

### 步骤 2.7：创建服务

确认所有配置正确后：
1. 点击 **"Create Web Service"**
2. 等待构建日志滚动

⏱️ **等待时间**：首次部署需要 2-5 分钟

### 步骤 2.8：查看部署状态

构建完成后，查看日志：
- ✅ 成功：`Server running on port 3000`
- ❌ 失败：查看错误信息并修复

### 步骤 2.9：获取后端 URL

部署成功后，在页面顶部会显示：
```
https://game-api-xxxxx.onrender.com
```

⏺️ **记录这个 URL**，这是您的后端 API 地址！

#### 可选：配置 Health Check

Render 会自动配置健康检查，您可以在 "Health Check Path" 中查看，默认是 `/`。

---

## 第三部分：更新前端配置

### 步骤 3.1：更新 API 地址

1. 在代码编辑器中打开 `src/api/api.ts`
2. 找到第 3 行：
```typescript
const RENDER_URL = 'https://game-api-xxxxx.onrender.com';
```

3. 将 `https://game-api-xxxxx.onrender.com` 替换为您在步骤 2.9 获得的后端 URL

**示例**：
```typescript
const RENDER_URL = 'https://game-api-abc123.onrender.com';
```

### 步骤 3.2：确认 CORS 配置

打开 `server/server.js`，确认已配置 CORS：

```javascript
app.use(cors({
  origin: ['https://galzb.cc.cd', 'https://www.galzb.cc.cd']
}));
```

如果需要添加更多域名，添加到数组中。

### 步骤 3.3：保存并关闭文件

按 `Ctrl + S` 保存文件。

---

## 第四部分：推送到 GitHub

### 步骤 4.1：添加文件到 Git

```bash
git add .
```

### 步骤 4.2：提交更改

```bash
git commit -m "配置后端API地址并添加Render部署配置"
```

### 步骤 4.3：推送到远程

```bash
git push origin main
```

⏱️ **等待时间**：推送需要 10-30 秒

### 步骤 4.4：验证 Vercel 重新部署

1. 访问 https://vercel.com
2. 进入您的项目
3. 检查 "Deployments" 标签
4. 应该会看到新的部署正在构建

⏱️ **Vercel 自动部署需要 1-2 分钟**

---

## 第五部分：初始化数据库

### 步骤 5.1：本地配置云数据库连接

在 `server` 目录下创建或编辑 `.env` 文件：

```bash
cd f:\yx\server
```

创建 `.env` 文件（如果不存在）：
```bash
touch .env   # Windows 上跳过这步
```

添加以下内容：
```
MONGODB_URI=mongodb+srv://您的用户名:您的密码@cluster0.xxxxx.mongodb.net/game_download_db?retryWrites=true&w=majority
```

### 步骤 5.2：运行初始化脚本

```bash
npm install  # 确保依赖已安装
node initData.js
```

### 步骤 5.3：验证数据插入

如果看到以下输出，说明数据初始化成功：
```
Connected to MongoDB
Categories inserted
Games inserted
Features inserted
Banners inserted
All data initialized successfully
```

---

## 第六部分：验证部署

### 步骤 6.1：测试后端 API

在浏览器中访问以下 URL（替换为您实际的 URL）：

```
https://game-api-xxxxx.onrender.com/
```

应该看到：
```json
{"message":"游戏下载网站 API 服务运行中"}
```

### 步骤 6.2：测试游戏列表 API

访问：
```
https://game-api-xxxxx.onrender.com/api/games
```

应该看到包含所有游戏的 JSON 数据。

### 步骤 6.3：测试分类 API

访问：
```
https://game-api-xxxxx.onrender.com/api/categories
```

应该看到所有分类。

### 步骤 6.4：测试轮播图 API

访问：
```
https://game-api-xxxxx.onrender.com/api/banners
```

应该看到轮播图数据。

### 步骤 6.5：访问完整网站

1. 打开浏览器
2. 访问 `https://galzb.cc.cd`
3. 打开开发者工具（F12）
4. 切换到 **"Network"** 标签
5. 刷新页面
6. 检查 API 请求：
   - ✅ 状态码 200 = 成功
   - ❌ 状态码 404/500 = 失败

### 步骤 6.6：检查浏览器控制台

在开发者工具中切换到 **"Console"** 标签：
- ✅ 无错误或只有警告 = 成功
- ❌ 红色错误 = 需要修复

---

## 第七部分：故障排查

### 问题 1：MongoDB 连接失败

#### 症状
后端日志显示：
```
MongoDB connection error: ...
```

#### 检查清单
- [ ] MONGODB_URI 是否正确
- [ ] 用户名和密码是否正确
- [ ] 网络访问是否配置（允许 0.0.0.0/0）
- [ ] 集群状态是否为 "Available"

#### 解决方法
1. 登录 MongoDB Atlas
2. 检查 "Network Access"
3. 确认已添加 `0.0.0.0/0`
4. 在 Render 中重新设置环境变量

### 问题 2：CORS 错误

#### 症状
浏览器控制台显示：
```
Access to fetch at 'https://game-api-xxxxx.onrender.com' from origin 'https://galzb.cc.cd' has been blocked by CORS policy
```

#### 解决方法
在 `server/server.js` 中添加或修改 CORS 配置：

```javascript
app.use(cors({
  origin: ['https://galzb.cc.cd', 'https://www.galzb.cc.cd'],
  credentials: true
}));
```

然后重新部署后端。

### 问题 3：API 超时

#### 症状
浏览器网络请求显示 "failed" 或长时间等待

#### 原因
后端服务可能处于冷启动状态（首次访问）

#### 解决方法
1. 等待 30 秒让服务完全启动
2. 刷新页面重试
3. 冷启动后会自动保持活跃 15 分钟

### 问题 4：数据不显示

#### 检查清单
1. 浏览器控制台是否有错误？
2. Network 标签中 API 请求状态码是什么？
3. 后端是否正常运行？
4. 数据库中是否有数据？

#### 解决方法
1. 访问后端 API 检查数据是否存在
2. 如果数据为空，重新运行初始化脚本
3. 检查 API URL 是否正确配置

### 问题 5：Render 服务进入休眠

#### 症状
首次访问需要等待很久或失败

#### 正常现象
免费套餐会在 15 分钟无活动后自动休眠，这是 Render 的机制。

#### 解决方法
1. 等待 30 秒让服务自动唤醒
2. 再次访问即可
3. 后续会自动保持活跃

---

## 第八部分：日常维护

### 更新网站数据

#### 方法 1：修改并重新运行初始化脚本

1. 编辑 `server/initData.js`
2. 修改数据内容
3. 运行：
```bash
node initData.js
```

⚠️ **注意**：这会清空并重新插入所有数据！

#### 方法 2：手动在 MongoDB Atlas 中编辑

1. 登录 MongoDB Atlas
2. 进入 "Database" → "Collections"
3. 选择要编辑的集合
4. 直接修改文档

### 监控服务状态

#### Render Dashboard
- 访问 https://dashboard.render.com
- 查看服务状态和日志
- 手动重启服务

#### MongoDB Atlas Dashboard
- 查看数据库使用情况
- 监控连接数
- 查看性能指标

### 备份数据

MongoDB Atlas 免费套餐会自动每周备份。您也可以手动导出：

1. 进入 "Database" → "Collections"
2. 选择集合
3. 点击 "Export Collection"
4. 选择 JSON 格式

---

## 第九部分：优化建议

### 1. 启用 gzip 压缩

在 `server/package.json` 中添加：
```json
"dependencies": {
  "compression": "^1.7.4"
}
```

在 `server/server.js` 中添加：
```javascript
import compression from 'compression';
app.use(compression());
```

### 2. 添加请求日志

```bash
npm install morgan
```

```javascript
import morgan from 'morgan';
app.use(morgan('combined'));
```

### 3. 配置自定义错误处理

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
```

---

## 第十部分：费用总结

### 免费套餐功能

#### MongoDB Atlas (Free Tier)
- ✅ 512 MB 存储
- ✅ 共享 CPU
- ✅ 每周自动备份
- ✅ 无限数据库操作
- ❌ 无商业支持

#### Render (Free)
- ✅ 每月 750 小时（24小时 × 31天 = 744小时）
- ✅ 自动休眠节省时间
- ✅ SSL 证书
- ✅ 自定义域名
- ❌ 服务会在 15 分钟无活动后休眠
- ❌ 冷启动需要 30 秒

#### Vercel (Free)
- ✅ 无限带宽
- ✅ 无限项目
- ✅ 自动 HTTPS
- ✅ 边缘网络加速
- ❌ 部署次数限制（100次/天）

### 总费用
**$0 / 月** - 完全免费！

---

## 第十一部分：快速参考卡

### 常用链接
```
MongoDB Atlas: https://www.mongodb.com/atlas/database
Render: https://render.com
Vercel: https://vercel.com
GitHub: https://github.com
```

### 环境变量速查表

| 变量名 | 示例值 | 说明 |
|--------|--------|------|
| MONGODB_URI | `mongodb+srv://user:pass@cluster.mongodb.net/db` | MongoDB 连接字符串 |
| NODE_ENV | `production` | 运行环境 |
| PORT | `3000` | 服务端口 |

### API 端点速查表

| 端点 | 方法 | 说明 |
|------|------|------|
| `/` | GET | 服务状态检查 |
| `/api/games` | GET | 获取所有游戏 |
| `/api/games/:id` | GET | 获取单个游戏 |
| `/api/categories` | GET | 获取所有分类 |
| `/api/features` | GET | 获取所有功能入口 |
| `/api/banners` | GET | 获取所有轮播图 |

### 常用命令

```bash
# 启动后端
cd server
npm install
npm start

# 初始化数据
node initData.js

# 推送代码
git add .
git commit -m "更新内容"
git push origin main

# 查看 Render 日志
render logs -s game-api
```

---

## 🎉 恭喜！

如果所有步骤都成功完成，您的网站现在应该：
- ✅ 前端部署在 Vercel：`https://galzb.cc.cd`
- ✅ 后端部署在 Render：`https://game-api-xxxxx.onrender.com`
- ✅ 数据库在 MongoDB Atlas
- ✅ 所有数据正常显示

**享受您的游戏网站吧！** 🎮

---

## 📞 需要帮助？

如果遇到问题：
1. 查看本文档的故障排查部分
2. 检查 Render 和 MongoDB Atlas 的状态页面
3. 查看浏览器控制台的错误信息
4. 参考各平台的官方文档

**祝您部署顺利！** 🚀