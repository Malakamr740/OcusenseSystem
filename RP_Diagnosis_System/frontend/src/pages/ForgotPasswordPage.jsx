import { useState } from "react";
import { forgotPassword } from "../api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data = await forgotPassword(email);
      setSuccess(
        data.message || "If the account exists, a password reset email has been sent."
      );
      setEmail("");
    } catch (err) {
      setError(err.message || "Failed to request password reset");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>Forgot Password</h2>
      <p>Enter your email address to receive a password reset link.</p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}