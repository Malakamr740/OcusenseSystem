import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";

import UploadCasePage from "./pages/UploadCasePage";
import MyCasesPage from "./pages/MyCasesPage";
import CaseDetailsPage from "./pages/CaseDetailsPage";
import PatientReportsPage from "./pages/PatientReportsPage";

import DoctorCasesPage from "./pages/DoctorCasesPage";
import DoctorReportsPage from "./pages/DoctorReportsPage";

import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminModelsPage from "./pages/AdminModelsPage";

import ChatbotPage from "./pages/ChatbotPage";
import DashboardPage from "./pages/DashboardPage";

function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div>
        <h1 style={{ fontSize: "56px", marginBottom: "12px" }}>404</h1>
        <p style={{ color: "#475467", marginBottom: "16px" }}>
          The page you are looking for does not exist.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["patient", "doctor", "admin"]}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/upload"
        element={
          <ProtectedRoute allowedRoles={["patient", "admin"]}>
            <UploadCasePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/cases"
        element={
          <ProtectedRoute allowedRoles={["patient", "admin"]}>
            <MyCasesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/cases/:id"
        element={
          <ProtectedRoute allowedRoles={["patient", "doctor", "admin"]}>
            <CaseDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/reports"
        element={
          <ProtectedRoute allowedRoles={["patient", "admin"]}>
            <PatientReportsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/cases"
        element={
          <ProtectedRoute allowedRoles={["doctor", "admin"]}>
            <DoctorCasesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/reports"
        element={
          <ProtectedRoute allowedRoles={["doctor", "admin"]}>
            <DoctorReportsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/model-registry"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminModelsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chatbot"
        element={
          <ProtectedRoute allowedRoles={["patient", "doctor", "admin"]}>
            <ChatbotPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}