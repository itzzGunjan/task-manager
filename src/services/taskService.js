import api from "./api";

export async function getTasks() {
  const { data } = await api.get("/tasks");
  return data;
}

export async function createTask(task) {
  const { data } = await api.post("/tasks", task);
  return data;
}

export async function updateTaskStatus(taskId, status) {
  const { data } = await api.patch(`/tasks/${taskId}/status`, { status });
  return data;
}
