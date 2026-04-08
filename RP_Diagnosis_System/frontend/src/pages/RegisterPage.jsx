import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import { Link } from "react-router-dom";
import { registerUser } from "../api";

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "patient",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordHint = useMemo(() => {
    if (!form.password) return "Use at least 8 characters for a stronger account password.";
    return form.password.length >= 8
      ? "Password strength looks acceptable for demo use."
      : "Password is still short.";
  }, [form.password]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess("");
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      setSuccess("Account created successfully. Please verify your email to continue.");
      setForm({
        full_name: "",
        email: "",
        password: "",
        confirm_password: "",
        role: "patient",
      });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2, py: 5 }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: "column", lg: "row" }} spacing={4} alignItems="stretch">
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", pr: { lg: 4 } }}>
            <Box>
              <Chip
                label="Secure registration"
                color="primary"
                variant="outlined"
                sx={{ mb: 2, bgcolor: "white" }}
              />
              <Typography variant="h3" sx={{ mb: 2, fontSize: { xs: 36, md: 56 } }}>
                Create account
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 640, lineHeight: 1.8, mb: 3 }}
              >
                Register securely, verify your email, and begin using the RP diagnosis platform.
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <MonitorHeartOutlinedIcon color="primary" />
                <Typography color="text.secondary">
                  Role-based access for patients and doctors.
                </Typography>
              </Stack>
            </Box>
          </Box>

          <Card sx={{ flex: 1, maxWidth: 560, width: "100%", ml: { lg: "auto" } }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Typography variant="h4" sx={{ mb: 1 }}>
                Register
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
                Create your account to access the medical AI workspace.
              </Typography>

              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  {success ? <Alert severity="success">{success}</Alert> : null}
                  {error ? <Alert severity="error">{error}</Alert> : null}

                  <TextField
                    label="Full name"
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  />

                  <TextField
                    label="Email address"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />

                  <TextField
                    select
                    label="Role"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <MenuItem value="patient">Patient</MenuItem>
                    <MenuItem value="doctor">Doctor</MenuItem>
                  </TextField>

                  <TextField
                    label="Password"
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    helperText={passwordHint}
                  />

                  <TextField
                    label="Confirm password"
                    type="password"
                    required
                    value={form.confirm_password}
                    onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleOutlineRoundedIcon />}
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Create account"}
                  </Button>

                  <Typography color="text.secondary">
                    Already have an account? <Link to="/login">Sign in</Link>
                  </Typography>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}