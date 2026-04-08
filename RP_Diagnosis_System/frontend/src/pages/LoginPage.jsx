import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { loginUser, getMe } from "../api";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser({
        email: form.email,
        password: form.password,
      });

      if (response.access_token) {
        login(response.access_token);

        const user = await getMe(response.access_token);

        if (user.role === "admin") navigate("/admin/dashboard");
        else if (user.role === "doctor") navigate("/doctor/cases");
        else navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
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
                label="Retinal medical AI platform"
                color="primary"
                variant="outlined"
                sx={{ mb: 2, bgcolor: "white" }}
              />
              <Typography variant="h3" sx={{ mb: 2, fontSize: { xs: 36, md: 56 } }}>
                OCUSENSE
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 640, lineHeight: 1.8, mb: 3 }}
              >
                A clean, professional clinical interface for Retinitis Pigmentosa diagnosis,
                explainability review, and report generation.
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <MonitorHeartOutlinedIcon color="primary" />
                <Typography color="text.secondary">
                  Designed for patients, clinicians, and administrators.
                </Typography>
              </Stack>
            </Box>
          </Box>

          <Card sx={{ flex: 1, maxWidth: 560, width: "100%", ml: { lg: "auto" } }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Typography variant="h4" sx={{ mb: 1 }}>
                Welcome back
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
                Sign in to continue to your secure retinal diagnosis workspace.
              </Typography>

              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  {error ? <Alert severity="error">{error}</Alert> : null}

                  <TextField
                    label="Email address"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MailOutlineIcon color="disabled" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    label="Password"
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon color="disabled" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    endIcon={loading ? <CircularProgress size={20} /> : <ArrowForwardRoundedIcon />}
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>

                  <Stack direction="row" justifyContent="space-between" flexWrap="wrap" gap={1}>
                    <Typography color="text.secondary">
                      <Link to="/forgot-password">Forgot password?</Link>
                    </Typography>
                    <Typography color="text.secondary">
                      <Link to="/verify-email">Verify email</Link>
                    </Typography>
                  </Stack>

                  <Divider />

                  <Typography color="text.secondary">
                    No account yet? <Link to="/register">Create one</Link>
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