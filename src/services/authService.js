import api from "./api";

export async function loginUser(credentials) {
  const { data } = await api.post("/login", credentials);
  localStorage.setItem("token", data.access_token);
  return data;
}

export function saveSession(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function getSessionUser() {
  const storedUser = localStorage.getItem("user");
  return storedUser ? JSON.parse(storedUser) : null;
}

export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getToken() {
  return localStorage.getItem("token");
}
