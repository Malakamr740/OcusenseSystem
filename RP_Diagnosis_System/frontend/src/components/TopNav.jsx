import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../auth/AuthContext";

/**
 * TopNav - Professional header navigation component
 * 
 * Improves UX by:
 * - Clean, organized navigation structure
 * - Role-aware menu items (shows different links for patient/doctor/admin)
 * - Visual feedback for active page
 * - Quick user info and logout button
 * - Responsive design for mobile
 * - Medical-grade styling
 * - Better information hierarchy
 */
export default function TopNav() {
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function isActive(path) {
    return location.pathname === path;
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="topnav">
      <div className="topnav-container">
        {/* Logo/Brand */}
        <div className="topnav-brand">
          <Link to="/" className="topnav-logo">
            <span className="topnav-logo-icon">🔬</span>
            <span className="topnav-logo-text">RP Diagnosis</span>
          </Link>
        </div>

        {/* Navigation Links */}
        {token ? (
          <>
            <nav className="topnav-menu">
              <Link to="/dashboard" className={`topnav-link ${isActive("/dashboard") ? "active" : ""}`}>
                Dashboard
              </Link>

              {user?.role === "patient" && (
                <>
                  <Link to="/upload-case" className={`topnav-link ${isActive("/upload-case") ? "active" : ""}`}>
                    Upload Case
                  </Link>
                  <Link to="/my-cases" className={`topnav-link ${isActive("/my-cases") ? "active" : ""}`}>
                    My Cases
                  </Link>
                  <Link to="/chatbot" className={`topnav-link ${isActive("/chatbot") ? "active" : ""}`}>
                    Chatbot
                  </Link>
                </>
              )}

              {user?.role === "doctor" && (
                <>
                  <Link to="/doctor/cases" className={`topnav-link ${isActive("/doctor/cases") ? "active" : ""}`}>
                    All Cases
                  </Link>
                  <Link to="/chatbot" className={`topnav-link ${isActive("/chatbot") ? "active" : ""}`}>
                    Chatbot
                  </Link>
                </>
              )}

              {user?.role === "admin" && (
                <>
                  <div className="topnav-submenu">
                    <button className="topnav-link topnav-submenu-toggle">
                      Admin ▼
                    </button>
                    <div className="topnav-submenu-dropdown">
                      <Link to="/admin/dashboard" className="topnav-submenu-item">
                        Dashboard
                      </Link>
                      <Link to="/admin/users" className="topnav-submenu-item">
                        Users
                      </Link>
                      <Link to="/admin/settings" className="topnav-submenu-item">
                        Settings
                      </Link>
                      <Link to="/admin/models" className="topnav-submenu-item">
                        Models
                      </Link>
                    </div>
                  </div>
                  <Link to="/chatbot" className={`topnav-link ${isActive("/chatbot") ? "active" : ""}`}>
                    Chatbot
                  </Link>
                </>
              )}
            </nav>

            {/* User Menu */}
            <div className="topnav-user">
              <div className="topnav-user-info">
                <div className="topnav-user-badge">{user?.role?.charAt(0).toUpperCase()}</div>
                <div className="topnav-user-details">
                  <div className="topnav-user-email">{user?.email}</div>
                  <div className="topnav-user-role">{user?.role}</div>
                </div>
              </div>
              <button onClick={handleLogout} className="topnav-logout-btn">
                Logout
              </button>
            </div>
          </>
        ) : (
          <nav className="topnav-menu">
            <Link to="/login" className="topnav-link">
              Login
            </Link>
            <Link to="/register" className="topnav-link-primary">
              Register
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
