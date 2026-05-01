import { useState } from "react";
import AppShell from "./components/AppShell";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import { getSessionUser, getToken, logoutUser } from "./services/authService";

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [tasks, setTasks] = useState([]);
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
    <AppShell
      currentUser={currentUser}
      activeView={activeView}
      onViewChange={setActiveView}
      onLogout={handleLogout}
    >
      {activeView === "dashboard" ? (
        <DashboardPage onTasksLoaded={setTasks} />
      ) : (
        <section className="rounded-lg border border-line bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">{activeView === "tasks" ? "Tasks" : "Projects"}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {tasks.length} tasks loaded. This workspace view is coming in the next step.
          </p>
        </section>
      )}
    </AppShell>
  );
}
