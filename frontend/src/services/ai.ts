import api from "./api";

export async function continueWriting(payload: {
  content: string;
  context?: string;
  style?: string;
  length?: number;
  direction?: string;
}): Promise<{ content: string; wordCount: number }> {
  const { data } = await api.post<{ content: string; wordCount: number }>("/ai/continue-writing", payload);
  return data;
}

