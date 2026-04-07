import { Outlet } from "react-router";
import TopNav from "./TopNav";

/**
 * MainLayout - Professional wrapper for all authenticated pages
 * Provides consistent header, navigation, and spacing across the application
 * 
 * Improves UX by:
 * - Consistent header across all authenticated pages
 * - Unified navigation for different user roles
 * - Professional spacing and padding
 * - Responsive design for all screen sizes
 */
export default function MainLayout() {
  return (
    <div className="app-shell">
      <TopNav />
      <main className="main-content">
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
