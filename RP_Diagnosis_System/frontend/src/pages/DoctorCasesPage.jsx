import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getAllCases } from "../api";
import { useAuth } from "../auth/AuthContext";

export default function DoctorCasesPage() {
  const { token, user } = useAuth();

  const [cases, setCases] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || user?.role !== "doctor") return;

    async function loadCases() {
      try {
        setLoading(true);
        setError("");

        const data = await getAllCases(token);
        setCases(data);
      } catch (err) {
        setError(err.message || "Failed to load cases");
      } finally {
        setLoading(false);
      }
    }

    loadCases();
  }, [token, user]);

  if (user?.role !== "doctor") {
    return <p>Only doctors can view this page.</p>;
  }

  return (
    <div>
      <h2>All Cases</h2>

      {loading && <p>Loading cases...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && cases.length === 0 && (
        <p>No cases found.</p>
      )}

      {!loading && !error && cases.length > 0 && (
        <div style={{ display: "grid", gap: 12 }}>
          {cases.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ddd",
                padding: 12,
                borderRadius: 8,
              }}
            >
              <p><strong>Case ID:</strong> {item.id}</p>
              <p><strong>Status:</strong> {item.status}</p>
              <p><strong>Modality:</strong> {item.modality}</p>
              <p><strong>Created At:</strong> {item.created_at}</p>

              <Link to={`/cases/${item.id}`}>Open Case</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}