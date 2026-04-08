import { useEffect, useState } from "react";
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
  Typography,
} from "@mui/material";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "../api";
import { useAuth } from "../auth/AuthContext";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = searchParams.get("token") || "";

  const [verifying, setVerifying] = useState(!!token);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        await verifyEmail(token);
        setVerified(true);
        setError("");
      } catch (err) {
        setError(err.message || "Email verification failed. The link may have expired.");
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [token]);

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2, py: 5 }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: "column", lg: "row" }} spacing={4} alignItems="stretch">
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", pr: { lg: 4 } }}>
            <Box>
              <Chip
                label="Email confirmation"
                color="primary"
                variant="outlined"
                sx={{ mb: 2, bgcolor: "white" }}
              />
              <Typography variant="h3" sx={{ mb: 2, fontSize: { xs: 36, md: 56 } }}>
                Verify email
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 640, lineHeight: 1.8, mb: 3 }}
              >
                Confirm your email before continuing to protected pages.
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <MonitorHeartOutlinedIcon color="primary" />
                <Typography color="text.secondary">
                  This page can later read the backend verification token from the URL.
                </Typography>
              </Stack>
            </Box>
          </Box>

          <Card sx={{ flex: 1, maxWidth: 560, width: "100%", ml: { lg: "auto" } }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Typography variant="h4" sx={{ mb: 1 }}>
                Email verification
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
                Your email must be verified before accessing secure medical pages.
              </Typography>

              <Stack spacing={2.5}>
                {verifying && (
                  <Stack direction="row" alignItems="center" gap={2}>
                    <CircularProgress size={24} />
                    <Typography>Verifying your email...</Typography>
                  </Stack>
                )}

                {!verifying && verified && (
                  <Alert severity="success">Your email has been verified successfully.</Alert>
                )}

                {!verifying && !verified && error && (
                  <Alert severity="error">{error}</Alert>
                )}

                {!verifying && (
                  <Stack direction="row" spacing={1.5}>
                    <Button component={Link} to="/login" variant="outlined" fullWidth>
                      Return to sign in
                    </Button>
                    {user && (
                      <Button onClick={() => navigate("/")} variant="contained" fullWidth>
                        Return to home
                      </Button>
                    )}
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}