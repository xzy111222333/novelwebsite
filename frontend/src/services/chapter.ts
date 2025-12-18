import api from "./api";

export type Chapter = {
  id: string;
  title: string;
  content: string;
  summary?: string | null;
  order: number;
  status: string;
  word_count: number;
  novel_id: string;
};

export async function listChapters(novelId: string): Promise<Chapter[]> {
  const { data } = await api.get<Chapter[]>(`/novels/${novelId}/chapters/`);
  return data;
}

export async function createChapter(
  novelId: string,
  payload: Pick<Chapter, "title" | "content"> & Partial<Pick<Chapter, "summary" | "order" | "status">>
): Promise<Chapter> {
  const { data } = await api.post<Chapter>(`/novels/${novelId}/chapters/`, payload);
  return data;
}

export async function updateChapter(
  novelId: string,
  chapterId: string,
  payload: Partial<Pick<Chapter, "title" | "content" | "summary" | "order" | "status">>
): Promise<Chapter> {
  const { data } = await api.put<Chapter>(`/novels/${novelId}/chapters/${chapterId}`, payload);
  return data;
}

export async function deleteChapter(novelId: string, chapterId: string): Promise<void> {
  await api.delete(`/novels/${novelId}/chapters/${chapterId}`);
}

