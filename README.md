# 轻写（QingXie）- AI 辅助小说创作平台

前后端分离架构：Next.js 前端 + FastAPI 后端 + MySQL 数据库

## 快速开始

### 1. 准备数据库

创建 MySQL 数据库：
```sql
CREATE DATABASE aiwrite_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 配置环境变量

在 `backend/.env` 配置数据库连接（如不存在则创建）：
```env
DATABASE_URL=mysql+pymysql://root:你的密码@localhost:3306/aiwrite_db?charset=utf8mb4
SECRET_KEY=your-secret-key-here
DOUBAO_API_KEY=你的豆包API密钥（可选，用于AI功能）
```

### 3. 启动后端

```bash
pip install -r backend/requirements.txt
uvicorn app.main:app --reload --app-dir backend
```

后端运行在：http://localhost:8000

### 4. 启动前端

```bash
npm install
npm run dev
```

前端运行在：http://localhost:3000

## 主要功能

- 小说创作与管理（作品、章节、角色、大纲、世界观）
- AI 辅助写作（续写、润色、审稿、拆书、起名、生成设定等）
- 数据统计与可视化
- 用户认证与权限管理

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **后端**: FastAPI, SQLAlchemy, PyMySQL, JWT
- **数据库**: MySQL 8.0

## API 文档

启动后端后访问：http://localhost:8000/docs
