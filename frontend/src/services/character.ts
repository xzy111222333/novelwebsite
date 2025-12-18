import api from "./api";

export type Character = {
  id: string;
  name: string;
  description?: string | null;
  avatar?: string | null;
  personality?: string | null;
  background?: string | null;
  relationships?: string | null;
  novel_id: string;
};

export async function listCharacters(novelId: string): Promise<Character[]> {
  const { data } = await api.get<Character[]>(`/novels/${novelId}/characters/`);
  return data;
}

export async function createCharacter(
  novelId: string,
  payload: Pick<Character, "name"> & Partial<Omit<Character, "id" | "novel_id">>
): Promise<Character> {
  const { data } = await api.post<Character>(`/novels/${novelId}/characters/`, payload);
  return data;
}

export async function deleteCharacter(novelId: string, characterId: string): Promise<void> {
  await api.delete(`/novels/${novelId}/characters/${characterId}`);
}

