import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchProfile } from "../services/auth";
import { Chapter, createChapter, deleteChapter, listChapters, updateChapter } from "../services/chapter";
import { continueWriting } from "../services/ai";
import { Character, createCharacter, deleteCharacter, listCharacters } from "../services/character";
import { getNovel, Novel } from "../services/novel";
import { Outline, createOutline, deleteOutline, listOutlines } from "../services/outline";
import { getWorldBuilding, upsertWorldBuilding, WorldBuilding } from "../services/worldBuilding";

export default function NovelPage() {
  const navigate = useNavigate();
  const params = useParams();
  const novelId = params.novelId || "";

  const [profileName, setProfileName] = useState("");
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [worldBuilding, setWorldBuilding] = useState<WorldBuilding | null>(null);
  const [message, setMessage] = useState<string>("");

  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterContent, setNewChapterContent] = useState("");
  const [activeChapterId, setActiveChapterId] = useState<string>("");

  const activeChapter = useMemo(
    () => chapters.find((c) => c.id === activeChapterId) || null,
    [chapters, activeChapterId]
  );

  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [wbTitle, setWbTitle] = useState("");
  const [wbType, setWbType] = useState("world");
  const [wbContent, setWbContent] = useState("");

  const [newOutlineTitle, setNewOutlineTitle] = useState("");
  const [newOutlineContent, setNewOutlineContent] = useState("");

  const [newCharacterName, setNewCharacterName] = useState("");
  const [newCharacterDesc, setNewCharacterDesc] = useState("");

  const refreshAll = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const profile = await fetchProfile();
      setProfileName(profile.name || profile.email);

      const [novelData, chaptersData, outlinesData, charactersData] = await Promise.all([
        getNovel(novelId),
        listChapters(novelId),
        listOutlines(novelId),
        listCharacters(novelId),
      ]);
      setNovel(novelData);
      setChapters(chaptersData);
      setOutlines(outlinesData);
      setCharacters(charactersData);

      try {
        const wb = await getWorldBuilding(novelId);
        setWorldBuilding(wb);
        setWbTitle(wb.title);
        setWbType(wb.type);
        setWbContent(wb.content);
      } catch {
        setWorldBuilding(null);
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        navigate("/login");
        return;
      }
      setMessage(error?.response?.data?.detail ?? "加载失败");
    }
  };

  useEffect(() => {
    if (!novelId) {
      navigate("/dashboard");
      return;
    }
    refreshAll();
  }, [novelId]);

  useEffect(() => {
    if (!activeChapter) return;
    setEditTitle(activeChapter.title);
    setEditContent(activeChapter.content);
  }, [activeChapterId]);

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createChapter(novelId, { title: newChapterTitle, content: newChapterContent, order: chapters.length + 1 });
      setChapters([created, ...chapters]);
      setNewChapterTitle("");
      setNewChapterContent("");
      setActiveChapterId(created.id);
      setMessage("");
      const updatedNovel = await getNovel(novelId);
      setNovel(updatedNovel);
    } catch (error: any) {
      setMessage(error?.response?.data?.detail ?? "创建章节失败");
    }
  };

  const handleSaveChapter = async () => {
    if (!activeChapter) return;
    try {
      const updated = await updateChapter(novelId, activeChapter.id, { title: editTitle, content: editContent });
      setChapters(chapters.map((c) => (c.id === updated.id ? updated : c)));
      setMessage("已保存");
      const updatedNovel = await getNovel(novelId);
      setNovel(updatedNovel);
    } catch (error: any) {
      setMessage(error?.response?.data?.detail ?? "保存失败");
    }
  };

  const handleDeleteChapter = async () => {
    if (!activeChapter) return;
    if (!confirm("确定删除该章节吗？")) return;
    try {
      await deleteChapter(novelId, activeChapter.id);
      setChapters(chapters.filter((c) => c.id !== activeChapter.id));
      setActiveChapterId("");
      setMessage("");
      const updatedNovel = await getNovel(novelId);
      setNovel(updatedNovel);
    } catch (error: any) {
      setMessage(error?.response?.data?.detail ?? "删除失败");
    }
  };

  const handleAiContinue = async () => {
    if (!activeChapter) return;
    setIsAiLoading(true);
    try {
      const res = await continueWriting({
        content: editContent,
        context: wbContent || undefined,
        length: 500,
      });
      setEditContent((prev) => (prev.trim() ? `${prev}\n\n${res.content}` : res.content));
      setMessage("AI 已生成续写内容（未自动保存）");
    } catch (error: any) {
      setMessage(error?.response?.data?.detail ?? "AI 调用失败（请检查 DOUBAO_API_KEY）");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveWorldBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const wb = await upsertWorldBuilding(novelId, { title: wbTitle, type: wbType, content: wbContent });
      setWorldBuilding(wb);
      setMessage("世界观已保存");
    } catch (error: any) {
      setMessage(error?.response?.data?.detail ?? "世界观保存失败");
    }
  };

  const handleCreateOutline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const outline = await createOutline(novelId, { title: newOutlineTitle, content: newOutlineContent, order: outlines.length + 1 });
      setOutlines([outline, ...outlines]);
      setNewOutlineTitle("");
      setNewOutlineContent("");
      setMessage("");
    } catch (error: any) {
      setMessage(error?.response?.data?.detail ?? "创建大纲失败");
    }
  };

  const handleDeleteOutline = async (outlineId: string) => {
    if (!confirm("确定删除该大纲吗？")) return;
    try {
      await deleteOutline(novelId, outlineId);
      setOutlines(outlines.filter((o) => o.id !== outlineId));
    } catch (error: any) {
      setMessage(error?.response?.data?.detail ?? "删除大纲失败");
    }
  };

  const handleCreateCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const character = await createCharacter(novelId, { name: newCharacterName, description: newCharacterDesc });
      setCharacters([character, ...characters]);
      setNewCharacterName("");
      setNewCharacterDesc("");
    } catch (error: any) {
      setMessage(error?.response?.data?.detail ?? "创建角色失败");
    }
  };

  const handleDeleteCharacter = async (characterId: string) => {
    if (!confirm("确定删除该角色吗？")) return;
    try {
      await deleteCharacter(novelId, characterId);
      setCharacters(characters.filter((c) => c.id !== characterId));
    } catch (error: any) {
      setMessage(error?.response?.data?.detail ?? "删除角色失败");
    }
  };

  return (
    <main className="page">
      <header>
        <p className="badge">小说编辑</p>
        <h1>{novel?.title || "加载中..."}</h1>
        <p className="meta">
          当前用户：{profileName || "未登录"} · 章节数：{novel?.chapter_count ?? 0} · 字数：{novel?.word_count ?? 0}
        </p>
        <nav className="actions">
          <Link to="/dashboard" className="btn">
            返回工作台
          </Link>
          <button className="btn" type="button" onClick={() => refreshAll()}>
            刷新
          </button>
        </nav>
        {message && <p className="notice">{message}</p>}
      </header>

      <section className="panel">
        <h3>章节列表</h3>
        <div className="card-grid">
          {chapters.map((c) => (
            <button
              key={c.id}
              className="card"
              type="button"
              onClick={() => setActiveChapterId(c.id)}
              style={{ textAlign: "left", cursor: "pointer", outline: c.id === activeChapterId ? "2px solid #2563eb" : "none" }}
            >
              <h3>{c.title}</h3>
              <p className="meta">字数：{c.word_count} · 状态：{c.status}</p>
            </button>
          ))}
        </div>
        {chapters.length === 0 && <p className="notice">暂无章节，先创建一个吧。</p>}
      </section>

      <form className="panel" onSubmit={handleCreateChapter}>
        <h3>新建章节</h3>
        <label className="field">
          <span>标题</span>
          <input value={newChapterTitle} onChange={(e) => setNewChapterTitle(e.target.value)} required />
        </label>
        <label className="field">
          <span>正文</span>
          <textarea value={newChapterContent} onChange={(e) => setNewChapterContent(e.target.value)} rows={6} required />
        </label>
        <button className="btn primary" type="submit">
          创建章节
        </button>
      </form>

      <section className="panel">
        <h3>章节编辑器</h3>
        {!activeChapter && <p className="notice">请选择左侧章节卡片进入编辑。</p>}
        {activeChapter && (
          <>
            <label className="field">
              <span>标题</span>
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </label>
            <label className="field">
              <span>正文</span>
              <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={12} />
            </label>
            <div className="actions">
              <button className="btn primary" type="button" onClick={handleSaveChapter}>
                保存
              </button>
              <button className="btn" type="button" onClick={handleAiContinue} disabled={isAiLoading}>
                {isAiLoading ? "AI 生成中..." : "AI 续写（追加到正文）"}
              </button>
              <button className="btn" type="button" onClick={handleDeleteChapter}>
                删除章节
              </button>
            </div>
          </>
        )}
      </section>

      <form className="panel" onSubmit={handleSaveWorldBuilding}>
        <h3>世界观（可选）</h3>
        <label className="field">
          <span>标题</span>
          <input value={wbTitle} onChange={(e) => setWbTitle(e.target.value)} placeholder="例如：世界设定" required />
        </label>
        <label className="field">
          <span>类型</span>
          <input value={wbType} onChange={(e) => setWbType(e.target.value)} placeholder="world / faction / item ..." required />
        </label>
        <label className="field">
          <span>内容</span>
          <textarea value={wbContent} onChange={(e) => setWbContent(e.target.value)} rows={6} required />
        </label>
        <button className="btn primary" type="submit">
          保存世界观
        </button>
        {!worldBuilding && <p className="meta">提示：第一次保存会创建记录，后续会覆盖更新。</p>}
      </form>

      <form className="panel" onSubmit={handleCreateOutline}>
        <h3>大纲</h3>
        <label className="field">
          <span>标题</span>
          <input value={newOutlineTitle} onChange={(e) => setNewOutlineTitle(e.target.value)} required />
        </label>
        <label className="field">
          <span>内容</span>
          <textarea value={newOutlineContent} onChange={(e) => setNewOutlineContent(e.target.value)} rows={4} />
        </label>
        <button className="btn primary" type="submit">
          添加大纲
        </button>
        <div className="card-grid">
          {outlines.map((o) => (
            <article key={o.id} className="card">
              <h3>{o.title}</h3>
              <p className="meta">{o.content || "暂无内容"}</p>
              <button className="btn" type="button" onClick={() => handleDeleteOutline(o.id)}>
                删除
              </button>
            </article>
          ))}
        </div>
        {outlines.length === 0 && <p className="notice">暂无大纲。</p>}
      </form>

      <form className="panel" onSubmit={handleCreateCharacter}>
        <h3>角色</h3>
        <label className="field">
          <span>姓名</span>
          <input value={newCharacterName} onChange={(e) => setNewCharacterName(e.target.value)} required />
        </label>
        <label className="field">
          <span>描述</span>
          <textarea value={newCharacterDesc} onChange={(e) => setNewCharacterDesc(e.target.value)} rows={3} />
        </label>
        <button className="btn primary" type="submit">
          添加角色
        </button>
        <div className="card-grid">
          {characters.map((c) => (
            <article key={c.id} className="card">
              <h3>{c.name}</h3>
              <p className="meta">{c.description || "暂无描述"}</p>
              <button className="btn" type="button" onClick={() => handleDeleteCharacter(c.id)}>
                删除
              </button>
            </article>
          ))}
        </div>
        {characters.length === 0 && <p className="notice">暂无角色。</p>}
      </form>
    </main>
  );
}

