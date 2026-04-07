import { Routes, Route, Navigate, Outlet } from "react-router";
import MainLayout from "./components/MainLayout";
import TopNav from "./components/TopNav";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import DashboardPage from "./pages/DashboardPage";
import UploadCasePage from "./pages/UploadCasePage";
import MyCasesPage from "./pages/MyCasesPage";
import CaseDetailsPage from "./pages/CaseDetailsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";
import DoctorCasesPage from "./pages/DoctorCasesPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminModelsPage from "./pages/AdminModelsPage"; 
import ChatbotPage from "./pages/ChatbotPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DoctorReportsPage from "./pages/DoctorReportsPage";

export default function App() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route element={<UnauthLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
        />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/upload-case" element={<UploadCasePage />} />
        <Route path="/my-cases" element={<MyCasesPage />} />
        <Route path="/cases/:caseId" element={<CaseDetailsPage />} />
        <Route path="/doctor/cases" element={<DoctorCasesPage />} />
        <Route path="/doctor/reports" element={<DoctorReportsPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        <Route path="/admin/models" element={<AdminModelsPage />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
      </Route>

      <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

function UnauthLayout() {
  return (
    <div className="app-shell">
      <TopNav />
      <main className="main-content">
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function HomePage() {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="page-container" style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div className="page-header">
        <div>
          <h1 style={{ color: "var(--white)", margin: 0 }}>Retinitis Pigmentosa Diagnosis System</h1>
          <p style={{ color: "rgba(255,255,255,0.9)", margin: "0.5rem 0 0 0" }}>
            AI-powered diagnosis assistance for retinal pathology
          </p>
        </div>
      </div>

      <div className="card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
        <h2>Welcome to the RP Diagnosis System</h2>
        <p style={{ fontSize: "1.05rem", color: "var(--gray-700)", marginBottom: "2rem" }}>
          A professional medical AI platform for diagnosis assistance, case management, and collaborative healthcare.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <a href="/login" className="btn btn-primary">Login</a>
          <a href="/register" className="btn btn-outline-primary">Register</a>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: "3rem" }}>
        <div className="stat-card">
          <div className="stat-card-icon">🔬</div>
          <div className="stat-card-content">
            <div className="stat-card-label">AI-Powered</div>
            <div style={{ fontSize: "0.95rem", color: "var(--gray-700)" }}>Advanced machine learning for accurate diagnosis</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">👨‍⚕️</div>
          <div className="stat-card-content">
            <div className="stat-card-label">For Healthcare Professionals</div>
            <div style={{ fontSize: "0.95rem", color: "var(--gray-700)" }}>Collaborate and manage patient cases</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🔐</div>
          <div className="stat-card-content">
            <div className="stat-card-label">Secure & Compliant</div>
            <div style={{ fontSize: "0.95rem", color: "var(--gray-700)" }}>HIPAA-compliant and encrypted</div>
          </div>
        </div>
      </div>
    </div>
  );
}
