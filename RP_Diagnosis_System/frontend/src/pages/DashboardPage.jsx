import Grid from "@mui/material/Grid";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AutoGraphOutlinedIcon from "@mui/icons-material/AutoGraphOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import { Card, CardContent, Stack, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { useAuth } from "../auth/AuthContext";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const subtitle =
    user?.role === "doctor"
      ? "Review retinal cases, open reports, and use the assistant from one clean workspace."
      : user?.role === "admin"
      ? "Monitor platform activity, models, and user operations from the admin workspace."
      : "Manage your uploaded cases, diagnosis results, reports, and assistant access from one place.";

  return (
    <MainLayout title="Dashboard">
      <PageHeader
        eyebrow="Overview"
        title="Workspace dashboard"
        subtitle={subtitle}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <StatCard
            title="Cases"
            value="12"
            subtitle="Uploaded and tracked in the system"
            icon={<AssignmentOutlinedIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <StatCard
            title="Predictions"
            value="9"
            subtitle="Completed diagnosis runs"
            icon={<AutoGraphOutlinedIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <StatCard
            title="Reports"
            value="7"
            subtitle="Generated PDF summaries"
            icon={<DescriptionOutlinedIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <StatCard
            title="Assistant sessions"
            value="18"
            subtitle="Chatbot interactions"
            icon={<ForumOutlinedIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Quick actions
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} flexWrap="wrap">
                {user?.role === "patient" && (
                  <>
                    <Button variant="contained" onClick={() => navigate("/patient/upload")}>
                      Upload new case
                    </Button>
                    <Button variant="outlined" onClick={() => navigate("/patient/cases")}>
                      View my cases
                    </Button>
                  </>
                )}

                {user?.role === "doctor" && (
                  <>
                    <Button variant="contained" onClick={() => navigate("/doctor/cases")}>
                      Review cases
                    </Button>
                    <Button variant="outlined" onClick={() => navigate("/doctor/reports")}>
                      Open reports
                    </Button>
                  </>
                )}

                {user?.role === "admin" && (
                  <>
                    <Button variant="contained" onClick={() => navigate("/admin/dashboard")}>
                      Open admin dashboard
                    </Button>
                    <Button variant="outlined" onClick={() => navigate("/admin/users")}>
                      Manage users
                    </Button>
                    <Button variant="outlined" onClick={() => navigate("/patient/upload")}>
                      Upload case
                    </Button>
                    <Button variant="outlined" onClick={() => navigate("/patient/cases")}>
                      View patient cases
                    </Button>
                    <Button variant="outlined" onClick={() => navigate("/doctor/cases")}>
                      Review all cases
                    </Button>
                    <Button variant="outlined" onClick={() => navigate("/doctor/reports")}>
                      Open reports
                    </Button>
                  </>
                )}

                <Button variant="outlined" onClick={() => navigate("/chatbot")}>
                  Open chatbot
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                Notes
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                This dashboard is designed to give each role a clear starting point with less visual clutter
                and faster access to the main clinical and administrative workflows.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </MainLayout>
  );
}