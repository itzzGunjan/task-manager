import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import { getTasks } from "../services/taskService";

function isOverdue(task) {
  return task.deadline && new Date(task.deadline) < new Date() && task.status !== "done";
}

export default function DashboardPage({ onTasksLoaded }) {
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
    const overdue = tasks.filter(isOverdue).length;
    return {
      total: tasks.length,
      completed,
      pending: tasks.length - completed,
      overdue
    };
  }, [tasks]);

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600">A current snapshot of task progress and risk.</p>
      </div>

      {error ? (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total tasks" value={isLoading ? "..." : stats.total} />
        <StatCard label="Completed" value={isLoading ? "..." : stats.completed} tone="success" />
        <StatCard label="Pending" value={isLoading ? "..." : stats.pending} tone="warning" />
        <StatCard label="Overdue" value={isLoading ? "..." : stats.overdue} tone="danger" />
      </div>
    </section>
  );
}
