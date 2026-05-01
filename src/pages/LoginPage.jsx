import { useState } from "react";
import { loginUser, signupUser } from "../services/authService";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "admin"
};

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === "signup";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleRoleChange = (role) => {
    setForm((current) => ({ ...current, role }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      if (isSignup) {
        await signupUser(form);
        setMessage("Account created. Sign in with your new credentials.");
        setMode("login");
        setForm((current) => ({ ...emptyForm, email: current.email, role: current.role }));
        return;
      }

      const session = await loginUser(form);
      onLogin(session.user);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please check the form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-5 py-8 text-ink">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_430px]">
        <div className="max-w-2xl">
          <div className="mb-8 inline-flex rounded-md border border-line bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded px-4 py-2 text-sm font-semibold ${mode === "login" ? "bg-ink text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded px-4 py-2 text-sm font-semibold ${mode === "signup" ? "bg-ink text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              Signup
            </button>
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand">Task Manager</p>
          <h1 className="max-w-xl text-4xl font-bold leading-tight sm:text-5xl">
            Assign work clearly. Finish it without confusion.
          </h1>
          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                handleRoleChange("admin");
              }}
              className={`rounded-lg border p-5 text-left shadow-sm transition ${form.role === "admin" && isSignup ? "border-brand bg-blue-50" : "border-line bg-white hover:border-slate-300"}`}
            >
              <span className="text-sm font-semibold text-brand">Admin</span>
              <span className="mt-2 block text-lg font-bold">Create and assign tasks</span>
              <span className="mt-2 block text-sm leading-6 text-slate-600">Set up projects, choose members, and track every task.</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                handleRoleChange("member");
              }}
              className={`rounded-lg border p-5 text-left shadow-sm transition ${form.role === "member" && isSignup ? "border-brand bg-blue-50" : "border-line bg-white hover:border-slate-300"}`}
            >
              <span className="text-sm font-semibold text-success">Member</span>
              <span className="mt-2 block text-lg font-bold">See assigned work</span>
              <span className="mt-2 block text-sm leading-6 text-slate-600">Open your dashboard, update progress, and close tasks.</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-line bg-white p-7 shadow-soft">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">{isSignup ? form.role : "Welcome back"}</p>
            <h2 className="mt-2 text-2xl font-bold">{isSignup ? "Create account" : "Login to workspace"}</h2>
          </div>

          {error ? <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
          {message ? <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

          {isSignup ? (
            <>
              <div className="mb-4 grid grid-cols-2 gap-2 rounded-md bg-slate-100 p-1">
                {["admin", "member"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleChange(role)}
                    className={`rounded px-3 py-2 text-sm font-semibold capitalize ${form.role === role ? "bg-white text-ink shadow-sm" : "text-slate-600"}`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <label className="mb-4 block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Name</span>
                <input className="w-full rounded-md border border-line px-3 py-2.5 outline-none transition focus:border-brand focus:ring-2 focus:ring-blue-100" name="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
              </label>
            </>
          ) : null}

          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
            <input className="w-full rounded-md border border-line px-3 py-2.5 outline-none transition focus:border-brand focus:ring-2 focus:ring-blue-100" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
          </label>

          <label className="mb-5 block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
            <input className="w-full rounded-md border border-line px-3 py-2.5 outline-none transition focus:border-brand focus:ring-2 focus:ring-blue-100" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Minimum 8 characters" minLength={8} required />
          </label>

          <button className="w-full rounded-md bg-brand px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : isSignup ? "Create account" : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
