import { useEffect, useState } from "react";
import { getAdminDashboardSummary } from "../api";
import { useAuth } from "../auth/AuthContext";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import LoadingState from "../components/LoadingState";
import Alert from "../components/Alert";

/**
 * Professional AdminDashboardPage
 * 
 * Improves UX by:
 * - PageHeader for professional title
 * - StatCard components for metrics grid
 * - LoadingState component
 * - Alert for errors
 * - Professional metric display with icons
 * - Responsive grid layout
 */
export default function AdminDashboardPage() {
  const { token, user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || user?.role !== "admin") return;

    async function loadSummary() {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminDashboardSummary(token);
        setSummary(data);
      } catch (err) {
        setError(err.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, [token, user]);

  if (user?.role !== "admin") {
    return (
      <div className="page-container">
        <PageHeader 
          title="Admin Dashboard"
          subtitle="Access Restricted"
        />
        <Alert 
          type="warning" 
          message="Only administrators can access this dashboard."
          dismissible={false}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container">
        <PageHeader 
          title="Admin Dashboard"
          subtitle="System overview and statistics"
        />
        <LoadingState message="Loading dashboard metrics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <PageHeader 
          title="Admin Dashboard"
          subtitle="System overview and statistics"
        />
        <Alert 
          type="danger" 
          message={error}
          dismissible={false}
        />
      </div>
    );
  }

  const metrics = summary ? [
    { label: "Total Users", value: summary.total_users ?? 0, icon: "👥" },
    { label: "Patients", value: summary.total_patients ?? 0, icon: "🏥" },
    { label: "Healthcare Professionals", value: summary.total_doctors ?? 0, icon: "👨‍⚕️" },
    { label: "Administrators", value: summary.total_admins ?? 0, icon: "⚙️" },
    { label: "Cases", value: summary.total_cases ?? 0, icon: "📋" },
    { label: "Reports Generated", value: summary.total_reports ?? 0, icon: "📊" },
    { label: "Chat Sessions", value: summary.total_chat_sessions ?? 0, icon: "💬" },
    { label: "Retargeting Sessions", value: summary.total_retargeting_sessions ?? 0, icon: "🔍" },
  ] : [];

  return (
    <div className="page-container">
      <PageHeader 
        title="Admin Dashboard"
        subtitle="System overview and key statistics"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {metrics.map((metric, index) => (
          <StatCard 
            key={index}
            label={metric.label}
            value={metric.value.toLocaleString()}
            icon={metric.icon}
          />
        ))}
      </div>
    </div>
  );
}