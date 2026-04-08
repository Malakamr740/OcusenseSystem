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
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [form, setForm] = useState({
    password: "",
    confirm: "",
  });

  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, form.password);
      setDone(true);
    } catch (err) {
      setError(err.message || "Password reset failed. Please try again.");
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
                label="Set a new password"
                color="primary"
                variant="outlined"
                sx={{ mb: 2, bgcolor: "white" }}
              />
              <Typography variant="h3" sx={{ mb: 2, fontSize: { xs: 36, md: 56 } }}>
                New password
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 640, lineHeight: 1.8, mb: 3 }}
              >
                Choose a new secure password for your account.
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <MonitorHeartOutlinedIcon color="primary" />
                <Typography color="text.secondary">
                  This page should later consume the reset token from your backend flow.
                </Typography>
              </Stack>
            </Box>
          </Box>

          <Card sx={{ flex: 1, maxWidth: 560, width: "100%", ml: { lg: "auto" } }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Typography variant="h4" sx={{ mb: 1 }}>
                Update password
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
                Enter and confirm your new password.
              </Typography>

              <Stack spacing={2.5}>
                {done ? (
                  <Alert severity="success">
                    Password updated successfully. You can now sign in.
                  </Alert>
                ) : null}
                {error ? <Alert severity="error">{error}</Alert> : null}

                <TextField
                  label="New password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  disabled={loading || done}
                />

                <TextField
                  label="Confirm password"
                  type="password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  disabled={loading || done}
                />

                <Button variant="contained" onClick={handleSubmit} disabled={loading || done}>
                  {loading ? <CircularProgress size={20} /> : "Update password"}
                </Button>

                <Typography color="text.secondary">
                  Back to <Link to="/login">Sign in</Link>
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}