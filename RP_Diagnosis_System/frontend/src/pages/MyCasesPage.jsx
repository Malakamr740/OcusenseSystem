import { useEffect, useState } from "react";
import { Button, Card, CardContent, CircularProgress, Stack, Typography, Alert } from "@mui/material";
import Grid from "@mui/material/Grid";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Link } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { getMyCases } from "../api";
import { useAuth } from "../auth/AuthContext";

export default function MyCasesPage() {
  const { token } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data = await getMyCases(token);
        setCases(data);
      } catch (err) {
        setError(err.message || "Failed to load cases");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCases();
    }
  }, [token]);

  if (loading) {
    return (
      <MainLayout title="My Cases">
        <PageHeader
          eyebrow="Patient"
          title="My cases"
          subtitle="Track uploaded retinal cases, diagnosis status, and report availability from one clean page."
        />
        <Stack alignItems="center" py={8}>
          <CircularProgress />
        </Stack>
      </MainLayout>
    );
  }
  return (
    <MainLayout title="My Cases">
      <PageHeader
        eyebrow="Patient"
        title="My cases"
        subtitle="Track uploaded retinal cases, diagnosis status, and report availability from one clean page."
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {cases.length === 0 && !error && (
        <Alert severity="info">No cases uploaded yet. Start by uploading a new case.</Alert>
      )}

      <Grid container spacing={3}>
        {cases.map((item) => (
          <Grid key={item.id} size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{item.patient_profile_id}</Typography>
                    <StatusBadge status={item.status} />
                  </Stack>

                  <Typography color="text.secondary">
                    Created: {new Date(item.created_at).toLocaleDateString()}
                  </Typography>
                  <Typography>{item.status}</Typography>

                  <Button
                    component={Link}
                    to={`/patient/cases/${item.id}`}
                    variant="outlined"
                    startIcon={<VisibilityOutlinedIcon />}
                  >
                    Open case
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </MainLayout>
  );
}