import api from "./api";

function decodeJwtPayload(token) {
  const payload = token.split(".")[1];
  const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(window.atob(normalizedPayload));
}

export async function loginUser(credentials) {
  const { data } = await api.post("/login", credentials);
  localStorage.setItem("token", data.access_token);
  const payload = decodeJwtPayload(data.access_token);
  const user = {
    email: payload.sub,
    role: payload.role
  };
  saveSession(user);
  return { ...data, user };
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
