import { useEffect, useState } from "react";
import { createProject, getProjects } from "../services/projectService";

export default function ProjectsPage() {
  const [form, setForm] = useState({ name: "", description: "" });
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadProjects() {
    setIsLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load projects.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await createProject(form);
      setMessage("Project created. It is now available while allocating tasks.");
      setForm({ name: "", description: "" });
      await loadProjects();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to create project.");
    }
  };

  return (
    <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <div>
        <form onSubmit={handleSubmit} className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold">Create project</h2>
          <p className="mt-1 text-sm text-slate-600">Projects keep assignments grouped for the admin task board.</p>

          {error ? <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
          {message ? <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Project name</span>
            <input className="w-full rounded-md border border-line px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-blue-100" name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
            <textarea className="min-h-28 w-full rounded-md border border-line px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-blue-100" name="description" value={form.description} onChange={handleChange} />
          </label>
          <button className="mt-5 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700" type="submit">
            Create project
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-line bg-white shadow-sm">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-xl font-bold">Projects</h2>
          <p className="mt-1 text-sm text-slate-600">These appear in the task allocation project selector.</p>
        </div>
        {isLoading ? (
          <p className="p-5 text-sm text-slate-600">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="p-5 text-sm text-slate-600">No projects yet.</p>
        ) : (
          <div className="divide-y divide-line">
            {projects.map((project) => (
              <article key={project.id} className="p-5">
                <p className="font-bold">{project.name}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{project.description || "No description added."}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
