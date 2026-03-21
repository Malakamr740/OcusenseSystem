import { useAuth } from "../auth/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome, {user?.email}</p>
      <p>Role: {user?.role}</p>

      {user?.role === "patient" && (
        <ul>
          <li>Next: My profile</li>
          <li>Next: Upload case</li>
          <li>Next: My reports</li>
          <li>Next: Retargeting</li>
          <li>Next: Chatbot</li>
        </ul>
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