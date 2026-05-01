import { useState } from "react";
import { loginUser, saveSession } from "../services/authService";

function inferRoleFromEmail(email) {
  return email.toLowerCase().includes("admin") ? "admin" : "member";
}

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [role, setRole] = useState("member");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await loginUser(form);
      const sessionUser = {
        email: form.email.toLowerCase(),
        role: role || inferRoleFromEmail(form.email)
      };
      saveSession(sessionUser);
      onLogin(sessionUser);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to sign in. Check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-mist px-5 py-8 text-ink">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand">Task Manager</p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            A focused workspace for projects, tasks, and team execution.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            Sign in with your backend account to manage projects as an admin or update assigned work as a member.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-line bg-white p-7 shadow-soft">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Login</h2>
            <p className="mt-2 text-sm text-slate-500">Use the credentials created through the FastAPI backend.</p>
          </div>

          {error ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
            <input
              className="w-full rounded-md border border-line px-3 py-2.5 outline-none transition focus:border-brand focus:ring-2 focus:ring-blue-100"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              required
            />
          </label>

          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
            <input
              className="w-full rounded-md border border-line px-3 py-2.5 outline-none transition focus:border-brand focus:ring-2 focus:ring-blue-100"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="password123"
              required
            />
          </label>

          <label className="mb-6 block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Workspace role</span>
            <select
              className="w-full rounded-md border border-line px-3 py-2.5 outline-none transition focus:border-brand focus:ring-2 focus:ring-blue-100"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
          </label>

          <button
            className="w-full rounded-md bg-brand px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
