import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { resetPassword } from "../api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!token) {
      setError("Reset token is missing.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data = await resetPassword(token, newPassword);
      setSuccess(data.message || "Password reset successfully.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>Reset Password</h2>

      {!token && <p style={{ color: "crimson" }}>Reset token is missing.</p>}

      {token && (
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}

      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {success && (
        <div style={{ marginTop: 16 }}>
          <Link to="/login">Go to Login</Link>
        </div>
      )}
    </div>
  );
}