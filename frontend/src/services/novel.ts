import api from "./api";

export type Novel = {
  id: string;
  title: string;
  description?: string;
  status: string;
  genre?: string;
  tags?: string;
};

export async function listNovels(): Promise<Novel[]> {
  const { data } = await api.get<Novel[]>("/novels/");
  return data;
}

export async function createNovel(payload: { title: string; description?: string }): Promise<Novel> {
  const { data } = await api.post<Novel>("/novels/", payload);
  return data;
}
