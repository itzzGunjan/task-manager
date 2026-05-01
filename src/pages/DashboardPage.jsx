import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { getTasks } from "../services/taskService";

function isOverdue(task) {
  return task.deadline && new Date(task.deadline) < new Date() && task.status !== "done";
}

function formatDate(value) {
  if (!value) return "No deadline";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function DashboardPage({ currentUser, onTasksLoaded }) {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      try {
        const data = await getTasks();
        if (!isMounted) return;
        setTasks(data);
        onTasksLoaded(data);
      } catch (err) {
        if (!isMounted) return;
        setError(err.response?.data?.detail || "Unable to load dashboard.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadTasks();
    return () => {
      isMounted = false;
    };
  }, [onTasksLoaded]);

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.status === "done").length;
    const inProgress = tasks.filter((task) => task.status === "in_progress").length;
    const overdue = tasks.filter(isOverdue).length;
    return { total: tasks.length, completed, inProgress, overdue };
  }, [tasks]);

  const upcomingTasks = useMemo(
    () =>
      [...tasks]
        .sort((a, b) => new Date(a.deadline || a.created_at) - new Date(b.deadline || b.created_at))
        .slice(0, 5),
    [tasks]
  );

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-line bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">{currentUser.role === "admin" ? "Admin dashboard" : "Member dashboard"}</p>
        <h2 className="mt-2 text-2xl font-bold">Hello, {currentUser.name || currentUser.email}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          {currentUser.role === "admin"
            ? "Create projects, assign members, and keep the full task pipeline visible."
            : "Your assigned tasks appear here as soon as an admin allocates them to your email."}
        </p>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total tasks" value={isLoading ? "..." : stats.total} />
        <StatCard label="In progress" value={isLoading ? "..." : stats.inProgress} tone="warning" />
        <StatCard label="Completed" value={isLoading ? "..." : stats.completed} tone="success" />
        <StatCard label="Overdue" value={isLoading ? "..." : stats.overdue} tone="danger" />
      </div>

      <div className="rounded-lg border border-line bg-white shadow-sm">
        <div className="border-b border-line px-5 py-4">
          <h3 className="text-lg font-semibold">{currentUser.role === "admin" ? "Latest team tasks" : "Your task dashboard"}</h3>
        </div>
        {isLoading ? (
          <p className="p-5 text-sm text-slate-600">Loading tasks...</p>
        ) : upcomingTasks.length === 0 ? (
          <p className="p-5 text-sm text-slate-600">No tasks yet.</p>
        ) : (
          <div className="divide-y divide-line">
            {upcomingTasks.map((task) => (
              <article key={task.id} className="grid gap-3 p-5 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div>
                  <p className="font-semibold">{task.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{task.assigned_to}</p>
                </div>
                <p className="text-sm text-slate-600">{formatDate(task.deadline)}</p>
                <StatusBadge status={task.status} />
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
