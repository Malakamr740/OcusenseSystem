import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { loginUser } from "../api";
import { useAuth } from "../auth/AuthContext";
import FormField from "../components/FormField";
import Alert from "../components/Alert";
import Card from "../components/Card";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setErrors({});
    setLoading(true);

    try {
      const data = await loginUser(form);
      login(data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container auth-page">
      <Card title="Welcome Back" subtitle="Sign in to your RP Diagnosis account">
        {error && (
          <Alert 
            type="danger" 
            message={error}
            onClose={() => setError("")}
            dismissible={true}
          />
        )}
        
        <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
          <FormField
            id="email"
            label="Email Address"
            type="email"
            placeholder="your.email@example.com"
            value={form.email}
            onChange={updateField}
            error={errors.email}
            required
          />

          <FormField
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={updateField}
            error={errors.password}
            required
          />

          <button 
            type="submit" 
            className="btn btn-primary btn-lg w-100" 
            disabled={loading}
            style={{ marginTop: '2rem' }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--gray-200)', paddingTop: '1.5rem' }}>
          <Link to="/forgot-password" className="text-muted" style={{ textDecoration: 'none', fontSize: '0.95rem' }}>
            Forgot your password?
          </Link>
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <span style={{ color: 'var(--gray-600)' }}>Don't have an account? </span>
          <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>
            Create one
          </Link>
        </div>
      </Card>
    </div>
  );
}