import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { resetPassword } from "../api";
import FormField from "../components/FormField";
import Alert from "../components/Alert";
import Card from "../components/Card";

/**
 * Professional ResetPasswordPage
 * 
 * Improves UX by:
 * - FormField components for password inputs
 * - Professional Alert messages
 * - Password matching validation
 * - Clear success state with login link
 */
export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});

    if (!token) {
      setError("Reset token is missing or invalid.");
      return;
    }

    if (newPassword.length < 8) {
      setErrors({ password: "Password must be at least 8 characters" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirm: "Passwords do not match" });
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data = await resetPassword(token, newPassword);
      setSuccess(data.message || "Password reset successfully! You can now log in with your new password.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container auth-page">
      <Card 
        title="Reset Your Password" 
        subtitle="Enter your new password below"
      >
        {!token && (
          <Alert 
            type="danger" 
            message="Reset token is missing or invalid. Please request a new password reset link."
            dismissible={false}
          />
        )}

        {error && (
          <Alert 
            type="danger" 
            message={error}
            onClose={() => setError("")}
            dismissible={true}
          />
        )}

        {success && (
          <div>
            <Alert 
              type="success" 
              message={success}
              dismissible={false}
            />
            <Link 
              to="/login" 
              className="btn btn-primary w-100" 
              style={{ marginTop: '1.5rem', textDecoration: 'none', display: 'block', textAlign: 'center' }}
            >
              Go to Login
            </Link>
          </div>
        )}

        {token && !success && (
          <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
            <FormField
              id="newPassword"
              label="New Password"
              type="password"
              placeholder="Enter at least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.password}
              required
            />

            <FormField
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirm}
              required
            />

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100"
              disabled={loading}
              style={{ marginTop: '2rem' }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}