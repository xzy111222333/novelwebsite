# Frontend (React + Vite)

本目录是本项目的前端（React + Vite），通过 REST API 访问 FastAPI 后端。

## 启动

```bash
cd frontend
npm install
npm run dev
```

如后端不是 `http://localhost:8000`，请在 `frontend/.env` 设置：

```env
VITE_API_URL=http://localhost:8000
```

## 页面

- `/` 落地页（含大作业要求链接：`/yaoqiu.md`）
- `/login` 注册 / 登录（JWT）
- `/dashboard` 小说列表与创建
- `/novels/:novelId` 小说编辑（章节/世界观/大纲/角色 + AI 续写）

提示：如果你要使用仓库原本的完整 UI（`src/app/**`），请在仓库根目录运行 Next.js（默认 `http://localhost:3000`），它也已改为对接 `backend/` 的 FastAPI。
