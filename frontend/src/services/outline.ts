import api from "./api";

export type Outline = {
  id: string;
  title: string;
  content?: string | null;
  chapter_range?: string | null;
  order: number;
  novel_id: string;
};

export async function listOutlines(novelId: string): Promise<Outline[]> {
  const { data } = await api.get<Outline[]>(`/novels/${novelId}/outlines/`);
  return data;
}

export async function createOutline(
  novelId: string,
  payload: Pick<Outline, "title"> & Partial<Pick<Outline, "content" | "chapter_range" | "order">>
): Promise<Outline> {
  const { data } = await api.post<Outline>(`/novels/${novelId}/outlines/`, payload);
  return data;
}

export async function deleteOutline(novelId: string, outlineId: string): Promise<void> {
  await api.delete(`/novels/${novelId}/outlines/${outlineId}`);
}

