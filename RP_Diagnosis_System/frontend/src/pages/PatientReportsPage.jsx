import { useEffect, useState } from "react";
import { Button, Card, CardContent, CircularProgress, Stack, Typography, Alert } from "@mui/material";
import Grid from "@mui/material/Grid";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import MainLayout from "../components/MainLayout";
import PageHeader from "../components/PageHeader";
import { getMyCases, getCaseReports, downloadReportFile } from "../api";
import { useAuth } from "../auth/AuthContext";

export default function PatientReportsPage() {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const cases = await getMyCases(token);
        const allReports = [];
        
        for (const caseItem of cases) {
          try {
            const caseReports = await getCaseReports(caseItem.id, token);
            allReports.push(...caseReports);
          } catch (err) {
            // Case might not have reports yet, continue
          }
        }
        
        setReports(allReports);
      } catch (err) {
        setError(err.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchReports();
    }
  }, [token]);

  const handleDownload = async (reportId) => {
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

  const handleView = async (reportId) => {
    try {
      const blob = await downloadReportFile(reportId, token);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      setError(err.message || "Failed to view report");
    }
  };

  if (loading) {
    return (
      <MainLayout title="Patient Reports">
        <PageHeader
          eyebrow="Patient"
          title="My reports"
          subtitle="Access your generated diagnosis reports and clinical summaries."
        />
        <Stack alignItems="center" py={8}>
          <CircularProgress />
        </Stack>
      </MainLayout>
    );
  }
  return (
    <MainLayout title="Patient Reports">
      <PageHeader
        eyebrow="Patient"
        title="My reports"
        subtitle="Access your generated diagnosis reports and clinical summaries."
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {reports.length === 0 && !error && (
        <Alert severity="info">No reports available yet. Upload a case and run diagnosis to generate reports.</Alert>
      )}

      <Grid container spacing={3}>
        {reports.map((report) => (
          <Grid key={report.id} size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <DescriptionOutlinedIcon color="primary" />
                    <Typography variant="h6">{report.id}</Typography>
                  </Stack>

                  <Typography color="text.secondary">
                    Case: {report.case_id} • Created: {new Date(report.created_at).toLocaleDateString()}
                  </Typography>

                  <Typography sx={{ lineHeight: 1.7 }}>Report generated successfully.</Typography>

                  <Stack direction="row" spacing={1.5}>
                    <Button variant="contained" onClick={() => handleView(report.id)}>Open report</Button>
                    <Button variant="outlined" onClick={() => handleDownload(report.id)}>
                      Download PDF
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </MainLayout>
  );
}
