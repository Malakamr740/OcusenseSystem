import { useEffect, useState } from "react";
import {
  getAllUsers,
  updateUserStatus,
  deleteUser,
} from "../api";
import { useAuth } from "../auth/AuthContext";

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
    if (!confirm("Are you sure you want to delete this user?")) return;

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
    return <p>Only admins can view this page.</p>;
  }

  return (
    <div>
      <h2>Manage Users</h2>

      {loading && <p>Loading users...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && users.length === 0 && <p>No users found.</p>}

      {!loading && users.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderTop: "1px solid #ddd" }}>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.is_active ? "Active" : "Inactive"}</td>
                <td>{u.created_at}</td>

                <td>
                  <button
                    onClick={() => handleToggleStatus(u)}
                    disabled={actionLoading === u.id}
                  >
                    {u.is_active ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    onClick={() => handleDelete(u)}
                    disabled={actionLoading === u.id}
                    style={{ marginLeft: 8 }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}