import { useEffect, useState } from "react";
import { getAdminDashboardSummary } from "../api";
import { useAuth } from "../auth/AuthContext";

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
    return <p>Only admins can view this page.</p>;
  }

  return (
    <div>
      <h2>Admin Dashboard</h2>

      {loading && <p>Loading dashboard...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginTop: 20,
          }}
        >
          <SummaryCard title="Total Users" value={summary.total_users} />
          <SummaryCard title="Total Patients" value={summary.total_patients} />
          <SummaryCard title="Total Doctors" value={summary.total_doctors} />
          <SummaryCard title="Total Admins" value={summary.total_admins} />
          <SummaryCard title="Total Cases" value={summary.total_cases} />
          <SummaryCard title="Total Reports" value={summary.total_reports} />
          <SummaryCard title="Chat Sessions" value={summary.total_chat_sessions} />
          <SummaryCard
            title="Retargeting Sessions"
            value={summary.total_retargeting_sessions}
          />
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 10,
        padding: 20,
        background: "#ffffff",
        color: "#111111",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <h3
        style={{
          margin: "0 0 10px 0",
          color: "#111111",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: 28,
          fontWeight: "bold",
          margin: 0,
          color: "#111111",
        }}
      >
        {value ?? 0}
      </p>
    </div>
  );
}