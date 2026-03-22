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
        <ul>
          <li>Next: View all cases</li>
          <li>Next: View reports</li>
          <li>Next: Chatbot</li>
        </ul>
      )}

      {user?.role === "admin" && (
        <ul>
          <li>Next: Users</li>
          <li>Next: Audit logs</li>
          <li>Next: Settings</li>
          <li>Next: Model registry</li>
        </ul>
      )}
    </div>
  );
}