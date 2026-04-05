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
            <li>Next later: View all cases</li>
            <li>Next later: View all reports</li>
          </ul>
        </div>
      )}

      {user?.role === "admin" && (
        <ul>
          <li>Next later: Users</li>
          <li>Next later: Audit logs</li>
          <li>Next later: Settings</li>
          <li>Next later: Model registry</li>
        </ul>
      )}
    </div>
  );
}