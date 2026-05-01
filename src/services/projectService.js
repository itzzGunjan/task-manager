import api from "./api";

export async function getProjects() {
  const { data } = await api.get("/projects");
  return data;
}

export async function createProject(project) {
  const { data } = await api.post("/projects", project);
  return data;
}
