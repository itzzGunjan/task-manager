import { useState } from "react";
import AppShell from "./components/AppShell";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ProjectsPage from "./pages/ProjectsPage";
import TasksPage from "./pages/TasksPage";
import { getSessionUser, getToken, logoutUser } from "./services/authService";

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [, setTasks] = useState([]);
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
      {activeView === "dashboard" ? <DashboardPage currentUser={currentUser} onTasksLoaded={setTasks} /> : null}
      {activeView === "tasks" ? <TasksPage currentUser={currentUser} onTasksChanged={setTasks} /> : null}
      {activeView === "projects" && currentUser.role === "admin" ? <ProjectsPage /> : null}
    </AppShell>
  );
}
