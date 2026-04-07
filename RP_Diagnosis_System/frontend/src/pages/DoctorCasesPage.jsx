import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getAllCases } from "../api";
import { useAuth } from "../auth/AuthContext";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import Alert from "../components/Alert";
import StatusBadge from "../components/StatusBadge";

/**
 * Professional DoctorCasesPage
 * 
 * Improves UX by:
 * - PageHeader for professional title
 * - Card-based case grid layout
 * - LoadingState & EmptyState components
 * - StatusBadge for status display
 * - Doctor-specific copy
 * - Professional case cards with hover effects
 */
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
    return (
      <div className="page-container">
        <PageHeader 
          title="All Cases"
          subtitle="Access Restricted"
        />
        <Alert 
          type="warning" 
          message="Only doctors can access the case review system."
          dismissible={false}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container">
        <PageHeader 
          title="All Cases"
          subtitle="Review and analyze patient fundus images"
        />
        <LoadingState message="Loading patient cases..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <PageHeader 
          title="All Cases"
          subtitle="Review and analyze patient fundus images"
        />
        <Alert 
          type="danger" 
          message={error}
          dismissible={false}
        />
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="page-container">
        <PageHeader 
          title="All Cases"
          subtitle="Review and analyze patient fundus images"
        />
        <EmptyState 
          title="No Cases Available"
          message="There are currently no patient cases available for review."
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader 
        title="All Cases"
        subtitle={`${cases.length} case${cases.length !== 1 ? 's' : ''} awaiting review`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {cases.map((item) => (
          <Card 
            key={item.id}
            title={`Case #${item.id}`}
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <StatusBadge status={item.status} />
                <span style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {item.modality || "Fundus"}
                </span>
              </div>

              <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <strong>Received:</strong> {new Date(item.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>

              {item.description && (
                <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.75rem' }}>
                  {item.description.substring(0, 100)}
                  {item.description.length > 100 ? '...' : ''}
                </p>
              )}
            </div>

            <Link 
              to={`/cases/${item.id}`} 
              className="btn btn-primary"
              style={{ marginTop: '1rem', textDecoration: 'none', display: 'block', textAlign: 'center' }}
            >
              Review Case
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}