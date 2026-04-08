import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AutoGraphOutlinedIcon from "@mui/icons-material/AutoGraphOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import { Card, CardContent, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import MainLayout from "../components/MainLayout";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { getAdminDashboardSummary } from "../api";
import { useAuth } from "../auth/AuthContext";

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getAdminDashboardSummary(token);
        setSummary(data);
      } catch (err) {
        console.error("Failed to load dashboard summary:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSummary();
    }
  }, [token]);

  if (loading) {
    return (
      <MainLayout title="Admin Dashboard">
        <PageHeader
          eyebrow="Admin"
          title="System dashboard"
          subtitle="High-level operational visibility for users, cases, models, and chatbot usage."
        />
        <Stack alignItems="center" py={8}>
          <CircularProgress />
        </Stack>
      </MainLayout>
    );
  }
  return (
    <MainLayout title="Admin Dashboard">
      <PageHeader
        eyebrow="Admin"
        title="System dashboard"
        subtitle="High-level operational visibility for users, cases, models, and chatbot usage."
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <StatCard
            title="Registered users"
            value={summary?.total_users || "0"}
            subtitle="Across patient, doctor, and admin roles"
            icon={<PeopleOutlineIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <StatCard
            title="Cases processed"
            value={summary?.total_cases || "0"}
            subtitle="Completed and pending diagnosis"
            icon={<AssignmentOutlinedIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <StatCard
            title="Active models"
            value={summary?.total_models || "0"}
            subtitle="Classification and segmentation models"
            icon={<AutoGraphOutlinedIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <StatCard
            title="Chat sessions"
            value={summary?.total_chat_sessions || "0"}
            subtitle="Assistant interactions across users"
            icon={<ForumOutlinedIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Admin focus
              </Typography>

              <Stack spacing={1.25}>
                <Typography color="text.secondary">
                  • Confirm user and profile consistency before demo runs.
                </Typography>
                <Typography color="text.secondary">
                  • Verify model registry records and default settings availability.
                </Typography>
                <Typography color="text.secondary">
                  • Keep reports, Grad-CAM, and segmentation review visually clean.
                </Typography>
                <Typography color="text.secondary">
                  • Standardize system messages and feedback across the platform.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                System health
              </Typography>

              <Stack spacing={1.5}>
                <Chip label="API connected" color="success" variant="outlined" sx={{ width: "fit-content" }} />
                <Chip label={`${summary?.total_models || 0} models registered`} color="primary" variant="outlined" sx={{ width: "fit-content" }} />
                <Chip label="Reports enabled" color="success" variant="outlined" sx={{ width: "fit-content" }} />
                <Chip label="Chatbot available" color="primary" variant="outlined" sx={{ width: "fit-content" }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </MainLayout>
  );
}