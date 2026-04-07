import { Link } from "react-router";
import { useAuth } from "../auth/AuthContext";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";

/**
 * Professional DashboardPage with role-based quick actions
 * 
 * Improves UX by:
 * - Clear visual hierarchy with professional header
 * - Role-specific action cards with icons
 * - Better button styling and layout
 * - Professional spacing and typography
 * - Quick access to key features
 */
export default function DashboardPage() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="page-container">
      <PageHeader 
        title={`${getGreeting()}, ${user?.email?.split('@')[0] || 'User'}`}
        subtitle={`Role: ${user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Guest'}`}
      />

      {user?.role === "patient" && <PatientDashboard />}
      {user?.role === "doctor" && <DoctorDashboard />}
      {user?.role === "admin" && <AdminDashboard />}
    </div>
  );
}

function PatientDashboard() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      <ActionCard 
        icon="📤"
        title="Upload Case"
        description="Submit a new case for diagnosis"
        to="/upload-case"
        ctaText="Upload Now"
      />
      <ActionCard 
        icon="📋"
        title="My Cases"
        description="View and manage your submitted cases"
        to="/my-cases"
        ctaText="View Cases"
      />
      <ActionCard 
        icon="💬"
        title="Chatbot Assistant"
        description="Chat with AI for guidance and questions"
        to="/chatbot"
        ctaText="Start Chat"
      />
      <ActionCard 
        icon="📊"
        title="Reports"
        description="View your diagnosis reports"
        to="#"
        ctaText="Coming Soon"
        disabled={true}
      />
    </div>
  );
}

function DoctorDashboard() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      <ActionCard 
        icon="🔍"
        title="All Cases"
        description="Review and diagnose patient cases"
        to="/doctor/cases"
        ctaText="View Cases"
      />
      <ActionCard 
        icon="📄"
        title="Reports"
        description="Access generated diagnosis reports"
        to="/doctor/reports"
        ctaText="View Reports"
      />
      <ActionCard 
        icon="💬"
        title="Chatbot Assistant"
        description="AI-powered assistant for medical queries"
        to="/chatbot"
        ctaText="Start Chat"
      />
    </div>
  );
}

function AdminDashboard() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      <ActionCard 
        icon="📊"
        title="Dashboard"
        description="View system statistics and metrics"
        to="/admin/dashboard"
        ctaText="View Stats"
      />
      <ActionCard 
        icon="👥"
        title="User Management"
        description="Manage users, roles, and permissions"
        to="/admin/users"
        ctaText="Manage Users"
      />
      <ActionCard 
        icon="⚙️"
        title="Settings"
        description="Configure system settings"
        to="/admin/settings"
        ctaText="Edit Settings"
      />
      <ActionCard 
        icon="🧠"
        title="Model Registry"
        description="Manage AI models and versions"
        to="/admin/models"
        ctaText="Manage Models"
      />
      <ActionCard 
        icon="💬"
        title="Chatbot Assistant"
        description="AI support for admin tasks"
        to="/chatbot"
        ctaText="Start Chat"
      />
    </div>
  );
}

function ActionCard({ icon, title, description, to, ctaText, disabled = false }) {
  return (
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
        <div style={{ fontSize: '2.5rem' }}>{icon}</div>
        <div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: 'var(--gray-900)' }}>
            {title}
          </h3>
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--gray-600)' }}>
            {description}
          </p>
        </div>
        <div style={{ marginTop: 'auto' }}>
          <Link 
            to={to} 
            className={`btn ${disabled ? 'btn-secondary' : 'btn-primary'}`}
            style={{ width: '100%', textDecoration: 'none', textAlign: 'center', display: 'block', marginTop: '1rem' }}
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </Card>
  );
}