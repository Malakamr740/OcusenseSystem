import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { getCaseById, runDiagnosisPipeline, generateCaseReport, downloadReportFile, getCaseResults, getStaticFileUrl } from "../api";
import { useAuth } from "../auth/AuthContext";

const previewStyle = {
  width: "100%",
  minHeight: 220,
  borderRadius: 18,
  background: "linear-gradient(135deg, #EEF4FF 0%, #E0EAFF 100%)",
  border: "1px solid #D0D5DD",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};

export default function CaseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [caseData, setCaseData] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatedReport, setGeneratedReport] = useState(null);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const data = await getCaseById(id, token);
        setCaseData(data);
        if (data.status === "done") {
          try {
            const res = await getCaseResults(id, token);
            setResults(res);
          } catch (resErr) {
            // Results might not be available, that's ok
            setResults(null);
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load case details");
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchCase();
    }
  }, [token, id]);

  const handleRunDiagnosis = async () => {
    setRunning(true);
    setSuccess("");
    try {
      await runDiagnosisPipeline(id, token);
      setError("");
      const updated = await getCaseById(id, token);
      setCaseData(updated);
      if (updated.status === "done") {
        try {
          const res = await getCaseResults(id, token);
          setResults(res);
        } catch (resErr) {
          setResults(null);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to run diagnosis");
    } finally {
      setRunning(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await generateCaseReport(id, token);
      setError("");
      setSuccess("Report generated successfully.");
      setGeneratedReport(response.report);
    } catch (err) {
      setError(err.message || "Failed to generate report");
      setSuccess("");
      setGeneratedReport(null);
    }
  };

  const handleDownloadReport = async (reportId) => {
    try {
      const blob = await downloadReportFile(reportId, token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      a.click();
    } catch (err) {
      setError(err.message || "Failed to download report");
    }
  };

  if (loading) {
    return (
      <MainLayout title="Case Details">
        <PageHeader
          eyebrow={user?.role === "doctor" ? "Doctor" : user?.role === "admin" ? "Admin" : "Patient"}
          title="Case details"
          subtitle="Prediction, Grad-CAM, segmentation, and reporting are grouped into one clearer clinical review page."
        />
        <Stack alignItems="center" py={8}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading case details...</Typography>
        </Stack>
      </MainLayout>
    );
  }

  if (!caseData) {
    return (
      <MainLayout title="Case Details">
        <PageHeader
          eyebrow={user?.role === "doctor" ? "Doctor" : user?.role === "admin" ? "Admin" : "Patient"}
          title="Case details"
          subtitle="Prediction, Grad-CAM, segmentation, and reporting are grouped into one clearer clinical review page."
        />
        <Alert severity="error">Case not found or access denied.</Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Case Details">
      <PageHeader
        eyebrow={user?.role === "doctor" ? "Doctor" : user?.role === "admin" ? "Admin" : "Patient"}
        title="Case details"
        subtitle="Prediction, Grad-CAM, segmentation, and reporting are grouped into one clearer clinical review page."
        actions={
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              variant="contained"
              startIcon={running ? <CircularProgress size={20} /> : <PlayArrowOutlinedIcon />}
              onClick={handleRunDiagnosis}
              disabled={running}
            >
              {running ? "Running..." : "Run diagnosis"}
            </Button>
            <Button variant="outlined" startIcon={<DownloadOutlinedIcon />} onClick={handleGenerateReport} disabled={caseData?.status !== "done"}>
              Generate report
            </Button>
          </Stack>
        }
      />

      {running ? (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography sx={{ mb: 1.5 }}>Diagnosis in progress...</Typography>
            <LinearProgress />
          </CardContent>
        </Card>
      ) : null}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {generatedReport && (
        <Button
          variant="contained"
          sx={{ mb: 3 }}
          onClick={() => handleDownloadReport(generatedReport.id)}
          startIcon={<DownloadOutlinedIcon />}
        >
          Download generated report
        </Button>
      )}

      {caseData.status === "done" && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Latest result is ready for review.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Case summary
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography color="text.secondary">Status</Typography>
                  <StatusBadge status={caseData.status} />
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Modality</Typography>
                  <Typography fontWeight={700}>{caseData.modality}</Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Created</Typography>
                  <Typography fontWeight={700}>{new Date(caseData.created_at).toLocaleDateString()}</Typography>
                </Stack>

                <Divider />

                <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  This case shows the structured information from the backend. Run diagnosis to generate predictions.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Grid container spacing={3}>
            {[
              { title: "Original fundus image", path: caseData.image_path, caption: "Source image used for inference." },
              { title: "Grad-CAM", path: results?.gradcam_results?.[0]?.overlay_path, caption: "Model attention over clinically relevant retinal regions." },
              { title: "Vessel mask", path: results?.segmentation_results?.[0]?.mask_path, caption: "Supportive vessel segmentation mask." },
              { title: "Overlay preview", path: results?.segmentation_results?.[0]?.overlay_path || results?.gradcam_results?.[0]?.overlay_path, caption: "Segmented output overlaid on the source image." },
            ].map((item) => (
              <Grid key={item.title} size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {item.title}
                    </Typography>
                    {item.path ? (
                      <Box sx={previewStyle}>
                        <img
                          src={getStaticFileUrl(item.path)}
                          alt={item.title}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 18 }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </Box>
                    ) : (
                      <Box sx={{ ...previewStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">No image available</Typography>
                      </Box>
                    )}
                    <Typography color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.7 }}>
                      {item.caption}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </MainLayout>
  );
}