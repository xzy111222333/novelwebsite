import { Link } from "react-router-dom";

export default function App() {
  return (
    <main className="page">
      <header>
        <p className="badge">全新前后端分离架构</p>
        <h1>轻写 · AI 辅助小说创作</h1>
        <p>
          前端基于 React + Vite，后端基于 FastAPI + SQLAlchemy，实现更清晰的职责划分和更好的可扩展性。
        </p>
        <p className="meta">
          提示：原项目的完整 UI 仍在仓库根目录的 Next.js（默认端口 3000），现在也已对接 FastAPI。
        </p>
        <nav className="actions">
          <Link to="/login" className="btn primary">
            登录
          </Link>
          <a className="btn" href="http://localhost:3000" target="_blank" rel="noreferrer">
            打开原版完整UI
          </a>
          <a className="btn" href="/yaoqiu.md" target="_blank" rel="noreferrer">
            查看大作业要求
          </a>
        </nav>
      </header>
      <section className="card-grid">
        <article className="card">
          <h3>快速上手</h3>
          <p>先启动 backend (FastAPI) ，再运行 frontend (Vite)。两者通过 REST API 通信。</p>
        </article>
        <article className="card">
          <h3>数据安全</h3>
          <p>内置 JWT 登录、用户隔离的小说 CRUD 接口，可按需扩展角色、世界观等模块。</p>
        </article>
        <article className="card">
          <h3>可持续演进</h3>
          <p>保持与原有 Next.js 组件的兼容思路，逐步迁移时可在 frontend 目录中复用 UI。</p>
        </article>
      </section>
    </main>
  );
}
