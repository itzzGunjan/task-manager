import { useEffect, useState } from "react";
import StatusBadge from "../components/StatusBadge";
import { createTask, getTasks, updateTaskStatus } from "../services/taskService";

const emptyTask = {
  title: "",
  description: "",
  project_id: "",
  assigned_to: "",
  status: "todo",
  deadline: ""
};

function formatDate(value) {
  if (!value) return "No deadline";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export default function TasksPage({ currentUser, onTasksChanged }) {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyTask);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const isAdmin = currentUser.role === "admin";

  async function loadTasks() {
    setIsLoading(true);
    setError("");
    try {
      const data = await getTasks();
      setTasks(data);
      onTasksChanged(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load tasks.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null
      };
      await createTask(payload);
      setForm(emptyTask);
      setMessage("Task created successfully.");
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to create task.");
    }
  };

  const handleStatusUpdate = async (taskId, status) => {
    setError("");
    setMessage("");

    try {
      await updateTaskStatus(taskId, status);
      setMessage("Task status updated.");
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to update task.");
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Tasks</h2>
          <p className="mt-1 text-sm text-slate-600">
            {isAdmin ? "Create and review all team tasks." : "Review and update your assigned tasks."}
          </p>
        </div>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {message ? <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

      {isAdmin ? (
        <form onSubmit={handleCreateTask} className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold">Create task</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Title</span>
              <input className="w-full rounded-md border border-line px-3 py-2" name="title" value={form.title} onChange={handleFieldChange} required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Assigned email</span>
              <input className="w-full rounded-md border border-line px-3 py-2" type="email" name="assigned_to" value={form.assigned_to} onChange={handleFieldChange} required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Project ID</span>
              <input className="w-full rounded-md border border-line px-3 py-2" name="project_id" value={form.project_id} onChange={handleFieldChange} required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Deadline</span>
              <input className="w-full rounded-md border border-line px-3 py-2" type="datetime-local" name="deadline" value={form.deadline} onChange={handleFieldChange} />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
              <textarea className="min-h-24 w-full rounded-md border border-line px-3 py-2" name="description" value={form.description} onChange={handleFieldChange} />
            </label>
          </div>
          <button className="mt-4 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700" type="submit">
            Create task
          </button>
        </form>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="border-b border-line px-5 py-4">
          <h3 className="text-lg font-semibold">Task list</h3>
        </div>

        {isLoading ? (
          <p className="p-5 text-sm text-slate-600">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="p-5 text-sm text-slate-600">No tasks found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-line text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Task</th>
                  <th className="px-5 py-3">Assigned</th>
                  <th className="px-5 py-3">Deadline</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-ink">{task.title}</p>
                      <p className="mt-1 max-w-md text-slate-500">{task.description || "No description"}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{task.assigned_to}</td>
                    <td className="px-5 py-4 text-slate-600">{formatDate(task.deadline)}</td>
                    <td className="px-5 py-4"><StatusBadge status={task.status} /></td>
                    <td className="px-5 py-4">
                      {currentUser.role === "member" ? (
                        <select
                          className="rounded-md border border-line px-2 py-1.5"
                          value={task.status}
                          onChange={(event) => handleStatusUpdate(task.id, event.target.value)}
                        >
                          <option value="todo">Todo</option>
                          <option value="in_progress">In progress</option>
                          <option value="done">Done</option>
                        </select>
                      ) : (
                        <span className="text-slate-400">Admin view</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
