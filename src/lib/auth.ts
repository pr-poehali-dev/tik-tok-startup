const AUTH_URL = "https://functions.poehali.dev/defa06ef-2fc5-47d0-a453-c90abe142ef1";
const TOKEN_KEY = "vspyshka_token";

export interface User {
  id: string;
  username: string;
  display_name: string;
  email: string;
  bio: string;
  avatar_url: string;
  followers_count: number;
  following_count: number;
  likes_count: number;
  is_verified: boolean;
}

async function callAuth(body: object): Promise<{ token?: string; user?: User; error?: string }> {
  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка сервера");
  return data;
}

export async function register(params: {
  username: string;
  email: string;
  password: string;
  display_name: string;
}): Promise<{ token: string; user: User }> {
  const data = await callAuth({ action: "register", ...params });
  localStorage.setItem(TOKEN_KEY, data.token!);
  if (data.user?.id) localStorage.setItem("vspyshka_user_id", data.user.id);
  return { token: data.token!, user: data.user! };
}

export async function login(params: {
  login: string;
  password: string;
}): Promise<{ token: string; user: User }> {
  const data = await callAuth({ action: "login", ...params });
  localStorage.setItem(TOKEN_KEY, data.token!);
  if (data.user?.id) localStorage.setItem("vspyshka_user_id", data.user.id);
  return { token: data.token!, user: data.user! };
}

export async function getMe(): Promise<User | null> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const data = await callAuth({ action: "me", token });
  return data.user || null;
}

export function logout(): void {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) callAuth({ action: "logout", token });
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("vspyshka_user_id");
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}