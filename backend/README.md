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

提示：请先在 MySQL 中创建数据库 `aiwrite_db`，并确保 `DATABASE_URL` 的账号拥有建表权限。

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
- `POST /ai/refine` AI 润色/扩写
- `POST /ai/review` AI 审稿报告
- `POST /ai/deconstruct` AI 拆书解析
- `POST /ai/naming` AI 起名
- `POST /ai/generate-outline` AI 生成大纲
- `POST /ai/generate-character` AI 生成角色设定
- `POST /ai/generate-world` AI 生成世界观设定
- `POST /ai/generate-draft` AI 生成章节草稿

健康检查：`GET /health`

## Admin setup

Manual database changes are required for admin and ban support.

```sql
ALTER TABLE users ADD COLUMN is_admin TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN is_banned TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE novels ADD COLUMN is_banned TINYINT(1) NOT NULL DEFAULT 0;
```

Mark a user as admin:

```sql
UPDATE users SET is_admin = 1 WHERE email = 'admin@example.com';
```

Ban or unban:

```sql
UPDATE users SET is_banned = 1 WHERE email = 'user@example.com';
UPDATE novels SET is_banned = 1 WHERE id = 'novel-id';
```
