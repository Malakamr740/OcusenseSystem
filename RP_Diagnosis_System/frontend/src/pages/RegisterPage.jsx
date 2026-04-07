import { useState } from "react";
import { Link } from "react-router";
import { registerUser, resendVerification } from "../api";
import FormField from "../components/FormField";
import Alert from "../components/Alert";
import Card from "../components/Card";

/**
 * Professional RegisterPage with role selection
 * 
 * Improves UX by:
 * - Clean form layout with FormField components
 * - Clear role selection for different user types
 * - Professional error/success messaging
 * - Resend verification support
 * - Link to login page
 */
export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "patient",
    full_name: "",
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  function updateField(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setShowResend(false);
    setLoading(true);

    try {
      const data = await registerUser(form);
      setSuccess(data.message || "Registration successful! Check your email to verify your account.");
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
      setSuccess(data.message || "Verification email sent! Check your inbox.");
    } catch (err) {
      setError(err.message || "Failed to resend verification email.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="page-container auth-page">
      <Card title="Create Your Account" subtitle="Join the RP Diagnosis System">
        {error && (
          <Alert 
            type="danger" 
            message={error}
            onClose={() => setError("")}
            dismissible={true}
          />
        )}
        {success && (
          <Alert 
            type="success" 
            message={success}
            onClose={() => setSuccess("")}
            dismissible={true}
          />
        )}
        
        <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
          <FormField
            id="full_name"
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={form.full_name}
            onChange={updateField}
            error={errors.full_name}
            required
          />

          <FormField
            id="email"
            label="Email Address"
            type="email"
            placeholder="john.doe@example.com"
            value={form.email}
            onChange={updateField}
            error={errors.email}
            required
          />

          <FormField
            id="password"
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={form.password}
            onChange={updateField}
            error={errors.password}
            help="Use at least 8 characters"
            required
          />

          <div className="form-group">
            <label className="form-label" htmlFor="role">Account Type</label>
            <select 
              id="role" 
              name="role" 
              className="form-control" 
              value={form.role} 
              onChange={updateField}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Healthcare Professional</option>
            </select>
            <div className="form-help">
              Select "Patient" if you need diagnosis assistance. Select "Healthcare Professional" if you're a doctor or clinician.
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg w-100" 
            disabled={loading}
            style={{ marginTop: '2rem' }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {showResend && (
          <div style={{ marginTop: '1.5rem' }}>
            <Alert 
              type="info"
              message="Account already exists. Resend verification email?"
            />
            <button 
              onClick={handleResend} 
              className="btn btn-outline-primary w-100" 
              disabled={resendLoading}
              style={{ marginTop: '1rem' }}
            >
              {resendLoading ? "Sending..." : "Resend Verification Email"}
            </button>
          </div>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--gray-200)', paddingTop: '1.5rem' }}>
          <span style={{ color: 'var(--gray-600)' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}