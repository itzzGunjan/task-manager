const baseNav = [
  { id: "dashboard", label: "Dashboard", icon: "01" },
  { id: "tasks", label: "Tasks", icon: "02" }
];

export default function AppShell({ currentUser, activeView, onViewChange, onLogout, children }) {
  const navItems = currentUser.role === "admin" ? [...baseNav, { id: "projects", label: "Projects", icon: "03" }] : baseNav;

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-line bg-white px-5 py-6 lg:block">
        <div className="rounded-lg border border-line bg-slate-50 p-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">Task Manager</p>
          <p className="mt-4 text-lg font-bold">{currentUser.name || "Workspace user"}</p>
          <p className="mt-1 break-all text-sm text-slate-500">{currentUser.email}</p>
          <span className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-slate-700 ring-1 ring-line">
            {currentUser.role}
          </span>
        </div>

        <nav className="mt-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-semibold transition ${
                activeView === item.id ? "bg-blue-50 text-brand ring-1 ring-blue-100" : "text-slate-600 hover:bg-slate-50 hover:text-ink"
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded bg-white text-xs font-bold ring-1 ring-line">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <button type="button" onClick={onLogout} className="absolute bottom-6 left-5 right-5 rounded-md border border-line px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Logout
        </button>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-line bg-white/95 px-5 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold capitalize text-brand">{currentUser.role} workspace</p>
              <h1 className="text-2xl font-bold">{activeView === "dashboard" ? "Overview" : activeView === "tasks" ? "Task board" : "Projects"}</h1>
            </div>
            <button type="button" onClick={onLogout} className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 lg:hidden">
              Logout
            </button>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewChange(item.id)}
                className={`rounded-md px-4 py-2 text-sm font-semibold ${activeView === item.id ? "bg-brand text-white" : "bg-slate-100 text-slate-700"}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>

        <main className="px-5 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
