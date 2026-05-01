import api from "./api";

function decodeJwtPayload(token) {
  const payload = token.split(".")[1];
  const normalizedPayload = payload
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(payload.length / 4) * 4, "=");
  return JSON.parse(window.atob(normalizedPayload));
}

export async function loginUser(credentials) {
  const { data } = await api.post("/login", {
    email: credentials.email,
    password: credentials.password
  });
  localStorage.setItem("token", data.access_token);
  const payload = decodeJwtPayload(data.access_token);
  const user = data.user || {
    email: payload.sub,
    role: payload.role
  };
  saveSession(user);
  return { ...data, user };
}

export async function signupUser(account) {
  const { data } = await api.post("/signup", account);
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
