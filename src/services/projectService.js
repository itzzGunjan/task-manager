import api from "./api";

export async function createProject(project) {
  const { data } = await api.post("/projects", project);
  return data;
}
