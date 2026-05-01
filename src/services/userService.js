import api from "./api";

export async function getUsers() {
  const { data } = await api.get("/users");
  return data;
}
