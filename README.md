# 轻写（QingXie）- AI 辅助小说创作平台（前后端分离）

本仓库包含（两套前端）：

- **推荐（保留原 UI）**：仓库根目录的 Next.js 前端（`src/app/**`），已改为**只做前端**，所有数据/登录都走 `backend/`（FastAPI）。
- `frontend/`：React + Vite（最小示例前端，用于演示前后端分离的最简对接）
- `backend/`：Python FastAPI + SQLAlchemy + JWT（后端）

说明：原项目是 Next.js 全栈（含 Prisma/SQLite）。现在已把 Next.js 的数据接口改为代理 FastAPI，所以你原来的页面（如 `src/app/app/page.tsx`）可以继续使用，同时满足“Python 后端 + 前端分离”的要求。

## 运行步骤（保留原页面）

1) 启动后端

```bash
pip install -r backend/requirements.txt
uvicorn app.main:app --reload --app-dir backend
```

后端默认监听 `http://localhost:8000`，健康检查：`GET /health`。

2) 启动 Next.js 前端（原 UI）

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

可选：如后端不是 `http://localhost:8000`，在根目录创建 `.env.local`：

```env
FASTAPI_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=please-change-me
```

也可以参考 `env.next.example`。

## 运行步骤（Vite 最小示例）

如果你只想要一个“最小可跑”的前端样例，再用 `frontend/`：

```bash
cd frontend
npm install
npm run dev
```

前端默认监听 `http://localhost:5173`。

## 数据库

后端支持两种模式：

- 默认 SQLite：无需配置，自动创建 `backend/app.db`
- MySQL 8.0：在 `backend/.env` 配置 `DATABASE_URL`（示例见 `backend/.env.example`）

MySQL 示例：

```env
DATABASE_URL=mysql+pymysql://root:123456@localhost:3306/aiwrite_db?charset=utf8mb4
```

## AI（豆包）

配置 `backend/.env` 的 `DOUBAO_API_KEY` 后，可在前端的小说编辑页使用「AI 续写」功能（后端接口：`POST /ai/continue-writing`）。

## 文档入口

- 大作业要求：`yaoqiu.md`
- 迁移计划：`迁移计划.md`
- 后端说明：`backend/README.md`
- 前端说明：`frontend/README.md`
