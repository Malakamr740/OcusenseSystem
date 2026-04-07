import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { verifyEmail } from "../api";
import Alert from "../components/Alert";
import Card from "../components/Card";
import LoadingState from "../components/LoadingState";

/**
 * Professional VerifyEmailPage
 * 
 * Improves UX by:
 * - LoadingState component while verifying
 * - Professional Alert messages
 * - Clear next steps with login link
 */
export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const hasRunRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    async function runVerification() {
      if (!token) {
        setError("Verification token is missing. Please use the link from your email.");
        setLoading(false);
        return;
      }

      try {
        setError("");
        setSuccess("");

        const data = await verifyEmail(token);
        setSuccess(data.message || "Email verified successfully! You can now log in.");
      } catch (err) {
        setError(err.message || "Verification failed. The link may have expired.");
      } finally {
        setLoading(false);
      }
    }

    runVerification();
  }, [token]);

  return (
    <div className="page-container auth-page">
      <Card title="Email Verification">
        {loading && (
          <LoadingState message="Verifying your email address..." />
        )}

        {!loading && error && (
          <>
            <Alert 
              type="danger" 
              message={error}
              dismissible={false}
            />
            <Link 
              to="/login" 
              className="btn btn-primary w-100" 
              style={{ marginTop: '2rem', textDecoration: 'none', display: 'block', textAlign: 'center' }}
            >
              Back to Login
            </Link>
          </>
        )}

        {!loading && success && (
          <>
            <Alert 
              type="success" 
              message={success}
              dismissible={false}
            />
            <Link 
              to="/login" 
              className="btn btn-primary w-100" 
              style={{ marginTop: '2rem', textDecoration: 'none', display: 'block', textAlign: 'center' }}
            >
              Go to Login
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}