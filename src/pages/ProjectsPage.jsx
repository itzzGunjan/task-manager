import { useState } from "react";
import { createProject } from "../services/projectService";

export default function ProjectsPage() {
  const [form, setForm] = useState({ name: "", description: "" });
  const [createdProject, setCreatedProject] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setCreatedProject(null);

    try {
      const project = await createProject(form);
      setCreatedProject(project);
      setForm({ name: "", description: "" });
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to create project.");
    }
  };

  return (
    <section className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Projects</h2>
        <p className="mt-1 text-sm text-slate-600">Create projects and use the generated ID when creating tasks.</p>
      </div>

      {error ? <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <form onSubmit={handleSubmit} className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Project name</span>
          <input className="w-full rounded-md border border-line px-3 py-2" name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
          <textarea className="min-h-28 w-full rounded-md border border-line px-3 py-2" name="description" value={form.description} onChange={handleChange} />
        </label>
        <button className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700" type="submit">
          Create project
        </button>
      </form>

      {createdProject ? (
        <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
          <p className="font-semibold">Project created</p>
          <p className="mt-2 break-all">Project ID: {createdProject.id}</p>
        </div>
      ) : null}
    </section>
  );
}
