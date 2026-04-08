import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import MainLayout from "../components/MainLayout";
import PageHeader from "../components/PageHeader";
import { uploadCase } from "../api";
import { useAuth } from "../auth/AuthContext";

export default function UploadCasePage() {
  const { token } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    patient_id: "RP-2026-001",
    age: "",
    sex: "",
    notes: "",
    image: null,
  });

  const readiness = useMemo(() => {
    let count = 0;
    if (form.patient_id) count += 1;
    if (form.age) count += 1;
    if (form.sex) count += 1;
    if (form.image) count += 1;
    return `${count}/4 required fields completed`;
  }, [form]);

  const handleSubmit = async () => {
    setError("");

    if (!form.image) {
      setError("Please select an image to upload.");
      return;
    }

    setLoading(true);

    try {
      const metadata = {
        patient_id: form.patient_id,
        age: form.age,
        sex: form.sex,
        notes: form.notes,
      };
      const result = await uploadCase(form.image, metadata, token);
      setSubmitted(true);
      setForm({
        patient_id: "RP-2026-001",
        age: "",
        sex: "",
        notes: "",
        image: null,
      });
    } catch (err) {
      setError(err.message || "Case upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Upload Case">
      <PageHeader
        eyebrow="Patient"
        title="Create new case"
        subtitle="Upload a fundus image, add structured metadata, and prepare the case for diagnosis."
        meta="Use anonymized identifiers when possible for testing and demonstrations."
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                {submitted ? <Alert severity="success">Case created successfully.</Alert> : null}
                {error ? <Alert severity="error">{error}</Alert> : null}

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                >
                  <Typography variant="h6">Case information</Typography>
                  <Chip label={readiness} color="primary" variant="outlined" />
                </Stack>

                <TextField
                  label="Patient identifier"
                  value={form.patient_id}
                  onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Age"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      select
                      label="Sex"
                      value={form.sex}
                      onChange={(e) => setForm({ ...form, sex: e.target.value })}
                    >
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="male">Male</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>

                <TextField
                  label="Clinical notes"
                  multiline
                  minRows={5}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />

                <Divider />

                <Stack spacing={1.5}>
                  <Button component="label" variant="outlined" startIcon={<CloudUploadOutlinedIcon />}>
                    Upload fundus image
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
                    />
                  </Button>

                  {form.image ? (
                    <Alert severity="info">Selected file: {form.image.name}</Alert>
                  ) : null}
                </Stack>

                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleOutlineRoundedIcon />}
                  onClick={handleSubmit}
                  disabled={loading || !form.image}
                >
                  {loading ? "Uploading..." : "Save case"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 1.5 }}>
                  Before you submit
                </Typography>
                <Box component="ul" sx={{ pl: 2.5, color: "text.secondary", lineHeight: 2, m: 0 }}>
                  <li>Upload a clear retinal fundus image.</li>
                  <li>Use anonymized patient identifiers.</li>
                  <li>Review notes before running diagnosis.</li>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Clinical reminder
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  This interface supports structured case preparation, but the final judgment should
                  remain with a qualified clinician.
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </MainLayout>
  );
}