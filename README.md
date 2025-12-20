# 轻写（QingXie）- AI 辅助小说创作平台（前后端分离）

本仓库包含：

- 前端：Next.js（根目录的 `src/app/**`）
- 后端：Python FastAPI（`backend/`）
- 数据库：MySQL 8.0（必须）

## 运行步骤（本地）

1) 准备 MySQL 数据库

创建数据库：`aiwrite_db`（字符集建议 `utf8mb4`）。

在 `backend/.env` 配置连接串（示例见 `backend/.env.example`）：

```env
DATABASE_URL=mysql+pymysql://root:123456@localhost:3306/aiwrite_db?charset=utf8mb4
```

2) 启动后端（FastAPI）

```bash
pip install -r backend/requirements.txt
uvicorn app.main:app --reload --app-dir backend
```

后端默认监听 `http://localhost:8000`，健康检查：`GET /health`。

3) 启动前端（Next.js）

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

## 数据库

后端使用 MySQL 8.0，通过 `backend/.env` 的 `DATABASE_URL` 连接数据库（示例见 `backend/.env.example`）。

```env
DATABASE_URL=mysql+pymysql://root:123456@localhost:3306/aiwrite_db?charset=utf8mb4
```

## AI（豆包）

配置 `backend/.env` 的 `DOUBAO_API_KEY` 后，可在前端使用 AI 工具（续写/润色/审稿/拆书/起名/生成大纲与设定等），后端接口统一在 `POST /ai/*`。

## 文档入口

- 大作业要求：`yaoqiu.md`
- 后端说明：`backend/README.md`
