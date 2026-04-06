import { Link } from "react-router";
import { useAuth } from "../auth/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome, {user?.email}</p>
      <p>Role: {user?.role}</p>

      {user?.role === "patient" && (
        <div>
          <h3>Patient Actions</h3>
          <ul>
            <li><Link to="/upload-case">Upload a new case</Link></li>
            <li><Link to="/my-cases">View my cases</Link></li>
            <li>Next later: My reports</li>
            <li>Next later: Retargeting</li>
            <li>Next later: Chatbot</li>
          </ul>
        </div>
      )}

     {user?.role === "doctor" && (
      <div>
        <h3>Doctor Actions</h3>
        <ul>
          <li><Link to="/doctor/cases">View all cases</Link></li>
          <li>Next later: View all reports</li>
        </ul>
      </div>
      )}

     {user?.role === "admin" && (
        <div>
          <h3>Admin Actions</h3>
          <ul>
            <li><Link to="/admin/dashboard">Dashboard</Link></li>
            <li><Link to="/admin/users">Manage Users</Link></li>
            <li><Link to="/admin/audit-logs">Audit Logs</Link></li>
            <li><Link to="/admin/settings">Settings</Link></li>
            <li><Link to="/admin/models">Model Registry</Link></li>
          </ul>
        </div>
      )}

    </div>
  );
}