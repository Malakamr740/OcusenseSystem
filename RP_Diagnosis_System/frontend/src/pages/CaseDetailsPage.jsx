import { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  getCaseById,
  getCaseResults,
  runDiagnosisPipeline,
  generateCaseReport,
  getCaseReports,
  downloadReportFile,
} from "../api";
import { useAuth } from "../auth/AuthContext";

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
  const [downloadLoadingId, setDownloadLoadingId] = useState(null);

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
        setError(err.message);
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
      setError(err.message);
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
      setError(err.message);
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
      setError(err.message);
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
      setError(err.message);
    } finally {
      setReportLoading(false);
    }
  }

  async function handleDownloadReport(reportId) {
    try {
      setError("");
      setDownloadLoadingId(reportId);

      const blob = await downloadReportFile(reportId, token);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report_${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloadLoadingId(null);
    }
  }

  if (user?.role !== "patient" && user?.role !== "doctor" && user?.role !== "admin") {
    return <p>You are not allowed to view this page.</p>;
  }

  return (
    <div>
      <h2>Case Details</h2>

      {caseLoading && <p>Loading case...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {caseData && (
        <div
          style={{
            border: "1px solid #ddd",
            padding: 12,
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          <p><strong>Case ID:</strong> {caseData.id}</p>
          <p><strong>Status:</strong> {caseData.status}</p>
          <p><strong>Modality:</strong> {caseData.modality}</p>
          <p><strong>Image Path:</strong> {caseData.image_path}</p>
          <p><strong>Created At:</strong> {caseData.created_at}</p>

          <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
            <button onClick={handleRunDiagnosis} disabled={runLoading}>
              {runLoading ? "Running..." : "Run Diagnosis"}
            </button>

            <button onClick={loadResults} disabled={resultsLoading}>
              {resultsLoading ? "Loading..." : "Load Results"}
            </button>

            <button onClick={handleGenerateReport} disabled={reportLoading}>
              {reportLoading ? "Generating..." : "Generate Report"}
            </button>

            <button onClick={loadReports} disabled={reportsLoading}>
              {reportsLoading ? "Loading..." : "Load Reports"}
            </button>
          </div>
        </div>
      )}

      {results && (
        <div style={{ display: "grid", gap: 20, marginBottom: 24 }}>
          <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
            <h3>Predictions</h3>

            {results.predictions?.length ? (
              results.predictions.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: "1px solid #eee",
                    padding: 10,
                    borderRadius: 6,
                    marginBottom: 10,
                  }}
                >
                  <p><strong>Task:</strong> {item.task_type}</p>
                  <p><strong>Model:</strong> {item.model_name}</p>
                  <p><strong>Version:</strong> {item.model_version || "-"}</p>
                  <p><strong>Label:</strong> {item.label}</p>
                  <p><strong>Confidence:</strong> {item.confidence}</p>
                </div>
              ))
            ) : (
              <p>No predictions found.</p>
            )}
          </div>

          <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
            <h3>Grad-CAM Results</h3>

            {results.gradcam_results?.length ? (
              results.gradcam_results.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: "1px solid #eee",
                    padding: 10,
                    borderRadius: 6,
                    marginBottom: 10,
                  }}
                >
                  <p><strong>Model:</strong> {item.model_name}</p>
                  <p><strong>Target Class:</strong> {item.target_class || "-"}</p>
                  <p><strong>Overlay Path:</strong> {item.overlay_path}</p>
                  <p><strong>Heatmap Path:</strong> {item.heatmap_path || "-"}</p>
                </div>
              ))
            ) : (
              <p>No Grad-CAM results found.</p>
            )}
          </div>

          <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
            <h3>Segmentation Results</h3>

            {results.segmentation_results?.length ? (
              results.segmentation_results.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: "1px solid #eee",
                    padding: 10,
                    borderRadius: 6,
                    marginBottom: 10,
                  }}
                >
                  <p><strong>Type:</strong> {item.segmentation_type}</p>
                  <p><strong>Model:</strong> {item.model_name}</p>
                  <p><strong>Version:</strong> {item.model_version || "-"}</p>
                  <p><strong>Mask Path:</strong> {item.mask_path}</p>
                  <p><strong>Overlay Path:</strong> {item.overlay_path || "-"}</p>
                </div>
              ))
            ) : (
              <p>No segmentation results found.</p>
            )}
          </div>
        </div>
      )}

      <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
        <h3>Reports</h3>

        {reports.length === 0 ? (
          <p>No reports loaded yet.</p>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              style={{
                border: "1px solid #eee",
                padding: 10,
                borderRadius: 6,
                marginBottom: 10,
              }}
            >
              <p><strong>Report ID:</strong> {report.id}</p>
              <p><strong>Type:</strong> {report.report_type}</p>
              <p><strong>Status:</strong> {report.status}</p>
              <p><strong>Created At:</strong> {report.created_at}</p>

              <button
                onClick={() => handleDownloadReport(report.id)}
                disabled={downloadLoadingId === report.id}
              >
                {downloadLoadingId === report.id ? "Downloading..." : "Download Report"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}