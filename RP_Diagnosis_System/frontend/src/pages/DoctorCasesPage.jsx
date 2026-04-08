import { useEffect, useState } from "react";
import { Button, Card, CardContent, CircularProgress, Stack, Typography, Alert } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { getAllCases } from "../api";
import { useAuth } from "../auth/AuthContext";

export default function DoctorCasesPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data = await getAllCases(token);
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
      <MainLayout title="Doctor Cases">
        <PageHeader
          eyebrow="Doctor"
          title="All cases"
          subtitle="Review patient cases, diagnosis states, and outcomes from a cleaner clinical overview."
        />
        <Stack alignItems="center" py={8}>
          <CircularProgress />
        </Stack>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Doctor Cases">
      <PageHeader
        eyebrow="Doctor"
        title="All cases"
        subtitle="Review patient cases, diagnosis states, and outcomes from a cleaner clinical overview."
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {cases.length === 0 && !error && (
        <Alert severity="info">No cases available at this time.</Alert>
      )}

      <Grid container spacing={3}>
        {cases.map((item) => (
          <Grid key={item.id} size={{ xs: 12, md: 6, lg: 4 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{item.id}</Typography>
                    <StatusBadge status={item.status} />
                  </Stack>

                  <Typography color="text.secondary">
                    Patient: {item.patient_profile_id}
                  </Typography>
                  <Typography>{item.status}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last updated: {new Date(item.updated_at).toLocaleDateString()}
                  </Typography>

                  <Button variant="outlined" onClick={() => navigate(`/patient/cases/${item.id}`)}>Review case</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </MainLayout>
  );
}