# Backend (FastAPI)

本目录是本项目的后端：FastAPI + SQLAlchemy + JWT，提供用户认证与小说创作相关的 REST API。

## 快速开始

1) 配置环境变量

复制 `backend/.env.example` 为 `backend/.env` 并修改：

```env
DATABASE_URL=mysql+pymysql://root:123456@localhost:3306/aiwrite_db?charset=utf8mb4
SECRET_KEY=please-change-me
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Doubao (可选，用于 /ai/*)
DOUBAO_API_KEY=
DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3/chat/completions
DOUBAO_MODEL=doubao-seed-1-6-flash-250828
```

不配置 `DATABASE_URL` 时会使用 SQLite（默认文件：`backend/app.db`）。

2) 安装依赖并启动

```bash
pip install -r backend/requirements.txt
uvicorn app.main:app --reload --app-dir backend
```

## 主要接口

- `POST /auth/register` 注册
- `POST /auth/login` 登录（返回 JWT）
- `GET /auth/me` 获取当前用户
- `GET/POST/PUT/DELETE /novels` 小说 CRUD（按用户隔离）
- `GET/POST/PUT/DELETE /novels/{novel_id}/chapters` 章节 CRUD（自动更新小说字数/章节数）
- `GET/POST/PUT/DELETE /novels/{novel_id}/characters` 角色 CRUD
- `GET/POST/PUT/DELETE /novels/{novel_id}/outlines` 大纲 CRUD
- `GET/PUT/DELETE /novels/{novel_id}/world-building` 世界观（Upsert）
- `POST /ai/continue-writing` AI 续写（需要 `DOUBAO_API_KEY`）

健康检查：`GET /health`

