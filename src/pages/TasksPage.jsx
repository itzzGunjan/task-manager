import { useEffect, useMemo, useState } from "react";
import StatusBadge from "../components/StatusBadge";
import { getProjects } from "../services/projectService";
import { createTask, getTasks, updateTaskStatus } from "../services/taskService";
import { getUsers } from "../services/userService";

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
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function TasksPage({ currentUser, onTasksChanged }) {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(emptyTask);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
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
    let isMounted = true;

    async function loadPage() {
      try {
        const [taskData, projectData, userData] = await Promise.all([
          getTasks(),
          isAdmin ? getProjects() : Promise.resolve([]),
          isAdmin ? getUsers() : Promise.resolve([])
        ]);
        if (!isMounted) return;
        const memberData = userData.filter((user) => user.role === "member");
        setTasks(taskData);
        setProjects(projectData);
        setMembers(memberData);
        onTasksChanged(taskData);
        setForm((current) => ({
          ...current,
          project_id: projectData[0]?.id || "",
          assigned_to: memberData[0]?.email || ""
        }));
      } catch (err) {
        if (!isMounted) return;
        setError(err.response?.data?.detail || "Unable to load tasks.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPage();
    return () => {
      isMounted = false;
    };
  }, [isAdmin, onTasksChanged]);

  const projectById = useMemo(() => Object.fromEntries(projects.map((project) => [project.id, project])), [projects]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsCreating(true);

    try {
      const payload = {
        ...form,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null
      };
      await createTask(payload);
      setForm((current) => ({
        ...emptyTask,
        project_id: current.project_id,
        assigned_to: current.assigned_to
      }));
      setMessage("Task allocated to the member dashboard.");
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to create task.");
    } finally {
      setIsCreating(false);
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
      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {message ? <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

      {isAdmin ? (
        <form onSubmit={handleCreateTask} className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Create and allocate task</h2>
              <p className="mt-1 text-sm text-slate-600">Choose a project and member, then the task appears in that member dashboard.</p>
            </div>
            <button className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300" type="submit" disabled={isCreating || !projects.length || !members.length}>
              {isCreating ? "Allocating..." : "Allocate task"}
            </button>
          </div>

          {projects.length === 0 || members.length === 0 ? (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Create at least one project and one member account before allocating tasks.
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Task title</span>
              <input className="w-full rounded-md border border-line px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-blue-100" name="title" value={form.title} onChange={handleFieldChange} required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Member</span>
              <select className="w-full rounded-md border border-line px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-blue-100" name="assigned_to" value={form.assigned_to} onChange={handleFieldChange} required>
                {members.map((member) => (
                  <option key={member.id} value={member.email}>
                    {member.name} - {member.email}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Project</span>
              <select className="w-full rounded-md border border-line px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-blue-100" name="project_id" value={form.project_id} onChange={handleFieldChange} required>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Deadline</span>
              <input className="w-full rounded-md border border-line px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-blue-100" type="datetime-local" name="deadline" value={form.deadline} onChange={handleFieldChange} />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
              <textarea className="min-h-24 w-full rounded-md border border-line px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-blue-100" name="description" value={form.description} onChange={handleFieldChange} />
            </label>
          </div>
        </form>
      ) : null}

      <div className="rounded-lg border border-line bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-xl font-bold">{isAdmin ? "All allocated tasks" : "My allocated tasks"}</h2>
            <p className="mt-1 text-sm text-slate-600">{isAdmin ? "Monitor every member assignment." : "Update the status when your work changes."}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{tasks.length} tasks</span>
        </div>

        {isLoading ? (
          <p className="p-5 text-sm text-slate-600">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="p-5 text-sm text-slate-600">No tasks found.</p>
        ) : (
          <div className="grid gap-4 p-4 lg:grid-cols-2">
            {tasks.map((task) => (
              <article key={task.id} className="rounded-lg border border-line bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold">{task.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{projectById[task.project_id]?.name || "Project assigned"}</p>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
                <p className="mt-4 min-h-12 text-sm leading-6 text-slate-600">{task.description || "No description added."}</p>
                <div className="mt-5 grid gap-3 border-t border-line pt-4 text-sm text-slate-600 sm:grid-cols-2">
                  <p>
                    <span className="block font-semibold text-slate-800">Assigned to</span>
                    {task.assigned_to}
                  </p>
                  <p>
                    <span className="block font-semibold text-slate-800">Deadline</span>
                    {formatDate(task.deadline)}
                  </p>
                </div>
                {!isAdmin ? (
                  <label className="mt-5 block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Update status</span>
                    <select className="w-full rounded-md border border-line px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-blue-100" value={task.status} onChange={(event) => handleStatusUpdate(task.id, event.target.value)}>
                      <option value="todo">Todo</option>
                      <option value="in_progress">In progress</option>
                      <option value="done">Done</option>
                    </select>
                  </label>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
