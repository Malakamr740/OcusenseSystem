import { useEffect, useState } from "react";
import { getAllReports, downloadReportFile } from "../api";
import { useAuth } from "../auth/AuthContext";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import Alert from "../components/Alert";
import StatusBadge from "../components/StatusBadge";

/**
 * Professional DoctorReportsPage
 * 
 * Improves UX by:
 * - PageHeader for professional title
 * - Card-based report item layout
 * - LoadingState & EmptyState components
 * - StatusBadge for status display
 * - Professional download buttons
 * - Better error and loading states
 */
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
    return (
      <div className="page-container">
        <PageHeader 
          title="Reports"
          subtitle="Access Restricted"
        />
        <Alert 
          type="warning" 
          message="Only healthcare professionals can access diagnosis reports."
          dismissible={false}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container">
        <PageHeader 
          title="Reports"
          subtitle="View and download generated diagnostic reports"
        />
        <LoadingState message="Loading reports..." />
      </div>
    );
  }

  if (error && reports.length === 0) {
    return (
      <div className="page-container">
        <PageHeader 
          title="Reports"
          subtitle="View and download generated diagnostic reports"
        />
        <Alert 
          type="danger" 
          message={error}
          dismissible={false}
        />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="page-container">
        <PageHeader 
          title="Reports"
          subtitle="View and download generated diagnostic reports"
        />
        <EmptyState 
          title="No Reports Yet"
          message="There are currently no diagnostic reports available. Reports will appear here once cases have been analyzed."
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader 
        title="Reports"
        subtitle={`${reports.length} diagnostic report${reports.length !== 1 ? 's' : ''} available`}
      />

      {error && (
        <Alert 
          type="danger" 
          message={error}
          dismissible={true}
          onDismiss={() => setError("")}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {reports.map((report) => (
          <Card 
            key={report.id}
            title={`Report #${report.id}`}
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <StatusBadge status={report.status} />
                <span style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#f3e5f5',
                  color: '#7b1fa2',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {report.report_type || "Diagnostic"}
                </span>
              </div>

              <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <strong>Case ID:</strong> {report.case_id}
              </p>

              <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <strong>Type:</strong> {report.report_type || "Diagnostic Report"}
              </p>

              <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1rem' }}>
                <strong>Generated:</strong> {new Date(report.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <button 
              className="btn btn-primary"
              onClick={() => handleDownload(report.id)}
              disabled={downloadingId === report.id}
              style={{ marginTop: '1rem', width: '100%' }}
            >
              {downloadingId === report.id ? "⬇ Downloading..." : "⬇ Download Report"}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}