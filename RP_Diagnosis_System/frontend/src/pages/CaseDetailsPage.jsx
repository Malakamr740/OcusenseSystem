import { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  getCaseById,
  getCaseResults,
  runDiagnosisPipeline,
  generateCaseReport,
  getCaseReports,
  downloadReportFile,
  getStaticFileUrl,
} from "../api";
import { useAuth } from "../auth/AuthContext";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Alert from "../components/Alert";
import LoadingState from "../components/LoadingState";
import StatusBadge from "../components/StatusBadge";

/**
 * Professional CaseDetailsPage
 * 
 * Improves UX by:
 * - PageHeader with case ID
 * - Card sections for case info, predictions, grad-cam, segmentation, reports
 * - Alert components for errors/success
 * - LoadingState component
 * - StatusBadge for status display
 * - Professional nested card grid layout
 * - Button groups for diagnosis/report actions
 */
export default function CaseDetailsPage() {
  const { caseId } = useParams();
  const { token, user } = useAuth();

  const [caseData, setCaseData] = useState(null);
  const [results, setResults] = useState(null);
  const [reports, setReports] = useState([]);

  const [caseLoading, setCaseLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) return;

    async function loadCase() {
      try {
        setCaseLoading(true);
        setError("");
        const data = await getCaseById(caseId, token);
        setCaseData(data);
      } catch (err) {
        setError(err.message || "Failed to load case");
      } finally {
        setCaseLoading(false);
      }
    }

    loadCase();
  }, [caseId, token]);

  async function loadResults() {
    try {
      setResultsLoading(true);
      setError("");
      const data = await getCaseResults(caseId, token);
      setResults(data);
    } catch (err) {
      setError(err.message || "Failed to load results");
    } finally {
      setResultsLoading(false);
    }
  }

  async function loadReports() {
    try {
      setReportsLoading(true);
      setError("");
      const data = await getCaseReports(caseId, token);
      setReports(data);
    } catch (err) {
      setError(err.message || "Failed to load reports");
    } finally {
      setReportsLoading(false);
    }
  }

  async function handleRunDiagnosis() {
    try {
      setRunLoading(true);
      setError("");
      setSuccess("");

      const data = await runDiagnosisPipeline(caseId, token);
      setResults(data);
      setSuccess("Diagnosis pipeline completed successfully.");

      const refreshedCase = await getCaseById(caseId, token);
      setCaseData(refreshedCase);
    } catch (err) {
      setError(err.message || "Diagnosis failed");
    } finally {
      setRunLoading(false);
    }
  }

  async function handleGenerateReport() {
    try {
      setReportLoading(true);
      setError("");
      setSuccess("");

      await generateCaseReport(caseId, token);
      setSuccess("Report generated successfully.");

      const loadedReports = await getCaseReports(caseId, token);
      setReports(loadedReports);
    } catch (err) {
      setError(err.message || "Report generation failed");
    } finally {
      setReportLoading(false);
    }
  }

  async function handleDownloadReport(reportId) {
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

  if (user?.role !== "patient" && user?.role !== "doctor" && user?.role !== "admin") {
    return (
      <div className="page-container">
        <PageHeader 
          title="Case Details"
          subtitle="Access Restricted"
        />
        <Alert 
          type="warning" 
          message="You do not have permission to view this case."
          dismissible={false}
        />
      </div>
    );
  }

  if (caseLoading) {
    return (
      <div className="page-container">
        <PageHeader 
          title="Case Details"
          subtitle={`Case #${caseId}`}
        />
        <LoadingState message="Loading case information..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader 
        title="Case Details"
        subtitle={caseData ? `Case #${caseData.id} - Diagnosis Results & Reports` : `Case #${caseId}`}
      />

      {error && (
        <Alert 
          type="danger" 
          message={error}
          dismissible={true}
          onDismiss={() => setError("")}
        />
      )}

      {success && (
        <Alert 
          type="success" 
          message={success}
          dismissible={true}
          onDismiss={() => setSuccess("")}
        />
      )}

      {caseData && (
        <>
          {/* Case Information */}
          <Card title="Case Information" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <strong style={{ color: '#666', fontSize: '0.875rem' }}>Case ID</strong>
                <p style={{ marginTop: '0.5rem', fontSize: '1.1rem', color: '#333' }}>{caseData.id}</p>
              </div>
              <div>
                <strong style={{ color: '#666', fontSize: '0.875rem' }}>Status</strong>
                <p style={{ marginTop: '0.5rem' }}>
                  <StatusBadge status={caseData.status} />
                </p>
              </div>
              <div>
                <strong style={{ color: '#666', fontSize: '0.875rem' }}>Modality</strong>
                <p style={{ marginTop: '0.5rem', fontSize: '1.1rem', color: '#333' }}>{caseData.modality || "Fundus"}</p>
              </div>
              <div>
                <strong style={{ color: '#666', fontSize: '0.875rem' }}>Created</strong>
                <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: '#333' }}>
                  {new Date(caseData.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            {caseData.image_path && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <strong style={{ fontSize: '0.875rem', color: '#666' }}>Image Path</strong>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#333', wordBreak: 'break-all' }}>
                  {caseData.image_path}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleRunDiagnosis} 
                disabled={runLoading}
              >
                {runLoading ? "⏳ Analyzing..." : "🔬 Run Diagnosis"}
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={loadResults} 
                disabled={resultsLoading}
              >
                {resultsLoading ? "⏳ Loading..." : "📊 Load Results"}
              </button>

              <button 
                className="btn btn-success" 
                onClick={handleGenerateReport} 
                disabled={reportLoading}
              >
                {reportLoading ? "⏳ Generating..." : "📄 Generate Report"}
              </button>

              <button 
                className="btn btn-info" 
                onClick={loadReports} 
                disabled={reportsLoading}
              >
                {reportsLoading ? "⏳ Loading..." : "📋 Load Reports"}
              </button>
            </div>
          </Card>

          {/* Diagnosis Results */}
          {results && (
            <>
              {/* Predictions */}
              <Card title="AI Predictions" style={{ marginTop: '2rem' }}>
                {results.predictions?.length ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {results.predictions.map((item) => (
                      <Card 
                        key={item.id} 
                        title={item.task_type}
                        style={{ backgroundColor: '#fafafa' }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div>
                            <strong style={{ color: '#666', fontSize: '0.875rem' }}>Model</strong>
                            <p style={{ marginTop: '0.25rem', color: '#333' }}>{item.model_name}</p>
                          </div>
                          <div>
                            <strong style={{ color: '#666', fontSize: '0.875rem' }}>Version</strong>
                            <p style={{ marginTop: '0.25rem', color: '#333' }}>{item.model_version || "N/A"}</p>
                          </div>
                          <div>
                            <strong style={{ color: '#666', fontSize: '0.875rem' }}>Diagnosis</strong>
                            <p style={{ marginTop: '0.25rem', fontSize: '1.1rem', fontWeight: '600', color: '#007bff' }}>
                              {item.label}
                            </p>
                          </div>
                          <div>
                            <strong style={{ color: '#666', fontSize: '0.875rem' }}>Confidence</strong>
                            <div style={{ marginTop: '0.5rem', backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden', height: '24px' }}>
                              <div 
                                style={{ 
                                  width: `${Math.min(parseFloat(item.confidence) * 100, 100)}%`, 
                                  backgroundColor: '#28a745',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#fff',
                                  fontSize: '0.75rem',
                                  fontWeight: '600'
                                }}
                              >
                                {(parseFloat(item.confidence) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#666', textAlign: 'center' }}>No predictions available yet.</p>
                )}
              </Card>

              {/* Grad-CAM Results */}
              {results.gradcam_results?.length > 0 && (
                <Card title="Visual Explanations (Grad-CAM)" style={{ marginTop: '2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {results.gradcam_results.map((item) => (
                      <Card 
                        key={item.id} 
                        title={item.model_name}
                        style={{ backgroundColor: '#fafafa' }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div>
                            <strong style={{ color: '#666', fontSize: '0.875rem' }}>Target Class</strong>
                            <p style={{ marginTop: '0.25rem', color: '#333' }}>{item.target_class || "N/A"}</p>
                          </div>
                          <div>
                            <strong style={{ color: '#666', fontSize: '0.875rem' }}>Overlay Path</strong>
                            <p style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: '#666', wordBreak: 'break-all' }}>
                              {item.overlay_path}
                            </p>
                          </div>
                          {item.heatmap_path && (
                            <div>
                              <strong style={{ color: '#666', fontSize: '0.875rem' }}>Heatmap Path</strong>
                              <p style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: '#666', wordBreak: 'break-all' }}>
                                {item.heatmap_path}
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              )}

              {/* Segmentation Results */}
              {results.segmentation_results?.length > 0 && (
                <Card title="Segmentation Results" style={{ marginTop: '2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {results.segmentation_results.map((item) => (
                      <Card 
                        key={item.id} 
                        title={item.segmentation_type}
                        style={{ backgroundColor: '#fafafa' }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div>
                            <strong style={{ color: '#666', fontSize: '0.875rem' }}>Model</strong>
                            <p style={{ marginTop: '0.25rem', color: '#333' }}>{item.model_name}</p>
                          </div>
                          <div>
                            <strong style={{ color: '#666', fontSize: '0.875rem' }}>Version</strong>
                            <p style={{ marginTop: '0.25rem', color: '#333' }}>{item.model_version || "N/A"}</p>
                          </div>
                          <div>
                            <strong style={{ color: '#666', fontSize: '0.875rem' }}>Mask Path</strong>
                            <p style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: '#666', wordBreak: 'break-all' }}>
                              {item.mask_path}
                            </p>
                          </div>
                          {item.overlay_path && (
                            <div>
                              <strong style={{ color: '#666', fontSize: '0.875rem' }}>Overlay Path</strong>
                              <p style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: '#666', wordBreak: 'break-all' }}>
                                {item.overlay_path}
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Reports Section */}
          <Card title="Generated Reports" style={{ marginTop: '2rem' }}>
            {reports.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
                No reports generated yet. Run diagnosis and generate a report above.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {reports.map((report) => (
                  <Card 
                    key={report.id} 
                    title={`Report #${report.id}`}
                    style={{ backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column' }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <strong style={{ color: '#666', fontSize: '0.875rem' }}>Type</strong>
                        <p style={{ marginTop: '0.25rem', color: '#333' }}>{report.report_type || "Diagnostic"}</p>
                      </div>
                      <div>
                        <strong style={{ color: '#666', fontSize: '0.875rem' }}>Status</strong>
                        <p style={{ marginTop: '0.25rem' }}>
                          <StatusBadge status={report.status} />
                        </p>
                      </div>
                      <div style={{ marginTop: '1rem' }}>
                        <strong style={{ color: '#666', fontSize: '0.875rem' }}>Generated</strong>
                        <p style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: '#333' }}>
                          {new Date(report.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleDownloadReport(report.id)}
                      disabled={downloadingId === report.id}
                      style={{ marginTop: '1rem' }}
                    >
                      {downloadingId === report.id ? "⬇ Downloading..." : "⬇ Download PDF"}
                    </button>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}