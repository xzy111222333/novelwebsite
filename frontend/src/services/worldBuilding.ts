import api from "./api";

export type WorldBuilding = {
  id: string;
  title: string;
  content: string;
  type: string;
  novel_id: string;
};

export async function getWorldBuilding(novelId: string): Promise<WorldBuilding> {
  const { data } = await api.get<WorldBuilding>(`/novels/${novelId}/world-building/`);
  return data;
}

export async function upsertWorldBuilding(
  novelId: string,
  payload: Pick<WorldBuilding, "title" | "content" | "type">
): Promise<WorldBuilding> {
  const { data } = await api.put<WorldBuilding>(`/novels/${novelId}/world-building/`, payload);
  return data;
}

export async function deleteWorldBuilding(novelId: string): Promise<void> {
  await api.delete(`/novels/${novelId}/world-building/`);
}

