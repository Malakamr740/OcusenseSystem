import { Routes, Route, Link, Navigate } from "react-router";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";

export default function App() {
  const { token, logout, user } = useAuth();

  return (
    <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh" }}>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "12px 20px",
          borderBottom: "1px solid #ddd",
          background: "#f8f9fb",
        }}
      >
        <div style={{ display: "flex", gap: 16 }}>
          <Link to="/">Home</Link>
          {!token && <Link to="/login">Login</Link>}
          {!token && <Link to="/register">Register</Link>}
          {token && <Link to="/dashboard">Dashboard</Link>}
        </div>

        <div>
          {token ? (
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span>
                {user ? `${user.email} (${user.role})` : "Logged in"}
              </span>
              <button onClick={logout}>Logout</button>
            </div>
          ) : (
            <span>RP Diagnosis System</span>
          )}
        </div>
      </nav>

      <div style={{ padding: 24 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/register" element={token ? <Navigate to="/dashboard" /> : <RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function Home() {
  return (
    <div>
      <h1>RP Diagnosis System</h1>
      <p>Frontend foundation is ready. Next we will connect more backend features page by page.</p>
    </div>
  );
}