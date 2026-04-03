import { useState } from "react";
import LandingPage from "./components/LandingPage.jsx";
import AuthPage from "./components/Authpage.jsx";
import Dashboard from "./components/Dashboard";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("landing"); // "landing" | "auth" | "dashboard"
  const [user, setUser] = useState(null);

  const handleAuth = (userData) => {
    setUser(userData);
    setPage("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    setPage("landing");
  };

  return (
    <>
      {page === "landing"  && <LandingPage onGetStarted={() => setPage("auth")} />}
      {page === "auth"     && <AuthPage onAuth={handleAuth} />}
      {page === "dashboard"&& <Dashboard user={user} onLogout={handleLogout} />}
    </>
  );
}