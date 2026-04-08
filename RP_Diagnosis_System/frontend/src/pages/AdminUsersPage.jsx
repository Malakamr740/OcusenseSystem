import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
} from "@mui/material";
import MainLayout from "../components/MainLayout";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { getAllUsers, updateUserStatus, deleteUser } from "../api";
import { useAuth } from "../auth/AuthContext";

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers(token);
        setUsers(data);
      } catch (err) {
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await updateUserStatus(userId, !currentStatus, token);
      setUsers(users.map((u) => (u.id === userId ? { ...u, is_active: !currentStatus } : u)));
    } catch (err) {
      setError(err.message || "Failed to update user status");
    }
  };

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId, token);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      setError(err.message || "Failed to delete user");
    }
  };

  if (loading) {
    return (
      <MainLayout title="Admin Users">
        <PageHeader
          eyebrow="Admin"
          title="Users"
          subtitle="Review registered users, roles, and activation states in one clean table."
          actions={<Button variant="contained">Add user</Button>}
        />
        <Stack alignItems="center" py={8}>
          <CircularProgress />
        </Stack>
      </MainLayout>
    );
  }
  return (
    <MainLayout title="Admin Users">
      <PageHeader
        eyebrow="Admin"
        title="Users"
        subtitle="Review registered users, roles, and activation states in one clean table."
        actions={<Button variant="contained">Add user</Button>}
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Card>
        <CardContent sx={{ p: 1.5 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar>{user.email?.[0].toUpperCase() || "U"}</Avatar>
                        <Stack>
                          <Typography fontWeight={700}>{user.full_name || user.email}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Stack>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ textTransform: "capitalize" }}>{user.role}</Typography>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={user.is_active ? "Active" : "Inactive"} />
                    </TableCell>

                    <TableCell align="right">
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleStatusToggle(user.id, user.is_active)}
                      >
                        {user.is_active ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="text"
                        size="small"
                        color="error"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </MainLayout>
  );
}