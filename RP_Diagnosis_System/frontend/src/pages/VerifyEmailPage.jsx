import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { verifyEmail } from "../api";

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
        setError("Verification token is missing.");
        setLoading(false);
        return;
      }

      try {
        setError("");
        setSuccess("");

        const data = await verifyEmail(token);
        setSuccess(data.message || "Email verified successfully.");
      } catch (err) {
        setError(err.message || "Verification failed.");
      } finally {
        setLoading(false);
      }
    }

    runVerification();
  }, [token]);

  return (
    <div style={{ maxWidth: 500 }}>
      <h2>Verify Email</h2>

      {loading && <p>Verifying your email...</p>}
      {!loading && success && <p style={{ color: "green" }}>{success}</p>}
      {!loading && !success && error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && (
        <div style={{ marginTop: 16 }}>
          <Link to="/login">Go to Login</Link>
        </div>
      )}
    </div>
  );
}