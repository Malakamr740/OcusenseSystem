import { useEffect, useState } from "react";
import { getAllReports, downloadReportFile } from "../api";
import { useAuth } from "../auth/AuthContext";

export default function DoctorReportsPage() {
  const { token, user } = useAuth();

  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    if (!token || user?.role !== "doctor") return;

    async function loadReports() {
      try {
        setLoading(true);
        setError("");

        const data = await getAllReports(token);
        setReports(data);
      } catch (err) {
        setError(err.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, [token, user]);

  async function handleDownload(reportId) {
    try {
      setError("");
      setDownloadingId(reportId);

      const blob = await downloadReportFile(reportId, token);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Failed to download report");
    } finally {
      setDownloadingId(null);
    }
  }

  if (user?.role !== "doctor") {
    return <p>Only doctors can view this page.</p>;
  }

  return (
    <div>
      <h2>All Reports</h2>

      {loading && <p>Loading reports...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && reports.length === 0 && (
        <p>No reports found.</p>
      )}

      {!loading && !error && reports.length > 0 && (
        <div style={{ display: "grid", gap: 12 }}>
          {reports.map((report) => (
            <div
              key={report.id}
              style={{
                border: "1px solid #ddd",
                padding: 12,
                borderRadius: 8,
              }}
            >
              <p><strong>Report ID:</strong> {report.id}</p>
              <p><strong>Case ID:</strong> {report.case_id}</p>
              <p><strong>Type:</strong> {report.report_type}</p>
              <p><strong>Status:</strong> {report.status}</p>
              <p><strong>Created At:</strong> {report.created_at}</p>

              <button
                onClick={() => handleDownload(report.id)}
                disabled={downloadingId === report.id}
              >
                {downloadingId === report.id ? "Downloading..." : "Download Report"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}2