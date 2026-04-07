import { useEffect, useState } from "react";
import {
  getAllUsers,
  updateUserStatus,
  deleteUser,
} from "../api";
import { useAuth } from "../auth/AuthContext";
import PageHeader from "../components/PageHeader";
import Alert from "../components/Alert";
import Card from "../components/Card";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";

export default function AdminUsersPage() {
  const { token, user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!token || user?.role !== "admin") return;

    loadUsers();
  }, [token, user]);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");
      const data = await getAllUsers(token);
      setUsers(data);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(u) {
    try {
      setActionLoading(u.id);
      await updateUserStatus(u.id, !u.is_active, token);
      await loadUsers();
    } catch (err) {
      setError(err.message || "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(u) {
    if (!confirm(`Are you sure you want to delete ${u.email}? This action cannot be undone.`)) return;

    try {
      setActionLoading(u.id);
      await deleteUser(u.id, token);
      await loadUsers();
    } catch (err) {
      setError(err.message || "Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  }

  if (user?.role !== "admin") {
    return (
      <div className="page-container">
        <Alert 
          type="warning" 
          message="Only administrators can access this page."
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader 
        title="User Management" 
        subtitle="View and manage all users in the system"
      />

      {error && (
        <Alert 
          type="danger" 
          message={error}
          onClose={() => setError("")}
          dismissible={true}
        />
      )}

      {loading ? (
        <LoadingState message="Loading users..." />
      ) : users.length === 0 ? (
        <EmptyState 
          icon="👥"
          title="No users found"
          description="There are no users in the system yet."
        />
      ) : (
        <Card title="All Users" subtitle={`${users.length} user${users.length !== 1 ? 's' : ''} total`}>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="table-th">Email</th>
                  <th className="table-th">Role</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Created</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="table-td">{u.email}</td>
                    <td className="table-td">
                      <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>
                        {u.role}
                      </span>
                    </td>
                    <td className="table-td">
                      <StatusBadge status={u.is_active ? "active" : "inactive"} />
                    </td>
                    <td className="table-td" style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                      {new Date(u.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td className="table-td table-actions">
                      <button
                        className={`table-action-btn ${u.is_active ? '' : ''}`}
                        onClick={() => handleToggleStatus(u)}
                        disabled={actionLoading === u.id}
                        title={u.is_active ? "Deactivate user" : "Activate user"}
                      >
                        {actionLoading === u.id ? '...' : u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className="table-action-btn"
                        onClick={() => handleDelete(u)}
                        disabled={actionLoading === u.id}
                        style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                        title="Delete user"
                      >
                        {actionLoading === u.id ? '...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}