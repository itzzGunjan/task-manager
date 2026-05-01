export default function AppShell({ currentUser, activeView, onViewChange, onLogout, children }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "tasks", label: "Tasks" }
  ];

  if (currentUser.role === "admin") {
    navItems.push({ id: "projects", label: "Projects" });
  }

  return (
    <div className="min-h-screen bg-mist text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white px-5 py-6 lg:block">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">Task Manager</p>
          <p className="mt-2 text-sm text-slate-500">{currentUser.email}</p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={`w-full rounded-md px-3 py-2 text-left text-sm font-semibold transition ${
                activeView === item.id
                  ? "bg-blue-50 text-brand"
                  : "text-slate-600 hover:bg-slate-50 hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={onLogout}
          className="absolute bottom-6 left-5 right-5 rounded-md border border-line px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Logout
        </button>
      </aside>

      <div className="lg:pl-64">
        <header className="border-b border-line bg-white px-5 py-4 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold capitalize text-brand">{currentUser.role}</p>
              <h1 className="text-2xl font-bold">Task Workspace</h1>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 lg:hidden"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="px-5 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
