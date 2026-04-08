import { useEffect, useState } from "react";
import { Alert, Button, Card, CardContent, CircularProgress, Stack, TextField } from "@mui/material";
import Grid from "@mui/material/Grid";
import MainLayout from "../components/MainLayout";
import PageHeader from "../components/PageHeader";
import { getAppSettings, updateAppSettings } from "../api";
import { useAuth } from "../auth/AuthContext";

export default function AdminSettingsPage() {
  const { token } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    app_name: "OCUSENSE",
    hospital_name: "Retinal Care Center",
    report_footer:
      "AI-generated result for decision support only. Final judgment remains with a qualified clinician.",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getAppSettings(token);
        setSettings(data);
      } catch (err) {
        setError(err.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSettings();
    }
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      await updateAppSettings(settings, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Admin Settings">
        <PageHeader
          eyebrow="Admin"
          title="System settings"
          subtitle="Manage application labels, institution metadata, and report disclaimers."
        />
        <Stack alignItems="center" py={8}>
          <CircularProgress />
        </Stack>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Admin Settings">
      <PageHeader
        eyebrow="Admin"
        title="System settings"
        subtitle="Manage application labels, institution metadata, and report disclaimers."
      />

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            {saved ? <Alert severity="success">Settings saved successfully.</Alert> : null}
            {error ? <Alert severity="error">{error}</Alert> : null}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Application name"
                  value={settings.app_name || ""}
                  onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Hospital / institution name"
                  value={settings.hospital_name || ""}
                  onChange={(e) => setSettings({ ...settings, hospital_name: e.target.value })}
                />
              </Grid>
            </Grid>

            <TextField
              multiline
              minRows={4}
              label="Report footer / disclaimer"
              value={settings.report_footer || ""}
              onChange={(e) => setSettings({ ...settings, report_footer: e.target.value })}
            />

            <Button variant="contained" onClick={handleSave} disabled={saving}>
              {saving ? <CircularProgress size={20} /> : "Save settings"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </MainLayout>
  );
}