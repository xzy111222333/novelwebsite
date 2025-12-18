import api from "./api";

export type AuthResponse = {
  access_token: string;
  token_type: string;
};

export async function login(email: string, password: string): Promise<AuthResponse> {
  const params = new URLSearchParams();
  params.append("username", email);
  params.append("password", password);
  const { data } = await api.post<AuthResponse>("/auth/login", params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  localStorage.setItem("token", data.access_token);
  return data;
}

export async function register(payload: { email: string; password: string; name?: string }): Promise<void> {
  await api.post("/auth/register", payload);
}

export async function fetchProfile() {
  const { data } = await api.get("/auth/me");
  return data;
}
