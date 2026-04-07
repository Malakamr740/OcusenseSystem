import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getMyCases } from "../api";
import { useAuth } from "../auth/AuthContext";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import Alert from "../components/Alert";
import StatusBadge from "../components/StatusBadge";

/**
 * Professional MyCasesPage
 * 
 * Improves UX by:
 * - PageHeader for professional title
 * - Card-based case grid layout
 * - LoadingState & EmptyState components
 * - StatusBadge for status display
 * - Professional card styling with hover effects
 * - CTA button for uploading first case
 */
export default function MyCasesPage() {
  const { token, user } = useAuth();

  const [cases, setCases] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || user?.role !== "patient") return;

    async function loadCases() {
      try {
        setLoading(true);
        const data = await getMyCases(token);
        setCases(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCases();
  }, [token, user]);

  if (user?.role !== "patient") {
    return (
      <div className="page-container">
        <PageHeader 
          title="My Cases"
          subtitle="Access Restricted"
        />
        <Alert 
          type="warning" 
          message="Only patients can view their own cases here."
          dismissible={false}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container">
        <PageHeader 
          title="My Cases"
          subtitle="View and manage your uploaded fundus images"
        />
        <LoadingState message="Loading your cases..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <PageHeader 
          title="My Cases"
          subtitle="View and manage your uploaded fundus images"
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
          title="My Cases"
          subtitle="View and manage your uploaded fundus images"
        />
        <EmptyState 
          title="No Cases Yet"
          message="You haven't uploaded any fundus images yet. Start by uploading your first case for AI-powered diagnosis."
          actionLabel="Upload Case"
          actionLink="/upload-case"
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader 
        title="My Cases"
        subtitle={`You have ${cases.length} case${cases.length !== 1 ? 's' : ''} uploaded`}
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
                <strong>Created:</strong> {new Date(item.created_at).toLocaleDateString('en-US', { 
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
              View Details
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}