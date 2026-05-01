import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import { getSessionUser, getToken, logoutUser } from "./services/authService";

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    if (!getToken()) return null;
    return getSessionUser();
  });

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} />;
  }

  return (
    <main className="min-h-screen bg-mist px-6 py-8 text-ink">
      <section className="mx-auto max-w-6xl rounded-lg border border-line bg-white p-8 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">Signed in</p>
            <h1 className="mt-2 text-3xl font-bold">Task Manager Dashboard</h1>
            <p className="mt-2 text-slate-600">{currentUser.email} · {currentUser.role}</p>
          </div>
          <button
            className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </section>
    </main>
  );
}
