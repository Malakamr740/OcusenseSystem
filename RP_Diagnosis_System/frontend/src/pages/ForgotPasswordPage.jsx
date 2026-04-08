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
import { Link } from "react-router-dom";
import { forgotPassword } from "../api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to send reset link. Please try again.");
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
                label="Account recovery"
                color="primary"
                variant="outlined"
                sx={{ mb: 2, bgcolor: "white" }}
              />
              <Typography variant="h3" sx={{ mb: 2, fontSize: { xs: 36, md: 56 } }}>
                Reset password
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 640, lineHeight: 1.8, mb: 3 }}
              >
                Enter your email to receive a secure reset link.
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <MonitorHeartOutlinedIcon color="primary" />
                <Typography color="text.secondary">
                  Password reset should connect to your FastAPI email flow later.
                </Typography>
              </Stack>
            </Box>
          </Box>

          <Card sx={{ flex: 1, maxWidth: 560, width: "100%", ml: { lg: "auto" } }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Typography variant="h4" sx={{ mb: 1 }}>
                Forgot your password?
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
                We will send a reset link to the registered email address.
              </Typography>

              <Stack spacing={2.5}>
                {sent ? <Alert severity="success">Password reset link sent successfully.</Alert> : null}
                {error ? <Alert severity="error">{error}</Alert> : null}

                <TextField
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />

                <Typography variant="body2" color="text.secondary">
                  Use the same email you registered with on the platform.
                </Typography>

                <Button variant="contained" onClick={handleSubmit} disabled={loading || sent}>
                  {loading ? <CircularProgress size={20} /> : "Send reset link"}
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