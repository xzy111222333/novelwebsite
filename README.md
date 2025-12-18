# 轻写 - AI辅助小说创作平台

基于 Next.js 全栈框架的智能小说创作工具，集成豆包大模型提供AI辅助创作功能。

> **轻写** - 纯粹而优雅的小说创作空间，专注于写作本身。


https://github.com/user-attachments/assets/a561f4ea-ab69-4278-b7cc-5f17e53d7117



### 1. 配置豆包API

在项目根目录创建 `.env` 文件：

```bash
# 豆包大模型配置
DOUBAO_API_KEY=your_doubao_apikey
DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3/chat/completions
DOUBAO_MODEL=doubao-seed-1-6-flash-250828

# 数据库配置
DATABASE_URL="file:./prisma/db/custom.db"
```

### 2. 安装依赖

```bash
npm install
```

### 3. 初始化数据库

```bash
npm run db:push
```

### 4. 启动开发服务器

```bash
npm run dev
```
![官网](https://youke1.picui.cn/s1/2025/10/14/68ed222a52e03.png)

![工作台](https://youke1.picui.cn/s1/2025/10/14/68ed2229723f6.png)
# novelwebsite
