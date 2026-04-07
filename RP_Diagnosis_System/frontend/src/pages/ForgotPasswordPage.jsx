import { useState } from "react";
import { Link } from "react-router";
import { forgotPassword } from "../api";
import FormField from "../components/FormField";
import Alert from "../components/Alert";
import Card from "../components/Card";

/**
 * Professional ForgotPasswordPage
 * 
 * Improves UX by:
 * - FormField component for consistent input styling
 * - Professional Alert messages
 * - Clear instruction text
 * - Link back to login
 */
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
        data.message || "If the account exists, a password reset email has been sent. Check your inbox."
      );
    } catch (err) {
      setError(err.message || "Failed to request password reset");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container auth-page">
      <Card 
        title="Forgot Your Password?" 
        subtitle="Enter your email to receive a password reset link"
      >
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
            dismissible={false}
          />
        )}

        {!success && (
          <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
            <FormField
              id="email"
              label="Email Address"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              help="We'll send a password reset link to this email"
            />

            <button 
              type="submit" 
              className="btn btn-primary btn-lg w-100" 
              disabled={loading}
              style={{ marginTop: '2rem' }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--gray-200)', paddingTop: '1.5rem' }}>
          <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>
            Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
}