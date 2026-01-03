export const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export function fastapiUrl(path: string) {
  if (!path.startsWith("/")) return `${FASTAPI_URL}/${path}`;
  return `${FASTAPI_URL}${path}`;
}

export async function fastapiFetch(
  path: string,
  init: RequestInit & { accessToken?: string } = {}
) {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.accessToken) {
    headers.set("Authorization", `Bearer ${init.accessToken}`);
  }

  const res = await fetch(fastapiUrl(path), {
    ...init,
    headers,
    cache: "no-store",
  });

  return res;
}

export function toCamelNovel(novel: any) {
  return {
    id: novel.id,
    title: novel.title,
    description: novel.description ?? null,
    genre: novel.genre ?? null,
    status: novel.status ?? "draft",
    coverImage: novel.cover_image ?? null,
    isBanned: Boolean(novel.is_banned),
    tags: typeof novel.tags === "string" && novel.tags ? safeJsonParse(novel.tags, []) : [],
    wordCount: novel.word_count ?? 0,
    chapterCount: novel.chapter_count ?? 0,
    createdAt: novel.created_at,
    updatedAt: novel.updated_at,
  };
}

export function toCamelChapter(chapter: any) {
  return {
    id: chapter.id,
    title: chapter.title,
    content: chapter.content ?? "",
    summary: chapter.summary ?? null,
    wordCount: chapter.word_count ?? 0,
    order: chapter.order ?? 0,
    status: chapter.status ?? "draft",
    novelId: chapter.novel_id,
    createdAt: chapter.created_at,
    updatedAt: chapter.updated_at,
  };
}

export function toCamelCharacter(character: any) {
  return {
    id: character.id,
    name: character.name,
    description: character.description ?? "",
    avatar: character.avatar ?? null,
    personality: character.personality ?? null,
    background: character.background ?? null,
    relationships: character.relationships ?? null,
    novelId: character.novel_id,
    createdAt: character.created_at,
    updatedAt: character.updated_at,
  };
}

export function toCamelOutline(outline: any) {
  return {
    id: outline.id,
    title: outline.title,
    content: outline.content ?? "",
    chapterRange: outline.chapter_range ?? null,
    order: outline.order ?? 0,
    novelId: outline.novel_id,
    createdAt: outline.created_at,
    updatedAt: outline.updated_at,
  };
}

export function toCamelWorldBuilding(wb: any) {
  return {
    id: wb.id,
    title: wb.title,
    content: wb.content,
    type: wb.type,
    novelId: wb.novel_id,
    createdAt: wb.created_at,
    updatedAt: wb.updated_at,
  };
}

function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

