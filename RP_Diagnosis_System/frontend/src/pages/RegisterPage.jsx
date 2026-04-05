import { useState } from "react";
import { registerUser, resendVerification } from "../api";

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "patient",
    full_name: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setShowResend(false);
    setLoading(true);

    try {
      const data = await registerUser(form);
      setSuccess(data.message || "Registration successful. Check your email.");
      setForm({
        email: "",
        password: "",
        role: "patient",
        full_name: "",
      });
    } catch (err) {
      const message = err.message || "Registration failed";
      setError(message);

      if (message.toLowerCase().includes("pending verification")) {
        setShowResend(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setSuccess("");
    setResendLoading(true);

    try {
      const data = await resendVerification(form.email);
      setSuccess(data.message || "Verification email sent again.");
    } catch (err) {
      setError(err.message || "Failed to resend verification email.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>Register</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          name="full_name"
          placeholder="Full name"
          value={form.full_name}
          onChange={updateField}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={updateField}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={updateField}
          required
        />

        <select name="role" value={form.role} onChange={updateField}>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {showResend && (
        <div style={{ marginTop: 12 }}>
          <button onClick={handleResend} disabled={resendLoading}>
            {resendLoading ? "Sending..." : "Resend Verification Email"}
          </button>
        </div>
      )}
    </div>
  );
}