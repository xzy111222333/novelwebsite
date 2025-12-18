import api from "./api";

export type Novel = {
  id: string;
  title: string;
  description?: string;
  status: string;
  genre?: string;
  tags?: string;
  chapter_count?: number;
  word_count?: number;
};

export async function listNovels(): Promise<Novel[]> {
  const { data } = await api.get<Novel[]>("/novels/");
  return data;
}

export async function createNovel(payload: { title: string; description?: string }): Promise<Novel> {
  const { data } = await api.post<Novel>("/novels/", payload);
  return data;
}

export async function getNovel(novelId: string): Promise<Novel> {
  const { data } = await api.get<Novel>(`/novels/${novelId}`);
  return data;
}

export async function updateNovel(
  novelId: string,
  payload: Partial<Pick<Novel, "title" | "description" | "status" | "genre" | "tags">>
): Promise<Novel> {
  const { data } = await api.put<Novel>(`/novels/${novelId}`, payload);
  return data;
}

export async function deleteNovel(novelId: string): Promise<void> {
  await api.delete(`/novels/${novelId}`);
}
