import { useEffect, useState } from "react";
import { createNovel, listNovels, Novel } from "../services/novel";
import { fetchProfile } from "../services/auth";

export default function Dashboard() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [userName, setUserName] = useState<string>("");

  const loadData = async () => {
    const profile = await fetchProfile();
    setUserName(profile.name || profile.email);
    const data = await listNovels();
    setNovels(data);
  };

  useEffect(() => {
    loadData().catch(() => setUserName(""));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const novel = await createNovel({ title, description });
    setNovels([novel, ...novels]);
    setTitle("");
    setDescription("");
  };

  return (
    <main className="page">
      <header>
        <p className="badge">工作台</p>
        <h1>欢迎回来，{userName || "创作者"}</h1>
        <p>这里可以创建和查看你的小说项目，后续可以把章节、角色等模块继续搬运过来。</p>
      </header>

      <form className="panel" onSubmit={handleCreate}>
        <h3>新建小说</h3>
        <label className="field">
          <span>标题</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label className="field">
          <span>简介</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </label>
        <button type="submit" className="btn primary">
          创建
        </button>
      </form>

      <section className="card-grid">
        {novels.map((novel) => (
          <article key={novel.id} className="card">
            <h3>{novel.title}</h3>
            <p>{novel.description || "暂无简介"}</p>
            <p className="meta">状态：{novel.status}</p>
          </article>
        ))}
        {novels.length === 0 && <p className="notice">暂无数据，先创建一条吧。</p>}
      </section>
    </main>
  );
}
